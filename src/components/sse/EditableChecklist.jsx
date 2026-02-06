import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X, Minus, MessageSquarePlus } from 'lucide-react';
import { useSSEData } from '../../context/SSEDataContext';
import { useChecklistData } from '../../hooks/useChecklistData';
import './Dimension.css';

// Score options for indicators (editable)
const INDICATOR_SCORES = [
    { value: 'yes', label: '✓', icon: Check, color: 'green' },
    { value: 'no', label: '✗', icon: X, color: 'red' },
    { value: 'nr', label: 'NR', icon: Minus, color: 'gray' },
];

/**
 * EditableChecklist - Data input checklist component
 * Used for: LT1, LT2, Principal, Admin, Budget, etc.
 * Scores entered here flow to Dimension tabs via SSEDataContext
 * 
 * @param {string} csvFileName - Name of CSV file in /Checklist/
 * @param {string} title - English title
 * @param {string} titleDv - Dhivehi title
 * @param {string} source - Identifier for this checklist (e.g., 'LT1', 'Principal')
 */
function EditableChecklist({ csvFileName, title, titleDv, source }) {
    const { data, loading, error, grouped, titleRows } = useChecklistData(csvFileName);
    const { getIndicatorScore, setIndicatorScore, getIndicatorStats, setIndicatorComment, getIndicatorComment } = useSSEData();

    const [expandedStrands, setExpandedStrands] = useState({});
    const [expandedSubstrands, setExpandedSubstrands] = useState({});
    const [expandedOutcomes, setExpandedOutcomes] = useState({});
    const [expandedComments, setExpandedComments] = useState({}); // Track which comment boxes are open

    // Toggle functions
    const toggleStrand = (id) => setExpandedStrands(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleSubstrand = (id) => setExpandedSubstrands(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleOutcome = (id) => setExpandedOutcomes(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleComment = (indicatorCode) => setExpandedComments(prev => ({ ...prev, [indicatorCode]: !prev[indicatorCode] }));

    // Handle indicator score cycle (click to cycle through: null → yes → no → nr → null)
    const handleScoreCycle = (indicatorCode) => {
        const currentScore = getIndicatorScore(indicatorCode);
        let nextScore;

        // Cycle through: null → yes → no → nr → null
        if (!currentScore) nextScore = 'yes';
        else if (currentScore === 'yes') nextScore = 'no';
        else if (currentScore === 'no') nextScore = 'nr';
        else nextScore = null;

        setIndicatorScore(indicatorCode, nextScore, source);
    };

    // Get display for current score
    const getScoreDisplay = (score) => {
        if (score === 'yes') return { icon: Check, color: 'green', label: '✓' };
        if (score === 'no') return { icon: X, color: 'red', label: '✗' };
        if (score === 'nr') return { icon: Minus, color: 'gray', label: 'NR' };
        return { icon: null, color: 'empty', label: '-' };
    };

    // Handle comment change
    const handleCommentChange = (indicatorCode, comment) => {
        setIndicatorComment(indicatorCode, comment);
    };

    // Calculate stats for this checklist
    const checklistStats = (() => {
        if (!data || data.length === 0) return { yes: 0, no: 0, nr: 0, unscored: 0, total: 0 };
        const indicatorCodes = data.map(row => row['indicatorCode'] || row['IndicatorCode']).filter(Boolean);
        return getIndicatorStats(indicatorCodes);
    })();

    // Progress percentage
    const progress = checklistStats.total > 0
        ? Math.round(((checklistStats.yes + checklistStats.no + checklistStats.nr) / checklistStats.total) * 100)
        : 0;

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading {title} checklist...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Error loading data: {error.message}</p>
                <p className="error-hint">Make sure "{csvFileName}" exists in /Checklist/ folder</p>
            </div>
        );
    }

    if (!grouped || grouped.length === 0) {
        return (
            <div className="empty-container">
                <h2>{title}</h2>
                <p>No checklist data found.</p>
                <p className="empty-hint">Please upload "{csvFileName}" to the Checklist folder.</p>
            </div>
        );
    }

    return (
        <div className="dimension-container editable">
            {/* Header */}
            <div className="dimension-header">
                <h2 className="dimension-title">
                    <span className="title-en">{title}</span>
                    <span className="title-dv font-dhivehi" dir="rtl">{titleDv}</span>
                </h2>
                <div className="dimension-stats">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        <span className="progress-text">{progress}%</span>
                    </div>
                    <div className="stat-badges">
                        <span className="stat-badge green">✓ {checklistStats.yes}</span>
                        <span className="stat-badge red">✗ {checklistStats.no}</span>
                        <span className="stat-badge gray">NR {checklistStats.nr}</span>
                    </div>
                </div>
            </div>

            {/* Editable badge */}
            <div className="editable-badge">
                <span>✏️ Data Entry Mode</span>
                <span className="badge-hint">Click score buttons to enter data</span>
            </div>

            {/* Title Rows from CSV (LT1 style headers) */}
            {titleRows && titleRows.length > 0 && (
                <div className="csv-title-rows font-dhivehi" dir="rtl">
                    {titleRows.map((row, idx) => (
                        <div key={idx} className={`csv-title-row ${idx === 0 ? 'main-title' : 'sub-title'}`}>
                            {row}
                        </div>
                    ))}
                </div>
            )}

            {/* Content */}
            <div className="checklist-content">
                {grouped.map((strand) => (
                    <div key={strand.id} className="strand-block">
                        {/* Strand Header */}
                        <button
                            className={`strand-header editable ${expandedStrands[strand.id] ? 'expanded' : ''}`}
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
                                                {substrand.outcomes.map((outcome) => (
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
                                                        </div>

                                                        {/* Indicators Table (Editable) */}
                                                        {expandedOutcomes[outcome.id] && (
                                                            <div className="indicators-table editable">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="col-comment">💬</th>
                                                                            <th className="col-score">Score</th>
                                                                            <th className="col-evidence font-dhivehi" dir="rtl">
                                                                                ބަލާނެ ލިޔެކިޔުން (Evidence)
                                                                            </th>
                                                                            <th className="col-indicator font-dhivehi" dir="rtl">
                                                                                މައުލޫމާތު (Indicator)
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {outcome.indicators.map((indicator, idx) => {
                                                                            const currentScore = getIndicatorScore(indicator.code);
                                                                            const currentComment = getIndicatorComment ? getIndicatorComment(indicator.code) : '';
                                                                            const isCommentOpen = expandedComments[indicator.code];
                                                                            const scoreDisplay = getScoreDisplay(currentScore);
                                                                            const ScoreIcon = scoreDisplay.icon;

                                                                            return (
                                                                                <tr key={indicator.code || idx}>
                                                                                    {/* Comment Column - First */}
                                                                                    <td className="col-comment">
                                                                                        <button
                                                                                            className={`comment-btn ${currentComment ? 'has-comment' : ''}`}
                                                                                            onClick={() => toggleComment(indicator.code)}
                                                                                            title={currentComment ? 'View/Edit comment' : 'Add comment'}
                                                                                        >
                                                                                            <MessageSquarePlus size={16} />
                                                                                        </button>

                                                                                        {/* Comment Popup Modal */}
                                                                                        {isCommentOpen && (
                                                                                            <div className="comment-popup-overlay" onClick={() => toggleComment(indicator.code)}>
                                                                                                <div className="comment-popup" onClick={(e) => e.stopPropagation()}>
                                                                                                    <div className="comment-popup-header">
                                                                                                        <h4 className="font-dhivehi" dir="rtl">ކޮމެންޓް އިތުރުކުރައްވާ</h4>
                                                                                                        <span>Add Comment</span>
                                                                                                        <button
                                                                                                            className="comment-popup-close"
                                                                                                            onClick={() => toggleComment(indicator.code)}
                                                                                                        >
                                                                                                            <X size={18} />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    <div className="comment-popup-body">
                                                                                                        <div className="comment-indicator-ref font-dhivehi" dir="rtl">
                                                                                                            {indicator.text}
                                                                                                        </div>
                                                                                                        <textarea
                                                                                                            className="comment-textarea font-dhivehi"
                                                                                                            dir="rtl"
                                                                                                            placeholder="ކޮމެންޓް ލިޔުއްވާ... (Enter your comment...)"
                                                                                                            value={currentComment || ''}
                                                                                                            onChange={(e) => handleCommentChange(indicator.code, e.target.value)}
                                                                                                            rows={4}
                                                                                                            autoFocus
                                                                                                        />
                                                                                                    </div>
                                                                                                    <div className="comment-popup-footer">
                                                                                                        <button
                                                                                                            className="comment-popup-done"
                                                                                                            onClick={() => toggleComment(indicator.code)}
                                                                                                        >
                                                                                                            Done
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                    </td>

                                                                                    {/* Score Column - Second (Single Cycling Button) */}
                                                                                    <td className="col-score">
                                                                                        <button
                                                                                            className={`score-cycle-btn ${scoreDisplay.color}`}
                                                                                            onClick={() => handleScoreCycle(indicator.code)}
                                                                                            title="Click to cycle: ✓ → ✗ → NR"
                                                                                        >
                                                                                            {ScoreIcon ? <ScoreIcon size={16} /> : <span className="score-empty">-</span>}
                                                                                        </button>
                                                                                    </td>

                                                                                    {/* Evidence Column - Third */}
                                                                                    <td className="col-evidence font-dhivehi" dir="rtl">
                                                                                        {indicator.evidence || '-'}
                                                                                    </td>

                                                                                    {/* Indicator Column - Fourth */}
                                                                                    <td className="col-indicator font-dhivehi" dir="rtl">
                                                                                        {indicator.text}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
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

export default EditableChecklist;

