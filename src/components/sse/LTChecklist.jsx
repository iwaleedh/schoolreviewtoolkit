import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, MessageSquarePlus, Save, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { useSSEData } from '../../context/SSEDataContext';
import { useChecklistData } from '../../hooks/useChecklistData';
import './Dimension.css';

// LT columns (1-10) - reversed order so LT1 is next to indicator
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
    const { loading, error, grouped, titleRows } = useChecklistData(csvFileName);
    const {
        getIndicatorLTScore,
        setIndicatorLTScore,
        setIndicatorComment,
        getIndicatorComment,
        savePendingLTScores,
        hasPendingChanges,
        getPendingCount,
        isSyncing,
        lastSyncTime,
        pendingComments,
    } = useSSEData();

    const [expandedStrands, setExpandedStrands] = useState({});
    const [expandedSubstrands, setExpandedSubstrands] = useState({});
    const [expandedOutcomes, setExpandedOutcomes] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [commentDrafts, setCommentDrafts] = useState({}); // Local state for comment drafts
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [saveStatus, setSaveStatus] = useState(null); // null, 'success', 'error'
    const [selectedView, setSelectedView] = useState('all'); // 'all' or specific LT

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Clear save status after 3 seconds
    useEffect(() => {
        if (saveStatus) {
            const timer = setTimeout(() => setSaveStatus(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    // Toggle functions
    const toggleStrand = (id) => setExpandedStrands(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleSubstrand = (id) => setExpandedSubstrands(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleOutcome = (id) => setExpandedOutcomes(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleComment = (indicatorCode) => {
        // If closing the comment popup, clear the draft
        if (expandedComments[indicatorCode]) {
            setCommentDrafts(prev => {
                const newDrafts = { ...prev };
                delete newDrafts[indicatorCode];
                return newDrafts;
            });
        } else {
            // Opening - initialize draft with current value
            const currentComment = getIndicatorComment ? getIndicatorComment(indicatorCode) : '';
            setCommentDrafts(prev => ({ ...prev, [indicatorCode]: currentComment || '' }));
        }
        setExpandedComments(prev => ({ ...prev, [indicatorCode]: !prev[indicatorCode] }));
    };

    // Save comment and close
    const saveComment = (indicatorCode) => {
        const draftComment = commentDrafts[indicatorCode] || '';
        setIndicatorComment(indicatorCode, draftComment);
        setExpandedComments(prev => ({ ...prev, [indicatorCode]: false }));
        setCommentDrafts(prev => {
            const newDrafts = { ...prev };
            delete newDrafts[indicatorCode];
            return newDrafts;
        });
    };

    // Update comment draft locally (no database call)
    const updateCommentDraft = (indicatorCode, value) => {
        setCommentDrafts(prev => ({ ...prev, [indicatorCode]: value }));
    };

    // Save all pending changes to backend
    const handleSaveAll = async () => {
        const result = await savePendingLTScores(source);
        if (result.success) {
            setSaveStatus('success');
        } else {
            setSaveStatus('error');
        }
    };

    // Count pending scores and comments
    const pendingScoresCount = getPendingCount(source);
    const pendingCommentsCount = Object.keys(pendingComments).length;
    const totalPendingCount = pendingScoresCount + pendingCommentsCount;
    const hasChanges = hasPendingChanges(source) || pendingCommentsCount > 0;

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
    // Returns: 1 if ≥60% scores are 1, 0 if <60%, NA if no scores
    const calculateAverage = (indicatorCode) => {
        const scores = visibleLTColumns.map(lt => getIndicatorLTScore(indicatorCode, lt));
        const numericScores = scores.filter(s => s === 1 || s === 0);

        if (numericScores.length === 0) return 'NA';

        const sum = numericScores.reduce((acc, val) => acc + val, 0);
        const percentage = (sum / numericScores.length) * 100;

        // If 60% or more scores are 1, return 1; otherwise return 0
        return percentage >= 60 ? 1 : 0;
    };

    // Filter available LT columns based on selection
    const visibleLTColumns = useMemo(() => {
        if (selectedView === 'all') return LT_COLUMNS;
        return [selectedView];
    }, [selectedView]);

    // Calculate progress stats
    const progressStats = useMemo(() => {
        let completed = 0;
        let yes = 0;
        let no = 0;
        let naExplicit = 0;

        // Count total indicators across all outcomes
        let totalIndicators = 0;
        grouped?.forEach(strand => {
            strand.substrands?.forEach(substrand => {
                substrand.outcomes?.forEach(outcome => {
                    totalIndicators += outcome.indicators?.length || 0;
                });
            });
        });

        const total = totalIndicators * visibleLTColumns.length;

        grouped?.forEach(strand => {
            strand.substrands?.forEach(substrand => {
                substrand.outcomes?.forEach(outcome => {
                    outcome.indicators?.forEach(indicator => {
                        visibleLTColumns.forEach(lt => {
                            const score = getIndicatorLTScore(indicator.code, lt);
                            if (score !== undefined && score !== null) {
                                completed++;
                                if (score === 1) yes++;
                                else if (score === 0) no++;
                                else if (score === 'NA') naExplicit++;
                            }
                        });
                    });
                });
            });
        });

        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { percentage, yes, no, naExplicit, pending: total - completed, totalIndicators };
    }, [grouped, visibleLTColumns, getIndicatorLTScore]);

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

                {/* Save Status & Button */}
                <div className="lt-header-actions">
                    {/* Online/Offline Status */}
                    <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                        <span>{isOnline ? 'Online' : 'Offline'}</span>
                    </div>

                    {/* Pending Changes Badge */}
                    {hasChanges && (
                        <div className="pending-badge">
                            <span>{totalPendingCount} unsaved</span>
                        </div>
                    )}

                    {/* Last Sync Time */}
                    {lastSyncTime && (
                        <div className="last-sync">
                            <span>Last saved: {new Date(lastSyncTime).toLocaleTimeString()}</span>
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        className={`save-all-btn ${saveStatus === 'success' ? 'success' : ''} ${saveStatus === 'error' ? 'error' : ''}`}
                        onClick={handleSaveAll}
                        disabled={isSyncing || !hasChanges}
                        title={!isOnline ? 'You are offline. Changes will sync when you come back online.' : 'Save all changes'}
                    >
                        {isSyncing ? (
                            <><RotateCcw size={16} className="spin" /> Saving...</>
                        ) : saveStatus === 'success' ? (
                            <><Save size={16} /> Saved!</>
                        ) : (
                            <><Save size={16} /> Save{hasChanges ? ` (${totalPendingCount})` : ''}</>
                        )}
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="lt-controls">
                <div className="view-selector">
                    <label htmlFor="lt-view-select">View:</label>
                    <select
                        id="lt-view-select"
                        value={selectedView}
                        onChange={(e) => setSelectedView(e.target.value)}
                        className="view-dropdown"
                    >
                        <option value="all">Master Sheet (All LTs)</option>
                        {LT_COLUMNS.map(lt => (
                            <option key={lt} value={lt}>{lt.replace('LT', 'Leading Teacher ')}</option>
                        ))}
                    </select>
                </div>

                <div className="lt-progress-stats">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progressStats.percentage}%` }}></div>
                        <span className="progress-text">{progressStats.percentage}%</span>
                    </div>
                    <div className="stat-badges">
                        <span className="stat-badge green">1: {progressStats.yes}</span>
                        <span className="stat-badge red">0: {progressStats.no}</span>
                        <span className="stat-badge gray">NA: {progressStats.naExplicit}</span>
                        <span className="stat-badge gray-light">⏳ {progressStats.pending}</span>
                    </div>
                </div>
            </div>

            {/* Editable badge */}
            <div className="editable-badge">
                <span>✏️ Multi-LT Data Entry {isOnline ? '(Online)' : '(Offline Mode)'}</span>
                <span className="badge-hint">
                    {selectedView === 'all'
                        ? (isOnline ? 'Viewing all LTs • Click cells to enter data' : 'Working offline - all LTs view')
                        : (isOnline ? `Viewing ${selectedView} only • Click cells to enter data` : `Working offline - ${selectedView} view`)}
                </span>
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
                                                                <table className={`lt-indicators-table ${selectedView === 'all' ? 'view-all' : 'view-single'}`}>
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="col-comment">💬</th>
                                                                            <th className="col-avg">Avg</th>
                                                                            {visibleLTColumns.map(lt => (
                                                                                <th key={lt} className="col-lt">{lt}</th>
                                                                            ))}
                                                                            <th className="col-evidence font-dhivehi" dir="rtl">ބަލާނެ ލިޔެކިޔުން</th>
                                                                            <th className="col-indicator font-dhivehi" dir="rtl">ބަލާނެ ކަންކަން</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {outcome.indicators.map((indicator, idx) => {
                                                                            const currentComment = getIndicatorComment ? getIndicatorComment(indicator.code) : '';
                                                                            const isCommentOpen = expandedComments[indicator.code];
                                                                            const avgScore = calculateAverage(indicator.code);

                                                                            const commentDraft = commentDrafts[indicator.code] || '';

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
                                                                                            <div className="comment-popup-overlay" onClick={() => saveComment(indicator.code)}>
                                                                                                <div className="comment-popup-modal" onClick={e => e.stopPropagation()}>
                                                                                                    <div className="comment-popup-header">
                                                                                                        <span className="font-dhivehi" dir="rtl">ކޮމެންޓް</span>
                                                                                                        <button
                                                                                                            className="comment-popup-close"
                                                                                                            onClick={() => saveComment(indicator.code)}
                                                                                                        >
                                                                                                            ×
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    <div className="comment-popup-body">
                                                                                                        <textarea
                                                                                                            className="comment-textarea font-dhivehi"
                                                                                                            dir="rtl"
                                                                                                            placeholder="ކޮމެންޓް ލިޔުއްވާ..."
                                                                                                            value={commentDraft}
                                                                                                            onChange={(e) => updateCommentDraft(indicator.code, e.target.value)}
                                                                                                            rows={4}
                                                                                                            autoFocus
                                                                                                        />
                                                                                                    </div>
                                                                                                    <div className="comment-popup-footer">
                                                                                                        <button
                                                                                                            className="comment-save-btn"
                                                                                                            onClick={() => saveComment(indicator.code)}
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

                                                                                    {/* LT Columns */}
                                                                                    {visibleLTColumns.map(lt => {
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
