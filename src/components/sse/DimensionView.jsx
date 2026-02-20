import { useMemo } from 'react';
import { ChevronDown, ChevronUp, Check, X, Minus } from 'lucide-react';
import { useState } from 'react';
import { useSSEData } from '../../context/SSEDataContext';
import { useChecklistData } from '../../hooks/useChecklistData';
import './Dimension.css';

// Score display for indicators (view-only)
const INDICATOR_DISPLAY = {
    yes: { icon: Check, color: 'green', label: '✓' },
    no: { icon: X, color: 'red', label: '✗' },
    nr: { icon: Minus, color: 'gray', label: 'NR' },
    null: { icon: Minus, color: 'gray-light', label: '-' },
};

// Outcome grade colors
const OUTCOME_COLORS = {
    FA: 'purple',
    MA: 'green',
    A: 'yellow',
    NS: 'red',
    NR: 'gray',
};

/**
 * DimensionView - View-only display of dimension scores
 * Reads scores from SSEDataContext (populated by data input checklists)
 */
function DimensionView({ dimensionNumber, csvFileName, title, titleDv }) {
    const { data, loading, error, grouped } = useChecklistData(csvFileName);
    const { getIndicatorScore, calculateOutcomeScore, getIndicatorStats } = useSSEData();

    const [expandedStrands, setExpandedStrands] = useState({});
    const [expandedSubstrands, setExpandedSubstrands] = useState({});
    const [expandedOutcomes, setExpandedOutcomes] = useState({});

    // Toggle functions
    const toggleStrand = (id) => setExpandedStrands(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleSubstrand = (id) => setExpandedSubstrands(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleOutcome = (id) => setExpandedOutcomes(prev => ({ ...prev, [id]: !prev[id] }));

    // Calculate overall dimension stats
    const dimensionStats = useMemo(() => {
        if (!data || data.length === 0) return { yes: 0, no: 0, nr: 0, unscored: 0, total: 0 };

        const indicatorCodes = data.map(row => row['IndicatorCode']).filter(Boolean);
        return getIndicatorStats(indicatorCodes);
    }, [data, getIndicatorStats]);

    // Get outcome grade for an outcome
    const getOutcomeGrade = (outcome) => {
        const indicatorCodes = outcome.indicators.map(ind => ind.code).filter(Boolean);
        return calculateOutcomeScore(indicatorCodes);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading Dimension {dimensionNumber} data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Error loading data: {error.message}</p>
                <p className="error-hint">Make sure the CSV file exists in /Checklist/ folder</p>
            </div>
        );
    }

    if (!grouped || grouped.length === 0) {
        return (
            <div className="empty-container">
                <p>No data found for Dimension {dimensionNumber}.</p>
            </div>
        );
    }

    return (
        <div className="dimension-container view-only">
            {/* Header with stats */}
            <div className="dimension-header">
                <h2 className="dimension-title">
                    <span className="title-en">{title}</span>
                    <span className="title-dv font-dhivehi" dir="rtl">{titleDv}</span>
                </h2>
                <div className="dimension-stats">
                    <div className="stat-badges">
                        <span className="stat-badge green">✓ {dimensionStats.yes}</span>
                        <span className="stat-badge red">✗ {dimensionStats.no}</span>
                        <span className="stat-badge gray">NR {dimensionStats.nr}</span>
                        <span className="stat-badge gray-light">- {dimensionStats.unscored}</span>
                    </div>
                    <span className="stat-total">Total: {dimensionStats.total}</span>
                </div>
            </div>

            {/* View-only badge */}
            <div className="view-only-badge">
                <span>👁️ View Only</span>
                <span className="badge-hint">Scores are entered in the checklist tabs</span>
            </div>

            {/* Content */}
            <div className="checklist-content">
                {grouped.map((strand) => (
                    <div key={strand.id} className="strand-block">
                        {/* Strand Header */}
                        <button
                            className={`strand-header ${expandedStrands[strand.id] ? 'expanded' : ''}`}
                            onClick={() => toggleStrand(strand.id)}
                        >
                            <div className="strand-info">
                                <span className="strand-title font-dhivehi" dir="rtl">
                                    {strand.title}
                                </span>
                            </div>
                            {expandedStrands[strand.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {/* Strand Content */}
                        {expandedStrands[strand.id] && (
                            <div className="strand-content">
                                {strand.substrands.map((substrand) => (
                                    <div key={substrand.id} className="substrand-block">
                                        {/* Substrand Header */}
                                        <button
                                            className={`substrand-header ${expandedSubstrands[substrand.id] ? 'expanded' : ''}`}
                                            onClick={() => toggleSubstrand(substrand.id)}
                                        >
                                            <div className="substrand-info">
                                                <span className="substrand-id">{substrand.id}</span>
                                                <span className="substrand-title font-dhivehi" dir="rtl">
                                                    {substrand.title}
                                                </span>
                                            </div>
                                            {expandedSubstrands[substrand.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>

                                        {/* Substrand Content */}
                                        {expandedSubstrands[substrand.id] && (
                                            <div className="substrand-content">
                                                {substrand.outcomes.map((outcome) => {
                                                    const outcomeGrade = getOutcomeGrade(outcome);

                                                    return (
                                                        <div key={outcome.id} className="outcome-block">
                                                            {/* Outcome Header */}
                                                            <div className="outcome-header">
                                                                <button
                                                                    className="outcome-toggle"
                                                                    onClick={() => toggleOutcome(outcome.id)}
                                                                >
                                                                    <span className="outcome-id">{outcome.id}</span>
                                                                    <span className="outcome-title font-dhivehi" dir="rtl">
                                                                        {outcome.title}
                                                                    </span>
                                                                    {expandedOutcomes[outcome.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                </button>

                                                                {/* Outcome Grade (View-Only) */}
                                                                <div className="outcome-grade">
                                                                    <span className={`grade-badge ${OUTCOME_COLORS[outcomeGrade]}`}>
                                                                        {outcomeGrade}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Indicators Table (View-Only) */}
                                                            {expandedOutcomes[outcome.id] && (
                                                                <div className="indicators-table view-only">
                                                                    <table>
                                                                        <thead>
                                                                            <tr>
                                                                                <th className="col-code">#</th>
                                                                                <th className="col-indicator font-dhivehi" dir="rtl">
                                                                                    ބަލާނެ ކަންކަން
                                                                                </th>
                                                                                <th className="col-score">Score</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {outcome.indicators.map((indicator, idx) => {
                                                                                const score = getIndicatorScore(indicator.code);
                                                                                const display = INDICATOR_DISPLAY[score] || INDICATOR_DISPLAY.null;
                                                                                const Icon = display.icon;

                                                                                return (
                                                                                    <tr key={indicator.code || idx}>
                                                                                        <td className="col-code">{indicator.code}</td>
                                                                                        <td className="col-indicator font-dhivehi" dir="rtl">
                                                                                            {indicator.text}
                                                                                        </td>
                                                                                        <td className="col-score">
                                                                                            <div className={`score-display ${display.color}`}>
                                                                                                <Icon size={18} />
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DimensionView;
