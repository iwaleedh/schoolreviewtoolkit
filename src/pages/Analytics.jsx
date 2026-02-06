import { useState } from 'react';
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
    Filter,
    Download,
    Eye,
} from 'lucide-react';
import './Analytics.css';

// Mock data for schools
const mockSchools = [
    { id: 1, name: 'Majeedhiyya School', location: 'Male\'', overallScore: 87, d1: 92, d2: 85, d3: 88, d4: 82, d5: 89, status: 'complete', students: 1250, teachers: 85 },
    { id: 2, name: 'Aminiya School', location: 'Male\'', overallScore: 84, d1: 88, d2: 82, d3: 85, d4: 80, d5: 85, status: 'complete', students: 980, teachers: 72 },
    { id: 3, name: 'Dharumavantha School', location: 'Male\'', overallScore: 79, d1: 75, d2: 82, d3: 80, d4: 78, d5: 80, status: 'complete', students: 890, teachers: 65 },
    { id: 4, name: 'Hiriya School', location: 'Male\'', overallScore: 76, d1: 78, d2: 74, d3: 79, d4: 72, d5: 77, status: 'in-progress', students: 720, teachers: 52 },
    { id: 5, name: 'Thaajuddin School', location: 'Male\'', overallScore: 72, d1: 70, d2: 75, d3: 73, d4: 68, d5: 74, status: 'complete', students: 650, teachers: 48 },
    { id: 6, name: 'Imaduddin School', location: 'Male\'', overallScore: 68, d1: 65, d2: 70, d3: 72, d4: 64, d5: 69, status: 'in-progress', students: 580, teachers: 42 },
    { id: 7, name: 'Kulhudhuffushi School', location: 'H.Dh Atoll', overallScore: 65, d1: 62, d2: 68, d3: 66, d4: 60, d5: 69, status: 'complete', students: 420, teachers: 35 },
    { id: 8, name: 'Thinadhoo School', location: 'Gd. Atoll', overallScore: 61, d1: 58, d2: 64, d3: 62, d4: 55, d5: 66, status: 'complete', students: 380, teachers: 28 },
    { id: 9, name: 'Fuvahmulah School', location: 'Fuvahmulah', overallScore: 58, d1: 55, d2: 60, d3: 58, d4: 52, d5: 65, status: 'in-progress', students: 340, teachers: 25 },
    { id: 10, name: 'Addu High School', location: 'Addu City', overallScore: 54, d1: 50, d2: 56, d3: 55, d4: 48, d5: 61, status: 'not-started', students: 290, teachers: 22 },
];

// Dimension info
const dimensions = [
    { id: 'd1', name: 'Inclusivity', nameDv: 'ޝާމިލުކުރުން', color: 'purple' },
    { id: 'd2', name: 'Teaching & Learning', nameDv: 'އުނގެނުމާއި އުނގައްނައިދިނުން', color: 'blue' },
    { id: 'd3', name: 'Health & Safety', nameDv: 'ސިއްހަތާއި ރައްކާތެރިކަން', color: 'green' },
    { id: 'd4', name: 'Community', nameDv: 'މުޖުތަމައު', color: 'amber' },
    { id: 'd5', name: 'Leadership', nameDv: 'ލީޑަރޝިޕް', color: 'rose' },
];

// Mock strengths and weaknesses
const mockStrengths = [
    { name: 'Teacher Training Programs', category: 'Human Resources', score: 94 },
    { name: 'Student Safety Protocols', category: 'Health & Safety', score: 92 },
    { name: 'Parent Communication', category: 'Community', score: 91 },
    { name: 'Library Resources', category: 'Infrastructure', score: 89 },
    { name: 'Sports Facilities', category: 'Resources', score: 87 },
];

const mockWeaknesses = [
    { name: 'SEN Support Services', category: 'Inclusivity', score: 42 },
    { name: 'Digital Learning Tools', category: 'Teaching & Learning', score: 48 },
    { name: 'Staff Mental Health Support', category: 'Human Resources', score: 51 },
    { name: 'Science Lab Equipment', category: 'Infrastructure', score: 55 },
    { name: 'Budget Allocation', category: 'Resources', score: 58 },
];

