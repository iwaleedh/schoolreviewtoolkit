import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from './AuthContext';
import {
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

export function SSEDataProvider({ children }) {
    const { user, token } = useAuth();

    // Initial school ID from user
    const [currentSchoolId, setCurrentSchoolId] = useState(user?.schoolId || null);

    // Fetch schools for default selection (Admin/Analyst)
    const schoolsQueryResult = useQuery(api.schools.listSchools);
    const schools = useMemo(() => schoolsQueryResult || [], [schoolsQueryResult]);


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
        currentSchoolId && token ? { schoolId: currentSchoolId, token } : "skip"
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
    const clearLtScoresMutation = useMutation(api.ltScores.clearAll);
    const setCommentMutation = useMutation(api.comments.set);
    const clearCommentsMutation = useMutation(api.comments.clearAll);

    // Local state for checklist data (CSV data doesn't need persistence)
    const [checklistData, setChecklistData] = useState({});

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
        } catch (err) {
            console.error('Failed to sync indicator score:', err);
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
        } catch (err) {
            console.error('Failed to sync multiple indicator scores:', err);
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
     * Set comment in real-time
     */
    const setIndicatorComment = useCallback((indicatorCode, comment) => {
        const sanitizedCode = sanitizeIndicatorCode(indicatorCode);
        const sanitizedComment = sanitizeComment(comment);
        if (!sanitizedCode || !currentSchoolId) return;

        // Fire and forget mutation for real-time sync
        setCommentMutation({
            indicatorCode: sanitizedCode,
            comment: sanitizedComment,
            schoolId: currentSchoolId,
        }).catch(err => {
            console.error('Failed to sync comment:', err);
        });
    }, [setCommentMutation, currentSchoolId]);

    /**
     * Get comment from server data
     */
    const getIndicatorComment = useCallback((indicatorCode) => {
        return indicatorComments?.[indicatorCode] || '';
    }, [indicatorComments]);



    /**
     * Set LT score in real-time
     */
    const setIndicatorLTScore = useCallback((indicatorCode, ltColumn, value, source = 'unknown') => {
        const sanitizedCode = sanitizeIndicatorCode(indicatorCode);
        const validatedValue = validateLTScore(value);
        if (!sanitizedCode || !ltColumn || !currentSchoolId) return;

        // Fire and forget mutation for real-time sync
        setLtScoreMutation({
            token,
            indicatorCode: sanitizedCode,
            ltColumn,
            value: validatedValue,
            source,
            schoolId: currentSchoolId,
        }).catch(err => {
            console.error('Failed to sync LT score:', err);
        });
    }, [setLtScoreMutation, currentSchoolId, token]);

    /**
     * Get LT score from server data
     */
    const getIndicatorLTScore = useCallback((indicatorCode, ltColumn) => {
        return ltScores?.[indicatorCode]?.[ltColumn] ?? null;
    }, [ltScores]);



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
        } catch (err) {
            console.error('Failed to clear all scores:', err);
            throw err;
        }
    }, [clearIndicatorScoresMutation, clearLtScoresMutation, clearCommentsMutation, currentSchoolId, token]);

    const value = useMemo(() => ({
        indicatorScores,
        indicatorSources,
        indicatorComments,
        ltScores,
        allData: checklistData,
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
        clearAllScores,
        storeChecklistData,
        getChecklistData,
    }), [
        indicatorScores,
        indicatorSources,
        indicatorComments,
        ltScores,
        checklistData,
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

