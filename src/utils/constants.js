/**
 * Constants for the School Review Toolkit
 * Centralizes scoring thresholds, colors, and other configuration
 */

// Scoring Thresholds (SIQAAF Framework)
export const SCORING_THRESHOLDS = {
    FULLY_ACHIEVED: 90,    // FA - 90% and above
    MOSTLY_ACHIEVED: 70,   // MA - 70% to 89%
    ACHIEVED: 50,          // A - 50% to 69%
    NOT_SUFFICIENT: 0,     // NS - below 50%
};

// Grade definitions
export const GRADES = {
    FA: 'FA',
    MA: 'MA',
    A: 'A',
    NS: 'NS',
    NR: 'NR',
};

// Grade colors (CSS variable names and hex values)
export const GRADE_COLORS = {
    FA: { hex: '#7c3aed', css: 'purple', bg: '#f3e8ff', text: '#7c3aed' },
    MA: { hex: '#16a34a', css: 'green', bg: '#dcfce7', text: '#16a34a' },
    A:  { hex: '#d97706', css: 'yellow', bg: '#fef3c7', text: '#d97706' },
    NS: { hex: '#dc2626', css: 'red', bg: '#fee2e2', text: '#dc2626' },
    NR: { hex: '#6b7280', css: 'gray', bg: '#f3f4f6', text: '#6b7280' },
};

// Grade labels (English and Dhivehi)
export const GRADE_LABELS = {
    FA: { en: 'Fully Achieved', dv: 'އެއްކޮށް ހާސިލުވެފައި' },
    MA: { en: 'Mostly Achieved', dv: 'ގިނައިން ހާސިލުވެފައި' },
    A:  { en: 'Achieved', dv: 'ހާސިލުވެފައި' },
    NS: { en: 'Not Sufficient', dv: 'ނުފުދޭ' },
    NR: { en: 'Not Reviewed', dv: 'ބެލިފައި ނެތް' },
};

// Dimension configuration
export const DIMENSIONS = [
    { id: 'D1', name: 'Inclusivity', nameDv: 'ޝާމިލުކުރުން', color: '#7c3aed', colorClass: 'purple' },
    { id: 'D2', name: 'Teaching & Learning', nameDv: 'އުނގެނުމާއި އުނގައްނައިދިނުން', color: '#4f46e5', colorClass: 'blue' },
    { id: 'D3', name: 'Health & Safety', nameDv: 'ސިއްހަތާއި ރައްކާތެރިކަން', color: '#10b981', colorClass: 'green' },
    { id: 'D4', name: 'Community', nameDv: 'މުޖުތަމައު', color: '#f59e0b', colorClass: 'amber' },
    { id: 'D5', name: 'Leadership', nameDv: 'ލީޑަރޝިޕް', color: '#f43f5e', colorClass: 'rose' },
];

// LT Columns configuration
export const LT_COLUMNS = ['LT1', 'LT2', 'LT3', 'LT4', 'LT5', 'LT6', 'LT7', 'LT8', 'LT9', 'LT10'];

// Multi-column threshold (60% rule for LT scoring)
export const MULTI_COLUMN_THRESHOLD = 60;

// Score values for indicators
export const INDICATOR_SCORES = {
    YES: 'yes',
    NO: 'no',
    NR: 'nr',
};

// Score display symbols
export const SCORE_SYMBOLS = {
    yes: '✓',
    no: '✗',
    nr: 'NR',
    empty: '-',
};

// Local Storage Keys
export const STORAGE_KEYS = {
    PENDING_SCORES: 'sse_pending_scores',
    PENDING_COMMENTS: 'sse_pending_comments',
    LAST_SYNC: 'sse_last_sync',
    THEME: 'theme',
};

// API Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SYNC_FAILED: 'Failed to sync data. Changes saved locally.',
    LOAD_FAILED: 'Failed to load data. Please try again.',
    CONVEX_UNAVAILABLE: 'Database connection unavailable. Working offline.',
};

// UI Configuration
export const UI_CONFIG = {
    DEBOUNCE_MS: 300,
    AUTOSAVE_INTERVAL_MS: 30000,
    TOAST_DURATION_MS: 3000,
    MAX_COMMENT_LENGTH: 2000,
    TABLE_VIRTUALIZATION_THRESHOLD: 100,
};

// Helper function to get grade from percentage
export function getGradeFromPercentage(percentage) {
    if (percentage >= SCORING_THRESHOLDS.FULLY_ACHIEVED) return GRADES.FA;
    if (percentage >= SCORING_THRESHOLDS.MOSTLY_ACHIEVED) return GRADES.MA;
    if (percentage >= SCORING_THRESHOLDS.ACHIEVED) return GRADES.A;
    return GRADES.NS;
}

// Helper function to get grade info
export function getGradeInfo(grade) {
    return {
        code: grade,
        color: GRADE_COLORS[grade] || GRADE_COLORS.NR,
        label: GRADE_LABELS[grade] || GRADE_LABELS.NR,
    };
}

// Helper function to get progress color
export function getProgressColor(percentage) {
    if (percentage >= 80) return GRADE_COLORS.MA.hex;
    if (percentage >= 50) return GRADE_COLORS.A.hex;
    return GRADE_COLORS.NS.hex;
}

export default {
    SCORING_THRESHOLDS,
    GRADES,
    GRADE_COLORS,
    GRADE_LABELS,
    DIMENSIONS,
    LT_COLUMNS,
    MULTI_COLUMN_THRESHOLD,
    INDICATOR_SCORES,
    SCORE_SYMBOLS,
    STORAGE_KEYS,
    ERROR_MESSAGES,
    UI_CONFIG,
    getGradeFromPercentage,
    getGradeInfo,
    getProgressColor,
};