function Analytics() {
    const [activeView, setActiveView] = useState('overview');
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [filterDimension, setFilterDimension] = useState('all');

    // Calculate aggregate stats
    const totalSchools = mockSchools.length;
    const avgScore = Math.round(mockSchools.reduce((acc, s) => acc + s.overallScore, 0) / totalSchools);
    const completedReviews = mockSchools.filter(s => s.status === 'complete').length;
    const needsAttention = mockSchools.filter(s => s.overallScore < 60).length;

    // Get score badge class
    const getScoreBadgeClass = (score) => {
        if (score >= 80) return 'excellent';
        if (score >= 65) return 'good';
        if (score >= 50) return 'needs-improvement';
        return 'critical';
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        if (status === 'complete') return 'complete';
        if (status === 'in-progress') return 'in-progress';
        return 'not-started';
    };

    // Filter schools
    const filteredSchools = filterDimension === 'all' 
        ? mockSchools 
        : [...mockSchools].sort((a, b) => b[filterDimension] - a[filterDimension]);

    // Render Overview Stats
    const renderStats = () => (
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon blue">
                        <School size={20} />
                    </div>
                </div>
                <div className="stat-card-value">{totalSchools}</div>
                <div className="stat-card-label">Total Schools</div>
                <div className="stat-card-change positive">
                    <TrendingUp size={12} /> +2 this year
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon green">
                        <BarChart3 size={20} />
                    </div>
                </div>
                <div className="stat-card-value">{avgScore}%</div>
                <div className="stat-card-label">Average Score</div>
                <div className="stat-card-change positive">
                    <TrendingUp size={12} /> +5% from last year
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon purple">
                        <CheckCircle size={20} />
                    </div>
                </div>
                <div className="stat-card-value">{completedReviews}</div>
                <div className="stat-card-label">Reviews Completed</div>
                <div className="stat-card-change positive">
                    <TrendingUp size={12} /> {Math.round(completedReviews/totalSchools*100)}% completion
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon rose">
                        <AlertTriangle size={20} />
                    </div>
                </div>
                <div className="stat-card-value">{needsAttention}</div>
                <div className="stat-card-label">Need Attention</div>
                <div className="stat-card-change negative">
                    <TrendingDown size={12} /> Below 60% score
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
                    <div className="analytics-card-subtitle">Average scores across all schools</div>
                </div>
            </div>
            <div className="analytics-card-body">
                <div className="dimension-scores">
                    {dimensions.map((dim, idx) => {
                        const avgDimScore = Math.round(
                            mockSchools.reduce((acc, s) => acc + s[dim.id], 0) / mockSchools.length
                        );
                        return (
                            <div key={dim.id} className="dimension-score-item">
                                <div className="dimension-score-header">
                                    <span className="dimension-score-label">
                                        D{idx + 1}: {dim.name}
                                    </span>
                                    <span className="dimension-score-value">{avgDimScore}%</span>
                                </div>
                                <div className="dimension-score-bar">
                                    <div 
                                        className={`dimension-score-fill ${dim.id}`}
                                        style={{ width: `${avgDimScore}%` }}
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
        const offset = circumference - (avgScore / 100) * circumference;
        
        return (
            <div className="analytics-card">
                <div className="analytics-card-header">
                    <div>
                        <div className="analytics-card-title">Overall Performance</div>
                        <div className="analytics-card-subtitle">Combined school average</div>
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
                                />
                            </svg>
                            <div className="score-ring-text">
                                <div className="score-ring-value">{avgScore}%</div>
                                <div className="score-ring-label">Average</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render Schools Ranking Table
    const renderSchoolsTable = () => (
        <div className="analytics-card" style={{ gridColumn: '1 / -1' }}>
            <div className="analytics-card-header">
                <div>
                    <div className="analytics-card-title">School Rankings</div>
                    <div className="analytics-card-subtitle">
                        {filterDimension === 'all' ? 'Sorted by overall score' : `Sorted by ${dimensions.find(d => d.id === filterDimension)?.name}`}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select 
                        className="filter-select"
                        value={filterDimension}
                        onChange={(e) => setFilterDimension(e.target.value)}
                    >
                        <option value="all">Overall Score</option>
                        {dimensions.map(d => (
                            <option key={d.id} value={d.id}>D{d.id.slice(1)}: {d.name}</option>
                        ))}
                    </select>
                    <button className="view-toggle-btn" title="Export">
                        <Download size={16} />
                    </button>
                </div>
            </div>
            <div className="analytics-card-body" style={{ padding: 0 }}>
                <table className="rankings-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>School</th>
                            <th>Location</th>
                            <th>Overall</th>
                            <th>D1</th>
                            <th>D2</th>
                            <th>D3</th>
                            <th>D4</th>
                            <th>D5</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSchools
                            .sort((a, b) => b.overallScore - a.overallScore)
                            .map((school, idx) => (
                            <tr key={school.id}>
                                <td>
                                    <span className={`rank-badge ${idx < 3 ? 'top' : idx >= 7 ? 'low' : 'mid'}`}>
                                        {idx + 1}
                                    </span>
                                </td>
                                <td><span className="school-name">{school.name}</span></td>
                                <td>{school.location}</td>
                                <td>
                                    <span className={`score-badge ${getScoreBadgeClass(school.overallScore)}`}>
                                        {school.overallScore}%
                                    </span>
                                </td>
                                <td>{school.d1}%</td>
                                <td>{school.d2}%</td>
                                <td>{school.d3}%</td>
                                <td>{school.d4}%</td>
                                <td>{school.d5}%</td>
                                <td>
                                    <span className={`status-badge ${getStatusBadgeClass(school.status)}`}>
                                        {school.status === 'complete' && <CheckCircle size={12} />}
                                        {school.status === 'in-progress' && <Clock size={12} />}
                                        {school.status.replace('-', ' ')}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        className="view-toggle-btn"
                                        onClick={() => setSelectedSchool(school)}
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

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
                        {mockStrengths.map((item, idx) => (
                            <div key={idx} className="sw-item strength">
                                <span className="sw-rank">{idx + 1}</span>
                                <div className="sw-content">
                                    <div className="sw-name">{item.name}</div>
                                    <div className="sw-category">{item.category}</div>
                                </div>
                                <span className="sw-score">{item.score}%</span>
                            </div>
                        ))}
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
                        {mockWeaknesses.map((item, idx) => (
                            <div key={idx} className="sw-item weakness">
                                <span className="sw-rank">{idx + 1}</span>
                                <div className="sw-content">
                                    <div className="sw-name">{item.name}</div>
                                    <div className="sw-category">{item.category}</div>
                                </div>
                                <span className="sw-score">{item.score}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );

    // Render Lowest Scoring Schools Alert
    const renderLowestScoringAlert = () => {
        const lowestSchools = mockSchools
            .sort((a, b) => a.overallScore - b.overallScore)
            .slice(0, 3);

        return (
            <div className="analytics-card alert-card">
                <div className="analytics-card-header alert-header">
                    <div className="alert-header-content">
                        <div className="stat-card-icon rose">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <div className="analytics-card-title">Schools Requiring Immediate Attention</div>
                            <div className="analytics-card-subtitle">These schools scored below 60% and need intervention</div>
                        </div>
                    </div>
                </div>
                <div className="analytics-card-body">
                    <div className="alert-schools-grid">
                        {lowestSchools.map((school, idx) => (
                            <div key={school.id} className="sw-item weakness alert-school-item">
                                <span className="sw-rank">{idx + 1}</span>
                                <div className="sw-content">
                                    <div className="sw-name">{school.name}</div>
                                    <div className="sw-category">{school.location} • {school.students} students</div>
                                </div>
                                <div className="alert-school-score">
                                    <span className="sw-score">{school.overallScore}%</span>
                                    <div className="weakest-dimension">
                                        Weakest: D{school.d1 <= school.d2 && school.d1 <= school.d3 && school.d1 <= school.d4 && school.d1 <= school.d5 ? '1' :
                                            school.d2 <= school.d3 && school.d2 <= school.d4 && school.d2 <= school.d5 ? '2' :
                                            school.d3 <= school.d4 && school.d3 <= school.d5 ? '3' :
                                            school.d4 <= school.d5 ? '4' : '5'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

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
                        <BarChart3 size={16} />
                        Overview
                    </button>
                    <button 
                        className={`view-toggle-btn ${activeView === 'schools' ? 'active' : ''}`}
                        onClick={() => setActiveView('schools')}
                    >
                        <School size={16} />
                        Schools
                    </button>
                    <button 
                        className={`view-toggle-btn ${activeView === 'dimensions' ? 'active' : ''}`}
                        onClick={() => setActiveView('dimensions')}
                    >
                        <Award size={16} />
                        Dimensions
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            {renderStats()}

            {/* Alert for lowest scoring schools */}
            {activeView === 'overview' && renderLowestScoringAlert()}

            {/* Main Content */}
            <div className={`analytics-content ${activeView === 'schools' ? 'full-width' : ''}`}>
                {activeView === 'overview' && (
                    <>
                        {renderOverallScore()}
                        {renderDimensionScores()}
                        {renderStrengthsWeaknesses()}
                    </>
                )}

                {activeView === 'schools' && renderSchoolsTable()}

                {activeView === 'dimensions' && (
                    <>
                        {renderDimensionScores()}
                        {renderStrengthsWeaknesses()}
                    </>
                )}
            </div>
        </div>
    );
}

export default Analytics;
