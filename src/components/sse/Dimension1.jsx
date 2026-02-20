import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X, Minus } from 'lucide-react';
import { useChecklistData } from '../../hooks/useChecklistData';
import './Dimension.css';

// Score options for indicators
const INDICATOR_SCORES = [
    { value: 'yes', label: '✓', icon: Check, color: 'green' },
    { value: 'no', label: '✗', icon: X, color: 'red' },
    { value: 'nr', label: 'NR', icon: Minus, color: 'gray' },
];

// Score options for outcomes
const OUTCOME_SCORES = [
    { value: 'FA', label: 'FA', color: 'purple' },
    { value: 'MA', label: 'MA', color: 'green' },
    { value: 'A', label: 'A', color: 'yellow' },
    { value: 'NS', label: 'NS', color: 'red' },
    { value: 'NR', label: 'NR', color: 'gray' },
];

function Dimension1() {
    const { data, loading, error, grouped } = useChecklistData('Dimension 1.csv');
    const [expandedStrands, setExpandedStrands] = useState({});
    const [expandedSubstrands, setExpandedSubstrands] = useState({});
    const [expandedOutcomes, setExpandedOutcomes] = useState({});
    const [indicatorScores, setIndicatorScores] = useState({});
    const [outcomeScores, setOutcomeScores] = useState({});

    const toggleStrand = (strandId) => {
        setExpandedStrands((prev) => ({
            ...prev,
            [strandId]: !prev[strandId],
        }));
    };

    const toggleSubstrand = (substrandId) => {
        setExpandedSubstrands((prev) => ({
            ...prev,
            [substrandId]: !prev[substrandId],
        }));
    };

    const toggleOutcome = (outcomeId) => {
        setExpandedOutcomes((prev) => ({
            ...prev,
            [outcomeId]: !prev[outcomeId],
        }));
    };

    const handleIndicatorScore = (indicatorCode, value) => {
        setIndicatorScores((prev) => ({
            ...prev,
            [indicatorCode]: value,
        }));
    };

    const handleOutcomeScore = (outcomeId, value) => {
        setOutcomeScores((prev) => ({
            ...prev,
            [outcomeId]: value,
        }));
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading Dimension 1 data...</p>
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

    if (!grouped || grouped.length === 0) {
        return (
            <div className="empty-container">
                <p>No data found for Dimension 1.</p>
            </div>
        );
    }

    return (
        <div className="dimension-container">
            <div className="dimension-header">
                <h2 className="dimension-title">
                    <span className="title-en">Dimension 1: Inclusivity</span>
                    <span className="title-dv font-dhivehi" dir="rtl">
                        ޑައިމެންޝަން 1: ޝާމިލުކުރުން
                    </span>
                </h2>
                <div className="dimension-stats">
                    <span>Total Indicators: {data.length}</span>
                </div>
            </div>

            <div className="checklist-content">
                {grouped.map((strand) => (
                    <div key={strand.id} className="strand-block">
                        {/* Strand Header */}
                        <button
                            className={`strand-header ${expandedStrands[strand.id] ? 'expanded' : ''}`}
                            onClick={() => toggleStrand(strand.id)}
                        >
                            <div className="strand-info">
                                <span className="strand-title font-dhivehi" dir="rtl">
                                    {strand.title}
                                </span>
                            </div>
                            {expandedStrands[strand.id] ? (
                                <ChevronUp size={20} />
                            ) : (
                                <ChevronDown size={20} />
                            )}
                        </button>

                        {/* Strand Content */}
                        {expandedStrands[strand.id] && (
                            <div className="strand-content">
                                {strand.substrands.map((substrand) => (
                                    <div key={substrand.id} className="substrand-block">
                                        {/* Substrand Header */}
                                        <button
                                            className={`substrand-header ${expandedSubstrands[substrand.id] ? 'expanded' : ''
                                                }`}
                                            onClick={() => toggleSubstrand(substrand.id)}
                                        >
                                            <div className="substrand-info">
                                                <span className="substrand-id">{substrand.id}</span>
                                                <span className="substrand-title font-dhivehi" dir="rtl">
                                                    {substrand.title}
                                                </span>
                                            </div>
                                            {expandedSubstrands[substrand.id] ? (
                                                <ChevronUp size={18} />
                                            ) : (
                                                <ChevronDown size={18} />
                                            )}
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
                                                                {expandedOutcomes[outcome.id] ? (
                                                                    <ChevronUp size={16} />
                                                                ) : (
                                                                    <ChevronDown size={16} />
                                                                )}
                                                            </button>

                                                            {/* Outcome Score */}
                                                            <div className="outcome-score">
                                                                {OUTCOME_SCORES.map((score) => (
                                                                    <button
                                                                        key={score.value}
                                                                        className={`score-btn outcome-score-btn ${score.color} ${outcomeScores[outcome.id] === score.value ? 'selected' : ''
                                                                            }`}
                                                                        onClick={() => handleOutcomeScore(outcome.id, score.value)}
                                                                    >
                                                                        {score.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Indicators Table */}
                                                        {expandedOutcomes[outcome.id] && (
                                                            <div className="indicators-table">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="col-code">#</th>
                                                                            <th className="col-indicator font-dhivehi" dir="rtl">
                                                                                ބަލާނެ ކަންކަން
                                                                            </th>
                                                                            <th className="col-score">Score</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {outcome.indicators.map((indicator, idx) => (
                                                                            <tr key={indicator.code || idx}>
                                                                                <td className="col-code">{indicator.code}</td>
                                                                                <td className="col-indicator font-dhivehi" dir="rtl">
                                                                                    {indicator.text}
                                                                                </td>
                                                                                <td className="col-score">
                                                                                    <div className="indicator-score-btns">
                                                                                        {INDICATOR_SCORES.map((score) => {
                                                                                            const Icon = score.icon;
                                                                                            return (
                                                                                                <button
                                                                                                    key={score.value}
                                                                                                    className={`score-btn indicator-score-btn ${score.color} ${indicatorScores[indicator.code] === score.value
                                                                                                        ? 'selected'
                                                                                                        : ''
                                                                                                        }`}
                                                                                                    onClick={() =>
                                                                                                        handleIndicatorScore(indicator.code, score.value)
                                                                                                    }
                                                                                                    title={score.label}
                                                                                                >
                                                                                                    <Icon size={16} />
                                                                                                </button>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
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

export default Dimension1;
