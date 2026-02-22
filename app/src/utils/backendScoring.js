/**
 * Backend Scoring Utility
 * Handles scoring calculations for indicators, outcomes, and substrands
 * Based on SIQAAF framework requirements
 */

import { MULTI_COLUMN_THRESHOLD } from './constants';

export { MULTI_COLUMN_THRESHOLD as INDICATOR_THRESHOLD };

/**
 * Calculate normalized indicator score from multiple data sources
 * @param {Array} dataPoints - Array of { source, value } objects where value is 'yes', 'no', 'nr', or null
 * @returns {Object} { score: 1|0|'NA', breakdown: string, sources: string[], achieved: number, total: number, dataPoints: Array }
 */
export function calculateIndicatorScore(dataPoints) {
    if (!dataPoints || dataPoints.length === 0) {
        return { score: 'NA', breakdown: 'No data', sources: [], achieved: 0, total: 0, dataPoints: [] };
    }

    const sources = [];
    let positiveCount = 0;
    let totalCount = 0;

    dataPoints.forEach(({ source, value }) => {
        if (value === 'yes') {
            positiveCount++;
            totalCount++;
            sources.push(source);
        } else if (value === 'no') {
            totalCount++;
            sources.push(source);
        }
    });

    if (totalCount === 0) {
        return { 
            score: 'NA', 
            breakdown: 'No valid data points', 
            sources: [],
            achieved: 0, 
            total: 0,
            dataPoints,
        };
    }

    const percentage = Math.round((positiveCount / totalCount) * 100);
    const score = percentage >= MULTI_COLUMN_THRESHOLD ? 1 : 0;

    return {
        score,
        breakdown: `${positiveCount}/${totalCount} = ${percentage}%`,
        sources: [...new Set(sources)],
        achieved: positiveCount,
        total: totalCount,
        percentage,
        dataPoints,
    };
}

/**
 * Calculate outcome score based on indicator scores
 * Score: 3 = 100%, 2 = 60-99%, 1 = <60% but >0%, 0 = 0%
 * NA indicators are excluded from the count
 * @param {Array} indicators - Array of { score: 1|0|'NA', code: string }
 * @returns {Object} { score: 0|1|2|3, breakdown: { total, achieved, percentage }, indicators: Array }
 */
export function calculateOutcomeScore(indicators) {
    if (!indicators || indicators.length === 0) {
        return { 
            score: 0, 
            breakdown: { total: 0, achieved: 0, percentage: 0 },
            indicators: []
        };
    }

    let achievedCount = 0;
    let totalCount = 0;
    const processedIndicators = [];

    indicators.forEach(indicator => {
        if (indicator.score === 'NA') {
            processedIndicators.push({ ...indicator, excluded: true });
            return;
        }

        totalCount++;
        if (indicator.score === 1) {
            achievedCount++;
        }
        processedIndicators.push({ ...indicator, excluded: false });
    });

    if (totalCount === 0) {
        return {
            score: 0,
            breakdown: { total: 0, achieved: 0, percentage: 0 },
            indicators: processedIndicators
        };
    }

    const percentage = Math.round((achievedCount / totalCount) * 100);
    
    let score;
    if (percentage === 100) {
        score = 3;
    } else if (percentage >= 60) {
        score = 2;
    } else if (percentage > 0) {
        score = 1;
    } else {
        score = 0;
    }

    return {
        score,
        breakdown: {
            total: totalCount,
            achieved: achievedCount,
            percentage,
        },
        indicators: processedIndicators,
    };
}

/**
 * Calculate substrand distribution from outcomes
 * @param {Array} outcomes - Array of { score: 0|1|2|3 }
 * @returns {Object} { score3: number, score2: number, score1: number, score0: number, total: number }
 */
export function calculateSubstrandDistribution(outcomes) {
    if (!outcomes || outcomes.length === 0) {
        return { score3: 0, score2: 0, score1: 0, score0: 0, total: 0 };
    }

    const distribution = { score3: 0, score2: 0, score1: 0, score0: 0, total: outcomes.length };

    outcomes.forEach(outcome => {
        if (outcome.score === 3) distribution.score3++;
        else if (outcome.score === 2) distribution.score2++;
        else if (outcome.score === 1) distribution.score1++;
        else distribution.score0++;
    });

    return distribution;
}

/**
 * Get color for indicator score
 * @param {number|string} score - 1, 0, or 'NA'
 * @returns {Object} { hex, bg, text }
 */
export function getIndicatorScoreColor(score) {
    switch (score) {
        case 1:
            return { hex: '#16a34a', bg: '#dcfce7', text: '#15803d' };
        case 0:
            return { hex: '#dc2626', bg: '#fee2e2', text: '#b91c1c' };
        case 'NA':
        default:
            return { hex: '#6b7280', bg: '#f3f4f6', text: '#4b5563' };
    }
}

/**
 * Get color for outcome score
 * @param {number} score - 3, 2, 1, or 0
 * @returns {Object} { hex, bg, text }
 */
export function getOutcomeScoreColor(score) {
    switch (score) {
        case 3:
            return { hex: '#7c3aed', bg: '#f3e8ff', text: '#6d28d9' };
        case 2:
            return { hex: '#16a34a', bg: '#dcfce7', text: '#15803d' };
        case 1:
            return { hex: '#d97706', bg: '#fef3c7', text: '#b45309' };
        case 0:
        default:
            return { hex: '#dc2626', bg: '#fee2e2', text: '#b91c1c' };
    }
}

/**
 * Get score display symbol for indicator
 * @param {number|string} score - 1, 0, or 'NA'
 * @returns {string}
 */
export function getIndicatorSymbol(score) {
    switch (score) {
        case 1:
            return '●';
        case 0:
            return '○';
        case 'NA':
        default:
            return '◷';
    }
}

/**
 * Get score display symbol for outcome
 * @param {number} score - 3, 2, 1, or 0
 * @returns {string}
 */
export function getOutcomeSymbol(score) {
    switch (score) {
        case 3:
            return '●●●';
        case 2:
            return '●●○';
        case 1:
            return '●○○';
        case 0:
        default:
            return '○○○';
    }
}

export default {
    MULTI_COLUMN_THRESHOLD,
    calculateIndicatorScore,
    calculateOutcomeScore,
    calculateSubstrandDistribution,
    getIndicatorScoreColor,
    getOutcomeScoreColor,
    getIndicatorSymbol,
    getOutcomeSymbol,
};
