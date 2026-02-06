/**
 * Results Page
 * 
 * Displays school review results and provides report generation functionality
 */

import { useState } from 'react';
import {
    FileText,
    BarChart3,
    TrendingUp,
    Award,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import ReportGenerator from '../components/reports/ReportGenerator';
import { useSSEData } from '../context/SSEDataContext';
import {
    processChecklistData,
    calculateOverallScore,
    OUTCOME_GRADES,
} from '../utils/scoringEngine';
import './Results.css';

// Dimension configuration
const DIMENSIONS = [
    { id: 'D1', name: 'Inclusivity', nameDv: 'ޝާމިލުކުރުން', color: '#7c3aed' },
    { id: 'D2', name: 'Teaching & Learning', nameDv: 'އުނގެނުމާއި އުނގައްނައިދިނުން', color: '#4f46e5' },
    { id: 'D3', name: 'Health & Safety', nameDv: 'ސިއްހަތާއި ރައްކާތެރިކަން', color: '#10b981' },
    { id: 'D4', name: 'Community', nameDv: 'މުޖުތަމައު', color: '#f59e0b' },
    { id: 'D5', name: 'Leadership', nameDv: 'ލީޑަރޝިޕް', color: '#f43f5e' },
];

function Results() {
    const [activeView, setActiveView] = useState('summary');
    const { allData } = useSSEData();

    // Process dimension data
    const getDimensionResults = () => {
        const results = {};
        DIMENSIONS.forEach(dim => {
            const data = allData[dim.id] || [];
            if (data.length > 0) {
                const processed = processChecklistData(data, 'Score');
                results[dim.id] = processed;
            } else {
                results[dim.id] = {
                    dimension: { score: 0, grade: 'NR' },
                    indicators: [],
                };
            }
        });
        return results;
    };

    const dimensionResults = getDimensionResults();
    const overallScore = calculateOverallScore(
        DIMENSIONS.map(d => dimensionResults[d.id]?.dimension || { score: 0 })
    );

    // Count completed dimensions
    const completedDimensions = DIMENSIONS.filter(
        d => dimensionResults[d.id]?.dimension?.grade !== 'NR'
    ).length;

    // Render grade badge
    const renderGradeBadge = (grade) => {
        const colors = {
            FA: { bg: '#f3e8ff', text: '#7c3aed' },
            MA: { bg: '#dcfce7', text: '#16a34a' },
            A: { bg: '#fef3c7', text: '#d97706' },
            NS: { bg: '#fee2e2', text: '#dc2626' },
            NR: { bg: '#f3f4f6', text: '#6b7280' },
        };
        const color = colors[grade] || colors.NR;
        
        return (
            <span 
                className="results-grade-badge"
                style={{ backgroundColor: color.bg, color: color.text }}
            >
                {grade}
            </span>
        );
    };

    return (
        <div className="results-page">
            {/* Header */}
            <header className="results-header">
                <div className="results-title">
                    <h1>
                        <span className="title-en">Results & Reports</span>
                        <span className="title-dv font-dhivehi" dir="rtl">ނަތީޖާ އަދި ރިޕޯޓް</span>
                    </h1>
                </div>
                <div className="view-toggle">
                    <button
                        className={`view-btn ${activeView === 'summary' ? 'active' : ''}`}
                        onClick={() => setActiveView('summary')}
                    >
                        <BarChart3 size={16} />
                        Summary
                    </button>
                    <button
                        className={`view-btn ${activeView === 'report' ? 'active' : ''}`}
                        onClick={() => setActiveView('report')}
                    >
                        <FileText size={16} />
                        Generate Report
                    </button>
                </div>
            </header>

            {activeView === 'summary' && (
                <>
                    {/* Quick Stats */}
                    <div className="results-stats">
                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <Award size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{overallScore.score}%</div>
                                <div className="stat-label">Overall Score</div>
                            </div>
                            {renderGradeBadge(overallScore.grade)}
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <CheckCircle size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{completedDimensions}/5</div>
                                <div className="stat-label">Dimensions Completed</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon purple">
                                <TrendingUp size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">
                                    {completedDimensions === 5 ? 'Ready' : 'In Progress'}
                                </div>
                                <div className="stat-label">Review Status</div>
                            </div>
                        </div>
                    </div>

                    {/* Dimension Results */}
                    <div className="results-dimensions">
                        <h2 className="section-title">Dimension Results</h2>
                        <div className="dimension-cards">
                            {DIMENSIONS.map((dim, idx) => {
                                const result = dimensionResults[dim.id];
                                const score = result?.dimension?.score || 0;
                                const grade = result?.dimension?.grade || 'NR';
                                const indicatorCount = result?.indicators?.length || 0;
                                
                                return (
                                    <div key={dim.id} className="dimension-card">
                                        <div 
                                            className="dimension-card-header"
                                            style={{ borderLeftColor: dim.color }}
                                        >
                                            <span 
                                                className="dimension-badge"
                                                style={{ backgroundColor: dim.color }}
                                            >
                                                D{idx + 1}
                                            </span>
                                            <div className="dimension-info">
                                                <h3>{dim.name}</h3>
                                                <p className="font-dhivehi" dir="rtl">{dim.nameDv}</p>
                                            </div>
                                        </div>
                                        <div className="dimension-card-body">
                                            <div className="dimension-score">
                                                <div className="score-circle" style={{
                                                    background: `conic-gradient(${dim.color} ${score * 3.6}deg, #e5e7eb 0deg)`
                                                }}>
                                                    <div className="score-inner">
                                                        <span className="score-value">{score}%</span>
                                                    </div>
                                                </div>
                                                {renderGradeBadge(grade)}
                                            </div>
                                            <div className="dimension-meta">
                                                <span>{indicatorCount} indicators</span>
                                                {grade === 'NR' ? (
                                                    <span className="status-pending">
                                                        <AlertCircle size={14} /> Not started
                                                    </span>
                                                ) : (
                                                    <span className="status-complete">
                                                        <CheckCircle size={14} /> Complete
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Grade Legend */}
                    <div className="grade-legend-section">
                        <h3>Grade Scale</h3>
                        <div className="grade-legend">
                            {Object.entries(OUTCOME_GRADES).map(([code, info]) => (
                                <div key={code} className="grade-item">
                                    {renderGradeBadge(code)}
                                    <span>{info.label}</span>
                                    <span className="grade-threshold">
                                        {info.min === -1 ? 'N/A' : `≥${info.min}%`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {activeView === 'report' && (
                <ReportGenerator 
                    schoolName="Sample School"
                    schoolId="SCH-001"
                />
            )}
        </div>
    );
}

export default Results;
