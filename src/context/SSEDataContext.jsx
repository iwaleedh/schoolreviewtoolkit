import { createContext, useContext, useState, useCallback } from 'react';

/**
 * SSEDataContext - Global state for all checklist scores
 * 
 * Architecture:
 * - Data Input Tabs (LT, Principal, Admin, etc.) write scores here
 * - Dimension Tabs read scores from here (view-only)
 */

const SSEDataContext = createContext(null);

export function SSEDataProvider({ children }) {
    // Indicator scores: { [IndicatorCode]: 'yes' | 'no' | 'nr' | null }
    const [indicatorScores, setIndicatorScores] = useState({});

    // Outcome scores: { [OutcomeNo]: 'FA' | 'MA' | 'A' | 'NS' | 'NR' | null }
    // These are auto-calculated from indicator scores
    const [outcomeScores, setOutcomeScores] = useState({});

    // Track which checklist each indicator came from (for debugging/tracking)
    const [indicatorSources, setIndicatorSources] = useState({});

    // Indicator comments: { [IndicatorCode]: string }
    const [indicatorComments, setIndicatorComments] = useState({});

    // LT Scores for multi-column checklists: { [IndicatorCode]: { LT1: 1|0|'NA'|null, LT2: ..., ... } }
    const [ltScores, setLtScores] = useState({});

    // Checklist data storage: { [source]: Array<checklistRow> }
    const [checklistData, setChecklistData] = useState({});

    /**
     * Store checklist data from CSV for a source
     * @param {string} source - Source identifier (e.g., 'D1', 'LT1', 'Principal')
     * @param {Array} data - Array of checklist rows
     */
    const storeChecklistData = useCallback((source, data) => {
        setChecklistData(prev => ({
            ...prev,
            [source]: data
        }));
    }, []);

    /**
     * Get checklist data for a source
     * @param {string} source - Source identifier
     * @returns {Array} Checklist data array
     */
    const getChecklistData = useCallback((source) => {
        return checklistData[source] || [];
    }, [checklistData]);

    /**
     * Set score for a single indicator
     * @param {string} indicatorCode - The indicator's unique code
     * @param {'yes' | 'no' | 'nr' | null} value - The score value
     * @param {string} source - Which checklist tab this came from (e.g., 'LT1', 'Principal')
     */
    const setIndicatorScore = useCallback((indicatorCode, value, source = 'unknown') => {
        setIndicatorScores(prev => ({
            ...prev,
            [indicatorCode]: value
        }));

        setIndicatorSources(prev => ({
            ...prev,
            [indicatorCode]: source
        }));
    }, []);

    /**
     * Set scores for multiple indicators at once
     * @param {Object} scores - { [indicatorCode]: value }
     * @param {string} source - Which checklist tab
     */
    const setMultipleIndicatorScores = useCallback((scores, source = 'unknown') => {
        setIndicatorScores(prev => ({
            ...prev,
            ...scores
        }));

        const sources = {};
        Object.keys(scores).forEach(code => {
            sources[code] = source;
        });
        setIndicatorSources(prev => ({
            ...prev,
            ...sources
        }));
    }, []);

    /**
     * Calculate outcome score based on indicator scores
     * @param {Array} indicatorCodes - List of indicator codes for this outcome
     * @returns {'FA' | 'MA' | 'A' | 'NS' | 'NR'} - Calculated grade
     */
    const calculateOutcomeScore = useCallback((indicatorCodes) => {
        if (!indicatorCodes || indicatorCodes.length === 0) return 'NR';

        let yesCount = 0;
        let noCount = 0;
        let nrCount = 0;

        indicatorCodes.forEach(code => {
            const score = indicatorScores[code];
            if (score === 'yes') yesCount++;
            else if (score === 'no') noCount++;
            else nrCount++;
        });

        const total = indicatorCodes.length;
        const scoredCount = yesCount + noCount;

        // If no scores entered, return NR
        if (scoredCount === 0) return 'NR';

        // Calculate percentage of "yes" among scored items
        const percentage = (yesCount / scoredCount) * 100;

        // Grade thresholds (adjust as needed for SIQAAF framework)
        if (percentage >= 90) return 'FA';      // Fully Achieved
        if (percentage >= 70) return 'MA';      // Mostly Achieved
        if (percentage >= 50) return 'A';       // Achieved
        return 'NS';                            // Not Sufficient
    }, [indicatorScores]);

    /**
     * Get all scores for indicators in a specific dimension
     * @param {string} dimensionId - e.g., 'd1', 'd2'
     * @param {Array} indicatorCodes - List of indicator codes for this dimension
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
     * Set comment for an indicator
     */
    const setIndicatorComment = useCallback((indicatorCode, comment) => {
        setIndicatorComments(prev => ({
            ...prev,
            [indicatorCode]: comment
        }));
    }, []);

    /**
     * Get comment for an indicator
     */
    const getIndicatorComment = useCallback((indicatorCode) => {
        return indicatorComments[indicatorCode] || '';
    }, [indicatorComments]);

    /**
     * Set LT score for an indicator (for multi-column LT checklists)
     * @param {string} indicatorCode - The indicator's unique code
     * @param {string} ltColumn - LT column name (e.g., 'LT1', 'LT2', etc.)
     * @param {1 | 0 | 'NA' | null} value - The score value
     * @param {string} source - Which checklist tab this came from
     */
    const setIndicatorLTScore = useCallback((indicatorCode, ltColumn, value, source = 'unknown') => {
        setLtScores(prev => ({
            ...prev,
            [indicatorCode]: {
                ...(prev[indicatorCode] || {}),
                [ltColumn]: value
            }
        }));

        setIndicatorSources(prev => ({
            ...prev,
            [indicatorCode]: source
        }));
    }, []);

    /**
     * Get LT score for an indicator
     */
    const getIndicatorLTScore = useCallback((indicatorCode, ltColumn) => {
        return ltScores[indicatorCode]?.[ltColumn] ?? null;
    }, [ltScores]);

    /**
     * Clear all scores (reset)
     */
    const clearAllScores = useCallback(() => {
        setIndicatorScores({});
        setOutcomeScores({});
        setIndicatorSources({});
        setIndicatorComments({});
        setLtScores({});
    }, []);

    const value = {
        // State
        indicatorScores,
        outcomeScores,
        indicatorSources,
        indicatorComments,
        ltScores,
        allData: checklistData,

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
    };

    return (
        <SSEDataContext.Provider value={value}>
            {children}
        </SSEDataContext.Provider>
    );
}

/**
 * Hook to access SSE data context
 */
export function useSSEData() {
    const context = useContext(SSEDataContext);
    if (!context) {
        throw new Error('useSSEData must be used within an SSEDataProvider');
    }
    return context;
}

export default SSEDataContext;
