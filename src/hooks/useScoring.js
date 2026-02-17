/**
 * useScoring Hook
 * 
 * Custom hook for calculating and managing scores from checklist data
 * Integrates with SSEDataContext to provide real-time score calculations
 */

import { useMemo } from 'react';
import { useSSEData } from '../context/SSEDataContext';
import {
    processChecklistData,
    calculateOverallScore,
    findStrengths,
    findWeaknesses,
    calculateCompletionRate,
    normalizeIndicatorValue,
    OUTCOME_GRADES,
} from '../utils/scoringEngine';

/**
 * Hook to calculate scores for a specific checklist/dimension
 * @param {string} source - The data source identifier (e.g., 'D1', 'LT1', 'Principal')
 * @returns {object} Scoring data and utilities
 */
export function useChecklistScoring(source) {
    const { getChecklistData } = useSSEData();
    
    const data = useMemo(() => {
        const checklistData = getChecklistData(source);
        if (!checklistData || checklistData.length === 0) {
            return null;
        }
        return processChecklistData(checklistData, 'Score');
    }, [source, getChecklistData]);
    
    const strengths = useMemo(() => {
        if (!data) return [];
        return findStrengths(data, 5);
    }, [data]);
    
    const weaknesses = useMemo(() => {
        if (!data) return [];
        return findWeaknesses(data, 5);
    }, [data]);
    
    const completion = useMemo(() => {
        if (!data) return { completed: 0, total: 0, percentage: 0 };
        return calculateCompletionRate(data);
    }, [data]);
    
    return {
        data,
        dimensionScore: data?.dimension?.score || 0,
        dimensionGrade: data?.dimension?.grade || 'NR',
        outcomes: data?.outcomes || {},
        substrands: data?.substrands || {},
        strands: data?.strands || {},
        strengths,
        weaknesses,
        completion,
        isLoaded: !!data,
    };
}

/**
 * Hook to calculate overall school scores across all dimensions
 * @returns {object} Overall scoring data
 */
export function useOverallScoring() {
    const { allData } = useSSEData();
    
    // Process each dimension
    const dimensionScores = useMemo(() => {
        const dimensions = ['D1', 'D2', 'D3', 'D4', 'D5'];
        const scores = {};
        
        dimensions.forEach(dim => {
            const data = allData[dim];
            if (data && data.length > 0) {
                const processed = processChecklistData(data, 'Score');
                scores[dim] = {
                    score: processed.dimension.score,
                    grade: processed.dimension.grade,
                    completion: calculateCompletionRate(processed),
                };
            } else {
                scores[dim] = {
                    score: 0,
                    grade: 'NR',
                    completion: { completed: 0, total: 0, percentage: 0 },
                };
            }
        });
        
        return scores;
    }, [allData]);
    
    // Calculate overall score
    const overall = useMemo(() => {
        const dimensionArray = Object.values(dimensionScores);
        return calculateOverallScore(dimensionArray);
    }, [dimensionScores]);
    
    // Find overall strengths and weaknesses
    const allStrengths = useMemo(() => {
        const strengths = [];
        Object.entries(allData).forEach(([source, data]) => {
            if (data && data.length > 0) {
                const processed = processChecklistData(data, 'Score');
                const sourceStrengths = findStrengths(processed, 3);
                sourceStrengths.forEach(s => {
                    strengths.push({ ...s, source });
                });
            }
        });
        return strengths.sort((a, b) => b.score - a.score).slice(0, 5);
    }, [allData]);
    
    const allWeaknesses = useMemo(() => {
        const weaknesses = [];
        Object.entries(allData).forEach(([source, data]) => {
            if (data && data.length > 0) {
                const processed = processChecklistData(data, 'Score');
                const sourceWeaknesses = findWeaknesses(processed, 3);
                sourceWeaknesses.forEach(w => {
                    weaknesses.push({ ...w, source });
                });
            }
        });
        return weaknesses.sort((a, b) => a.score - b.score).slice(0, 5);
    }, [allData]);
    
    // Calculate total completion across all sources
    const totalCompletion = useMemo(() => {
        let totalCompleted = 0;
        let totalItems = 0;
        
        Object.values(dimensionScores).forEach(dim => {
            totalCompleted += dim.completion.completed;
            totalItems += dim.completion.total;
        });
        
        const percentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
        return { completed: totalCompleted, total: totalItems, percentage };
    }, [dimensionScores]);
    
    return {
        overall,
        dimensionScores,
        strengths: allStrengths,
        weaknesses: allWeaknesses,
        completion: totalCompletion,
    };
}

/**
 * Hook to get outcome grade distribution
 * @param {string} source - The data source identifier
 * @returns {object} Grade distribution counts
 */
export function useGradeDistribution(source) {
    const { getChecklistData } = useSSEData();
    
    const distribution = useMemo(() => {
        const data = getChecklistData(source);
        if (!data || data.length === 0) {
            return { FA: 0, MA: 0, A: 0, NS: 0, NR: 0, total: 0 };
        }
        
        const processed = processChecklistData(data, 'Score');
        const outcomes = Object.values(processed.outcomes);
        
        const dist = {
            FA: outcomes.filter(o => o.grade === 'FA').length,
            MA: outcomes.filter(o => o.grade === 'MA').length,
            A: outcomes.filter(o => o.grade === 'A').length,
            NS: outcomes.filter(o => o.grade === 'NS').length,
            NR: outcomes.filter(o => o.grade === 'NR').length,
            total: outcomes.length,
        };
        
        return dist;
    }, [source, getChecklistData]);
    
    return distribution;
}

/**
 * Hook to compare multiple sources/schools
 * @param {Array<string>} sources - Array of source identifiers to compare
 * @returns {Array} Comparison data
 */
export function useScoreComparison(sources) {
    const { allData } = useSSEData();
    
    const comparison = useMemo(() => {
        return sources.map(source => {
            const data = allData[source];
            if (!data || data.length === 0) {
                return {
                    source,
                    score: 0,
                    grade: 'NR',
                    completion: 0,
                };
            }
            
            const processed = processChecklistData(data, 'Score');
            const completion = calculateCompletionRate(processed);
            
            return {
                source,
                score: processed.dimension.score,
                grade: processed.dimension.grade,
                completion: completion.percentage,
                outcomes: processed.outcomes,
                substrands: processed.substrands,
            };
        });
    }, [sources, allData]);
    
    return comparison;
}

/**
 * Hook to get real-time indicator status
 * @param {Array} indicators - Array of indicator data
 * @returns {object} Indicator statistics
 */
export function useIndicatorStats(indicators) {
    const stats = useMemo(() => {
        if (!indicators || indicators.length === 0) {
            return { met: 0, notMet: 0, notReviewed: 0, total: 0, percentage: 0 };
        }
        
        let met = 0;
        let notMet = 0;
        let notReviewed = 0;
        
        indicators.forEach(indicator => {
            const score = normalizeIndicatorValue(indicator.Score || indicator.score);
            if (score === 1) met++;
            else if (score === 0) notMet++;
            else notReviewed++;
        });
        
        const total = indicators.length;
        const reviewed = met + notMet;
        const percentage = reviewed > 0 ? Math.round((met / reviewed) * 100) : 0;
        
        return { met, notMet, notReviewed, total, percentage };
    }, [indicators]);
    
    return stats;
}

export default {
    useChecklistScoring,
    useOverallScoring,
    useGradeDistribution,
    useScoreComparison,
    useIndicatorStats,
};
