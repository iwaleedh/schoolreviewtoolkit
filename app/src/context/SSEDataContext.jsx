import { createContext, useContext, useCallback, useMemo, useState, useEffect, useReducer } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from './AuthContext';
import {
    STORAGE_KEYS,
    ERROR_MESSAGES,
    UI_CONFIG,
    SCORING_THRESHOLDS
} from '../utils/constants';
import {
    sanitizeComment,
    sanitizeIndicatorCode,
    validateScore,
    validateLTScore
} from '../utils/sanitizers';

/**
 * SSEDataContext - Global state for all checklist scores
 * Now with offline-first support - data stored locally first, synced to backend on Save
 * 
 * Architecture:
 * - Data Input Tabs (LT, Principal, Admin, etc.) write to local pending state
 * - Click "Save" to sync all pending changes to Convex backend
 * - Dimension Tabs read scores from here (view-only)
 */

const SSEDataContext = createContext(null);

// Action types for reducer
const ACTIONS = {
    SET_PENDING_LT_SCORE: 'SET_PENDING_LT_SCORE',
    SET_PENDING_COMMENT: 'SET_PENDING_COMMENT',
    CLEAR_PENDING_FOR_SOURCE: 'CLEAR_PENDING_FOR_SOURCE',
    CLEAR_PENDING_COMMENTS: 'CLEAR_PENDING_COMMENTS',
    CLEAR_ALL_PENDING: 'CLEAR_ALL_PENDING',
    SET_SYNCING: 'SET_SYNCING',
    SET_LAST_SYNC: 'SET_LAST_SYNC',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer for pending state management
function pendingReducer(state, action) {
    // Defensive check: if state is somehow lost, return initial state structure
    if (!state) {
        state = {
            ltScores: {},
            comments: {},
            isSyncing: false,
            lastSyncTime: null,
            error: null,
        };
    }

    switch (action.type) {
        case ACTIONS.SET_PENDING_LT_SCORE: {
            const { indicatorCode, ltColumn, value, source } = action.payload || {};
            if (!indicatorCode || !ltColumn) return state;

            return {
                ...state,
                ltScores: {
                    ...(state.ltScores || {}),
                    [indicatorCode]: {
                        ...(state.ltScores?.[indicatorCode] || {}),
                        [ltColumn]: { value, source, timestamp: Date.now() }
                    }
                },
            };
        }
        case ACTIONS.SET_PENDING_COMMENT: {
            const { indicatorCode, comment } = action.payload || {};
            if (!indicatorCode) return state;

            return {
                ...state,
                comments: {
                    ...(state.comments || {}),
                    [indicatorCode]: { comment, timestamp: Date.now() }
                },
            };
        }
        case ACTIONS.CLEAR_PENDING_FOR_SOURCE: {
            const { source } = action.payload || {};
            if (!source) return state;

            const newLtScores = { ...(state.ltScores || {}) };
            Object.keys(newLtScores).forEach(indicatorCode => {
                const columns = { ...(newLtScores[indicatorCode] || {}) };
                Object.keys(columns).forEach(ltColumn => {
                    if (columns[ltColumn]?.source === source) {
                        delete columns[ltColumn];
                    }
                });
                if (Object.keys(columns).length === 0) {
                    delete newLtScores[indicatorCode];
                } else {
                    newLtScores[indicatorCode] = columns;
                }
            });
            return {
                ...state,
                ltScores: newLtScores,
            };
        }
        case ACTIONS.CLEAR_PENDING_COMMENTS: {
            return {
                ...state,
                comments: {},
            };
        }
        case ACTIONS.CLEAR_ALL_PENDING: {
            return {
                ...state,
                ltScores: {},
                comments: {},
            };
        }
        case ACTIONS.SET_SYNCING: {
            return { ...state, isSyncing: !!action.payload };
        }
        case ACTIONS.SET_LAST_SYNC: {
            return { ...state, lastSyncTime: action.payload };
        }
        case ACTIONS.SET_ERROR: {
            return { ...state, error: action.payload };
        }
        case ACTIONS.CLEAR_ERROR: {
            return { ...state, error: null };
        }
        default:
            return state;
    }
}

// Load pending changes from localStorage
const loadPendingFromStorage = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.PENDING_SCORES);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

// Save pending changes to localStorage
const savePendingToStorage = (pending) => {
    try {
        localStorage.setItem(STORAGE_KEYS.PENDING_SCORES, JSON.stringify(pending));
    } catch (error) {
        console.warn('Failed to save to localStorage:', error);
    }
};

