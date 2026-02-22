/**
 * ReportGenerator Component
 * 
 * Generates A4-formatted PDF/Word reports for school reviews
 * Includes dimension scores, outcome grades, strengths/weaknesses
 */

import { useState, useRef } from 'react';
import {
    FileText,
    Download,
    Printer,
    FileSpreadsheet,
    Loader,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useSSEData } from '../../context/SSEDataContext';
import {
    processChecklistData,
    calculateOverallScore,
    calculateCompletionRate,
    OUTCOME_GRADES,
} from '../../utils/scoringEngine';
import './ReportGenerator.css';

// Dimension names
const DIMENSIONS = [
    { id: 'D1', name: 'Inclusivity', nameDv: 'ޝާމިލުކުރުން', color: '#7c3aed' },
    { id: 'D2', name: 'Teaching & Learning', nameDv: 'އުނގެނުމާއި އުނގައްނައިދިނުން', color: '#4f46e5' },
    { id: 'D3', name: 'Health & Safety', nameDv: 'ސިއްހަތާއި ރައްކާތެރިކަން', color: '#10b981' },
    { id: 'D4', name: 'Community', nameDv: 'މުޖުތަމައު', color: '#f59e0b' },
    { id: 'D5', name: 'Leadership', nameDv: 'ލީޑަރޝިޕް', color: '#f43f5e' },
];

