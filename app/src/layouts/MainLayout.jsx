import { useState, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar';
import { useSSEData } from '../context/SSEDataContext';
import './MainLayout.css';

function MobileTopBar() {
    const location = useLocation();
    const { currentSchoolId, setCurrentSchoolId, schools } = useSSEData();

    // Don't show in admin routes
    if (location.pathname.startsWith('/admin')) return null;

    const currentSchool = useMemo(
        () => schools?.find(s => s.schoolId === currentSchoolId),
        [schools, currentSchoolId]
    );

    const hasMultipleSchools = schools && schools.length > 1;

    return (
        <div className="mobile-top-bar">
            <span className="brand-icon-sm">🏫</span>
            {hasMultipleSchools ? (
                <select
                    className="mobile-school-select font-dhivehi"
                    dir="rtl"
                    value={currentSchoolId || ''}
                    onChange={(e) => setCurrentSchoolId(e.target.value)}
                >
                    {schools.map(school => (
                        <option key={school.schoolId} value={school.schoolId}>
                            {school.nameDv || school.name}
                        </option>
                    ))}
                </select>
            ) : currentSchool ? (
                <span className="mobile-school-label font-dhivehi" dir="rtl">
                    {currentSchool.nameDv || currentSchool.name}
                </span>
            ) : null}
        </div>
    );
}

function MainLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className={`main-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <main className="main-content">
                <MobileTopBar />
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
