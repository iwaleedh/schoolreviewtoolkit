import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Plus, Trash2, Copy, Check, X, Link, CheckCircle, XCircle, Save, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useChecklistData } from '../../hooks/useChecklistData';
import './Dimension.css';

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
        if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'INPUT') return;

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
            style={{ overflowX: 'auto', cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <div className="drag-scroll-hint">← Drag to scroll →</div>
            {children}
        </div>
    );
}

// Rating options
const RATINGS = [
    { value: 1, label: '1', description: 'Not Good', color: 'red' },
    { value: 2, label: '2', description: 'Good', color: 'yellow' },
    { value: 3, label: '3', description: 'V.Good', color: 'green' },
];

function ParentDataChecklist({ csvFileName, title, titleDv }) {
    const { loading, error, grouped } = useChecklistData(csvFileName);
    const responses = useQuery(api.parentSurvey.getAll) ?? { responses: {}, statuses: {} };
    const deleteParentMutation = useMutation(api.parentSurvey.deleteParent);
    const setParentStatusMutation = useMutation(api.parentSurvey.setParentStatus);
    const saveManualResponsesMutation = useMutation(api.parentSurvey.saveManualResponses);
    const updateSettingMutation = useMutation(api.parentSurvey.updateSetting);
    const parentSurveyEnabled = useQuery(api.parentSurvey.getSetting, { key: "parentSurveyEnabled" });



    const parentsList = useQuery(api.parentSurvey.getParents) || [];

    // Map parentId to student name
    const parentNames = {};
    parentsList.forEach(p => {
        parentNames[p.parentId] = p.studentName;
    });

    const [parents, setParents] = useState([]);
    const [newParentId, setNewParentId] = useState('');
    const [showAddParent, setShowAddParent] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [pendingUpdates, setPendingUpdates] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Monitor online/offline status
    const [isOnline, setIsOnline] = useState(navigator.onLine);

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

    // Generate survey URL
    const baseUrl = window.location.origin;

    // Load existing parents from responses
    useEffect(() => {
        if (responses.responses) {
            const parentIds = Object.keys(responses.responses);
            setParents(parentIds.sort());
        }
    }, [responses.responses]);

    // Get next parent ID
    const getNextParentId = useCallback(() => {
        if (parents.length === 0) return '001';
        const maxId = Math.max(...parents.map((p) => parseInt(p, 10)));
        return String(maxId + 1).padStart(3, '0');
    }, [parents]);


    // Add new parent
    const handleAddParent = () => {
        const parentId = newParentId.trim() || getNextParentId();
        if (!parents.includes(parentId)) {
            setParents([...parents, parentId].sort());
        }
        setNewParentId('');
        setShowAddParent(false);
    };

    // Delete parent
    const handleDeleteParent = async (parentId) => {
        if (confirm(`Delete all responses for Parent ${parentId}?`)) {
            await deleteParentMutation({ parentId });
            setParents(parents.filter((p) => p !== parentId));
        }
    };

    // Set rating (local state)
    const handleSetRating = (parentId, indicatorCode, rating) => {
        const key = `${parentId}-${indicatorCode}`;
        setPendingUpdates(prev => ({
            ...prev,
            [key]: { parentId, indicatorCode, rating }
        }));
    };

    // Save all pending updates
    const handleSave = async () => {
        if (Object.keys(pendingUpdates).length === 0 || !isOnline) return;
        setIsSaving(true);
        try {
            await saveManualResponsesMutation({ updates: Object.values(pendingUpdates) });
            setPendingUpdates({});
        } catch (error) {
            console.error("Failed to save:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Toggle Response (Global Setting)
    const handleToggleResponse = async () => {
        const newValue = !parentSurveyEnabled;
        await updateSettingMutation({ key: "parentSurveyEnabled", value: newValue });
    };

    // Get rating for a parent-indicator
    const getRating = useCallback((parentId, indicatorCode) => {
        const key = `${parentId}-${indicatorCode}`;
        if (pendingUpdates[key]) {
            return pendingUpdates[key].rating;
        }
        return responses.responses[parentId]?.[indicatorCode] || null;
    }, [pendingUpdates, responses.responses]);

    // Calculate indicator-wise totals (Row totals)
    // Stored as object keyed by IndicatorCode: { vGood, good, notGood }
    // Flatten indicators from grouped data
    const indicators = useMemo(() => {
        const flattened = [];
        grouped?.forEach((strand) => {
            strand.substrands.forEach((substrand) => {
                substrand.outcomes.forEach((outcome) => {
                    outcome.indicators.forEach((indicator) => {
                        flattened.push(indicator);
                    });
                });
            });
        });
        return flattened;
    }, [grouped]);

    // Calculate indicator-wise totals (Row totals)
    // Stored as object keyed by IndicatorCode: { vGood, good, notGood }
    const indicatorTotals = useMemo(() => {
        const totals = {};
        indicators.forEach(ind => {
            let vGood = 0, good = 0, notGood = 0;
            parents.forEach(parentId => {
                const rating = getRating(parentId, ind.code);
                if (rating === 3) vGood++;
                else if (rating === 2) good++;
                else if (rating === 1) notGood++;
            });
            totals[ind.code] = { vGood, good, notGood };
        });
        return totals;
    }, [indicators, parents, getRating]);

    // Generate and display URL
    const handleGenerateUrl = () => {
        const url = `${baseUrl}/school-review-toolkit/survey/parent`;
        setGeneratedUrl(url);
    };

    // Copy URL to clipboard
    const handleCopyUrl = async () => {
        if (generatedUrl) {
            await navigator.clipboard.writeText(generatedUrl);
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        }
    };

    // Toggle accept/reject status for a parent
    const handleToggleStatus = async (parentId) => {
        const currentStatus = responses.statuses?.[parentId];
        let newStatus;
        if (!currentStatus) {
            newStatus = 'accepted';
        } else if (currentStatus === 'accepted') {
            newStatus = 'rejected';
        } else {
            newStatus = null; // clear status
        }
        await setParentStatusMutation({ parentId, status: newStatus });
    };

    // Get parent status
    const getParentStatus = (parentId) => {
        return responses.statuses?.[parentId] || null;
    };

    // Calculate column-wise totals for a parent
    const getColumnTotals = (parentId, indicators) => {
        let vGood = 0, good = 0, notGood = 0;
        indicators.forEach((indicator) => {
            const rating = getRating(parentId, indicator.code);
            if (rating === 3) vGood++;
            else if (rating === 2) good++;
            else if (rating === 1) notGood++;
        });
        return { vGood, good, notGood };
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading {title}...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Error loading data: {error.message}</p>
            </div>
        );
    }



    return (
        <div className="dimension-container editable">
            {/* Header */}
            <div className="dimension-header">
                <div className="header-left">
                    <h2 className="dimension-title">
                        <span className="title-en">{title}</span>
                        <span className="title-dv font-dhivehi" dir="rtl">{titleDv}</span>
                    </h2>
                    <div className="dimension-stats">
                        {/* Online/Offline Status */}
                        <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                            <span>{isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                        <span className="stat-badge blue">
                            Parents: {parents.length}
                        </span>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className={`toggle-response-btn ${parentSurveyEnabled ? 'active' : ''}`}
                        onClick={handleToggleResponse}
                        title={parentSurveyEnabled ? "Public Survey is ON" : "Public Survey is OFF"}
                    >
                        {parentSurveyEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        <span>Responses: {parentSurveyEnabled ? 'ON' : 'OFF'}</span>
                    </button>
                    <button
                        className={`save-btn ${Object.keys(pendingUpdates).length > 0 ? 'dirty' : ''}`}
                        onClick={handleSave}
                        disabled={Object.keys(pendingUpdates).length === 0 || isSaving || !isOnline}
                        title={!isOnline ? 'You are offline. Reconnect to save changes.' : 'Save Changes'}
                    >
                        <Save size={18} />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                        {Object.keys(pendingUpdates).length > 0 && (
                            <span className="unsaved-badge">{Object.keys(pendingUpdates).length}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* URL Generator Section */}
            <div className="survey-url-section">
                <h3 className="font-dhivehi" dir="rtl">އޮންލައިން ސުވާލުފޯމް ލިންކް</h3>
                <p>Generate a link for parents to fill the survey online:</p>
                <div className="url-generator">
                    <button
                        className="generate-url-btn"
                        onClick={handleGenerateUrl}
                    >
                        <Link size={16} />
                        Get Public Link
                    </button>
                </div>
                {generatedUrl && (
                    <div className="generated-url-display">
                        <div className="generated-url-label">
                            Public Survey Link (One link for all parents):
                        </div>
                        <div className="generated-url-box">
                            <span className="generated-url-text">{generatedUrl}</span>
                            <button
                                className="copy-url-btn"
                                onClick={handleCopyUrl}
                                title="Copy to clipboard"
                            >
                                {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
                                {copiedUrl ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Parent Button */}
            <div className="parent-controls">
                {!showAddParent ? (
                    <button
                        className="add-parent-btn"
                        onClick={() => {
                            setNewParentId(getNextParentId());
                            setShowAddParent(true);
                        }}
                    >
                        <Plus size={18} />
                        <span>Manually Add Parent ID</span>
                    </button>
                ) : (
                    <div className="add-parent-form">
                        <input
                            type="text"
                            value={newParentId}
                            onChange={(e) => setNewParentId(e.target.value)}
                            placeholder="Parent ID"
                            autoFocus
                        />
                        <button onClick={handleAddParent} className="confirm-btn">
                            <Check size={16} />
                        </button>
                        <button
                            onClick={() => setShowAddParent(false)}
                            className="cancel-btn"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Parents Table */}
            {parents.length > 0 && indicators.length > 0 && (
                <div className="parents-table-container">
                    <DraggableTableWrapper>
                        <table className="parents-table">
                            <thead>
                                <tr>
                                    <th className="col-indicator">Indicator</th>
                                    <th className="col-indicator-totals">Total<br /><span style={{ fontSize: '0.65rem', fontWeight: 'normal' }}>(VG/G/NG)</span></th>
                                    {parents.map((parentId) => {
                                        const status = getParentStatus(parentId);
                                        return (
                                            <th key={parentId} className={`col-parent ${status ? `status-${status}` : ''}`}>
                                                <div className="parent-header">
                                                    <span className="parent-name tooltip-container">
                                                        {parentNames[parentId] || parentId}
                                                        {parentNames[parentId] && <span className="tooltip-text">{parentId}</span>}
                                                    </span>
                                                    <div className="parent-header-actions">
                                                        <button
                                                            className={`parent-status-btn ${status || 'pending'}`}
                                                            onClick={() => handleToggleStatus(parentId)}
                                                            title={
                                                                !status
                                                                    ? 'Click to Accept'
                                                                    : status === 'accepted'
                                                                        ? 'Click to Reject'
                                                                        : 'Click to Clear'
                                                            }
                                                        >
                                                            {status === 'accepted' ? (
                                                                <><CheckCircle size={12} /> <span>Accepted</span></>
                                                            ) : status === 'rejected' ? (
                                                                <><XCircle size={12} /> <span>Rejected</span></>
                                                            ) : (
                                                                <span>Pending</span>
                                                            )}
                                                        </button>
                                                        <button
                                                            className="delete-parent-btn"
                                                            onClick={() => handleDeleteParent(parentId)}
                                                            title="Delete parent"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {indicators.map((indicator) => (
                                    <tr key={indicator.code}>
                                        <td className="col-indicator font-dhivehi" dir="rtl">
                                            {indicator.text}
                                        </td>
                                        <td className="col-indicator-totals">
                                            {indicatorTotals[indicator.code] && (
                                                <div className="totals-display">
                                                    <span className="t-val vgood" title="V.Good">{indicatorTotals[indicator.code].vGood}</span>
                                                    <span className="t-sep">/</span>
                                                    <span className="t-val good" title="Good">{indicatorTotals[indicator.code].good}</span>
                                                    <span className="t-sep">/</span>
                                                    <span className="t-val notgood" title="Not Good">{indicatorTotals[indicator.code].notGood}</span>
                                                </div>
                                            )}
                                        </td>
                                        {parents.map((parentId) => {
                                            const rating = getRating(parentId, indicator.code);
                                            return (
                                                <td key={`${parentId}-${indicator.code}`} className="col-parent">
                                                    <div className="rating-buttons">
                                                        {RATINGS.map((r) => (
                                                            <button
                                                                key={r.value}
                                                                className={`rating-btn ${r.color} ${rating === r.value ? 'selected' : ''
                                                                    }`}
                                                                onClick={() =>
                                                                    handleSetRating(
                                                                        parentId,
                                                                        indicator.code,
                                                                        r.value
                                                                    )
                                                                }
                                                                title={r.description}
                                                            >
                                                                {r.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                            {/* Column-wise Totals */}
                            <tfoot>
                                <tr className="totals-row totals-vgood">
                                    <td className="col-indicator totals-label">
                                        <span className="total-label-text green">V.Good (3)</span>
                                    </td>
                                    <td className="col-indicator-totals"></td>
                                    {parents.map((parentId) => {
                                        const totals = getColumnTotals(parentId, indicators);
                                        return (
                                            <td key={`vgood-${parentId}`} className="col-parent total-cell">
                                                <span className="total-badge green">{totals.vGood}</span>
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr className="totals-row totals-good">
                                    <td className="col-indicator totals-label">
                                        <span className="total-label-text yellow">Good (2)</span>
                                    </td>
                                    <td className="col-indicator-totals"></td>
                                    {parents.map((parentId) => {
                                        const totals = getColumnTotals(parentId, indicators);
                                        return (
                                            <td key={`good-${parentId}`} className="col-parent total-cell">
                                                <span className="total-badge yellow">{totals.good}</span>
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr className="totals-row totals-notgood">
                                    <td className="col-indicator totals-label">
                                        <span className="total-label-text red">Not Good (1)</span>
                                    </td>
                                    <td className="col-indicator-totals"></td>
                                    {parents.map((parentId) => {
                                        const totals = getColumnTotals(parentId, indicators);
                                        return (
                                            <td key={`notgood-${parentId}`} className="col-parent total-cell">
                                                <span className="total-badge red">{totals.notGood}</span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </DraggableTableWrapper>
                </div>
            )}

            {parents.length === 0 && (
                <div className="empty-parents">
                    <p>No parents added yet.</p>
                    <p>Click "Add Parent Entry" to start entering data.</p>
                </div>
            )}
        </div>
    );
}

export default ParentDataChecklist;
