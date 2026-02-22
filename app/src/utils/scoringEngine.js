/**
 * SIQAAF Scoring Engine
 * 
 * Implements the scoring system for the School Review Toolkit
 * Based on the SIQAAF Framework specifications
 * 
 * Hierarchy: Dimension → Strand → Substrand → Outcome → Indicator
 * 
 * Scoring Rules:
 * - Indicators: ✓ (1), ✗ (0), NR (null)
 * - Outcomes: FA (≥90%), MA (70-89%), A (50-69%), NS (<50%), NR
 * - 60% threshold for multi-column data normalization
 */

import { 
    SCORING_THRESHOLDS, 
    GRADE_COLORS, 
    GRADE_LABELS,
    MULTI_COLUMN_THRESHOLD,
    getGradeFromPercentage 
} from './constants';

// ============================================
// INDICATOR SCORING
// ============================================

/**
 * Normalize a single indicator score
 * @param {any} value - The raw indicator value (✓, ✗, 1, 0, 'Yes', 'No', 'NR', etc.)
 * @returns {number|null} - 1 (met), 0 (not met), or null (not reviewed)
 */
export function normalizeIndicatorValue(value) {
    if (value === null || value === undefined || value === '' || value === 'NR' || value === '-') {
        return null;
    }
    
    // Positive values
    if (value === 1 || value === '1' || value === '✓' || value === 'Yes' || value === 'yes' || value === true || value === 'Y') {
        return 1;
    }
    
    // Negative values
    if (value === 0 || value === '0' || value === '✗' || value === 'No' || value === 'no' || value === false || value === 'N') {
        return 0;
    }
    
    // Try to parse as number
    const num = parseFloat(value);
    if (!isNaN(num)) {
        return num >= 0.5 ? 1 : 0;
    }
    
    return null;
}

/**
 * Normalize indicator score from multiple data points (e.g., LT1-LT15 columns)
 * Uses 60% threshold rule
 * @param {Array} dataPoints - Array of raw values from multiple columns
 * @returns {number|null} - 1 if ≥60% positive, 0 if <60%, null if no valid data
 */
export function normalizeMultiColumnIndicator(dataPoints) {
    // Filter out NR/null responses
    const validPoints = dataPoints
        .map(normalizeIndicatorValue)
        .filter(p => p !== null);
    
    if (validPoints.length === 0) {
        return null; // No valid data
    }
    
    // Count positive scores (1)
    const positiveCount = validPoints.filter(p => p === 1).length;
    
    // Calculate percentage
    const percentage = (positiveCount / validPoints.length) * 100;
    
    // Apply threshold from constants
    return percentage >= MULTI_COLUMN_THRESHOLD ? 1 : 0;
}

// ============================================
// OUTCOME SCORING
// ============================================

/**
 * Outcome grade thresholds - uses constants for consistency
 */
export const OUTCOME_GRADES = {
    FA: { min: SCORING_THRESHOLDS.FULLY_ACHIEVED, label: GRADE_LABELS.FA.en, labelDv: GRADE_LABELS.FA.dv, color: GRADE_COLORS.FA.hex },
    MA: { min: SCORING_THRESHOLDS.MOSTLY_ACHIEVED, label: GRADE_LABELS.MA.en, labelDv: GRADE_LABELS.MA.dv, color: GRADE_COLORS.MA.hex },
    A: { min: SCORING_THRESHOLDS.ACHIEVED, label: GRADE_LABELS.A.en, labelDv: GRADE_LABELS.A.dv, color: GRADE_COLORS.A.hex },
    NS: { min: SCORING_THRESHOLDS.NOT_SUFFICIENT, label: GRADE_LABELS.NS.en, labelDv: GRADE_LABELS.NS.dv, color: GRADE_COLORS.NS.hex },
    NR: { min: -1, label: GRADE_LABELS.NR.en, labelDv: GRADE_LABELS.NR.dv, color: GRADE_COLORS.NR.hex },
};

/**
 * Calculate outcome grade from indicator scores
 * @param {Array<number|null>} indicatorScores - Array of normalized indicator scores
 * @returns {{ grade: string, percentage: number, met: number, total: number }}
 */
export function calculateOutcomeGrade(indicatorScores) {
    // Filter out null (NR) indicators
    const validScores = indicatorScores.filter(s => s !== null);
    
    if (validScores.length === 0) {
        return { grade: 'NR', percentage: 0, met: 0, total: 0 };
    }
    
    const met = validScores.filter(s => s === 1).length;
    const total = validScores.length;
    const percentage = Math.round((met / total) * 100);
    
    const grade = getGradeFromPercentage(percentage);
    
    return { grade, percentage, met, total };
}

/**
 * Get outcome grade info
 * @param {string} grade - Grade code (FA, MA, A, NS, NR)
 * @returns {object} Grade info object
 */
