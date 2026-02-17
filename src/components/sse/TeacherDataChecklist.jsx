import { useState, useCallback, useEffect, useMemo } from 'react';
import { Plus, Trash2, Copy, Check, X, Link, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useChecklistData } from '../../hooks/useChecklistData';
import './Dimension.css';

// Rating options
const RATINGS = [
    { value: 1, label: '1', description: 'Not Good', color: 'red' },
    { value: 2, label: '2', description: 'Good', color: 'yellow' },
    { value: 3, label: '3', description: 'V.Good', color: 'green' },
];

function TeacherDataChecklist({ csvFileName, title, titleDv }) {
    const { loading, error, grouped } = useChecklistData(csvFileName);
    const responses = useQuery(api.teacherSurvey.getAll) ?? { responses: {} };
    const setRatingMutation = useMutation(api.teacherSurvey.setRating);

    const deleteTeacherMutation = useMutation(api.teacherSurvey.deleteTeacher);
    const saveManualResponsesMutation = useMutation(api.teacherSurvey.saveManualResponses);
    const updateSettingMutation = useMutation(api.teacherSurvey.updateSetting);
    const teacherSurveyEnabled = useQuery(api.teacherSurvey.getSetting, { key: "teacherSurveyEnabled" });

    const [teachers, setTeachers] = useState([]);
    const [newTeacherId, setNewTeacherId] = useState('');
    const [showAddTeacher, setShowAddTeacher] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [pendingUpdates, setPendingUpdates] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Generate survey URL
    const baseUrl = window.location.origin;

    // Flatten indicators from grouped data (must be before early returns)
    const indicators = useMemo(() => {
        const result = [];
        if (grouped) {
            grouped.forEach((strand) => {
                strand.substrands.forEach((substrand) => {
                    substrand.outcomes.forEach((outcome) => {
                        outcome.indicators.forEach((indicator) => {
                            result.push(indicator);
                        });
                    });
                });
            });
        }
        return result;
    }, [grouped]);

    // Load existing teachers from responses
    useEffect(() => {
        if (responses.responses) {
            const teacherIds = Object.keys(responses.responses);
            setTeachers(teacherIds.sort());
        }
    }, [responses.responses]);

    // Get next teacher ID
    const getNextTeacherId = useCallback(() => {
        if (teachers.length === 0) return '001';
        const maxId = Math.max(...teachers.map((t) => parseInt(t, 10)));
        return String(maxId + 1).padStart(3, '0');
    }, [teachers]);

    // Add new teacher
    const handleAddTeacher = () => {
        const teacherId = newTeacherId.trim() || getNextTeacherId();
        if (!teachers.includes(teacherId)) {
            setTeachers([...teachers, teacherId].sort());
        }
        setNewTeacherId('');
        setShowAddTeacher(false);
    };

    // Delete teacher
    const handleDeleteTeacher = async (teacherId) => {
        if (confirm(`Delete all responses for Teacher ${teacherId}?`)) {
            await deleteTeacherMutation({ teacherId });
            setTeachers(teachers.filter((t) => t !== teacherId));
        }
    };

    // Set rating
    const handleSetRating = (teacherId, indicatorCode, rating) => {
        const key = `${teacherId}-${indicatorCode}`;
        setPendingUpdates(prev => ({
            ...prev,
            [key]: { teacherId, indicatorCode, rating }
        }));
    };

    // Save all pending updates
    const handleSave = async () => {
        if (Object.keys(pendingUpdates).length === 0) return;
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
        const newValue = !teacherSurveyEnabled;
        await updateSettingMutation({ key: "teacherSurveyEnabled", value: newValue });
    };

    // Get rating for a teacher-indicator
    const getRating = useCallback((teacherId, indicatorCode) => {
        const key = `${teacherId}-${indicatorCode}`;
        if (pendingUpdates[key]) {
            return pendingUpdates[key].rating;
        }
        return responses.responses[teacherId]?.[indicatorCode] || null;
    }, [responses.responses, pendingUpdates]);

    // Calculate indicator-wise totals (Row totals) - must be before early returns
    const indicatorTotals = useMemo(() => {
        const totals = {};
        indicators.forEach(ind => {
            let vGood = 0, good = 0, notGood = 0;
            teachers.forEach(teacherId => {
                const rating = getRating(teacherId, ind.code);
                if (rating === 3) vGood++;
                else if (rating === 2) good++;
                else if (rating === 1) notGood++;
            });
            totals[ind.code] = { vGood, good, notGood };
        });
        return totals;
    }, [indicators, teachers, getRating]);

    // Generate general survey URL
    const getSurveyUrl = () => {
        return `${baseUrl}/school-review-toolkit/survey/teacher`;
    };

    // Generate and display URL
    const handleGenerateUrl = () => {
        const url = getSurveyUrl();
        setCopiedUrl(url);
    };

    // Copy URL to clipboard
    const handleCopyUrl = async () => {
        if (copiedUrl) {
            await navigator.clipboard.writeText(copiedUrl);
            setTimeout(() => setCopiedUrl(false), 2000);
        }
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
                <h2 className="dimension-title">
                    <span className="title-en">{title}</span>
                    <span className="title-dv font-dhivehi" dir="rtl">{titleDv}</span>
                </h2>
                <div className="dimension-stats">
                    <span className="stat-badge blue">
                        Teachers: {teachers.length}
                    </span>
                </div>
                <div className="header-actions">
                    <button
                        className={`toggle-response-btn ${teacherSurveyEnabled ? 'active' : ''}`}
                        onClick={handleToggleResponse}
                        title={teacherSurveyEnabled ? "Public Survey is ON" : "Public Survey is OFF"}
                    >
                        {teacherSurveyEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        <span>Responses: {teacherSurveyEnabled ? 'ON' : 'OFF'}</span>
                    </button>
                    <button
                        className={`save-btn ${Object.keys(pendingUpdates).length > 0 ? 'dirty' : ''}`}
                        onClick={handleSave}
                        disabled={Object.keys(pendingUpdates).length === 0 || isSaving}
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
                <p>Generate a link for teachers to fill the survey online:</p>
                <div className="url-generator">
                    <button
                        className="generate-url-btn"
                        onClick={handleGenerateUrl}
                    >
                        <Link size={16} />
                        Get Public Link
                    </button>
                </div>
                {copiedUrl && (
                    <div className="generated-url-display">
                        <div className="generated-url-label">
                            Public Survey Link:
                        </div>
                        <div className="generated-url-box">
                            <span className="generated-url-text">{copiedUrl}</span>
                            <button
                                className="copy-url-btn"
                                onClick={handleCopyUrl}
                                title="Copy to clipboard"
                            >
                                <Copy size={16} />
                                {copiedUrl ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Teacher Button */}
            <div className="parent-controls">
                {!showAddTeacher ? (
                    <button
                        className="add-parent-btn"
                        onClick={() => {
                            setNewTeacherId(getNextTeacherId());
                            setShowAddTeacher(true);
                        }}
                    >
                        <Plus size={18} />
                        <span>Add Teacher Entry</span>
                    </button>
                ) : (
                    <div className="add-parent-form">
                        <input
                            type="text"
                            value={newTeacherId}
                            onChange={(e) => setNewTeacherId(e.target.value)}
                            placeholder="Teacher ID"
                            autoFocus
                        />
                        <button onClick={handleAddTeacher} className="confirm-btn">
                            <Check size={16} />
                        </button>
                        <button
                            onClick={() => setShowAddTeacher(false)}
                            className="cancel-btn"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Teachers Table */}
            {teachers.length > 0 && indicators.length > 0 && (
                <div className="parents-table-container">
                    <div className="parents-table-wrapper">
                        <table className="parents-table">
                            <thead>
                                <tr>
                                    <th className="col-indicator">Indicator</th>
                                    <th className="col-indicator-totals">Total<br /><span style={{ fontSize: '0.65rem', fontWeight: 'normal' }}>(VG/G/NG)</span></th>
                                    {teachers.map((teacherId) => (
                                        <th key={teacherId} className="col-parent">
                                            <div className="parent-header">
                                                <span>T{teacherId}</span>
                                                <button
                                                    className="delete-parent-btn"
                                                    onClick={() => handleDeleteTeacher(teacherId)}
                                                    title="Delete teacher"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </th>
                                    ))}
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
                                        {teachers.map((teacherId) => {
                                            const rating = getRating(teacherId, indicator.code);
                                            return (
                                                <td key={`${teacherId}-${indicator.code}`} className="col-parent">
                                                    <div className="rating-buttons">
                                                        {RATINGS.map((r) => (
                                                            <button
                                                                key={r.value}
                                                                className={`rating-btn ${r.color} ${rating === r.value ? 'selected' : ''
                                                                    }`}
                                                                onClick={() =>
                                                                    handleSetRating(
                                                                        teacherId,
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
                        </table>
                    </div>
                </div>
            )}

            {teachers.length === 0 && (
                <div className="empty-parents">
                    <p>No teachers added yet.</p>
                    <p>Click "Add Teacher Entry" to start entering data.</p>
                </div>
            )}
        </div>
    );
}

export default TeacherDataChecklist;
