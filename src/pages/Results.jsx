/**
 * Results Page
 * 
 * Displays school review results and provides report generation functionality
 * Contains tabs: Summary, Backend, Generate Report
 */

import { useState, useMemo } from 'react';
import {
    FileText,
    BarChart3,
    TrendingUp,
    Award,
    CheckCircle,
    AlertCircle,
    Database,
} from 'lucide-react';
import ReportGenerator from '../components/reports/ReportGenerator';
import Backend from './Backend';
import { useSSEData } from '../context/SSEDataContext';
import {
    processChecklistData,
    calculateOverallScore,
} from '../utils/scoringEngine';
import { DIMENSIONS, GRADE_COLORS, GRADE_LABELS, SCORING_THRESHOLDS } from '../utils/constants';
import './Results.css';

function Results() {
    const [activeView, setActiveView] = useState('summary');
    const { allData } = useSSEData();

    // Process dimension data
    const dimensionResults = useMemo(() => {
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
    }, [allData]);

    const overallScore = useMemo(() => {
        return calculateOverallScore(
            DIMENSIONS.map(d => dimensionResults[d.id]?.dimension || { score: 0 })
        );
    }, [dimensionResults]);

    // Count completed dimensions
    const completedDimensions = DIMENSIONS.filter(
        d => dimensionResults[d.id]?.dimension?.grade !== 'NR'
    ).length;

    // Render grade badge
    const renderGradeBadge = (grade) => {
        const color = GRADE_COLORS[grade] || GRADE_COLORS.NR;
        
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
                        aria-pressed={activeView === 'summary'}
                    >
                        <BarChart3 size={16} aria-hidden="true" />
                        Summary
                    </button>
                    <button
                        className={`view-btn ${activeView === 'backend' ? 'active' : ''}`}
                        onClick={() => setActiveView('backend')}
                        aria-pressed={activeView === 'backend'}
                    >
                        <Database size={16} aria-hidden="true" />
                        Backend
                    </button>
                    <button
                        className={`view-btn ${activeView === 'report' ? 'active' : ''}`}
                        onClick={() => setActiveView('report')}
                        aria-pressed={activeView === 'report'}
                    >
                        <FileText size={16} aria-hidden="true" />
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
                                <Award size={24} aria-hidden="true" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{overallScore.score}%</div>
                                <div className="stat-label">Overall Score</div>
                            </div>
                            {renderGradeBadge(overallScore.grade)}
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <CheckCircle size={24} aria-hidden="true" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{completedDimensions}/5</div>
                                <div className="stat-label">Dimensions Completed</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon purple">
                                <TrendingUp size={24} aria-hidden="true" />
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
                                                        <AlertCircle size={14} aria-hidden="true" /> Not started
                                                    </span>
                                                ) : (
                                                    <span className="status-complete">
                                                        <CheckCircle size={14} aria-hidden="true" /> Complete
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
                        <div className="grade-legend" role="list">
                            {Object.entries(GRADE_COLORS).map(([code]) => {
                                const threshold = code === 'FA' ? SCORING_THRESHOLDS.FULLY_ACHIEVED :
                                    code === 'MA' ? SCORING_THRESHOLDS.MOSTLY_ACHIEVED :
                                    code === 'A' ? SCORING_THRESHOLDS.ACHIEVED :
                                    code === 'NS' ? SCORING_THRESHOLDS.NOT_SUFFICIENT : null;
                                
                                return (
                                    <div key={code} className="grade-item" role="listitem">
                                        {renderGradeBadge(code)}
                                        <span>{GRADE_LABELS[code]?.en || code}</span>
                                        <span className="grade-threshold">
                                            {code === 'NR' ? 'N/A' : `≥${threshold}%`}
                                        </span>
                                    </div>
                                );
                            })}
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

            {activeView === 'backend' && (
                <Backend />
            )}
        </div>
    );
}

export default Results;
