import { NavLink, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import {
    LayoutDashboard,
    ClipboardList,
    School,
    BarChart3,
    TrendingUp,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    Users,
    Building2,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useSSEData } from '../../context/SSEDataContext';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import './Sidebar.css';

const menuItems = [
    {
        id: 'dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        labelDv: 'ވެށި',
        labelEn: 'Overview',
    },
    {
        id: 'toolkit',
        path: '/toolkit',
        icon: ClipboardList,
        labelDv: 'ރިވިއު ޓޫލްކިޓް',
        labelEn: 'Review Toolkit',
    },
    {
        id: 'profile',
        path: '/school-profile',
        icon: School,
        labelDv: 'ސްކޫލް ފޯމް',
        labelEn: 'School Profile',
    },
    {
        id: 'results',
        path: '/results',
        icon: BarChart3,
        labelDv: 'ރިޕޯޓް',
        labelEn: 'Reports',
    },
    {
        id: 'analytics',
        path: '/analytics',
        icon: TrendingUp,
        labelDv: 'ކުރިއެރުން',
        labelEn: 'Analytics',
    },
    {
        id: 'support',
        path: '/support',
        icon: HelpCircle,
        labelDv: 'ދެހީ',
        labelEn: 'Support',
    },
    {
        id: 'users',
        path: '/admin/users',
        icon: Users,
        labelDv: 'ޔޫޒަރުން',
        labelEn: 'Users',
        adminOnly: true,
    },
    {
        id: 'schools',
        path: '/admin/schools',
        icon: Building2,
        labelDv: 'ސްކޫލްތައް',
        labelEn: 'Schools',
        adminOnly: true,
    },
];

function Sidebar({ collapsed, onToggle }) {
    const location = useLocation();
    const { user } = useAuth();
    const { currentSchoolId, setCurrentSchoolId } = useSSEData();

    // Fetch all schools
    const schoolsQueryResult = useQuery(api.schools.listSchools);
    const schools = useMemo(() => schoolsQueryResult || [], [schoolsQueryResult]);

    // Filter schools based on role
    const accessibleSchools = useMemo(() => {
        const schoolsList = schools || [];
        if (!user) return [];
        if (user.role === 'ADMIN') return schoolsList;
        if (user.role === 'ANALYST') {
            return schoolsList.filter(s => user.assignedSchools?.includes(s.schoolId));
        }
        if (user.role === 'PRINCIPAL') {
            return schoolsList.filter(s => s.schoolId === user.schoolId);
        }
        return [];
    }, [schools, user]);

    return (
        <aside
            className={`sidebar ${collapsed ? 'collapsed' : ''}`}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Header */}
            <div className="sidebar-header">
                {!collapsed && (
                    <div className="brand font-dhivehi" dir="rtl">
                        <span className="brand-icon" aria-hidden="true">🏫</span>
                        <span className="brand-text">ސްކޫލް ރިވިއު</span>
                    </div>
                )}
                <button
                    className="toggle-btn"
                    onClick={onToggle}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-expanded={!collapsed}
                >
                    {collapsed ? <ChevronLeft size={20} aria-hidden="true" /> : <ChevronRight size={20} aria-hidden="true" />}
                </button>
            </div>

            {/* School Selector */}
            {!collapsed && accessibleSchools.length > 1 && (
                <div className="sidebar-school-selector">
                    <label className="selector-label font-dhivehi" dir="rtl">ސްކޫލް އިޚްތިޔާރު ކުރައްވާ:</label>
                    <select
                        className="school-select font-dhivehi"
                        dir="rtl"
                        value={currentSchoolId || ''}
                        onChange={(e) => setCurrentSchoolId(e.target.value)}
                    >
                        {accessibleSchools.map(school => (
                            <option key={school.schoolId} value={school.schoolId}>
                                {school.nameDv || school.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {!collapsed && accessibleSchools.length === 1 && (
                <div className="sidebar-school-display">
                    <span className="school-name-badge font-dhivehi" dir="rtl">
                        {accessibleSchools[0].nameDv || accessibleSchools[0].name}
                    </span>
                </div>
            )}

            {/* Navigation */}
            <nav className="sidebar-nav" role="menubar">
                {menuItems.map((item) => {
                    if (item.adminOnly && user?.role !== 'ADMIN') return null;

                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                        (item.path === '/toolkit' && location.pathname.startsWith('/toolkit')) ||
                        (item.path === '/results' && location.pathname.startsWith('/results'));

                    return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            title={collapsed ? item.labelDv : undefined}
                            role="menuitem"
                            aria-current={isActive ? 'page' : undefined}
                            aria-label={item.labelEn}
                        >
                            <Icon size={22} className="nav-icon" aria-hidden="true" />
                            {!collapsed && (
                                <span className="label-dv font-dhivehi" dir="rtl">{item.labelDv}</span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                {!collapsed && (
                    <div className="version-info" aria-label="Application version">
                        <span>Academic Year 2026</span>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
