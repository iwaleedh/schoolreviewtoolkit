import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
    LayoutDashboard,
    School,
    Users,
    TrendingUp,
    AlertTriangle,
    ChevronRight,
    Search,
    Shield,
    MapPin,
    Download
} from 'lucide-react';
import { useSSEData } from '../../context/SSEDataContext';
import './AdminDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const { setCurrentSchoolId } = useSSEData();
    const schoolsQueryResult = useQuery(api.schools.listSchools);
    const schools = useMemo(() => schoolsQueryResult || [], [schoolsQueryResult]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAtoll, setSelectedAtoll] = useState('All');

    // Calculate status counts for progress bar
    const active = useMemo(() => schools.filter(s => s.status === 'IN_PROGRESS').length, [schools]);
    const completed = useMemo(() => schools.filter(s => s.status === 'COMPLETED').length, [schools]);
    const notStarted = useMemo(() => schools.filter(s => s.status === 'NOT_STARTED' || !s.status).length, [schools]);

    // High-level metrics calculation
    const metrics = useMemo(() => {
        return {
            totalSchools: schools.length,
            activeReviews: active,
            completedReviews: completed,
            notStarted: notStarted,
            needsAttention: schools.slice(0, 3), // Mocking "attention needed" for now
            atolls: Array.from(new Set(schools.map(s => s.atoll).filter(Boolean))).sort()
        };
    }, [schools, active, completed, notStarted]);

    // Filtered schools for grid
    const filteredSchools = useMemo(() => {
        let filtered = schools;

        if (selectedAtoll !== 'All') {
            filtered = filtered.filter(s => s.atoll === selectedAtoll);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.name?.toLowerCase().includes(q) ||
                s.nameDv?.includes(q) ||
                s.schoolId?.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [schools, searchQuery, selectedAtoll]);

    const handleSchoolClick = (schoolId) => {
        setCurrentSchoolId(schoolId);
        navigate(`/dashboard`);
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">System Overview</h1>
                    <p className="admin-subtitle">Cross-school monitoring and analytics</p>
                </div>
            </header>

            <div className="admin-metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon-wrapper blue">
                        <School size={24} />
                    </div>
                    <div className="metric-info">
                        <span className="metric-value">{metrics.totalSchools}</span>
                        <span className="metric-label">Total Schools</span>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon-wrapper amber">
                        <TrendingUp size={24} />
                    </div>
                    <div className="metric-info">
                        <span className="metric-value">{metrics.activeReviews}</span>
                        <span className="metric-label">Active Reviews</span>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon-wrapper green">
                        <Shield size={24} />
                    </div>
                    <div className="metric-info">
                        <span className="metric-value">{metrics.completedReviews}</span>
                        <span className="metric-label">Completed Reviews</span>
                    </div>
                </div>
            </div>

            {/* System Wide Progress Visualization */}
            <div className="admin-system-progress">
                <div className="progress-header">
                    <h3>System-Wide Review Progress</h3>
                    <button className="export-btn" title="Export CSV Report">
                        <Download size={16} />
                        <span>Export Data</span>
                    </button>
                </div>
                <div className="progress-bar-container">
                    {metrics.totalSchools > 0 && (
                        <>
                            <div
                                className="progress-segment completed"
                                style={{ width: `${(metrics.completedReviews / metrics.totalSchools) * 100}%` }}
                                title={`${metrics.completedReviews} Completed`}
                            ></div>
                            <div
                                className="progress-segment active"
                                style={{ width: `${(metrics.activeReviews / metrics.totalSchools) * 100}%` }}
                                title={`${metrics.activeReviews} In Progress`}
                            ></div>
                            <div
                                className="progress-segment default"
                                style={{ width: `${(metrics.notStarted / metrics.totalSchools) * 100}%` }}
                                title={`${metrics.notStarted} Not Started`}
                            ></div>
                        </>
                    )}
                </div>
                <div className="progress-legend">
                    <span className="legend-item"><span className="dot completed"></span> {metrics.completedReviews} Completed</span>
                    <span className="legend-item"><span className="dot active"></span> {metrics.activeReviews} In Progress</span>
                    <span className="legend-item"><span className="dot default"></span> {metrics.notStarted} Not Started</span>
                </div>
            </div>

            <div className="admin-content-split">
                <main className="schools-section">
                    <div className="section-header">
                        <h2>School Directory</h2>
                        <div className="filters-container">
                            <div className="filter-box">
                                <MapPin size={18} className="filter-icon" />
                                <select
                                    value={selectedAtoll}
                                    onChange={(e) => setSelectedAtoll(e.target.value)}
                                >
                                    <option value="All">All Atolls</option>
                                    {metrics.atolls.map(atoll => (
                                        <option key={atoll} value={atoll}>{atoll}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="search-box">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="schools-grid">
                        {filteredSchools.map(school => (
                            <div
                                key={school._id}
                                className="school-card"
                                onClick={() => handleSchoolClick(school.schoolId)}
                            >
                                <div className="school-card-header">
                                    <div className="school-avatar">
                                        {school.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="school-identity">
                                        <h3>{school.name}</h3>
                                        <span className="school-id-badge">{school.schoolId}</span>
                                    </div>
                                </div>
                                <div className="school-card-footer">
                                    <span className="school-location">{school.island}, {school.atoll}</span>
                                    <ChevronRight size={18} className="action-icon" />
                                </div>
                            </div>
                        ))}
                        {filteredSchools.length === 0 && (
                            <div className="empty-state">
                                <p>No schools match your search.</p>
                            </div>
                        )}
                    </div>
                </main>

                <aside className="attention-sidebar">
                    <div className="attention-header">
                        <AlertTriangle size={20} className="attention-icon" />
                        <h2>Attention Required</h2>
                    </div>
                    <p className="attention-desc">Schools with lowest recent scores requiring intervention.</p>

                    <div className="attention-list">
                        {metrics.needsAttention.map((school, i) => (
                            <div key={`attn-${school.schoolId}`} className="attention-item">
                                <span className="attention-rank">#{i + 1}</span>
                                <div>
                                    <h4>{school.name}</h4>
                                    <span className="attention-issue">Low D2 Score (Teaching & Learning)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default AdminDashboard;
