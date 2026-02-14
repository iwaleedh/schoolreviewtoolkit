import { useState } from 'react';
import {
    ChevronDown,
    FileText,
    Users,
    Clipboard,
    BookOpen,
    Calculator,
    Settings,
    UserCheck,
    Baby,
} from 'lucide-react';
import EditableChecklist from '../components/sse/EditableChecklist';
import LTChecklist from '../components/sse/LTChecklist';
import LessonPlanChecklist from '../components/sse/LessonPlanChecklist';
import ParentDataChecklist from '../components/sse/ParentDataChecklist';
import StudentDataChecklist from '../components/sse/StudentDataChecklist';
import TeacherDataChecklist from '../components/sse/TeacherDataChecklist';
import CommentsTable from '../components/sse/CommentsTable';
import './SSEToolkit.css';

// Tab configuration for Review Toolkit
const primaryTabs = [
    {
        id: 'lt',
        label: 'Leading Teacher',
        labelDv: 'ލީޑިން ޓީޗަރ',
        isDropdown: true,
        children: [
            { id: 'lt1', label: 'LT1' },
            { id: 'lt2', label: 'LT2' },
            { id: 'sen-lt', label: 'SEN-LT' },
            { id: 'lesson-plan-fs', label: 'Lesson Plan FS' },
            { id: 'lesson-plan-ks', label: 'Lesson Plan KS' },
            { id: 'lesson-obs-fs', label: 'Lesson Observation FS' },
            { id: 'lesson-obs-ks', label: 'Lesson Observation KS' },
        ],
    },
    {
        id: 'principal-dp',
        label: 'Principal/DP',
        labelDv: 'ޕްރިންސިޕަލް/ޑޕ',
        icon: UserCheck,
        isDropdown: true,
        children: [
            { id: 'principal', label: 'Principal' },
            { id: 'deputy-principal', label: 'Deputy Principal' },
        ],
    },
    {
        id: 'admin',
        label: 'Admin',
        labelDv: 'އެޑްމިން',
        icon: Clipboard,
        isDropdown: true,
        children: [
            { id: 'admin-administrator', label: 'Administrator' },
            { id: 'admin-hr', label: 'HR' },
        ],
    },
    { id: 'budget', label: 'Budget', labelDv: 'ބަޖެޓް', icon: Calculator },
    {
        id: 'general-documents',
        label: 'General Documents',
        labelDv: 'ޖެނެރަލް ޑޮކިއުމެންޓްސް',
        icon: FileText,
        isDropdown: true,
        children: [
            { id: 'literacy-ambassador', label: 'Literacy Ambassador' },
            { id: 'pd-cordinator', label: 'PD Cordinator' },
            { id: 'sse-focal', label: 'SSE Focal' },
            { id: 'general-others', label: 'Others' },
        ],
    },
    { id: 'general-observation', label: 'General Observation', labelDv: 'ޖެނެރަލް އޮބްސަވޭޝަން', icon: Users },
    { id: 'foundation', label: 'Foundation', labelDv: 'ފައުންޑޭޝަން', icon: Baby },
    {
        id: 'questionnaire',
        label: 'Questionnaire',
        labelDv: 'ސުވާލުފޯމް',
        icon: Settings,
        isDropdown: true,
        children: [
            { id: 'parent-data', label: 'Parent Data' },
            { id: 'student-data', label: 'Student Data' },
            { id: 'teacher-data', label: 'Teacher Data' },
            { id: 'comments', label: 'Comments' },
        ],
    },
];

