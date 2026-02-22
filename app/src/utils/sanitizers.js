/**
 * Utility functions for sanitizing user input
 * Prevents XSS and other injection attacks
 * 
 * SECURITY NOTE: This regex-based sanitization is a defense-in-depth measure.
 * React automatically escapes content in JSX, providing primary XSS protection.
 * These utilities add an extra layer of security for:
 * - Data stored in localStorage (which doesn't auto-escape)
 * - Data sent to backend APIs
 * - Future-proofing against dangerouslySetInnerHTML usage
 * 
 * For high-security contexts, consider using DOMPurify instead.
 */

const DANGEROUS_HTML_TAGS = [
    'script', 'iframe', 'object', 'embed', 'form', 
    'input', 'button', 'meta', 'link', 'style'
];

const DANGEROUS_ATTRIBUTES = [
    'onclick', 'onerror', 'onload', 'onmouseover', 'onfocus',
    'onblur', 'onsubmit', 'onkeydown', 'onkeyup', 'onchange'
];

/**
 * Sanitize text input by removing potentially dangerous content
 * @param {string} text - The text to sanitize
 * @param {number} maxLength - Maximum allowed length (default from constants)
 * @returns {string} Sanitized text
 */
export function sanitizeText(text, maxLength = 2000) {
    if (typeof text !== 'string') {
        return '';
    }

    let sanitized = text;

    // Trim whitespace
    sanitized = sanitized.trim();

    // Limit length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    // Remove dangerous HTML tags
    DANGEROUS_HTML_TAGS.forEach(tag => {
        const regex = new RegExp(`<\\/?${tag}[^>]*>`, 'gi');
        sanitized = sanitized.replace(regex, '');
    });

    // Remove dangerous attributes
    DANGEROUS_ATTRIBUTES.forEach(attr => {
        const regex = new RegExp(`${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
        sanitized = sanitized.replace(regex, '');
    });

    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript\s*:/gi, '');

    // Remove data: URLs (can be used for XSS)
    sanitized = sanitized.replace(/data\s*:/gi, '');

    // Remove vbscript: URLs
    sanitized = sanitized.replace(/vbscript\s*:/gi, '');

    return sanitized;
}

/**
 * Sanitize a comment specifically for storage
 * @param {string} comment - The comment text
 * @returns {string} Sanitized comment
 */
export function sanitizeComment(comment) {
    return sanitizeText(comment, 2000);
}

/**
 * Escape HTML entities for safe display
 * @param {string} text - The text to escape
 * @returns {string} Escaped text safe for HTML display
 */
export function escapeHtml(text) {
    if (typeof text !== 'string') {
        return '';
    }

    const htmlEntities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
    };

    return text.replace(/[&<>"'`=/]/g, char => htmlEntities[char]);
}

/**
 * Validate and sanitize an indicator code
 * @param {string} code - The indicator code to validate
 * @returns {string|null} Sanitized code or null if invalid
 */
export function sanitizeIndicatorCode(code) {
    if (typeof code !== 'string') {
        return null;
    }

    // Indicator codes should be alphanumeric with dots and dashes
    const validPattern = /^[A-Za-z0-9.\-_]+$/;
    const sanitized = code.trim();

    if (sanitized.length > 50 || !validPattern.test(sanitized)) {
        return null;
    }

    return sanitized;
}

/**
 * Validate a score value
 * @param {any} value - The score value to validate
 * @returns {string|null} Valid score ('yes', 'no', 'nr') or null
 */
export function validateScore(value) {
    if (value === null || value === undefined) {
        return null;
    }

    const normalized = String(value).toLowerCase().trim();
    
    if (normalized === 'yes' || normalized === '1' || normalized === '✓') {
        return 'yes';
    }
    if (normalized === 'no' || normalized === '0' || normalized === '✗') {
        return 'no';
    }
    if (normalized === 'nr' || normalized === '-' || normalized === 'na') {
        return 'nr';
    }

    return null;
}

/**
 * Validate an LT score value
 * @param {any} value - The LT score value to validate
 * @returns {number|string|null} Valid score (1, 0, 'NA') or null
 */
export function validateLTScore(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (value === 1 || value === '1' || value === 'yes') {
        return 1;
    }
    if (value === 0 || value === '0' || value === 'no') {
        return 0;
    }
    if (value === 'NA' || value === 'na' || value === 'NR' || value === 'nr') {
        return 'NA';
    }

    return null;
}

export default {
    sanitizeText,
    sanitizeComment,
    escapeHtml,
    sanitizeIndicatorCode,
    validateScore,
    validateLTScore,
};