function ReportGenerator({ schoolName = 'Sample School', schoolId = '001' }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportGenerated, setReportGenerated] = useState(false);
    const reportRef = useRef(null);
    const { allData } = useSSEData();

    // Process all dimension data
    const processAllDimensions = () => {
        const results = {};
        DIMENSIONS.forEach(dim => {
            const data = allData[dim.id] || [];
            if (data.length > 0) {
                results[dim.id] = processChecklistData(data, 'Score');
            } else {
                results[dim.id] = {
                    dimension: { score: 0, grade: 'NR' },
                    outcomes: {},
                    substrands: {},
                    strands: {},
                    indicators: [],
                };
            }
        });
        return results;
    };

    // Calculate overall school score
    const calculateSchoolScore = (dimensionResults) => {
        const scores = DIMENSIONS.map(dim => dimensionResults[dim.id]?.dimension || { score: 0 });
        return calculateOverallScore(scores);
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Handle PDF download (using browser print to PDF)
    const handleDownloadPDF = () => {
        setIsGenerating(true);
        setTimeout(() => {
            window.print();
            setIsGenerating(false);
            setReportGenerated(true);
        }, 500);
    };

    // Handle CSV export
    const handleExportCSV = () => {
        const dimensionResults = processAllDimensions();
        let csvContent = 'Dimension,Score,Grade,Completion\n';
        
        DIMENSIONS.forEach(dim => {
            const result = dimensionResults[dim.id];
            const completion = calculateCompletionRate(result);
            csvContent += `${dim.name},${result.dimension.score}%,${result.dimension.grade},${completion.percentage}%\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${schoolName.replace(/\s+/g, '_')}_Report.csv`;
        link.click();
    };

    // Get current date formatted
    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Render grade badge
    const renderGradeBadge = (grade, size = 'normal') => {
        const _gradeInfo = OUTCOME_GRADES[grade] || OUTCOME_GRADES.NR;
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
                className={`grade-badge ${size}`}
                style={{ backgroundColor: color.bg, color: color.text }}
            >
                {grade}
            </span>
        );
    };

    const dimensionResults = processAllDimensions();
    const overallScore = calculateSchoolScore(dimensionResults);

    return (
        <div className="report-generator">
            {/* Controls */}
            <div className="report-controls no-print">
                <h2 className="report-controls-title">
                    <FileText size={24} />
                    Generate Report
                </h2>
                <p className="report-controls-subtitle">
                    Export school review results as PDF or CSV
                </p>
                
                <div className="report-buttons">
                    <button 
                        className="report-btn primary"
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <Loader size={18} className="spin" />
                        ) : (
                            <Download size={18} />
                        )}
                        Download PDF
                    </button>
                    
                    <button 
                        className="report-btn secondary"
                        onClick={handlePrint}
                    >
                        <Printer size={18} />
                        Print
                    </button>
                    
                    <button 
                        className="report-btn secondary"
                        onClick={handleExportCSV}
                    >
                        <FileSpreadsheet size={18} />
                        Export CSV
                    </button>
                </div>
                
                {reportGenerated && (
                    <div className="report-success">
                        <CheckCircle size={16} />
                        Report generated successfully!
                    </div>
                )}
            </div>

            {/* Report Preview / Print Content */}
            <div className="report-preview" ref={reportRef}>
                <div className="report-page">
                    {/* Header */}
                    <header className="report-header">
                        <div className="report-logo">🏫</div>
                        <div className="report-header-content">
                            <h1 className="report-title">School Review Report</h1>
                            <p className="report-subtitle font-dhivehi" dir="rtl">
                                ސްކޫލް ރިވިއު ރިޕޯޓް
                            </p>
                        </div>
                        <div className="report-meta">
                            <div className="report-date">{getCurrentDate()}</div>
                            <div className="report-year">Academic Year 2026</div>
                        </div>
                    </header>

                    {/* School Info */}
                    <section className="report-section school-info">
                        <div className="school-info-grid">
                            <div className="school-info-item">
                                <label>School Name</label>
                                <span>{schoolName}</span>
                            </div>
                            <div className="school-info-item">
                                <label>School ID</label>
                                <span>{schoolId}</span>
                            </div>
                            <div className="school-info-item">
                                <label>Review Status</label>
                                <span className="status-complete">Complete</span>
                            </div>
                        </div>
                    </section>

                    {/* Overall Score */}
                    <section className="report-section overall-score-section">
                        <h2 className="section-title">Overall Performance</h2>
                        <div className="overall-score-display">
                            <div className="overall-score-circle" style={{
                                background: `conic-gradient(#2563eb ${overallScore.score * 3.6}deg, #e5e7eb 0deg)`
                            }}>
                                <div className="overall-score-inner">
                                    <span className="overall-score-value">{overallScore.score}%</span>
                                    <span className="overall-score-grade">{renderGradeBadge(overallScore.grade, 'large')}</span>
                                </div>
                            </div>
                            <div className="overall-score-label">
                                Combined Score Across All Dimensions
                            </div>
                        </div>
                    </section>

                    {/* Dimension Scores */}
                    <section className="report-section">
                        <h2 className="section-title">Dimension Scores</h2>
                        <div className="dimension-scores-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Dimension</th>
                                        <th>Name</th>
                                        <th>Score</th>
                                        <th>Grade</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {DIMENSIONS.map((dim, idx) => {
                                        const result = dimensionResults[dim.id];
                                        const completion = calculateCompletionRate(result);
                                        return (
                                            <tr key={dim.id}>
                                                <td>
                                                    <span 
                                                        className="dimension-indicator"
                                                        style={{ backgroundColor: dim.color }}
                                                    >
                                                        D{idx + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="dimension-name">{dim.name}</div>
                                                    <div className="dimension-name-dv font-dhivehi" dir="rtl">
                                                        {dim.nameDv}
                                                    </div>
                                                </td>
                                                <td className="score-cell">
                                                    <div className="score-bar-container">
                                                        <div 
                                                            className="score-bar-fill"
                                                            style={{ 
                                                                width: `${result.dimension.score}%`,
                                                                backgroundColor: dim.color 
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="score-value">{result.dimension.score}%</span>
                                                </td>
                                                <td>{renderGradeBadge(result.dimension.grade)}</td>
                                                <td>
                                                    {completion.percentage >= 100 ? (
                                                        <span className="completion-complete">
                                                            <CheckCircle size={14} /> Complete
                                                        </span>
                                                    ) : (
                                                        <span className="completion-partial">
                                                            {completion.percentage}% done
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Grade Distribution Legend */}
                    <section className="report-section grade-legend">
                        <h3 className="subsection-title">Grade Scale</h3>
                        <div className="grade-legend-grid">
                            {Object.entries(OUTCOME_GRADES).map(([code, info]) => (
                                <div key={code} className="grade-legend-item">
                                    {renderGradeBadge(code)}
                                    <span className="grade-legend-label">
                                        {info.label} ({info.min === -1 ? 'N/A' : `≥${info.min}%`})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="report-footer">
                        <div className="report-footer-left">
                            <p>Quality Assurance Department</p>
                            <p>Ministry of Education, Maldives</p>
                        </div>
                        <div className="report-footer-right">
                            <p>Generated by School Review Toolkit</p>
                            <p>Page 1 of 1</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default ReportGenerator;