function SSEToolkit() {
    const [activeTab, setActiveTab] = useState('lt1');
    const [openDropdown, setOpenDropdown] = useState(null);

    const handleTabClick = (tabId, isDropdown) => {
        if (isDropdown) {
            setOpenDropdown(openDropdown === tabId ? null : tabId);
        } else {
            setActiveTab(tabId);
            setOpenDropdown(null);
        }
    };

    const handleChildClick = (childId) => {
        setActiveTab(childId);
        setOpenDropdown(null);
    };

    // Render content based on active tab
    const renderContent = (tabId) => {
        // LT checklists with multi-column input (LT1-LT10 + Average)
        const ltConfig = {
            lt1: { title: 'Leading Teacher 1', titleDv: 'ލީޑިން ޓީޗަރ 1', csv: 'LT1.csv', source: 'LT1' },
            lt2: { title: 'Leading Teacher 2', titleDv: 'ލީޑިން ޓީޗަރ 2', csv: 'LT2.csv', source: 'LT2' },
        };

        // Lesson Plan checklists (flat table with LP1-LP5 per LT)
        const lpConfig = {
            'lesson-plan-fs': { title: 'Lesson Plan (Foundation Stage)', titleDv: 'ލެސަން ޕްލޭން (ފައުންޑޭޝަން ސްޓޭޖް)', csv: 'LP-FS.csv', source: 'LPFS' },
            'lesson-plan-ks': { title: 'Lesson Plan (Key Stage)', titleDv: 'ލެސަން ޕްލޭން (ކީ ސްޓޭޖް)', csv: 'LP-KS.csv', source: 'LPKS' },
        };

        // Lesson Observation checklists (flat table with observation columns per Teacher)
        const loConfig = {
            'lesson-obs-fs': { title: 'Lesson Observation (Foundation Stage)', titleDv: 'ލެސަން އޮބްސަވޭޝަން (ފައުންޑޭޝަން ސްޓޭޖް)', csv: 'LO-FS.csv', source: 'LOFS' },
            'lesson-obs-ks': { title: 'Lesson Observation (Key Stage)', titleDv: 'ލެސަން އޮބްސަވޭޝަން (ކީ ސްޓޭޖް)', csv: 'LO-KS.csv', source: 'LOKS' },
        };

        // Data input tabs (Editable - single score column)
        const editableConfig = {
            'sen-lt': { title: 'SEN Leading Teacher', titleDv: 'ސެން ލީޑިން ޓީޗަރ', csv: 'SEN.csv', source: 'SEN-LT' },


            principal: { title: 'Principal Checklist', titleDv: 'ޕްރިންސިޕަލް ޗެކްލިސްޓް', csv: 'Principal.csv', source: 'Principal', rowRange: { start: 3, end: 39 } },
            'deputy-principal': { title: 'Deputy Principal Checklist', titleDv: 'ޑެޕިއުޓީ ޕްރިންސިޕަލް ޗެކްލިސްޓް', csv: 'Principal.csv', source: 'DeputyPrincipal', rowRange: { start: 40, end: 84 } },
            'admin-administrator': { title: 'Admin Checklist - Administrator', titleDv: 'އެޑްމިން ޗެކްލިސްޓް - އެޑްމިނިސްޓްރޭޓަރ', csv: 'Administrator.csv', source: 'Admin-Administrator' },
            'admin-hr': { title: 'Admin Checklist - HR', titleDv: 'އެޑްމިން ޗެކްލިސްޓް - އެޗްއާރް', csv: 'HR.csv', source: 'Admin-HR' },
            budget: { title: 'Budget Checklist', titleDv: 'ބަޖެޓް ޗެކްލިސްޓް', csv: 'Budget.csv', source: 'Budget' },
            'literacy-ambassador': { title: 'Literacy Ambassador Checklist', titleDv: 'ލިޓަރަސީ އެމްބެސަޑަރ ޗެކްލިސްޓް', csv: 'Literacy.csv', source: 'Literacy-Ambassador', hideObservations: true },
            'pd-cordinator': { title: 'PD Cordinator Checklist', titleDv: 'ޕީޑީ ކޯޑިނޭޓަރ ޗެކްލިސްޓް', csv: 'PD.csv', source: 'PD-Cordinator', hideObservations: true },
            'sse-focal': { title: 'SSE Focal Checklist', titleDv: 'އެސްއީއީ ފޯކަލް ޗެކްލިސްޓް', csv: 'SSE.csv', source: 'SSE-Focal', hideObservations: true },
            'general-others': { title: 'Others Checklist', titleDv: 'އެހެނިހެން ޗެކްލިސްޓް', csv: 'other.csv', source: 'General-Others', hideObservations: true },
            'general-observation': { title: 'General Observation Checklist', titleDv: 'ޖެނެރަލް އޮބްސަވޭޝަން ޗެކްލިސްޓް', csv: 'General Observation.csv', source: 'General-Observation', showAllColumns: true },
            foundation: { title: 'Foundation Checklist', titleDv: 'ފައުންޑޭޝަން ޗެކްލިސްޓް', csv: 'Foundation.csv', source: 'Foundation', showAllColumns: true },
            // Student data uses StudentDataChecklist component (similar to parent)
            // Teacher data uses TeacherDataChecklist component (similar to parent)
        };

        // Check if it's an LT checklist (multi-column)
        if (ltConfig[tabId]) {
            const config = ltConfig[tabId];
            return (
                <LTChecklist
                    csvFileName={config.csv}
                    title={config.title}
                    titleDv={config.titleDv}
                    source={config.source}
                />
            );
        }

        // Check if it's a Lesson Plan checklist (flat table with LP columns)
        if (lpConfig[tabId]) {
            const config = lpConfig[tabId];
            return (
                <LessonPlanChecklist
                    csvFileName={config.csv}
                    title={config.title}
                    titleDv={config.titleDv}
                    source={config.source}
                />
            );
        }

        // Check if it's a Lesson Observation checklist (flat table with T columns)
        if (loConfig[tabId]) {
            const config = loConfig[tabId];
            return (
                <LessonPlanChecklist
                    csvFileName={config.csv}
                    title={config.title}
                    titleDv={config.titleDv}
                    source={config.source}
                />
            );
        }

        // Parent Data Checklist (special handling for questionnaire)
        if (tabId === 'parent-data') {
            return (
                <ParentDataChecklist
                    csvFileName="Parents_data.csv"
                    title="Parent Questionnaire"
                    titleDv="ބެލެނިވެރިންގެ ސުވާލުފޯމް"
                />
            );
        }

        // Student Data Checklist
        if (tabId === 'student-data') {
            return (
                <StudentDataChecklist
                    csvFileName="Students_data.csv"
                    title="Student Questionnaire"
                    titleDv="ދަރިވަރުންގެ ސުވާލުފޯމް"
                />
            );
        }

        // Teacher Data Checklist
        if (tabId === 'teacher-data') {
            return (
                <TeacherDataChecklist
                    csvFileName="Teachers_data.csv"
                    title="Teacher Questionnaire"
                    titleDv="މުދައްސިސުންގެ ސުވާލުފޯމް"
                />
            );
        }

        // Comments Table - Shows all comments from questionnaires
        if (tabId === 'comments') {
            return (
                <CommentsTable
                    title="Stakeholder Comments"
                    titleDv="ސްޓޭކްހޯލްޑަރުންގެ ކޮމެންޓްސް"
                />
            );
        }

        // Check if it's an editable data input tab (single score column)
        if (editableConfig[tabId]) {
            const config = editableConfig[tabId];
            return (
                <EditableChecklist
                    key={tabId}
                    csvFileName={config.csv}
                    title={config.title}
                    titleDv={config.titleDv}
                    source={config.source}
                    rowRange={config.rowRange}
                    filterColumn={config.filterColumn}
                    filterValue={config.filterValue}
                    hideObservations={config.hideObservations}
                    showAllColumns={config.showAllColumns}
                />
            );
        }

        // Default placeholder
        return (
            <div className="content-placeholder">
                <h2>Tab: {tabId}</h2>
                <p>Upload the CSV file for this checklist to the /Checklist folder.</p>
                <p className="font-dhivehi" dir="rtl" style={{ marginTop: '1rem' }}>
                    މި ޓެބްގެ CSV ފައިލް Checklist ފޯލްޑަރަށް އަޕްލޯޑް ކުރައްވާ
                </p>
            </div>
        );
    };

    return (
        <div className="sse-toolkit">
            {/* Page Header */}
            <header className="toolkit-header">
                <h1 className="page-title">
                    <span className="title-en">School Review Toolkit</span>
                    <span className="title-dv font-dhivehi" dir="rtl">ސްކޫލް ރިވިއު ޓޫލްކިޓް</span>
                </h1>
            </header>

            {/* Primary Tabs (All Checklists) */}
            <div className="tab-row primary-tabs">
                {primaryTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <div key={tab.id} className="tab-wrapper">
                            <button
                                className={`tab-btn ${activeTab === tab.id ||
                                    (tab.children && tab.children.some(c => c.id === activeTab)) ? 'active' : ''}`}
                                onClick={() => handleTabClick(tab.id, tab.isDropdown)}
                            >
                                {Icon && <Icon size={16} className="tab-icon" />}
                                <span className="tab-label">{tab.label}</span>
                                {tab.isDropdown && <ChevronDown size={16} className="dropdown-icon" />}
                            </button>

                            {tab.isDropdown && openDropdown === tab.id && (
                                <div className="dropdown-menu">
                                    {tab.children.map((child) => (
                                        <button
                                            key={child.id}
                                            className={`dropdown-item ${activeTab === child.id ? 'active' : ''}`}
                                            onClick={() => handleChildClick(child.id)}
                                        >
                                            {child.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="toolkit-content">
                {renderContent(activeTab)}
            </div>
        </div>
    );
}

export default SSEToolkit;
