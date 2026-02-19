import { createContext, useContext, useCallback, useMemo, useState, useEffect, useReducer } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
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
    switch (action.type) {
        case ACTIONS.SET_PENDING_LT_SCORE: {
            const { indicatorCode, ltColumn, value, source } = action.payload;
            return {
                ...state,
                ltScores: {
                    ...state.ltScores,
                    [indicatorCode]: {
                        ...state.ltScores[indicatorCode],
                        [ltColumn]: { value, source, timestamp: Date.now() }
                    }
                },
            };
        }
        case ACTIONS.SET_PENDING_COMMENT: {
            const { indicatorCode, comment } = action.payload;
            return {
                ...state,
                comments: {
                    ...state.comments,
                    [indicatorCode]: { comment, timestamp: Date.now() }
                },
            };
        }
        case ACTIONS.CLEAR_PENDING_FOR_SOURCE: {
            const { source } = action.payload;
            const newLtScores = { ...state.ltScores };
            Object.keys(newLtScores).forEach(indicatorCode => {
                const columns = { ...newLtScores[indicatorCode] };
                Object.keys(columns).forEach(ltColumn => {
                    if (columns[ltColumn].source === source) {
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
                indicatorScores: {},
            };
        }
        case ACTIONS.SET_SYNCING: {
            return { ...state, isSyncing: action.payload };
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
const createInitialState = () => ({
    ltScores: loadPendingFromStorage(),
    comments: (() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.PENDING_COMMENTS);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    })(),
    isSyncing: false,
    lastSyncTime: (() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
            return stored ? new Date(stored) : null;
        } catch {
            return null;
        }
    })(),
    error: null,
});

export function SSEDataProvider({ children }) {
    // Convex queries - real-time data from database
    const indicatorData = useQuery(api.indicatorScores.getAll) ?? { scores: {}, sources: {} };
    const ltScoresData = useQuery(api.ltScores.getAll) ?? {};
    const commentsData = useQuery(api.comments.getAll) ?? {};

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

    // Outcome scores are calculated, not stored
    const [outcomeScores, setOutcomeScores] = useState({});

    // Use reducer for pending state management
    const [pendingState, dispatch] = useReducer(pendingReducer, null, createInitialState);
    const { ltScores: pendingLTScores, comments: pendingComments, isSyncing, lastSyncTime, error } = pendingState;

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

    // Extract scores and sources from query result
    const indicatorScores = indicatorData.scores;
    const indicatorSources = indicatorData.sources;
    const ltScores = ltScoresData;
    const indicatorComments = commentsData;

    /**
     * Store checklist data from CSV for a source (local only)
     */
    const storeChecklistData = useCallback((source, data) => {
        setChecklistData(prev => ({
            ...prev,
            [source]: data
        }));
    }, []);

    /**
     * Get checklist data for a source
     */
    const getChecklistData = useCallback((source) => {
        return checklistData[source] || [];
    }, [checklistData]);

    /**
     * Set score for a single indicator with validation
     */
    const setIndicatorScore = useCallback(async (indicatorCode, value, source = 'unknown') => {
        const sanitizedCode = sanitizeIndicatorCode(indicatorCode);
        const validatedScore = validateScore(value);
        
        if (!sanitizedCode) {
            console.warn('Invalid indicator code:', indicatorCode);
            return;
        }
        
        try {
            await setIndicatorScoreMutation({
                indicatorCode: sanitizedCode,
                value: validatedScore,
                source,
            });
            dispatch({ type: ACTIONS.CLEAR_ERROR });
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: ERROR_MESSAGES.SYNC_FAILED });
            throw err;
        }
    }, [setIndicatorScoreMutation]);

    /**
     * Set scores for multiple indicators at once
     */
    const setMultipleIndicatorScores = useCallback(async (scores, source = 'unknown') => {
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
            });
            dispatch({ type: ACTIONS.CLEAR_ERROR });
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: ERROR_MESSAGES.SYNC_FAILED });
            throw err;
        }
    }, [setMultipleScoresMutation]);

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

        // If no scores entered, return NR
        if (scoredCount === 0) return 'NR';

        // Calculate percentage of "yes" among scored items
        const percentage = (yesCount / scoredCount) * 100;

        // Grade thresholds (SIQAAF framework)
        if (percentage >= SCORING_THRESHOLDS.FA) return 'FA';
        if (percentage >= SCORING_THRESHOLDS.MA) return 'MA';
        if (percentage >= SCORING_THRESHOLDS.A) return 'A';
        return 'NS';
    }, [indicatorScores]);

    /**
     * Get all scores for indicators in a specific dimension
     */
    const getScoresForDimension = useCallback((indicatorCodes) => {
        const scores = {};
        indicatorCodes.forEach(code => {
            scores[code] = indicatorScores[code] || null;
        });
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

        indicatorCodes.forEach(code => {
            const score = indicatorScores[code];
            if (score === 'yes') yes++;
            else if (score === 'no') no++;
            else if (score === 'nr') nr++;
            else unscored++;
        });

        return { yes, no, nr, unscored, total: indicatorCodes.length };
    }, [indicatorScores]);

    /**
     * Set comment locally (offline-first with localStorage persistence)
     */
    const setIndicatorComment = useCallback((indicatorCode, comment) => {
        const sanitizedCode = sanitizeIndicatorCode(indicatorCode);
        const sanitizedComment = sanitizeComment(comment);
        
        if (!sanitizedCode) {
            console.warn('Invalid indicator code for comment:', indicatorCode);
            return;
        }
        
        dispatch({ 
            type: ACTIONS.SET_PENDING_COMMENT, 
            payload: { indicatorCode: sanitizedCode, comment: sanitizedComment } 
        });
    }, []);

    /**
     * Get comment - check pending first, then server data
     */
    const getIndicatorComment = useCallback((indicatorCode) => {
        const pending = pendingComments[indicatorCode]?.comment;
        if (pending !== undefined) {
            return pending;
        }
        return indicatorComments[indicatorCode] || '';
    }, [indicatorComments, pendingComments]);

    /**
     * Save pending comments to backend
     */
    const savePendingComments = useCallback(async () => {
        const pending = Object.entries(pendingComments);
        if (pending.length === 0) return { success: true, count: 0 };

        try {
            await Promise.all(
                pending.map(([indicatorCode, data]) =>
                    setCommentMutation({
                        indicatorCode,
                        comment: data.comment,
                    })
                )
            );

            dispatch({ type: ACTIONS.CLEAR_PENDING_COMMENTS });
            localStorage.removeItem(STORAGE_KEYS.PENDING_COMMENTS);
            return { success: true, count: pending.length };
        } catch (error) {
            console.error('Failed to sync comments:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: ERROR_MESSAGES.SYNC_FAILED });
            return { success: false, error, count: pending.length };
        }
    }, [pendingComments, setCommentMutation]);

    /**
     * Set LT score locally (offline-first - doesn't sync immediately)
     */
    const setIndicatorLTScore = useCallback((indicatorCode, ltColumn, value, source = 'unknown') => {
        const sanitizedCode = sanitizeIndicatorCode(indicatorCode);
        const validatedValue = validateLTScore(value);
        
        if (!sanitizedCode) {
            console.warn('Invalid indicator code:', indicatorCode);
            return;
        }
        
        dispatch({
            type: ACTIONS.SET_PENDING_LT_SCORE,
            payload: { indicatorCode: sanitizedCode, ltColumn, value: validatedValue, source },
        });
    }, []);

    /**
     * Get LT score - check pending (local) first, then server data
     */
    const getIndicatorLTScore = useCallback((indicatorCode, ltColumn) => {
        // Check pending changes first (local priority)
        const pending = pendingLTScores[indicatorCode]?.[ltColumn]?.value;
        if (pending !== undefined) {
            return pending;
        }
        // Fall back to server data
        return ltScores[indicatorCode]?.[ltColumn] ?? null;
    }, [ltScores, pendingLTScores]);

    /**
     * Get all pending LT scores for a source
     */
    const getPendingLTScoresForSource = useCallback((source) => {
        const result = [];
        Object.entries(pendingLTScores).forEach(([indicatorCode, columns]) => {
            Object.entries(columns).forEach(([ltColumn, data]) => {
                if (data.source === source) {
                    result.push({
                        indicatorCode,
                        ltColumn,
                        value: data.value,
                    });
                }
            });
        });
        return result;
    }, [pendingLTScores]);

    /**
     * Check if there are pending changes for a source
     */
    const hasPendingChanges = useCallback((source) => {
        return Object.values(pendingLTScores).some(columns => 
            Object.values(columns).some(data => data.source === source)
        );
    }, [pendingLTScores]);

    /**
     * Save all pending LT scores to backend (batch sync)
     */
    const savePendingLTScores = useCallback(async (source) => {
        const pending = getPendingLTScoresForSource(source);
        if (pending.length === 0 && Object.keys(pendingComments).length === 0) {
            return { success: true, count: 0 };
        }

        dispatch({ type: ACTIONS.SET_SYNCING, payload: true });
        try {
            // Save LT scores
            if (pending.length > 0) {
                // Use batch mutation if available, otherwise fall back to individual calls
                if (setMultipleLtScoresMutation) {
                    await setMultipleLtScoresMutation({
                        scores: pending,
                        source,
                    });
                } else {
                    // Fallback: save individually
                    await Promise.all(
                        pending.map(({ indicatorCode, ltColumn, value }) =>
                            setLtScoreMutation({
                                indicatorCode,
                                ltColumn,
                                value,
                                source,
                            })
                        )
                    );
                }
            }

            // Also save pending comments
            if (Object.keys(pendingComments).length > 0) {
                await savePendingComments();
            }

            // Clear pending scores for this source
            dispatch({ type: ACTIONS.CLEAR_PENDING_FOR_SOURCE, payload: { source } });

            const now = new Date();
            dispatch({ type: ACTIONS.SET_LAST_SYNC, payload: now });
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());
            dispatch({ type: ACTIONS.CLEAR_ERROR });

            return { success: true, count: pending.length };
        } catch (err) {
            console.error('Failed to sync LT scores:', err);
            dispatch({ type: ACTIONS.SET_ERROR, payload: ERROR_MESSAGES.SYNC_FAILED });
            return { success: false, error: err, count: pending.length };
        } finally {
            dispatch({ type: ACTIONS.SET_SYNCING, payload: false });
        }
    }, [getPendingLTScoresForSource, setLtScoreMutation, setMultipleLtScoresMutation, pendingComments, savePendingComments]);

    /**
     * Discard pending changes for a source
     */
    const discardPendingLTScores = useCallback((source) => {
        dispatch({ type: ACTIONS.CLEAR_PENDING_FOR_SOURCE, payload: { source } });
    }, []);

    /**
     * Get pending comments count
     */
    const getPendingCount = useCallback((source) => {
        return getPendingLTScoresForSource(source).length;
    }, [getPendingLTScoresForSource]);

    /**
     * Clear all scores (reset)
     */
    const clearAllScores = useCallback(async () => {
        try {
            await Promise.all([
                clearIndicatorScoresMutation(),
                clearLtScoresMutation(),
                clearCommentsMutation(),
            ]);
            setOutcomeScores({});
            dispatch({ type: ACTIONS.CLEAR_ALL_PENDING });
            localStorage.removeItem(STORAGE_KEYS.PENDING_SCORES);
            localStorage.removeItem(STORAGE_KEYS.PENDING_COMMENTS);
        } catch (err) {
            console.error('Failed to clear all scores:', err);
            dispatch({ type: ACTIONS.SET_ERROR, payload: ERROR_MESSAGES.SYNC_FAILED });
            throw err;
        }
    }, [clearIndicatorScoresMutation, clearLtScoresMutation, clearCommentsMutation]);

    const value = useMemo(() => ({
        // State
        indicatorScores,
        outcomeScores,
        indicatorSources,
        indicatorComments,
        ltScores,
        allData: checklistData,
        
        // Offline-first state
        pendingLTScores,
        pendingComments,
        isSyncing,
        lastSyncTime,
        error,

        // Actions
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
        clearAllScores,
        storeChecklistData,
        getChecklistData,
        
        // Offline-first actions
        savePendingLTScores,
        savePendingComments,
        hasPendingChanges,
        getPendingCount,
        discardPendingLTScores,
        getPendingLTScoresForSource,
    }), [
        indicatorScores,
        outcomeScores,
        indicatorSources,
        indicatorComments,
        ltScores,
        checklistData,
        pendingLTScores,
        pendingComments,
        isSyncing,
        lastSyncTime,
        error,
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
        clearAllScores,
        storeChecklistData,
        getChecklistData,
        savePendingLTScores,
        savePendingComments,
        hasPendingChanges,
        getPendingCount,
        discardPendingLTScores,
        getPendingLTScoresForSource,
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

