import { useState, useCallback, useEffect, useMemo } from 'react';
import { Plus, Trash2, Copy, Check, X, Link, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useChecklistData } from '../../hooks/useChecklistData';
import { useSSEData } from '../../context/SSEDataContext';
import './Dimension.css';

// Rating options
const RATINGS = [
    { value: 1, label: '1', description: 'Not Good', color: 'red' },
    { value: 2, label: '2', description: 'Good', color: 'yellow' },
    { value: 3, label: '3', description: 'V.Good', color: 'green' },
];

function StudentDataChecklist({ csvFileName, title, titleDv }) {
    const { loading, error, grouped } = useChecklistData(csvFileName);
    const { currentSchoolId } = useSSEData();
    const responses = useQuery(api.studentSurvey.getAll, currentSchoolId ? { schoolId: currentSchoolId } : "skip") ?? { responses: {} };


    const deleteStudentMutation = useMutation(api.studentSurvey.deleteStudent);
    const saveManualResponsesMutation = useMutation(api.studentSurvey.saveManualResponses);
    const updateSettingMutation = useMutation(api.studentSurvey.updateSetting);
    const studentSurveyEnabled = useQuery(api.studentSurvey.getSetting, { key: "studentSurveyEnabled" });

    const [students, setStudents] = useState([]);
    const [newStudentId, setNewStudentId] = useState('');
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
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

    // Load existing students from responses
    useEffect(() => {
        if (responses.responses) {
            const studentIds = Object.keys(responses.responses);
            setStudents(studentIds.sort());
        }
    }, [responses.responses]);

    // Get next student ID
    const getNextStudentId = useCallback(() => {
        if (students.length === 0) return '001';
        const maxId = Math.max(...students.map((s) => parseInt(s, 10)));
        return String(maxId + 1).padStart(3, '0');
    }, [students]);

    // Add new student
    const handleAddStudent = () => {
        const studentId = newStudentId.trim() || getNextStudentId();
        if (!students.includes(studentId)) {
            setStudents([...students, studentId].sort());
        }
        setNewStudentId('');
        setShowAddStudent(false);
    };

    // Delete student
    const handleDeleteStudent = async (studentId) => {
        if (confirm(`Delete all responses for Student ${studentId}?`)) {
            await deleteStudentMutation({ studentId });
            setStudents(students.filter((s) => s !== studentId));
        }
    };

    // Set rating
    const handleSetRating = (studentId, indicatorCode, rating) => {
        const key = `${studentId}-${indicatorCode}`;
        setPendingUpdates(prev => ({
            ...prev,
            [key]: { studentId, indicatorCode, rating }
        }));
    };

    // Save all pending updates
    const handleSave = async () => {
        if (Object.keys(pendingUpdates).length === 0 || !isOnline) return;
        setIsSaving(true);
        try {
            await saveManualResponsesMutation({ updates: Object.values(pendingUpdates), schoolId: currentSchoolId });
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
        const newValue = !studentSurveyEnabled;
        await updateSettingMutation({ key: "studentSurveyEnabled", value: newValue });
    };

    // Get rating for a student-indicator
    const getRating = useCallback((studentId, indicatorCode) => {
        const key = `${studentId}-${indicatorCode}`;
        if (pendingUpdates[key]) {
            return pendingUpdates[key].rating;
        }
        return responses.responses[studentId]?.[indicatorCode] || null;
    }, [responses.responses, pendingUpdates]);

    // Flatten indicators from grouped data (must be before early returns)
    const indicators = useMemo(() => {
        const inds = [];
        if (grouped) {
            grouped.forEach((strand) => {
                strand.substrands.forEach((substrand) => {
                    substrand.outcomes.forEach((outcome) => {
                        outcome.indicators.forEach((indicator) => {
                            inds.push(indicator);
                        });
                    });
                });
            });
        }
        return inds;
    }, [grouped]);

    // Calculate indicator-wise totals (Row totals) - must be before early returns
    const indicatorTotals = useMemo(() => {
        const totals = {};
        indicators.forEach(ind => {
            let vGood = 0, good = 0, notGood = 0;
            students.forEach(studentId => {
                const rating = getRating(studentId, ind.code);
                if (rating === 3) vGood++;
                else if (rating === 2) good++;
                else if (rating === 1) notGood++;
            });
            totals[ind.code] = { vGood, good, notGood };
        });
        return totals;
    }, [indicators, students, getRating]);

    // Generate general survey URL (students will enter their info on the form)
    const getSurveyUrl = () => {
        return `${baseUrl}/survey/student`;
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
            setCopiedUrl(copiedUrl); // Keep showing it
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
                    {/* Online/Offline Status */}
                    <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                        <span>{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                    <span className="stat-badge blue">
                        Students: {students.length}
                    </span>
                </div>
                <div className="header-actions">
                    <button
                        className={`toggle-response-btn ${studentSurveyEnabled ? 'active' : ''}`}
                        onClick={handleToggleResponse}
                        title={studentSurveyEnabled ? "Public Survey is ON" : "Public Survey is OFF"}
                    >
                        {studentSurveyEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        <span>Responses: {studentSurveyEnabled ? 'ON' : 'OFF'}</span>
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
                <p>Generate a link for students to fill the survey online:</p>
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

            {/* Add Student Button */}
            <div className="parent-controls">
                {!showAddStudent ? (
                    <button
                        className="add-parent-btn"
                        onClick={() => {
                            setNewStudentId(getNextStudentId());
                            setShowAddStudent(true);
                        }}
                    >
                        <Plus size={18} />
                        <span>Add Student Entry</span>
                    </button>
                ) : (
                    <div className="add-parent-form">
                        <input
                            type="text"
                            value={newStudentId}
                            onChange={(e) => setNewStudentId(e.target.value)}
                            placeholder="Student ID"
                            autoFocus
                        />
                        <button onClick={handleAddStudent} className="confirm-btn">
                            <Check size={16} />
                        </button>
                        <button
                            onClick={() => setShowAddStudent(false)}
                            className="cancel-btn"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Students Table */}
            {students.length > 0 && indicators.length > 0 && (
                <div className="parents-table-container">
                    <div className="parents-table-wrapper">
                        <table className="parents-table">
                            <thead>
                                <tr>
                                    <th className="col-indicator">Indicator</th>
                                    <th className="col-indicator-totals">Total<br /><span style={{ fontSize: '0.65rem', fontWeight: 'normal' }}>(VG/G/NG)</span></th>
                                    {students.map((studentId) => (
                                        <th key={studentId} className="col-parent">
                                            <div className="parent-header">
                                                <span>S{studentId}</span>
                                                <button
                                                    className="delete-parent-btn"
                                                    onClick={() => handleDeleteStudent(studentId)}
                                                    title="Delete student"
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
                                        {students.map((studentId) => {
                                            const rating = getRating(studentId, indicator.code);
                                            return (
                                                <td key={`${studentId}-${indicator.code}`} className="col-parent">
                                                    <div className="rating-buttons">
                                                        {RATINGS.map((r) => (
                                                            <button
                                                                key={r.value}
                                                                className={`rating-btn ${r.color} ${rating === r.value ? 'selected' : ''
                                                                    }`}
                                                                onClick={() =>
                                                                    handleSetRating(
                                                                        studentId,
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

            {students.length === 0 && (
                <div className="empty-parents">
                    <p>No students added yet.</p>
                    <p>Click "Add Student Entry" to start entering data.</p>
                </div>
            )}
        </div>
    );
}

export default StudentDataChecklist;
