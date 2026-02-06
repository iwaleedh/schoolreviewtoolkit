import { useState, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, MessageSquarePlus } from 'lucide-react';
import { useSSEData } from '../../context/SSEDataContext';
import { useChecklistData } from '../../hooks/useChecklistData';
import './Dimension.css';

// LT columns (1-10)
const LT_COLUMNS = ['LT1', 'LT2', 'LT3', 'LT4', 'LT5', 'LT6', 'LT7', 'LT8', 'LT9', 'LT10'];

/**
 * DraggableTableWrapper - Enables drag-to-scroll on wide tables
 */
function DraggableTableWrapper({ children }) {
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onMouseDown = useCallback((e) => {
        if (!containerRef.current) return;
        // Don't start drag on buttons or interactive elements
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setScrollLeft(containerRef.current.scrollLeft);
    }, []);

    const onMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const onMouseLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const onMouseMove = useCallback((e) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        containerRef.current.scrollLeft = scrollLeft - walk;
    }, [isDragging, startX, scrollLeft]);

    return (
        <div
            ref={containerRef}
            className={`lt-table-wrapper drag-scroll ${isDragging ? 'dragging' : ''}`}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
        >
            <div className="drag-scroll-hint">← Drag to scroll →</div>
            {children}
        </div>
    );
}

/**
 * LTChecklist - Multi-column checklist for Leading Teachers
 * Displays 10 LT columns (LT1-LT10) plus an Average column
 * Each LT score can be 1, 0, or NA
 * Average is calculated as the mean of non-NA values
 */
