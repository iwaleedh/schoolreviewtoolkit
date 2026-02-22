import { useState, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    School,
    Users,
    Award,
    AlertTriangle,
    CheckCircle,
    Clock,
    ChevronRight,
    Download,
    Eye,
} from 'lucide-react';
import { useSSEData } from '../context/SSEDataContext';
import {
    processChecklistData,
    calculateOverallScore,
    findStrengths,
    findWeaknesses,
    calculateCompletionRate,
} from '../utils/scoringEngine';
import { DIMENSIONS, GRADE_COLORS } from '../utils/constants';
import './Analytics.css';

// Note: In a multi-school scenario, this data would come from the backend
// For now, showing single-school analytics with real data from context
function Analytics() {
    const [activeView, setActiveView] = useState('overview');
    const { allData, indicatorScores } = useSSEData();

    // Calculate real dimension scores from context
    const dimensionResults = useMemo(() => {
        const results = {};
        DIMENSIONS.forEach(dim => {
            const data = allData[dim.id] || [];
            if (data.length > 0) {
                const processed = processChecklistData(data, 'Score');
                results[dim.id] = {
                    ...processed,
                    completion: calculateCompletionRate(processed),
                };
            } else {
                results[dim.id] = {
                    dimension: { score: 0, grade: 'NR' },
                    indicators: [],
                    outcomes: {},
                    substrands: {},
                    completion: { completed: 0, total: 0, percentage: 0 },
                };
            }
        });
        return results;
    }, [allData]);

    // Calculate overall score
    const overallScore = useMemo(() => {
        const dimensionScores = DIMENSIONS.map(d =>
            dimensionResults[d.id]?.dimension || { score: 0 }
        );
        return calculateOverallScore(dimensionScores);
    }, [dimensionResults]);

    // Calculate total stats
    const stats = useMemo(() => {
        let totalIndicators = 0;
        let completedIndicators = 0;
        let yesCount = 0;

        Object.values(indicatorScores || {}).forEach(score => {
            totalIndicators++;
            if (score === 'yes') {
                completedIndicators++;
                yesCount++;
            } else if (score === 'no') {
                completedIndicators++;
            } else if (score === 'nr') {
                completedIndicators++;
            }
        });

        return {
            total: totalIndicators,
            completed: completedIndicators,
            yes: yesCount,
            avgScore: overallScore.score,
            needsAttention: overallScore.grade === 'NS' ? 1 : 0,
        };
    }, [indicatorScores, overallScore]);

    // Find strengths and weaknesses from real data
    const strengthsData = useMemo(() => {
        const strengths = [];
        DIMENSIONS.forEach(dim => {
            const result = dimensionResults[dim.id];
            if (result?.substrands) {
                const dimStrengths = findStrengths(result, 2);
                dimStrengths.forEach(s => {
                    strengths.push({
                        name: s.id,
                        category: dim.name,
                        score: s.score,
                    });
                });
            }
        });
        return strengths.sort((a, b) => b.score - a.score).slice(0, 5);
    }, [dimensionResults]);

    const weaknessesData = useMemo(() => {
        const weaknesses = [];
        DIMENSIONS.forEach(dim => {
            const result = dimensionResults[dim.id];
            if (result?.substrands) {
                const dimWeaknesses = findWeaknesses(result, 2);
                dimWeaknesses.forEach(w => {
                    weaknesses.push({
                        name: w.id,
                        category: dim.name,
                        score: w.score,
                    });
                });
            }
        });
        return weaknesses.filter(w => w.score > 0).sort((a, b) => a.score - b.score).slice(0, 5);
    }, [dimensionResults]);

    // Get score badge class
    const getScoreBadgeClass = (score) => {
        if (score >= 80) return 'excellent';
        if (score >= 65) return 'good';
        if (score >= 50) return 'needs-improvement';
        return 'critical';
    };

    // Render Overview Stats
    const renderStats = () => (
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon blue">
                        <BarChart3 size={20} />
                    </div>
                </div>
                <div className="stat-card-value">{stats.total}</div>
                <div className="stat-card-label">Total Indicators</div>
                <div className="stat-card-change positive">
                    <TrendingUp size={12} /> Across all dimensions
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon green">
                        <TrendingUp size={20} />
                    </div>
                </div>
                <div className="stat-card-value">{stats.avgScore}%</div>
                <div className="stat-card-label">Overall Score</div>
                <div className={`stat-card-change ${stats.avgScore >= 70 ? 'positive' : 'negative'}`}>
                    {stats.avgScore >= 70 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    Grade: {overallScore.grade}
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon purple">
                        <CheckCircle size={20} />
                    </div>
                </div>
                <div className="stat-card-value">{stats.completed}</div>
                <div className="stat-card-label">Reviewed Indicators</div>
                <div className="stat-card-change positive">
                    <TrendingUp size={12} /> {Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}% complete
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon rose">
                        <AlertTriangle size={20} />
                    </div>
                </div>
                <div className="stat-card-value">{stats.needsAttention}</div>
                <div className="stat-card-label">Need Attention</div>
                <div className="stat-card-change negative">
                    <TrendingDown size={12} /> {stats.needsAttention > 0 ? 'Requires review' : 'All good!'}
                </div>
            </div>
        </div>
    );

    // Render Dimension Scores
    const renderDimensionScores = () => (
        <div className="analytics-card">
            <div className="analytics-card-header">
                <div>
                    <div className="analytics-card-title">Dimension Performance</div>
                    <div className="analytics-card-subtitle">Scores calculated from indicator data</div>
                </div>
            </div>
            <div className="analytics-card-body">
                <div className="dimension-scores">
                    {DIMENSIONS.map((dim, idx) => {
                        const result = dimensionResults[dim.id];
                        const score = result?.dimension?.score || 0;
                        const grade = result?.dimension?.grade || 'NR';
                        return (
                            <div key={dim.id} className="dimension-score-item">
                                <div className="dimension-score-header">
                                    <span className="dimension-score-label">
                                        D{idx + 1}: {dim.name}
                                    </span>
                                    <span className="dimension-score-value">
                                        {score}%
                                        <span
                                            className="grade-badge"
                                            style={{
                                                backgroundColor: GRADE_COLORS[grade]?.bg,
                                                color: GRADE_COLORS[grade]?.text,
                                                marginLeft: '0.5rem',
                                                padding: '0.125rem 0.375rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {grade}
                                        </span>
                                    </span>
                                </div>
                                <div className="dimension-score-bar">
                                    <div
                                        className={`dimension-score-fill ${dim.id.toLowerCase()}`}
                                        style={{ width: `${score}%`, backgroundColor: dim.color }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // Render Overall Score Ring
    const renderOverallScore = () => {
        const circumference = 2 * Math.PI * 70;
        const offset = circumference - (stats.avgScore / 100) * circumference;

        return (
            <div className="analytics-card">
                <div className="analytics-card-header">
                    <div>
                        <div className="analytics-card-title">Overall Performance</div>
                        <div className="analytics-card-subtitle">Combined dimension scores</div>
                    </div>
                </div>
                <div className="analytics-card-body">
                    <div className="overall-score-display">
                        <div className="score-ring">
                            <svg viewBox="0 0 160 160" className="radar-chart-svg">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    className="score-ring-bg"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    className="score-ring-fill"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    style={{ stroke: GRADE_COLORS[overallScore.grade]?.hex || '#6b7280' }}
                                />
                            </svg>
                            <div className="score-ring-text">
                                <div className="score-ring-value">{stats.avgScore}%</div>
                                <div className="score-ring-label">{overallScore.grade}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render Strengths & Weaknesses
    const renderStrengthsWeaknesses = () => (
        <>
            <div className="analytics-card">
                <div className="analytics-card-header">
                    <div>
                        <div className="analytics-card-title">Top Strengths</div>
                        <div className="analytics-card-subtitle">Highest performing areas</div>
                    </div>
                </div>
                <div className="analytics-card-body">
                    <div className="sw-list">
                        {strengthsData.length > 0 ? (
                            strengthsData.map((item, idx) => (
                                <div key={idx} className="sw-item strength">
                                    <span className="sw-rank">{idx + 1}</span>
                                    <div className="sw-content">
                                        <div className="sw-name">{item.name}</div>
                                        <div className="sw-category">{item.category}</div>
                                    </div>
                                    <span className="sw-score">{item.score}%</span>
                                </div>
                            ))
                        ) : (
                            <div className="sw-empty">
                                <p>No data yet. Complete some checklists to see strengths.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="analytics-card">
                <div className="analytics-card-header">
                    <div>
                        <div className="analytics-card-title">Areas for Improvement</div>
                        <div className="analytics-card-subtitle">Lowest performing areas</div>
                    </div>
                </div>
                <div className="analytics-card-body">
                    <div className="sw-list">
                        {weaknessesData.length > 0 ? (
                            weaknessesData.map((item, idx) => (
                                <div key={idx} className="sw-item weakness">
                                    <span className="sw-rank">{idx + 1}</span>
                                    <div className="sw-content">
                                        <div className="sw-name">{item.name}</div>
                                        <div className="sw-category">{item.category}</div>
                                    </div>
                                    <span className="sw-score">{item.score}%</span>
                                </div>
                            ))
                        ) : (
                            <div className="sw-empty">
                                <p>No weaknesses identified yet. Great job!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    // Render dimension comparison table
    const renderDimensionTable = () => (
        <div className="analytics-card" style={{ gridColumn: '1 / -1' }}>
            <div className="analytics-card-header">
                <div>
                    <div className="analytics-card-title">Dimension Comparison</div>
                    <div className="analytics-card-subtitle">Detailed breakdown by dimension</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="view-toggle-btn" title="Export">
                        <Download size={16} />
                    </button>
                </div>
            </div>
            <div className="analytics-card-body" style={{ padding: 0 }}>
                <table className="rankings-table">
                    <thead>
                        <tr>
                            <th>Dimension</th>
                            <th>Score</th>
                            <th>Grade</th>
                            <th>Indicators</th>
                            <th>Completion</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DIMENSIONS.map((dim, idx) => {
                            const result = dimensionResults[dim.id];
                            const score = result?.dimension?.score || 0;
                            const grade = result?.dimension?.grade || 'NR';
                            const indicatorCount = result?.indicators?.length || 0;
                            const completion = result?.completion?.percentage || 0;

                            return (
                                <tr key={dim.id}>
                                    <td>
                                        <span className="school-name">
                                            <span
                                                className="dimension-badge"
                                                style={{ backgroundColor: dim.color, marginRight: '0.5rem' }}
                                            >
                                                D{idx + 1}
                                            </span>
                                            {dim.name}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`score-badge ${getScoreBadgeClass(score)}`}>
                                            {score}%
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                backgroundColor: GRADE_COLORS[grade]?.bg,
                                                color: GRADE_COLORS[grade]?.text,
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {grade}
                                        </span>
                                    </td>
                                    <td>{indicatorCount}</td>
                                    <td>{completion}%</td>
                                    <td>
                                        <span className={`status-badge ${grade === 'NR' ? 'not-started' : 'complete'}`}>
                                            {grade === 'NR' ? (
                                                <>
                                                    <Clock size={12} /> Not started
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={12} /> Complete
                                                </>
                                            )}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="analytics-dashboard">
            {/* Header */}
            <header className="analytics-header">
                <div className="analytics-title">
                    <span className="title-en">Analytics Dashboard</span>
                    <span className="title-dv font-dhivehi" dir="rtl">އެނަލިޓިކްސް ޑޭޝްބޯޑް</span>
                </div>
                <div className="view-toggle">
                    <button
                        className={`view-toggle-btn ${activeView === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveView('overview')}
                    >
                        <span className="tab-label font-dhivehi" dir="rtl">އޯވަވިއު</span>
                    </button>
                    <button
                        className={`view-toggle-btn ${activeView === 'dimensions' ? 'active' : ''}`}
                        onClick={() => setActiveView('dimensions')}
                    >
                        <span className="tab-label font-dhivehi" dir="rtl">ޑައިމެންޝަންސް</span>
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            {renderStats()}

            {/* Main Content */}
            <div className={`analytics-content ${activeView === 'dimensions' ? 'full-width' : ''}`}>
                {activeView === 'overview' && (
                    <>
                        {renderOverallScore()}
                        {renderDimensionScores()}
                        {renderStrengthsWeaknesses()}
                    </>
                )}

                {activeView === 'dimensions' && renderDimensionTable()}
            </div>
        </div>
    );
}

export default Analytics;
