import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, MessageSquarePlus, X, Save, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { useSSEData } from '../../context/SSEDataContext';
import Papa from 'papaparse';
import './Dimension.css';

// LT/Teacher columns - will be dynamically set based on CSV
const MAX_LT_GROUPS = ['LT1', 'LT2', 'LT3', 'LT4', 'LT5', 'LT6', 'LT7', 'LT8', 'LT9', 'LT10'];
const MAX_T_GROUPS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'];
const LP_COLUMNS = ['LP1', 'LP2', 'LP3', 'LP4', 'LP5'];
const OBS_COLUMNS = ['LO1', 'LO2']; // For Lesson Observation (2 observations per teacher)

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
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setScrollLeft(containerRef.current.scrollLeft);
    }, []);

    const onMouseUp = useCallback(() => setIsDragging(false), []);
    const onMouseLeave = useCallback(() => setIsDragging(false), []);

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
 * MobileOutcomeCard - Touch-friendly card layout for a single outcome on small screens
 */
function MobileOutcomeCard({ outcome, visibleLTGroups, getLPScore, handleLPScoreClick, isDataEntryMode, calculateAverage, columnConfig }) {
    const [expandedIndicator, setExpandedIndicator] = useState(null);

    const toggleIndicator = (code) => {
        setExpandedIndicator(prev => prev === code ? null : code);
    };

    return (
        <div className="lp-mobile-cards">
            {outcome.indicators.map((indicator) => {
                const isExpanded = expandedIndicator === indicator.code;
                const avgScore = calculateAverage(indicator.code);
                return (
                    <div key={indicator.code} className={`lp-mobile-card ${isExpanded ? 'expanded' : ''}`}>
                        <button
                            className="lp-mobile-card-header"
                            onClick={() => toggleIndicator(indicator.code)}
                        >
                            <div className="lp-mobile-card-info">
                                <div className="lp-mobile-card-badges">
                                    <span className="lp-mobile-card-code">{indicator.code}</span>
                                    <span className={`lp-mobile-avg-badge ${avgScore === 1 ? 'avg-one' : avgScore === 0 ? 'avg-zero' : 'avg-na'}`}>
                                        Avg: {avgScore === 1 ? '1' : avgScore === 0 ? '0' : 'NR'}
                                    </span>
                                </div>
                            </div>
                            <span className={`lp-mobile-card-chevron ${isExpanded ? 'open' : ''}`}>▼</span>
                        </button>

                        {/* Indicator Text */}
                        <div className="lp-mobile-card-indicator font-dhivehi" dir="rtl">
                            {indicator.text}
                        </div>

                        {isExpanded && (
                            <div className="lp-mobile-card-body">
                                {visibleLTGroups.map(lt => (
                                    <div key={lt} className="lp-mobile-lt-group">
                                        <div className="lp-mobile-lt-label">
                                            {columnConfig?.groupPrefix === 'T' 
                                                ? lt.replace('T', 'T ') 
                                                : lt.replace('LT', 'LT ')}
                                        </div>
                                        <div className="lp-mobile-lp-row">
                                            {columnConfig?.colNames?.map(col => {
                                                const score = getLPScore(indicator.code, lt, col);
                                                return (
                                                    <button
                                                        key={`${lt}_${col}`}
                                                        className={`lp-mobile-score-btn ${score === 1 ? 'score-yes' : score === 0 ? 'score-no' : score === 'NR' ? 'score-nr' : 'score-empty'} ${!isDataEntryMode ? 'read-only' : ''}`}
                                                        onClick={() => handleLPScoreClick(indicator.code, lt, col, score)}
                                                        disabled={!isDataEntryMode}
                                                    >
                                                        <span className="lp-mobile-lp-label">{col}</span>
                                                        <span className="lp-mobile-score-value">
                                                            {score === 1 ? '✓' : score === 0 ? '✗' : score === 'NR' ? 'NR' : '—'}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/**
 * LessonPlanChecklist - Accordion layout for lesson plan checklists
 * Matches LTChecklist pattern: Outcome headers → expandable tables with LP columns
 * Includes Comment column and 1/0/NR average
 */
export default function LessonPlanChecklist({ csvFileName, title, titleDv, source }) {
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
    const [data, setData] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedView, setSelectedView] = useState('all');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [ltGroups, setLtGroups] = useState(MAX_LT_GROUPS);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [saveStatus, setSaveStatus] = useState(null); // null, 'success', 'error'
    const [columnConfig, setColumnConfig] = useState({
        colsPerGroup: 5,
        groupPrefix: 'LT',
        colNames: LP_COLUMNS,
    });

    // Accordion state
    const [expandedOutcomes, setExpandedOutcomes] = useState({});
    const [expandedComments, setExpandedComments] = useState({});

    const toggleOutcome = (id) => setExpandedOutcomes(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleComment = (code) => setExpandedComments(prev => ({ ...prev, [code]: !prev[code] }));

    // Listen for window resize to toggle mobile view
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // Save all pending changes to backend
    const handleSaveAll = async () => {
        const result = await savePendingLTScores(source);
        if (result.success) {
            setSaveStatus('success');
        } else {
            setSaveStatus('error');
        }
    };

    // Parse CSV data
    useEffect(() => {
        const loadData = async () => {
            try {
                const basePath = import.meta.env.BASE_URL || '/';
                const response = await fetch(`${basePath}Checklist/${csvFileName}`);
                if (!response.ok) throw new Error(`Failed to fetch ${csvFileName}`);
                const text = await response.text();

                const lines = text.split('\n');
                if (lines.length < 3) throw new Error('CSV has insufficient data');

                // Parse header to detect structure (LT-based or T-based)
                const columnHeaderLine = lines[1]; // Second row has column names like "1,2,1,2..."
                const dataStartRow = 2;
                
                // Check if this is Lesson Observation (T-columns) or Lesson Plan (LT-columns)
                // by looking at the first header row
                const titleRow = lines[0];
                const isObservation = titleRow.includes('Observation') || titleRow.includes('Obervation') || titleRow.includes('އޮބްސަވޭޝަން');
                const isTeacherBased = columnHeaderLine.includes('T1') || isObservation;
                
                // Determine columns per group
                const colsPerGroup = isObservation ? 2 : 5;
                const groupPrefix = isObservation ? 'T' : 'LT';
                const colNames = isObservation ? OBS_COLUMNS : LP_COLUMNS;
                const maxGroups = isObservation ? MAX_T_GROUPS : MAX_LT_GROUPS;

                const dataLines = lines.slice(dataStartRow).join('\n');

                Papa.parse(dataLines, {
                    header: false,
                    skipEmptyLines: true,
                    complete: (results) => {
                        if (results.data.length < 1) {
                            setError('CSV has insufficient data rows');
                            setLoading(false);
                            return;
                        }

                        const dataRows = results.data;
                        const LP_START_COL = 5;

                        // Detect number of groups from the data row length
                        const firstDataRow = dataRows.find(row => row[0] && row[0].trim());
                        const totalCols = firstDataRow ? firstDataRow.length : 0;
                        const groupCount = Math.floor((totalCols - LP_START_COL) / colsPerGroup);
                        const detectedGroups = maxGroups.slice(0, Math.max(1, groupCount));
                        setLtGroups(detectedGroups);
                        setColumnConfig({
                            colsPerGroup,
                            groupPrefix,
                            colNames,
                        });

                        const indicators = [];
                        let currentOutcomeNo = '';
                        let currentOutcome = '';

                        dataRows.forEach((row) => {
                            const indicatorCode = (row[0] || '').trim();
                            const outcomeNo = (row[2] || '').trim();
                            const outcome = (row[3] || '').trim();
                            const indicator = (row[4] || '').trim();

                            if (outcomeNo) currentOutcomeNo = outcomeNo;
                            if (outcome) currentOutcome = outcome;

                            if (indicatorCode && indicator) {
                                const lpData = {};
                                for (let groupIdx = 0; groupIdx < detectedGroups.length; groupIdx++) {
                                    const groupKey = `${groupPrefix}${groupIdx + 1}`;
                                    lpData[groupKey] = {};
                                    for (let colIdx = 0; colIdx < colsPerGroup; colIdx++) {
                                        const colIndex = LP_START_COL + (groupIdx * colsPerGroup) + colIdx;
                                        const colKey = colNames[colIdx];
                                        lpData[groupKey][colKey] = row[colIndex] || '';
                                    }
                                }

                                indicators.push({
                                    code: indicatorCode,
                                    outcomeNo: currentOutcomeNo,
                                    outcome: currentOutcome,
                                    text: indicator,
                                    lpData
                                });
                            }
                        });

                        setData(indicators);

                        // Group indicators by outcomeNo
                        const outcomeMap = new Map();
                        indicators.forEach((ind) => {
                            if (!outcomeMap.has(ind.outcomeNo)) {
                                outcomeMap.set(ind.outcomeNo, {
                                    id: ind.outcomeNo,
                                    title: ind.outcome,
                                    indicators: []
                                });
                            }
                            outcomeMap.get(ind.outcomeNo).indicators.push(ind);
                        });
                        setGroupedData(Array.from(outcomeMap.values()));

                        setLoading(false);
                    },
                    error: (err) => {
                        setError(err.message);
                        setLoading(false);
                    }
                });
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        loadData();
    }, [csvFileName]);

    // Get score for a specific indicator/LT/LP combination
    const getLPScore = useCallback((indicatorCode, lt, lp) => {
        const colKey = `${lt}_${lp}`;
        return getIndicatorLTScore(indicatorCode, colKey);
    }, [getIndicatorLTScore]);

    // Set score - cycle: null -> 1 -> 0 -> 'NR' -> null (continuous)
    const handleLPScoreClick = useCallback((indicatorCode, lt, lp, currentScore) => {
        const colKey = `${lt}_${lp}`;
        let newScore;
        if (currentScore === undefined || currentScore === null) {
            newScore = 1;
        } else if (currentScore === 1) {
            newScore = 0;
        } else if (currentScore === 0) {
            newScore = 'NR';
        } else {
            newScore = null;
        }
        setIndicatorLTScore(indicatorCode, colKey, newScore, source);
    }, [setIndicatorLTScore, source]);

    // Calculate average: 1 if ≥60% are 1, 0 if <60%, NR if no valid scores
    const calculateAverage = useCallback((indicatorCode) => {
        const scores = [];
        ltGroups.forEach(lt => {
            columnConfig.colNames.forEach(col => {
                const score = getLPScore(indicatorCode, lt, col);
                if (score === 1 || score === 0) {
                    scores.push(score);
                }
            });
        });

        if (scores.length === 0) return 'NR';

        const sum = scores.reduce((acc, val) => acc + val, 0);
        const percentage = (sum / scores.length) * 100;
        return percentage >= 60 ? 1 : 0;
    }, [getLPScore, ltGroups, columnConfig]);

    // Handle comment change
    const handleCommentChange = (indicatorCode, comment) => {
        setIndicatorComment(indicatorCode, comment);
    };

    // Calculate progress stats
    const progressStats = useMemo(() => {
        let completed = 0;
        let yes = 0;
        let no = 0;
        let nrExplicit = 0;
        const total = data.length * ltGroups.length * columnConfig.colNames.length;

        data.forEach(indicator => {
            ltGroups.forEach(lt => {
                columnConfig.colNames.forEach(col => {
                    const score = getLPScore(indicator.code, lt, col);
                    if (score !== undefined && score !== null) {
                        completed++;
                        if (score === 1) yes++;
                        else if (score === 0) no++;
                        else if (score === 'NR') nrExplicit++;
                    }
                });
            });
        });

        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { percentage, yes, no, nrExplicit, pending: total - completed };
    }, [data, getLPScore, ltGroups, columnConfig]);

    // Count pending scores and comments
    const pendingScoresCount = getPendingCount(source);
    const pendingCommentsCount = Object.keys(pendingComments).length;
    const totalPendingCount = pendingScoresCount + pendingCommentsCount;
    const hasChanges = hasPendingChanges(source) || pendingCommentsCount > 0;

    // Filter available LT groups based on selection
    const visibleLTGroups = useMemo(() => {
        if (selectedView === 'all') return ltGroups;
        return ltGroups.includes(selectedView) ? [selectedView] : ltGroups;
    }, [selectedView, ltGroups]);

    // LP score button class
    const getLPScoreClass = (score) => {
        if (score === 1) return 'lt-score-btn score-one';
        if (score === 0) return 'lt-score-btn score-zero';
        if (score === 'NR') return 'lt-score-btn score-na';
        return 'lt-score-btn score-empty';
    };

    // LP score display text
    const getLPScoreDisplay = (score) => {
        if (score === 1) return '✓';
        if (score === 0) return '✗';
        if (score === 'NR') return 'NR';
        return '-';
    };

    if (loading) {
        return (
            <div className="dimension-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading lesson plan data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dimension-container">
                <div className="error-container">
                    <p>Error: {error}</p>
                    <p className="error-hint">Make sure "{csvFileName}" exists in /Checklist/ folder</p>
                </div>
            </div>
        );
    }

    if (groupedData.length === 0) {
        return (
            <div className="dimension-container">
                <div className="empty-container">
                    <h2>{title}</h2>
                    <p>No checklist data found.</p>
                    <p className="empty-hint">Please upload "{csvFileName}" to the Checklist folder.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dimension-container editable lt-checklist lp-checklist">
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
                    <label htmlFor="view-select">View:</label>
                    <select
                        id="view-select"
                        value={selectedView}
                        onChange={(e) => setSelectedView(e.target.value)}
                        className="view-dropdown"
                    >
                        <option value="all">Master Sheet (All)</option>
                        {ltGroups.map(lt => (
                            <option key={lt} value={lt}>
                                {columnConfig.groupPrefix === 'T' 
                                    ? lt.replace('T', 'Teacher ') 
                                    : lt.replace('LT', 'Leading Teacher ')}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="lp-progress-stats">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progressStats.percentage}%` }}></div>
                        <span className="progress-text">{progressStats.percentage}%</span>
                    </div>
                    <div className="stat-badges">
                        <span className="stat-badge green">✓ {progressStats.yes}</span>
                        <span className="stat-badge red">✗ {progressStats.no}</span>
                        <span className="stat-badge gray">NR {progressStats.nrExplicit}</span>
                        <span className="stat-badge gray-light">⏳ {progressStats.pending}</span>
                    </div>
                </div>
            </div>

            {/* Editable badge */}
            <div className="editable-badge">
                <span>✏️ {columnConfig.groupPrefix === 'T' ? 'Lesson Observation' : 'Lesson Plan'} Data Entry {isOnline ? '(Online)' : '(Offline Mode)'}</span>
                <span className="badge-hint">
                    {isOnline 
                        ? 'Click cells to cycle: ✓ → ✗ → NR • Click Save when done' 
                        : 'Working offline - data is saved locally • Will sync when you come back online'}
                </span>
            </div>

            {/* Accordion Content - grouped by outcome */}
            <div className="checklist-content lt-grid-wrapper">
                {groupedData.map((outcome) => (
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
                            <span className="outcome-indicator-count">{outcome.indicators.length} indicators</span>
                        </button>

                        {/* Outcome Content - LP Grid Table */}
                        {expandedOutcomes[outcome.id] && (
                            !isMobile ? (
                                <DraggableTableWrapper>
                                    <table className="lt-indicators-table">
                                        <thead>
                                            <tr>
                                                <th className="col-comment">💬</th>
                                                <th className="col-avg">Avg</th>
                                                {visibleLTGroups.map(lt => (
                                                    <th key={lt} className="col-lt-group-header" colSpan={columnConfig.colsPerGroup}>
                                                        {columnConfig.groupPrefix === 'T' 
                                                            ? lt.replace('T', 'T - ') 
                                                            : lt.replace('LT', 'LT - ')}
                                                    </th>
                                                ))}
                                                <th className="col-indicator font-dhivehi" dir="rtl">އިންޑިކޭޓަރ</th>
                                            </tr>
                                            <tr className="lp-sub-header">
                                                <th></th>
                                                <th></th>
                                                {visibleLTGroups.map(lt => (
                                                    columnConfig.colNames.map(col => (
                                                        <th key={`${lt}_${col}`} className="col-lp-sub">
                                                            {col}
                                                        </th>
                                                    ))
                                                ))}
                                                <th></th>
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
                                                                    <div className="comment-popup" onClick={e => e.stopPropagation()}>
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

                                                        {/* Average Column - 1/0/NR */}
                                                        <td className={`col-avg ${avgScore === 1 ? 'avg-one' : avgScore === 0 ? 'avg-zero' : 'avg-na'}`}>
                                                            <span className="avg-display">
                                                                {avgScore === 1 ? '1' : avgScore === 0 ? '0' : 'NR'}
                                                            </span>
                                                        </td>

                                                        {/* Score Cells per Group */}
                                                        {visibleLTGroups.map(lt => (
                                                            columnConfig.colNames.map(col => {
                                                                const score = getLPScore(indicator.code, lt, col);
                                                                return (
                                                                    <td key={`${lt}_${col}`} className="col-lt">
                                                                        <button
                                                                            className={getLPScoreClass(score)}
                                                                            onClick={() => handleLPScoreClick(indicator.code, lt, col, score)}
                                                                            title={`${lt} ${col}: Click to cycle ✓→✗→NR`}
                                                                        >
                                                                            {getLPScoreDisplay(score)}
                                                                        </button>
                                                                    </td>
                                                                );
                                                            })
                                                        ))}

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
                            ) : (
                                <MobileOutcomeCard
                                    outcome={outcome}
                                    visibleLTGroups={visibleLTGroups}
                                    getLPScore={getLPScore}
                                    handleLPScoreClick={handleLPScoreClick}
                                    isDataEntryMode={true}
                                    calculateAverage={calculateAverage}
                                    columnConfig={columnConfig}
                                />
                            )
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
