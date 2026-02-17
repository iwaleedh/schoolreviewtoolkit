/**
 * Theme Toggle Component
 * 
 * Animated toggle switch for dark/light mode
 */

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

function ThemeToggle({ showLabel = true, size = 'medium' }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className={`theme-toggle-wrapper ${size}`}>
            {showLabel && (
                <span className="theme-label">
                    {isDark ? 'Dark' : 'Light'}
                </span>
            )}
            <button
                className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
                <span className="toggle-track">
                    <span className="toggle-icons">
                        <Sun size={14} className="sun-icon" />
                        <Moon size={14} className="moon-icon" />
                    </span>
                    <span className="toggle-thumb" />
                </span>
            </button>
        </div>
    );
}

export default ThemeToggle;