export function getOutcomeGradeInfo(grade) {
    return OUTCOME_GRADES[grade] || OUTCOME_GRADES.NR;
}

// ============================================
// SUBSTRAND, STRAND, DIMENSION SCORING
// ============================================

/**
 * Calculate substrand score from outcome grades
 * @param {Array<{ grade: string, percentage: number }>} outcomes - Array of outcome results
 * @returns {{ score: number, totalOutcomes: number, gradeDistribution: object }}
 */
export function calculateSubstrandScore(outcomes) {
    const validOutcomes = outcomes.filter(o => o.grade !== 'NR');
    
    if (validOutcomes.length === 0) {
        return { score: 0, totalOutcomes: 0, gradeDistribution: {} };
    }
    
    // Calculate average percentage
    const totalPercentage = validOutcomes.reduce((acc, o) => acc + o.percentage, 0);
    const score = Math.round(totalPercentage / validOutcomes.length);
    
    // Count grade distribution
    const gradeDistribution = {
        FA: outcomes.filter(o => o.grade === 'FA').length,
        MA: outcomes.filter(o => o.grade === 'MA').length,
        A: outcomes.filter(o => o.grade === 'A').length,
        NS: outcomes.filter(o => o.grade === 'NS').length,
        NR: outcomes.filter(o => o.grade === 'NR').length,
    };
    
    return { score, totalOutcomes: validOutcomes.length, gradeDistribution };
}

/**
 * Calculate strand score from substrand scores
 * @param {Array<{ score: number }>} substrands - Array of substrand results
 * @returns {{ score: number, totalSubstrands: number }}
 */
export function calculateStrandScore(substrands) {
    const validSubstrands = substrands.filter(s => s.score > 0 || s.totalOutcomes > 0);
    
    if (validSubstrands.length === 0) {
        return { score: 0, totalSubstrands: 0 };
    }
    
    const totalScore = validSubstrands.reduce((acc, s) => acc + s.score, 0);
    const score = Math.round(totalScore / validSubstrands.length);
    
    return { score, totalSubstrands: validSubstrands.length };
}

/**
 * Calculate dimension score from strand scores
 * @param {Array<{ score: number }>} strands - Array of strand results
 * @returns {{ score: number, totalStrands: number, grade: string }}
 */
export function calculateDimensionScore(strands) {
    const validStrands = strands.filter(s => s.score > 0 || s.totalSubstrands > 0);
    
    if (validStrands.length === 0) {
        return { score: 0, totalStrands: 0, grade: 'NR' };
    }
    
    const totalScore = validStrands.reduce((acc, s) => acc + s.score, 0);
    const score = Math.round(totalScore / validStrands.length);
    
    const grade = getGradeFromPercentage(score);
    
    return { score, totalStrands: validStrands.length, grade };
}

/**
 * Calculate overall school score from dimension scores
 * @param {Array<{ score: number }>} dimensions - Array of dimension results (D1-D5)
 * @returns {{ score: number, grade: string }}
 */
export function calculateOverallScore(dimensions) {
    const validDimensions = dimensions.filter(d => d.score > 0);
    
    if (validDimensions.length === 0) {
        return { score: 0, grade: 'NR' };
    }
    
    const totalScore = validDimensions.reduce((acc, d) => acc + d.score, 0);
    const score = Math.round(totalScore / validDimensions.length);
    
    const grade = getGradeFromPercentage(score);
    
    return { score, grade };
}

// ============================================
// DATA PROCESSING UTILITIES
// ============================================

/**
 * Process checklist data and calculate scores
 * @param {Array<object>} checklistData - Raw checklist data from CSV
 * @param {string} scoreColumn - Column name containing scores (default: 'Score')
 * @returns {object} Processed scores by hierarchy
 */
