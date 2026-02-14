import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Send, XCircle } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useChecklistData } from '../hooks/useChecklistData';
import './ParentSurvey.css';

const RATINGS = [
    { value: 1, label: '1 - Not Good', description: 'Not Good', color: 'red' },
    { value: 2, label: '2 - Good', description: 'Good', color: 'yellow' },
    { value: 3, label: '3 - Very Good', description: 'Very Good', color: 'green' },
];

// Start Survey Form Component
function StartSurveyForm({ onStart }) {
    const [name, setName] = useState('');
    const [grade, setGrade] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsSubmitting(true);
        await onStart(name, grade);
        setIsSubmitting(false);
    };

    return (
        <div className="start-survey-container">
            <div className="start-card">
                <h1 className="font-dhivehi" dir="rtl">ބެލެނިވެރިންގެ ސުވާލުފޯމް</h1>
                <h2>Parent Questionnaire</h2>
                <p className="start-desc">
                    Please enter your child's name and grade to start the survey.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Student Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Ahmed Ali"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Grade / Class (Optional)</label>
                        <input
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            placeholder="e.g. Grade 1A"
                        />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="start-btn">
                        {isSubmitting ? 'Starting...' : 'Start Survey'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function ParentSurvey() {
    const { parentId: routeParentId } = useParams();
    const navigate = useNavigate();
    const { data, loading, error, grouped } = useChecklistData('Parents_data.csv');

    // If no ID in route, we are in start mode
    const isStartMode = !routeParentId;

    // Only use query if we have an ID
    const existingResponsesResult = useQuery(api.parentSurvey.getByParentId,
        isStartMode ? "skip" : { parentId: routeParentId }
    );

    const parentSurveyEnabled = useQuery(api.parentSurvey.getSetting, { key: "parentSurveyEnabled" });
    const submitSurvey = useMutation(api.parentSurvey.submitOnlineSurvey);
    const createParentMutation = useMutation(api.parentSurvey.createParent);

    const [responses, setResponses] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [comment, setComment] = useState('');

    // Load existing responses when data is available
    useEffect(() => {
        if (!isStartMode && existingResponsesResult?.ratings) {
            setResponses((prev) => {
                if (Object.keys(prev).length === 0 && Object.keys(existingResponsesResult.ratings).length > 0) {
                    return existingResponsesResult.ratings;
                }
                return prev;
            });
        }
    }, [isStartMode, existingResponsesResult]);

    // Handle create parent
    const handleStartSurvey = async (studentName, grade) => {
        try {
            const newId = await createParentMutation({ studentName, grade });
            // Navigate to the specific URL for this parent
            navigate(`/survey/parent/${newId}`, { replace: true });
        } catch (err) {
            console.error("Failed to crate parent:", err);
            alert("Error starting survey. Please try again.");
        }
    };

    // Set rating for an indicator
    const handleSetRating = (indicatorCode, rating) => {
        setResponses((prev) => ({ ...prev, [indicatorCode]: rating }));
    };

    // Submit survey
    const handleSubmit = async () => {
        const responseArray = Object.entries(responses).map(([indicatorCode, rating]) => ({
            indicatorCode,
            rating,
        }));

        if (responseArray.length === 0) {
            alert('Please rate at least one indicator.');
            return;
        }

        try {
            await submitSurvey({
                parentId: routeParentId,
                responses: responseArray,
                comment
            });
            setSubmitted(true);
        } catch (err) {
            alert('Error submitting survey. Please try again.');
            console.error(err);
        }
    };

    // Check directly for enabled status
    if (parentSurveyEnabled === false) {
        return (
            <div className="survey-closed-container">
                <div className="closed-icon">
                    <XCircle size={48} />
                </div>
                <h2>Survey Closed</h2>
                <p>The parent survey is currently not accepting responses.</p>
                <p>Please contact the school administration for more information.</p>
            </div>
        );
    }

    // Render Start Screen if no ID
    if (isStartMode) {
        return <StartSurveyForm onStart={handleStartSurvey} />;
    }

    if (loading) {
        return (
            <div className="survey-loading">
                <div className="spinner"></div>
                <p>Loading survey...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="survey-error">
                <h2>Error loading survey</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="survey-success">
                <div className="success-icon">
                    <Check size={48} />
                </div>
                <h2>Thank You!</h2>
                <p>Your feedback has been submitted successfully.</p>
                <p className="parent-id">Parent ID: {routeParentId}</p>
            </div>
        );
    }

    // Calculate progress
    const totalIndicators = data?.length || 0;
    const answeredCount = Object.keys(responses).length;
    const progress = totalIndicators > 0 ? Math.round((answeredCount / totalIndicators) * 100) : 0;

    return (
        <div className="parent-survey">
            {/* Header */}
            <header className="survey-header">
                <h1 className="font-dhivehi" dir="rtl">
                    ބެލެނިވެރިންގެ ސުވާލުފޯމް
                </h1>
                <h2>Parent Questionnaire</h2>
                <div className="parent-id-badge">ID: {routeParentId}</div>
            </header>

            {/* Progress Bar */}
            <div className="progress-section">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="progress-text">{answeredCount} / {totalIndicators} answered ({progress}%)</span>
            </div>

            {/* Survey Content */}
            <div className="survey-content">
                {grouped?.map((strand) => (
                    <div key={strand.id} className="strand-section">
                        {/* Static Header - Hide if Unknown */}
                        {strand.title !== 'Unknown' && (
                            <div className="strand-header static">
                                <span className="strand-title font-dhivehi" dir="rtl">
                                    {strand.title}
                                </span>
                            </div>
                        )}

                        <div className="strand-content">
                            {strand.substrands.map((substrand) => (
                                <div key={substrand.id} className="substrand-section">
                                    <h4 className="substrand-title font-dhivehi" dir="rtl">
                                        {substrand.title}
                                    </h4>
                                    {substrand.outcomes.map((outcome) => (
                                        <div key={outcome.id} className="outcome-section">
                                            <h5 className="outcome-title font-dhivehi" dir="rtl">
                                                {outcome.title}
                                            </h5>
                                            <div className="indicators-list">
                                                {outcome.indicators.map((indicator) => (
                                                    <div
                                                        key={indicator.code}
                                                        className="indicator-item"
                                                    >
                                                        <p className="indicator-text font-dhivehi" dir="rtl">
                                                            {indicator.text}
                                                        </p>
                                                        <div className="rating-options">
                                                            {RATINGS.map((r) => (
                                                                <button
                                                                    key={r.value}
                                                                    className={`rating-option ${r.color} ${responses[indicator.code] === r.value
                                                                        ? 'selected'
                                                                        : ''
                                                                        }`}
                                                                    onClick={() =>
                                                                        handleSetRating(indicator.code, r.value)
                                                                    }
                                                                >
                                                                    <span className="rating-number">{r.value}</span>
                                                                    <span className="rating-desc">{r.description}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Comment Section (New) */}
            <div className="survey-comment-section">
                <label className="comment-label">Additional Comments (Optional)</label>
                <textarea
                    className="survey-comment-input"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your comments here..."
                    rows={4}
                />
            </div>

            {/* Submit Button */}
            <div className="survey-footer">
                <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={answeredCount === 0}
                >
                    <Send size={18} />
                    <span>Submit Survey</span>
                </button>
                <p className="submit-note">
                    You can update your responses after submitting.
                </p>
            </div>
        </div>
    );
}

export default ParentSurvey;