function LTChecklist({ csvFileName, title, titleDv, source }) {
    const { data, loading, error, grouped, titleRows } = useChecklistData(csvFileName);
    const { getIndicatorLTScore, setIndicatorLTScore, setIndicatorComment, getIndicatorComment } = useSSEData();

    const [expandedStrands, setExpandedStrands] = useState({});
    const [expandedSubstrands, setExpandedSubstrands] = useState({});
    const [expandedOutcomes, setExpandedOutcomes] = useState({});
    const [expandedComments, setExpandedComments] = useState({});

    // Toggle functions
    const toggleStrand = (id) => setExpandedStrands(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleSubstrand = (id) => setExpandedSubstrands(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleOutcome = (id) => setExpandedOutcomes(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleComment = (indicatorCode) => setExpandedComments(prev => ({ ...prev, [indicatorCode]: !prev[indicatorCode] }));

    // Cycle through LT scores: empty → 1 → 0 → NA → empty
    const handleLTScoreCycle = (indicatorCode, ltColumn) => {
        const currentScore = getIndicatorLTScore(indicatorCode, ltColumn);
        let nextScore;

        if (currentScore === null || currentScore === undefined) nextScore = 1;
        else if (currentScore === 1) nextScore = 0;
        else if (currentScore === 0) nextScore = 'NA';
        else nextScore = null;

        setIndicatorLTScore(indicatorCode, ltColumn, nextScore, source);
    };

    // Calculate average for an indicator across all LTs
    const calculateAverage = (indicatorCode) => {
        const scores = LT_COLUMNS.map(lt => getIndicatorLTScore(indicatorCode, lt));
        const numericScores = scores.filter(s => s === 1 || s === 0);

        if (numericScores.length === 0) return 'NA';

        const sum = numericScores.reduce((acc, val) => acc + val, 0);
        const avg = sum / numericScores.length;

        // Round to 1 decimal place, or return 1/0 if exactly those
        if (avg === 1) return 1;
        if (avg === 0) return 0;
        return Number(avg.toFixed(1));
    };

    // Get display style for LT score
    const getScoreButtonClass = (score) => {
        if (score === 1) return 'lt-score-btn score-one';
        if (score === 0) return 'lt-score-btn score-zero';
        if (score === 'NA') return 'lt-score-btn score-na';
        return 'lt-score-btn score-empty';
    };

    // Get display text for LT score
    const getScoreDisplay = (score) => {
        if (score === 1) return '1';
        if (score === 0) return '0';
        if (score === 'NA') return 'NA';
        return '-';
    };

    // Handle comment change
    const handleCommentChange = (indicatorCode, comment) => {
        setIndicatorComment(indicatorCode, comment);
    };

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
        <div className="dimension-container editable lt-checklist">
            {/* Header */}
            <div className="dimension-header">
                <h2 className="dimension-title">
                    <span className="title-en">{title}</span>
                    <span className="title-dv font-dhivehi" dir="rtl">{titleDv}</span>
                </h2>
            </div>

            {/* Editable badge */}
            <div className="editable-badge">
                <span>✏️ Multi-LT Data Entry</span>
                <span className="badge-hint">Click cells to cycle: 1 → 0 → NA</span>
            </div>

            {/* Title Rows from CSV */}
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
            <div className="checklist-content lt-grid-wrapper">
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
                                                <span className="substrand-title font-dhivehi" dir="rtl">{substrand.title}</span>
                                            </div>
                                            {expandedSubstrands[substrand.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>

                                        {/* Substrand Content */}
                                        {expandedSubstrands[substrand.id] && (
                                            <div className="substrand-content">
                                                {substrand.outcomes.map((outcome) => (
                                                    <div key={outcome.id} className="outcome-block">
                                                        {/* Outcome Header */}
                                                        <button
                                                            className={`outcome-header ${expandedOutcomes[outcome.id] ? 'expanded' : ''}`}
                                                            onClick={() => toggleOutcome(outcome.id)}
                                                        >
                                                            <div className="outcome-info">
                                                                <span className="outcome-id">{outcome.id}</span>
                                                                <span className="outcome-title font-dhivehi" dir="rtl">{outcome.title}</span>
                                                            </div>
                                                            {expandedOutcomes[outcome.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>

                                                        {/* Outcome Content - LT Grid Table */}
                                                        {expandedOutcomes[outcome.id] && (
                                                            <DraggableTableWrapper>
                                                                <table className="lt-indicators-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="col-comment">💬</th>
                                                                            <th className="col-avg">Avg</th>
                                                                            {LT_COLUMNS.map(lt => (
                                                                                <th key={lt} className="col-lt">{lt}</th>
                                                                            ))}
                                                                            <th className="col-evidence font-dhivehi" dir="rtl">ބަލާނެ ލިޔެކިޔުން</th>
                                                                            <th className="col-indicator font-dhivehi" dir="rtl">މައުލޫމާތު</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {outcome.indicators.map((indicator, idx) => {
                                                                            const currentComment = getIndicatorComment ? getIndicatorComment(indicator.code) : '';
                                                                            const isCommentOpen = expandedComments[indicator.code];
                                                                            const avgScore = calculateAverage(indicator.code);

                                                                            return (
                                                                                <tr key={indicator.code || idx}>
                                                                                    {/* Comment Column */}
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
                                                                                                <div className="comment-popup-modal" onClick={e => e.stopPropagation()}>
                                                                                                    <div className="comment-popup-header">
                                                                                                        <span className="font-dhivehi" dir="rtl">ކޮމެންޓް</span>
                                                                                                        <button
                                                                                                            className="comment-popup-close"
                                                                                                            onClick={() => toggleComment(indicator.code)}
                                                                                                        >
                                                                                                            ×
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    <div className="comment-popup-body">
                                                                                                        <textarea
                                                                                                            className="comment-textarea font-dhivehi"
                                                                                                            dir="rtl"
                                                                                                            placeholder="ކޮމެންޓް ލިޔުއްވާ..."
                                                                                                            value={currentComment || ''}
                                                                                                            onChange={(e) => handleCommentChange(indicator.code, e.target.value)}
                                                                                                            rows={4}
                                                                                                        />
                                                                                                    </div>
                                                                                                    <div className="comment-popup-footer">
                                                                                                        <button
                                                                                                            className="comment-save-btn"
                                                                                                            onClick={() => toggleComment(indicator.code)}
                                                                                                        >
                                                                                                            Save
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                    </td>

                                                                                    {/* Average Column */}
                                                                                    <td className={`col-avg ${avgScore === 1 ? 'avg-one' : avgScore === 0 ? 'avg-zero' : 'avg-na'}`}>
                                                                                        <span className="avg-display">{avgScore}</span>
                                                                                    </td>

                                                                                    {/* LT1-LT10 Columns */}
                                                                                    {LT_COLUMNS.map(lt => {
                                                                                        const ltScore = getIndicatorLTScore(indicator.code, lt);
                                                                                        return (
                                                                                            <td key={lt} className="col-lt">
                                                                                                <button
                                                                                                    className={getScoreButtonClass(ltScore)}
                                                                                                    onClick={() => handleLTScoreCycle(indicator.code, lt)}
                                                                                                    title={`${lt}: Click to cycle 1→0→NA`}
                                                                                                >
                                                                                                    {getScoreDisplay(ltScore)}
                                                                                                </button>
                                                                                            </td>
                                                                                        );
                                                                                    })}

                                                                                    {/* Evidence Column */}
                                                                                    <td className="col-evidence font-dhivehi" dir="rtl">
                                                                                        {indicator.evidence || '-'}
                                                                                    </td>

                                                                                    {/* Indicator Column */}
                                                                                    <td className="col-indicator font-dhivehi" dir="rtl">
                                                                                        {indicator.text}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </DraggableTableWrapper>
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

export default LTChecklist;
