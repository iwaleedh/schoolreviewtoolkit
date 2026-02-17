import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

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

// Load pending changes from localStorage
const loadPendingFromStorage = () => {
    try {
        const stored = localStorage.getItem('sse_pending_scores');
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

// Save pending changes to localStorage
const savePendingToStorage = (pending) => {
    try {
        localStorage.setItem('sse_pending_scores', JSON.stringify(pending));
    } catch {
        // Ignore storage errors
    }
};

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

    // OFFLINE-FIRST: Pending changes that haven't been synced to backend yet
    const [pendingLTScores, setPendingLTScores] = useState(() => loadPendingFromStorage());
    const [pendingComments, setPendingComments] = useState(() => {
        try {
            const stored = localStorage.getItem('sse_pending_comments');
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    });
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(() => {
        try {
            const stored = localStorage.getItem('sse_last_sync');
            return stored ? new Date(stored) : null;
        } catch {
            return null;
        }
    });

    // Persist pending changes to localStorage whenever they change
    useEffect(() => {
        savePendingToStorage(pendingLTScores);
    }, [pendingLTScores]);

    useEffect(() => {
        try {
            localStorage.setItem('sse_pending_comments', JSON.stringify(pendingComments));
        } catch (error) {
            console.warn('Failed to save pending comments to localStorage:', error);
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
     * Set score for a single indicator
     */
    const setIndicatorScore = useCallback(async (indicatorCode, value, source = 'unknown') => {
        await setIndicatorScoreMutation({
            indicatorCode,
            value,
            source,
        });
    }, [setIndicatorScoreMutation]);

    /**
     * Set scores for multiple indicators at once
     */
    const setMultipleIndicatorScores = useCallback(async (scores, source = 'unknown') => {
        const scoresArray = Object.entries(scores).map(([indicatorCode, value]) => ({
            indicatorCode,
            value,
        }));
        await setMultipleScoresMutation({
            scores: scoresArray,
            source,
        });
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
        if (percentage >= 90) return 'FA';      // Fully Achieved
        if (percentage >= 70) return 'MA';      // Mostly Achieved
        if (percentage >= 50) return 'A';       // Achieved
        return 'NS';                            // Not Sufficient
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
        const newPending = {
            ...pendingComments,
            [indicatorCode]: { comment, timestamp: Date.now() }
        };
        setPendingComments(newPending);
        // Also save to localStorage immediately for persistence
        try {
            localStorage.setItem('sse_pending_comments', JSON.stringify(newPending));
        } catch (error) {
            console.warn('Failed to save comment to localStorage:', error);
        }
    }, [pendingComments]);

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

            setPendingComments({});
            return { success: true, count: pending.length };
        } catch (error) {
            console.error('Failed to sync comments:', error);
            return { success: false, error, count: pending.length };
        }
    }, [pendingComments, setCommentMutation]);

    /**
     * Set LT score locally (offline-first - doesn't sync immediately)
     */
    const setIndicatorLTScore = useCallback((indicatorCode, ltColumn, value, source = 'unknown') => {
        // Store in pending state (local only)
        const newPending = {
            ...pendingLTScores,
            [indicatorCode]: {
                ...pendingLTScores[indicatorCode],
                [ltColumn]: { value, source, timestamp: Date.now() }
            }
        };
        setPendingLTScores(newPending);
        // Also save to localStorage immediately for persistence
        savePendingToStorage(newPending);
    }, [pendingLTScores]);

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

        setIsSyncing(true);
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
            setPendingLTScores(prev => {
                const newPending = { ...prev };
                Object.keys(newPending).forEach(indicatorCode => {
                    const columns = { ...newPending[indicatorCode] };
                    Object.keys(columns).forEach(ltColumn => {
                        if (columns[ltColumn].source === source) {
                            delete columns[ltColumn];
                        }
                    });
                    if (Object.keys(columns).length === 0) {
                        delete newPending[indicatorCode];
                    } else {
                        newPending[indicatorCode] = columns;
                    }
                });
                return newPending;
            });

            const now = new Date();
            setLastSyncTime(now);
            localStorage.setItem('sse_last_sync', now.toISOString());

            return { success: true, count: pending.length };
        } catch (error) {
            console.error('Failed to sync LT scores:', error);
            return { success: false, error, count: pending.length };
        } finally {
            setIsSyncing(false);
        }
    }, [getPendingLTScoresForSource, setLtScoreMutation, setMultipleLtScoresMutation, pendingComments, savePendingComments]);

    /**
     * Discard pending changes for a source
     */
    const discardPendingLTScores = useCallback((source) => {
        setPendingLTScores(prev => {
            const newPending = { ...prev };
            Object.keys(newPending).forEach(indicatorCode => {
                const columns = { ...newPending[indicatorCode] };
                Object.keys(columns).forEach(ltColumn => {
                    if (columns[ltColumn].source === source) {
                        delete columns[ltColumn];
                    }
                });
                if (Object.keys(columns).length === 0) {
                    delete newPending[indicatorCode];
                } else {
                    newPending[indicatorCode] = columns;
                }
            });
            return newPending;
        });
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
        await Promise.all([
            clearIndicatorScoresMutation(),
            clearLtScoresMutation(),
            clearCommentsMutation(),
        ]);
        setOutcomeScores({});
        setPendingLTScores({});
        setPendingComments({});
        localStorage.removeItem('sse_pending_scores');
        localStorage.removeItem('sse_pending_comments');
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

