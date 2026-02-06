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
    { id: 'principal', label: 'Principal', labelDv: 'ޕްރިންސިޕަލް', icon: UserCheck },
    { id: 'admin', label: 'Admin', labelDv: 'އެޑްމިން', icon: Clipboard },
    { id: 'budget', label: 'Budget', labelDv: 'ބަޖެޓް', icon: Calculator },
    { id: 'general', label: 'General', labelDv: 'ޖެނެރަލް', icon: FileText },
    { id: 'others', label: 'Others', labelDv: 'އެހެނިހެން', icon: Users },
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

        // Data input tabs (Editable - single score column)
        const editableConfig = {
            'sen-lt': { title: 'SEN Leading Teacher', titleDv: 'ސެން ލީޑިން ޓީޗަރ', csv: 'SEN-LT.csv', source: 'SEN-LT' },
            'lesson-plan-fs': { title: 'Lesson Plan FS', titleDv: 'ލެސަން ޕްލޭން FS', csv: 'LessonPlanFS.csv', source: 'LessonPlanFS' },
            'lesson-plan-ks': { title: 'Lesson Plan KS', titleDv: 'ލެސަން ޕްލޭން KS', csv: 'LessonPlanKS.csv', source: 'LessonPlanKS' },
            'lesson-obs-fs': { title: 'Lesson Observation FS', titleDv: 'ލެސަން އޮބްސަވޭޝަން FS', csv: 'LessonObsFS.csv', source: 'LessonObsFS' },
            'lesson-obs-ks': { title: 'Lesson Observation KS', titleDv: 'ލެސަން އޮبްސަވޭޝަން KS', csv: 'LessonObsKS.csv', source: 'LessonObsKS' },
            principal: { title: 'Principal Checklist', titleDv: 'ޕްރިންސިޕަލް ޗެކްލިސްޓް', csv: 'Principal.csv', source: 'Principal' },
            admin: { title: 'Admin Checklist', titleDv: 'އެޑްމިން ޗެކްލިސްޓް', csv: 'Admin.csv', source: 'Admin' },
            budget: { title: 'Budget Checklist', titleDv: 'ބަޖެޓް ޗެކްލިސްޓް', csv: 'Budget.csv', source: 'Budget' },
            general: { title: 'General Checklist', titleDv: 'ޖެނެرަލް ޗެކްލިސްޓް', csv: 'General.csv', source: 'General' },
            others: { title: 'Others Checklist', titleDv: 'އެހެނިހެން ޗެކްލިސްޓް', csv: 'Others.csv', source: 'Others' },
            foundation: { title: 'Foundation Checklist', titleDv: 'ފައުންޑޭޝަން ޗެކްލިސްޓް', csv: 'Foundation.csv', source: 'Foundation' },
            'parent-data': { title: 'Parent Data', titleDv: 'ބެލެނިވެރިންގެ ޑޭޓާ', csv: 'ParentData.csv', source: 'ParentData' },
            'student-data': { title: 'Student Data', titleDv: 'ދަރިވަރުންގެ ޑޭޓާ', csv: 'StudentData.csv', source: 'StudentData' },
            'teacher-data': { title: 'Teacher Data', titleDv: 'މުدައްރިسުންގެ ޑޭޓާ', csv: 'TeacherData.csv', source: 'TeacherData' },
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

        // Check if it's an editable data input tab (single score column)
        if (editableConfig[tabId]) {
            const config = editableConfig[tabId];
            return (
                <EditableChecklist
                    csvFileName={config.csv}
                    title={config.title}
                    titleDv={config.titleDv}
                    source={config.source}
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