export function processChecklistData(checklistData, scoreColumn = 'Score') {
    const results = {
        indicators: [],
        outcomes: {},
        substrands: {},
        strands: {},
        dimension: { score: 0, grade: 'NR' },
    };
    
    if (!checklistData || checklistData.length === 0) {
        return results;
    }
    
    // Group indicators by outcome
    const outcomeGroups = {};
    
    checklistData.forEach(row => {
        const outcomeNo = row.OutcomeNo || row.outcomeNo || '';
        const substrandNo = row.SubstrandNo || row.substrandNo || '';
        const strandNo = row.StarndNo || row.StrandNo || row.strandNo || '';
        const score = normalizeIndicatorValue(row[scoreColumn]);
        
        // Store indicator
        results.indicators.push({
            code: row.IndicatorCode || row.indicatorCode || '',
            outcomeNo,
            substrandNo,
            strandNo,
            score,
            text: row.Indicators || row.indicator || '',
        });
        
        // Group by outcome
        if (outcomeNo) {
            if (!outcomeGroups[outcomeNo]) {
                outcomeGroups[outcomeNo] = {
                    scores: [],
                    substrandNo,
                    strandNo,
                    text: row.Outcomes || row.outcome || '',
                };
            }
            outcomeGroups[outcomeNo].scores.push(score);
        }
    });
    
    // Calculate outcome grades
    const substrandGroups = {};
    
    Object.entries(outcomeGroups).forEach(([outcomeNo, data]) => {
        const outcomeResult = calculateOutcomeGrade(data.scores);
        results.outcomes[outcomeNo] = {
            ...outcomeResult,
            substrandNo: data.substrandNo,
            strandNo: data.strandNo,
            text: data.text,
        };
        
        // Group by substrand
        const substrandNo = data.substrandNo;
        if (substrandNo) {
            if (!substrandGroups[substrandNo]) {
                substrandGroups[substrandNo] = {
                    outcomes: [],
                    strandNo: data.strandNo,
                };
            }
            substrandGroups[substrandNo].outcomes.push(outcomeResult);
        }
    });
    
    // Calculate substrand scores
    const strandGroups = {};
    
    Object.entries(substrandGroups).forEach(([substrandNo, data]) => {
        const substrandResult = calculateSubstrandScore(data.outcomes);
        results.substrands[substrandNo] = {
            ...substrandResult,
            strandNo: data.strandNo,
        };
        
        // Group by strand
        const strandNo = data.strandNo;
        if (strandNo) {
            if (!strandGroups[strandNo]) {
                strandGroups[strandNo] = { substrands: [] };
            }
            strandGroups[strandNo].substrands.push(substrandResult);
        }
    });
    
    // Calculate strand scores
    const strandResults = [];
    
    Object.entries(strandGroups).forEach(([strandNo, data]) => {
        const strandResult = calculateStrandScore(data.substrands);
        results.strands[strandNo] = strandResult;
        strandResults.push(strandResult);
    });
    
    // Calculate dimension score
    results.dimension = calculateDimensionScore(strandResults);
    
    return results;
}

/**
 * Get score color class based on value
 * @param {number} score - Score percentage (0-100)
 * @returns {string} CSS class name
 */
export function getScoreColorClass(score) {
    if (score >= SCORING_THRESHOLDS.FULLY_ACHIEVED) return 'score-excellent';
    if (score >= SCORING_THRESHOLDS.MOSTLY_ACHIEVED) return 'score-good';
    if (score >= SCORING_THRESHOLDS.ACHIEVED) return 'score-fair';
    return 'score-poor';
}

/**
 * Get grade badge color
 * @param {string} grade - Grade code
 * @returns {string} Color name
 */
export function getGradeBadgeColor(grade) {
    return GRADE_COLORS[grade]?.css || 'gray';
}

/**
 * Format score for display
 * @param {number} score - Score value
 * @param {boolean} showPercent - Whether to show percent sign
 * @returns {string} Formatted score string
 */
export function formatScore(score, showPercent = true) {
    if (score === null || score === undefined) return '-';
    const rounded = Math.round(score);
    return showPercent ? `${rounded}%` : `${rounded}`;
}

// ============================================
// COMPARISON & ANALYSIS UTILITIES
// ============================================

/**
 * Find strengths (top N highest scoring areas)
 * @param {object} scores - Processed scores object
 * @param {number} topN - Number of top items to return
 * @returns {Array} Top scoring substrands/outcomes
 */
export function findStrengths(scores, topN = 5) {
    const items = Object.entries(scores.substrands)
        .map(([id, data]) => ({ id, ...data }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topN);
    
    return items;
}

/**
 * Find weaknesses (bottom N lowest scoring areas)
 * @param {object} scores - Processed scores object
 * @param {number} bottomN - Number of bottom items to return
 * @returns {Array} Lowest scoring substrands/outcomes
 */
export function findWeaknesses(scores, bottomN = 5) {
    const items = Object.entries(scores.substrands)
        .map(([id, data]) => ({ id, ...data }))
        .filter(item => item.score > 0)
        .sort((a, b) => a.score - b.score)
        .slice(0, bottomN);
    
    return items;
}

/**
 * Calculate completion rate
 * @param {object} scores - Processed scores object
 * @returns {{ completed: number, total: number, percentage: number }}
 */
export function calculateCompletionRate(scores) {
    const total = scores.indicators.length;
    const completed = scores.indicators.filter(i => i.score !== null).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
}

export default {
    normalizeIndicatorValue,
    normalizeMultiColumnIndicator,
    calculateOutcomeGrade,
    calculateSubstrandScore,
    calculateStrandScore,
    calculateDimensionScore,
    calculateOverallScore,
    processChecklistData,
    getScoreColorClass,
    getGradeBadgeColor,
    formatScore,
    findStrengths,
    findWeaknesses,
    calculateCompletionRate,
    OUTCOME_GRADES,
    getOutcomeGradeInfo,
};
