import { useState, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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

function ParentSurvey() {
    const { parentId: routeParentId } = useParams();
    const location = useLocation();

    // Extract schoolId from query params
    const schoolId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('schoolId') || params.get('s'); // Support 's' as well
    }, [location.search]);

    const { data, loading, error, grouped } = useChecklistData('Parents_data.csv');

    // If no ID in route, we are in start mode
    const isStartMode = !routeParentId;

    // Only use query if we have an ID
    const existingResponsesResult = useQuery(api.parentSurvey.getByParentId,
        isStartMode ? "skip" : { parentId: routeParentId }
    );

    const parentSurveyEnabled = useQuery(api.parentSurvey.getSetting,
        schoolId ? { key: "parentSurveyEnabled", schoolId } : { key: "parentSurveyEnabled" }
    );
    const submitSurvey = useMutation(api.parentSurvey.submitOnlineSurvey);
    const createParentMutation = useMutation(api.parentSurvey.createParent);

    // Initialize responses from existing data if available
    const initialResponses = (!isStartMode && existingResponsesResult?.ratings)
        ? existingResponsesResult.ratings
        : {};
    const [responses, setResponses] = useState(initialResponses);
    const [submitted, setSubmitted] = useState(false);
    const [comment, setComment] = useState('');

    const [generatedId, setGeneratedId] = useState(routeParentId || '');
    const [isSubmittingData, setIsSubmittingData] = useState(false);

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

        if (!schoolId) {
            alert('Error: School ID is missing. Please use the link provided by your school.');
            return;
        }

        setIsSubmittingData(true);
        try {
            let finalId = routeParentId;
            if (isStartMode) {
                finalId = await createParentMutation({
                    studentName: "Anonymous Student",
                    grade: "Anonymous",
                    schoolId
                });
                setGeneratedId(finalId);
            }

            await submitSurvey({
                parentId: finalId,
                responses: responseArray,
                comment,
                schoolId
            });
            setSubmitted(true);
        } catch (err) {
            alert('Error submitting survey. Please try again.');
            console.error(err);
        } finally {
            setIsSubmittingData(false);
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

    // Check for schoolId
    if (!schoolId && !loading && !routeParentId) {
        return (
            <div className="survey-error">
                <div className="closed-icon">
                    <XCircle size={48} />
                </div>
                <h2>School ID Missing</h2>
                <p>This survey link is invalid because it is missing a School ID.</p>
                <p>Please use the specific link provided by your child's school.</p>
            </div>
        );
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
                <p className="parent-id">Parent ID: {generatedId}</p>
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
                {!isStartMode && <div className="parent-id-badge">ID: {routeParentId}</div>}
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

            <div className="survey-footer">
                <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={answeredCount === 0 || isSubmittingData}
                >
                    <Send size={18} />
                    <span>{isSubmittingData ? 'Submitting...' : 'Submit Survey'}</span>
                </button>
                <p className="submit-note">
                    You can update your responses after submitting.
                </p>
            </div>
        </div>
    );
}

export default ParentSurvey;
