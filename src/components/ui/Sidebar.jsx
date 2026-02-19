import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    School,
    BarChart3,
    TrendingUp,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
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
];

function Sidebar({ collapsed, onToggle }) {
    const location = useLocation();

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

            {/* Navigation */}
            <nav className="sidebar-nav" role="menubar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                        (item.path === '/toolkit' && location.pathname.startsWith('/toolkit')) ||
                        (item.path === '/results' && location.pathname.startsWith('/results'));

                    return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            title={collapsed ? item.labelEn : undefined}
                            role="menuitem"
                            aria-current={isActive ? 'page' : undefined}
                            aria-label={item.labelEn}
                        >
                            <Icon size={22} className="nav-icon" aria-hidden="true" />
                            {!collapsed && (
                                <div className="nav-labels">
                                    <span className="label-dv font-dhivehi" dir="rtl">{item.labelDv}</span>
                                    <span className="label-en">{item.labelEn}</span>
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                {/* Theme Toggle */}
                <div className="theme-toggle-container">
                    <ThemeToggle showLabel={!collapsed} size={collapsed ? 'small' : 'medium'} />
                </div>
                
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
