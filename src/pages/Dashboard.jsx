/**
 * Dashboard / Overview Page
 * 
 * Provides a quick overview of the school review status
 * with key stats, progress indicators, and quick actions
 */

import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    FileText,
    TrendingUp,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    Users,
    GraduationCap,
    Building,
    Calendar,
    Target,
    Award,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import './Dashboard.css';

// Mock data for dashboard
const schoolInfo = {
    name: 'Majeedhiyya School',
    nameDv: 'މަޖީދިއްޔާ ސްކޫލް',
    id: 'SCH-001',
    location: 'Male\', Maldives',
    academicYear: '2026',
};

const reviewProgress = {
    overall: 68,
    dimensions: [
        { id: 'D1', name: 'Inclusivity', progress: 85, color: '#7c3aed' },
        { id: 'D2', name: 'Teaching & Learning', progress: 72, color: '#4f46e5' },
        { id: 'D3', name: 'Health & Safety', progress: 90, color: '#10b981' },
        { id: 'D4', name: 'Community', progress: 45, color: '#f59e0b' },
        { id: 'D5', name: 'Leadership', progress: 50, color: '#f43f5e' },
    ],
};

const quickStats = [
    { label: 'Total Indicators', value: '847', icon: ClipboardList, color: 'blue', change: null },
    { label: 'Completed', value: '576', icon: CheckCircle, color: 'green', change: '+24 today' },
    { label: 'In Progress', value: '156', icon: Clock, color: 'amber', change: null },
    { label: 'Pending', value: '115', icon: AlertCircle, color: 'red', change: '-12 this week' },
];

const recentActivity = [
    { action: 'Completed LT1 Checklist', time: '2 hours ago', icon: CheckCircle, color: 'green' },
    { action: 'Updated Principal Checklist', time: '5 hours ago', icon: FileText, color: 'blue' },
    { action: 'Started Dimension 4 Review', time: 'Yesterday', icon: Clock, color: 'amber' },
    { action: 'Generated Progress Report', time: '2 days ago', icon: BarChart3, color: 'purple' },
];

const quickActions = [
    { label: 'Continue Review', labelDv: 'ރިވިއު ކުރިއަށް ގެންދާ', path: '/toolkit', icon: ClipboardList, color: 'primary' },
    { label: 'View Analytics', labelDv: 'އެނަލިޓިކްސް ބައްލަވާ', path: '/analytics', icon: TrendingUp, color: 'purple' },
    { label: 'Generate Report', labelDv: 'ރިޕޯޓް ހައްދަވާ', path: '/results', icon: FileText, color: 'green' },
];