// Initial state for reducer
const createInitialState = () => {
    const initialState = {
        ltScores: {},
        comments: {},
        isSyncing: false,
        lastSyncTime: null,
        error: null,
    };

    try {
        const storedLt = loadPendingFromStorage();
        if (storedLt && typeof storedLt === 'object') {
            initialState.ltScores = storedLt;
        }

        const storedComments = localStorage.getItem(STORAGE_KEYS.PENDING_COMMENTS);
        if (storedComments) {
            const parsed = JSON.parse(storedComments);
            if (parsed && typeof parsed === 'object') {
                initialState.comments = parsed;
            }
        }

        const storedSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        if (storedSync) {
            initialState.lastSyncTime = new Date(storedSync);
        }
    } catch (e) {
        console.warn('Failed to initialize state from localStorage:', e);
    }

    return initialState;
};

export function SSEDataProvider({ children }) {
    const { user, token } = useAuth();

    // Initial school ID from user
    const [currentSchoolId, setCurrentSchoolId] = useState(user?.schoolId || null);

    // Fetch schools for default selection (Admin/Analyst)
    const schoolsQueryResult = useQuery(api.schools.listSchools);
    const schools = useMemo(() => schoolsQueryResult || [], [schoolsQueryResult]);

    // Clear potentially corrupted old keys on mount
    useEffect(() => {
        try {
            console.log('SSEDataProvider: Maintenance - checking for corrupted state');
            // Check if state is in a crash loop by tracking reloads in session
            const reloads = parseInt(sessionStorage.getItem('sse_reload_count') || '0', 10);
            if (reloads > 5) {
                console.warn('SSEDataProvider: Crash loop detected, clearing localStorage');
                localStorage.removeItem(STORAGE_KEYS.PENDING_SCORES);
                localStorage.removeItem(STORAGE_KEYS.PENDING_COMMENTS);
                sessionStorage.setItem('sse_reload_count', '0');
            } else {
                sessionStorage.setItem('sse_reload_count', (reloads + 1).toString());
            }
        } catch (e) {
            console.error('SSEDataProvider: Maintenance error:', e);
        }
    }, [user]);

    // Set default school if none is set
    useEffect(() => {
        try {
            if (user) {
                if (user.schoolId && !currentSchoolId) {
                    // Principal: Always use their school
                    setCurrentSchoolId(user.schoolId);
                } else if (!currentSchoolId && schools && schools.length > 0) {
                    // Admin/Analyst: Use first accessible school
                    if (user.role === 'ADMIN') {
                        setCurrentSchoolId(schools[0].schoolId);
                    } else if (user.role === 'ANALYST' && user.assignedSchools?.length > 0) {
                        const firstAssigned = schools.find(s => user.assignedSchools.includes(s.schoolId));
                        if (firstAssigned) {
                            setCurrentSchoolId(firstAssigned.schoolId);
                        }
                    }
                }
            }
        } catch (e) {
            console.error('SSEDataProvider: Error in default school useEffect:', e);
        }
    }, [user, currentSchoolId, schools]);

    // Simplified queries - real-time data from database
    const indicatorDataResult = useQuery(api.indicatorScores.getAll,
        currentSchoolId ? { schoolId: currentSchoolId } : "skip"
    );
    const indicatorScores = useMemo(() => indicatorDataResult?.scores || {}, [indicatorDataResult]);
    const indicatorSources = useMemo(() => indicatorDataResult?.sources || {}, [indicatorDataResult]);

    const ltScoresDataResult = useQuery(api.ltScores.getAll,
        currentSchoolId ? { schoolId: currentSchoolId } : "skip"
    );
    const ltScores = useMemo(() => ltScoresDataResult || {}, [ltScoresDataResult]);

    const commentsDataResult = useQuery(api.comments.getAll,
        currentSchoolId ? { schoolId: currentSchoolId } : "skip"
    );
    const indicatorComments = useMemo(() => commentsDataResult || {}, [commentsDataResult]);

    // Convex mutations
    const setIndicatorScoreMutation = useMutation(api.indicatorScores.set);
    const setMultipleScoresMutation = useMutation(api.indicatorScores.setMultiple);
    const clearIndicatorScoresMutation = useMutation(api.indicatorScores.clearAll);
    const setLtScoreMutation = useMutation(api.ltScores.set);
    const setMultipleLtScoresMutation = useMutation(api.ltScores.setMultiple);
    const clearLtScoresMutation = useMutation(api.ltScores.clearAll);
    const setCommentMutation = useMutation(api.comments.set);
    const clearCommentsMutation = useMutation(api.comments.clearAll);

    // Local state for checklist data (CSV data doesn't need persistence)
    const [checklistData, setChecklistData] = useState({});

    // Use reducer for pending state management
    const [pendingState, dispatch] = useReducer(pendingReducer, null, createInitialState);

    // Defensive check before destructuring
    const {
        ltScores: pendingLTScores = {},
        comments: pendingComments = {},
        isSyncing = false,
        lastSyncTime = null,
        error = null
    } = pendingState || {};

    // Persist pending changes to localStorage whenever they change
    useEffect(() => {
        savePendingToStorage(pendingLTScores);
    }, [pendingLTScores]);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.PENDING_COMMENTS, JSON.stringify(pendingComments));
        } catch (err) {
            console.warn('Failed to save pending comments to localStorage:', err);
        }
    }, [pendingComments]);

    // Find current school info
    const currentSchool = useMemo(() => {
        if (!schools || !currentSchoolId) return null;
        return schools.find(s => s.schoolId === currentSchoolId) || null;
    }, [schools, currentSchoolId]);

    /**
     * Store checklist data from CSV for a source (local only)
     */
    const storeChecklistData = useCallback((source, data) => {
        if (!source) return;
        setChecklistData(prev => ({
            ...prev,
            [source]: data || []
        }));
    }, []);

    /**
     * Get checklist data for a source
     */
    const getChecklistData = useCallback((source) => {
        return (source && checklistData[source]) || [];
    }, [checklistData]);

    /**
     * Set score for a single indicator with validation
     */
    const setIndicatorScore = useCallback(async (indicatorCode, value, source = 'unknown') => {
        const sanitizedCode = sanitizeIndicatorCode(indicatorCode);
        const validatedScore = validateScore(value);

        if (!sanitizedCode || !currentSchoolId) return;

        try {
            await setIndicatorScoreMutation({
                indicatorCode: sanitizedCode,
                value: validatedScore,
                source,
                schoolId: currentSchoolId,
            });
            dispatch({ type: ACTIONS.CLEAR_ERROR });
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: ERROR_MESSAGES.SYNC_FAILED });
            throw err;
        }
    }, [setIndicatorScoreMutation, currentSchoolId]);

    /**
     * Set scores for multiple indicators at once
     */
    const setMultipleIndicatorScores = useCallback(async (scores, source = 'unknown') => {
        if (!scores || !currentSchoolId) return;

        const scoresArray = Object.entries(scores)
            .map(([indicatorCode, value]) => {
                const sanitizedCode = sanitizeIndicatorCode(indicatorCode);
                const validatedScore = validateScore(value);
                return sanitizedCode ? { indicatorCode: sanitizedCode, value: validatedScore } : null;
            })
            .filter(Boolean);

        if (scoresArray.length === 0) return;

        try {
            await setMultipleScoresMutation({
                scores: scoresArray,
                source,
                schoolId: currentSchoolId,
            });
            dispatch({ type: ACTIONS.CLEAR_ERROR });
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: ERROR_MESSAGES.SYNC_FAILED });
            throw err;
        }
    }, [setMultipleScoresMutation, currentSchoolId]);

    /**
     * Calculate outcome score based on indicator scores
     */
    const calculateOutcomeScore = useCallback((indicatorCodes) => {
        if (!indicatorCodes || indicatorCodes.length === 0) return 'NR';

        let yesCount = 0;
        let noCount = 0;

        indicatorCodes.forEach(code => {
            const score = indicatorScores[code];
            if (score === 'yes') yesCount++;
            else if (score === 'no') noCount++;
        });

        const scoredCount = yesCount + noCount;
        if (scoredCount === 0) return 'NR';

        const percentage = (yesCount / scoredCount) * 100;

        if (percentage >= SCORING_THRESHOLDS.FULLY_ACHIEVED) return 'FA';
        if (percentage >= SCORING_THRESHOLDS.MOSTLY_ACHIEVED) return 'MA';
        if (percentage >= SCORING_THRESHOLDS.ACHIEVED) return 'A';
        return 'NS';
    }, [indicatorScores]);

    /**
     * Get all scores for indicators in a specific dimension
     */
    const getScoresForDimension = useCallback((indicatorCodes) => {
        const scores = {};
        if (indicatorCodes) {
            indicatorCodes.forEach(code => {
                scores[code] = indicatorScores[code] || null;
            });
        }
        return scores;
    }, [indicatorScores]);

    /**
     * Get score for a specific indicator
     */
    const getIndicatorScore = useCallback((indicatorCode) => {
        return indicatorScores[indicatorCode] || null;
    }, [indicatorScores]);

    /**
     * Get statistics for a set of indicators
     */
    const getIndicatorStats = useCallback((indicatorCodes) => {
        let yes = 0, no = 0, nr = 0, unscored = 0;

        if (indicatorCodes) {
            indicatorCodes.forEach(code => {
                const score = indicatorScores[code];
                if (score === 'yes') yes++;
                else if (score === 'no') no++;
                else if (score === 'nr') nr++;
                else unscored++;
            });
        }

        return { yes, no, nr, unscored, total: indicatorCodes?.length || 0 };
    }, [indicatorScores]);

    /**
     * Set comment locally
     */
    const setIndicatorComment = useCallback((indicatorCode, comment) => {
        const sanitizedCode = sanitizeIndicatorCode(indicatorCode);
        const sanitizedComment = sanitizeComment(comment);
        if (!sanitizedCode) return;

        dispatch({
            type: ACTIONS.SET_PENDING_COMMENT,
            payload: { indicatorCode: sanitizedCode, comment: sanitizedComment }
        });
    }, []);

    /**
     * Get comment - check pending first, then server data
     */
    const getIndicatorComment = useCallback((indicatorCode) => {
        const pending = pendingComments?.[indicatorCode]?.comment;
        if (pending !== undefined) return pending;
        return indicatorComments?.[indicatorCode] || '';
    }, [indicatorComments, pendingComments]);

    /**
     * Save pending comments to backend
     */
    const savePendingComments = useCallback(async () => {
        if (!pendingComments || Object.keys(pendingComments).length === 0) return { success: true, count: 0 };
        try {
            const pending = Object.entries(pendingComments);
            await Promise.all(
                pending.map(([indicatorCode, data]) =>
                    setCommentMutation({
                        indicatorCode,
                        comment: data.comment,
                        schoolId: currentSchoolId,
                    })
                )
            );
            dispatch({ type: ACTIONS.CLEAR_PENDING_COMMENTS });
            localStorage.removeItem(STORAGE_KEYS.PENDING_COMMENTS);
            return { success: true, count: pending.length };
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: ERROR_MESSAGES.SYNC_FAILED });
            return { success: false, error, count: 0 };
        }
    }, [pendingComments, setCommentMutation, currentSchoolId]);

    /**
     * Set LT score locally
     */
    const setIndicatorLTScore = useCallback((indicatorCode, ltColumn, value, source = 'unknown') => {
        const sanitizedCode = sanitizeIndicatorCode(indicatorCode);
        const validatedValue = validateLTScore(value);
        if (!sanitizedCode || !ltColumn) return;

        dispatch({
            type: ACTIONS.SET_PENDING_LT_SCORE,
            payload: { indicatorCode: sanitizedCode, ltColumn, value: validatedValue, source },
        });
    }, []);

    /**
     * Get LT score - check pending (local) first, then server data
     */
    const getIndicatorLTScore = useCallback((indicatorCode, ltColumn) => {
        const pending = pendingLTScores?.[indicatorCode]?.[ltColumn]?.value;
        if (pending !== undefined) return pending;
        return ltScores?.[indicatorCode]?.[ltColumn] ?? null;
    }, [ltScores, pendingLTScores]);

    /**
     * Get all pending LT scores for a source
     */
    const getPendingLTScoresForSource = useCallback((source) => {
        const result = [];
        if (!pendingLTScores) return result;
        Object.entries(pendingLTScores).forEach(([indicatorCode, columns]) => {
            if (columns) {
                Object.entries(columns).forEach(([ltUser, data]) => {
                    if (data?.source === source) {
                        result.push({ indicatorCode, ltColumn: ltUser, value: data.value });
                    }
                });
            }
        });
        return result;
    }, [pendingLTScores]);

    /**
     * Check if there are pending changes for a source
     */
    const hasPendingChanges = useCallback((source) => {
        if (!pendingLTScores) return false;
        return Object.values(pendingLTScores).some(columns =>
            columns && Object.values(columns).some(data => data?.source === source)
        );
    }, [pendingLTScores]);

    /**
     * Get the count of pending LT scores for a given source
     */
    const getPendingCount = useCallback((source) => {
        if (!pendingLTScores) return 0;
        let count = 0;
        Object.values(pendingLTScores).forEach(columns => {
            if (columns) {
                Object.values(columns).forEach(data => {
                    if (data?.source === source) count++;
                });
            }
        });
        return count;
    }, [pendingLTScores]);

    /**
     * Save all pending LT scores to backend
     */
    const savePendingLTScores = useCallback(async (source) => {
        const pending = getPendingLTScoresForSource(source);
        const commentsPending = pendingComments && Object.keys(pendingComments).length > 0;

        if (pending.length === 0 && !commentsPending) return { success: true, count: 0 };

        dispatch({ type: ACTIONS.SET_SYNCING, payload: true });
        try {
            if (pending.length > 0) {
                if (setMultipleLtScoresMutation) {
                    await setMultipleLtScoresMutation({
                        token,
                        scores: pending,
                        source,
                        schoolId: currentSchoolId,
                    });
                } else {
                    await Promise.all(
                        pending.map(({ indicatorCode, ltColumn, value }) =>
                            setLtScoreMutation({
                                token,
                                indicatorCode,
                                ltColumn,
                                value,
                                source,
                                schoolId: currentSchoolId,
                            })
                        )
                    );
                }
            }

            if (commentsPending) await savePendingComments();

            dispatch({ type: ACTIONS.CLEAR_PENDING_FOR_SOURCE, payload: { source } });
            const now = new Date();
            dispatch({ type: ACTIONS.SET_LAST_SYNC, payload: now });
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());
            dispatch({ type: ACTIONS.CLEAR_ERROR });
            return { success: true, count: pending.length };
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: ERROR_MESSAGES.SYNC_FAILED });
            return { success: false, error: err, count: 0 };
        } finally {
            dispatch({ type: ACTIONS.SET_SYNCING, payload: false });
        }
    }, [getPendingLTScoresForSource, setLtScoreMutation, setMultipleLtScoresMutation, pendingComments, savePendingComments, currentSchoolId, token]);

    /**
     * Discard pending changes for a source
     */
    const discardPendingLTScores = useCallback((source) => {
        dispatch({ type: ACTIONS.CLEAR_PENDING_FOR_SOURCE, payload: { source } });
    }, []);

    /**
     * Clear all scores (reset)
     */
    const clearAllScores = useCallback(async () => {
        if (!currentSchoolId) return;
        try {
            await Promise.all([
                clearIndicatorScoresMutation({ schoolId: currentSchoolId }),
                clearLtScoresMutation({ token, schoolId: currentSchoolId }),
                clearCommentsMutation({ schoolId: currentSchoolId }),
            ]);
            dispatch({ type: ACTIONS.CLEAR_ALL_PENDING });
            localStorage.removeItem(STORAGE_KEYS.PENDING_SCORES);
            localStorage.removeItem(STORAGE_KEYS.PENDING_COMMENTS);
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: ERROR_MESSAGES.SYNC_FAILED });
            throw err;
        }
    }, [clearIndicatorScoresMutation, clearLtScoresMutation, clearCommentsMutation, currentSchoolId, token]);

    const value = useMemo(() => ({
        indicatorScores,
        indicatorSources,
        indicatorComments,
        ltScores,
        allData: checklistData,
        pendingLTScores,
        pendingComments,
        isSyncing,
        lastSyncTime,
        error,
        currentSchoolId,
        schools,
        currentSchool,
        setCurrentSchoolId,
        setIndicatorScore,
        setMultipleIndicatorScores,
        calculateOutcomeScore,
        getScoresForDimension,
        getIndicatorScore,
        getIndicatorStats,
        setIndicatorComment,
        getIndicatorComment,
        setIndicatorLTScore,
        getIndicatorLTScore,
        savePendingLTScores,
        savePendingComments,
        hasPendingChanges,
        getPendingCount,
        discardPendingLTScores,
        getPendingLTScoresForSource,
        clearAllScores,
        storeChecklistData,
        getChecklistData,
    }), [
        indicatorScores,
        indicatorSources,
        indicatorComments,
        ltScores,
        checklistData,
        pendingLTScores,
        pendingComments,
        isSyncing,
        lastSyncTime,
        error,
        currentSchoolId,
        schools,
        currentSchool,
        setCurrentSchoolId,
        setIndicatorScore,
        setMultipleIndicatorScores,
        calculateOutcomeScore,
        getScoresForDimension,
        getIndicatorScore,
        getIndicatorStats,
        setIndicatorComment,
        getIndicatorComment,
        setIndicatorLTScore,
        getIndicatorLTScore,
        savePendingLTScores,
        savePendingComments,
        hasPendingChanges,
        getPendingCount,
        discardPendingLTScores,
        getPendingLTScoresForSource,
        clearAllScores,
        storeChecklistData,
        getChecklistData,
    ]);

    return (
        <SSEDataContext.Provider value={value}>
            {children}
        </SSEDataContext.Provider>
    );
}

/**
 * Hook to access SSE data context
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSSEData() {
    const context = useContext(SSEDataContext);
    if (!context) {
        throw new Error('useSSEData must be used within an SSEDataProvider');
    }
    return context;
}

