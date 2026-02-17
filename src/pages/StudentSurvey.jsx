import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Send } from 'lucide-react';
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
            <div className="start-survey-box">
                <h2>Student Survey</h2>
                <p>Please enter your details to start the survey</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Grade/Class (Optional)</label>
                        <input
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            placeholder="e.g., Grade 5"
                        />
                    </div>
                    <button type="submit" className="start-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Starting...' : 'Start Survey'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function StudentSurvey() {
    const { studentId: routeStudentId } = useParams();
    const navigate = useNavigate();
    const { data, loading, error, grouped } = useChecklistData('Students_data.csv');

    // If no ID in route, we are in start mode
    const isStartMode = !routeStudentId;

    // Only use query if we have an ID
    const existingResponsesResult = useQuery(api.studentSurvey.getByStudentId,
        isStartMode ? "skip" : { studentId: routeStudentId }
    );

    const submitSurvey = useMutation(api.studentSurvey.submitOnlineSurvey);
    const createStudentMutation = useMutation(api.studentSurvey.createStudent);

    // Initialize responses from existing data if available
    const initialResponses = (!isStartMode && existingResponsesResult?.ratings) 
        ? existingResponsesResult.ratings 
        : {};
    const [responses, setResponses] = useState(initialResponses);
    const [submitted, setSubmitted] = useState(false);
    const [expandedStrands, setExpandedStrands] = useState({});
    const [comment, setComment] = useState('');

    // Handle create student
    const handleStartSurvey = async (name, grade) => {
        try {
            const newId = await createStudentMutation({ name, grade });
            // Navigate to the specific URL for this student
            navigate(`/survey/student/${newId}`, { replace: true });
        } catch (err) {
            console.error("Failed to create student:", err);
            alert("Error starting survey. Please try again.");
        }
    };

    // Toggle strand expansion
    const toggleStrand = (strandId) => {
        setExpandedStrands((prev) => ({ ...prev, [strandId]: !prev[strandId] }));
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
            await submitSurvey({ studentId: routeStudentId, responses: responseArray, comment });
            setSubmitted(true);
        } catch (err) {
            alert('Error submitting survey. Please try again.');
            console.error(err);
        }
    };

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

    // Show start form if no student ID
    if (isStartMode) {
        return <StartSurveyForm onStart={handleStartSurvey} />;
    }

    if (submitted) {
        return (
            <div className="survey-success">
                <div className="success-icon">
                    <Check size={48} />
                </div>
                <h2>Thank You!</h2>
                <p>Your feedback has been submitted successfully.</p>
                <p className="parent-id">Student ID: {routeStudentId}</p>
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
                    ދަރިވަރުންގެ ސުވާލުފޯމް
                </h1>
                <h2>Student Questionnaire</h2>
                <div className="parent-id-badge">Student ID: {routeStudentId}</div>
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
                        <button
                            className="strand-header"
                            onClick={() => toggleStrand(strand.id)}
                        >
                            <span className="strand-title font-dhivehi" dir="rtl">
                                {strand.title}
                            </span>
                            {expandedStrands[strand.id] ? (
                                <ChevronUp size={20} />
                            ) : (
                                <ChevronDown size={20} />
                            )}
                        </button>

                        {expandedStrands[strand.id] && (
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
                                                                        className={`rating-option ${r.color} ${
                                                                            responses[indicator.code] === r.value
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
                        )}
                    </div>
                ))}
            </div>

            {/* Comment Section */}
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

export default StudentSurvey;