function Dashboard() {
    const getProgressColor = (progress) => {
        if (progress >= 80) return '#22c55e';
        if (progress >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="dashboard">
            {/* Welcome Header */}
            <header className="dashboard-header">
                <div className="welcome-section">
                    <div className="welcome-icon">
                        <LayoutDashboard size={28} />
                    </div>
                    <div className="welcome-text">
                        <h1>
                            <span className="greeting">Welcome back!</span>
                            <span className="greeting-dv font-dhivehi" dir="rtl">މަރުހަބާ!</span>
                        </h1>
                        <p className="school-name">{schoolInfo.name}</p>
                    </div>
                </div>
                <div className="header-meta">
                    <div className="meta-item">
                        <Calendar size={16} />
                        <span>Academic Year {schoolInfo.academicYear}</span>
                    </div>
                    <div className="meta-item">
                        <Building size={16} />
                        <span>{schoolInfo.location}</span>
                    </div>
                </div>
            </header>

            {/* Quick Stats */}
            <section className="stats-section">
                <div className="stats-grid">
                    {quickStats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className={`stat-card ${stat.color}`}>
                                <div className="stat-card-icon">
                                    <Icon size={22} />
                                </div>
                                <div className="stat-card-content">
                                    <div className="stat-value">{stat.value}</div>
                                    <div className="stat-label">{stat.label}</div>
                                    {stat.change && (
                                        <div className={`stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
                                            {stat.change.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            {stat.change}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Overall Progress Card */}
                <section className="dashboard-card progress-card">
                    <div className="card-header">
                        <h2>
                            <Target size={20} />
                            Review Progress
                        </h2>
                        <span className="card-subtitle">Overall completion status</span>
                    </div>
                    <div className="card-body">
                        <div className="overall-progress">
                            <div className="progress-ring-container">
                                <svg className="progress-ring" viewBox="0 0 120 120">
                                    <circle
                                        className="progress-ring-bg"
                                        cx="60"
                                        cy="60"
                                        r="52"
                                    />
                                    <circle
                                        className="progress-ring-fill"
                                        cx="60"
                                        cy="60"
                                        r="52"
                                        style={{
                                            strokeDasharray: `${2 * Math.PI * 52}`,
                                            strokeDashoffset: `${2 * Math.PI * 52 * (1 - reviewProgress.overall / 100)}`,
                                            stroke: getProgressColor(reviewProgress.overall),
                                        }}
                                    />
                                </svg>
                                <div className="progress-ring-text">
                                    <span className="progress-value">{reviewProgress.overall}%</span>
                                    <span className="progress-label">Complete</span>
                                </div>
                            </div>
                        </div>
                        <div className="dimension-progress-list">
                            {reviewProgress.dimensions.map((dim) => (
                                <div key={dim.id} className="dimension-progress-item">
                                    <div className="dimension-info">
                                        <span className="dimension-badge" style={{ backgroundColor: dim.color }}>
                                            {dim.id}
                                        </span>
                                        <span className="dimension-name">{dim.name}</span>
                                    </div>
                                    <div className="dimension-bar-container">
                                        <div className="dimension-bar">
                                            <div 
                                                className="dimension-bar-fill"
                                                style={{ width: `${dim.progress}%`, backgroundColor: dim.color }}
                                            />
                                        </div>
                                        <span className="dimension-percent">{dim.progress}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Quick Actions Card */}
                <section className="dashboard-card actions-card">
                    <div className="card-header">
                        <h2>
                            <ChevronRight size={20} />
                            Quick Actions
                        </h2>
                        <span className="card-subtitle">Jump to common tasks</span>
                    </div>
                    <div className="card-body">
                        <div className="quick-actions-grid">
                            {quickActions.map((action, idx) => {
                                const Icon = action.icon;
                                return (
                                    <Link 
                                        key={idx} 
                                        to={action.path} 
                                        className={`quick-action-btn ${action.color}`}
                                    >
                                        <div className="action-icon">
                                            <Icon size={24} />
                                        </div>
                                        <div className="action-text">
                                            <span className="action-label">{action.label}</span>
                                            <span className="action-label-dv font-dhivehi" dir="rtl">
                                                {action.labelDv}
                                            </span>
                                        </div>
                                        <ChevronRight size={18} className="action-arrow" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Recent Activity Card */}
                <section className="dashboard-card activity-card">
                    <div className="card-header">
                        <h2>
                            <Clock size={20} />
                            Recent Activity
                        </h2>
                        <span className="card-subtitle">Your latest actions</span>
                    </div>
                    <div className="card-body">
                        <div className="activity-list">
                            {recentActivity.map((activity, idx) => {
                                const Icon = activity.icon;
                                return (
                                    <div key={idx} className="activity-item">
                                        <div className={`activity-icon ${activity.color}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="activity-content">
                                            <span className="activity-action">{activity.action}</span>
                                            <span className="activity-time">{activity.time}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* School Info Card */}
                <section className="dashboard-card info-card">
                    <div className="card-header">
                        <h2>
                            <Building size={20} />
                            School Information
                        </h2>
                        <Link to="/school-profile" className="card-link">
                            Edit <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="card-body">
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-icon">
                                    <GraduationCap size={18} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">School Name</span>
                                    <span className="info-value">{schoolInfo.name}</span>
                                    <span className="info-value-dv font-dhivehi" dir="rtl">{schoolInfo.nameDv}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon">
                                    <FileText size={18} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">School ID</span>
                                    <span className="info-value">{schoolInfo.id}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon">
                                    <Users size={18} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Students</span>
                                    <span className="info-value">1,250</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon">
                                    <Award size={18} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Teachers</span>
                                    <span className="info-value">85</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Tips */}
            <section className="dashboard-tips">
                <div className="tip-card">
                    <div className="tip-icon">💡</div>
                    <div className="tip-content">
                        <strong>Tip:</strong> Complete all 5 dimensions to generate your final school review report.
                        <span className="font-dhivehi" dir="rtl" style={{ display: 'block', marginTop: '0.25rem' }}>
                            ފައިނަލް ރިޕޯޓް ހެދުމަށް 5 ޑައިމެންޝަން ފުރިހަމަ ކުރައްވާ
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;
