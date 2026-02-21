import { useState } from 'react';
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
    { id: 'lt', label: 'ލީޑިން ޓީޗަރ' },
    { id: 'principal-dp', label: 'ޕްރިންސިޕަލް/ޑޕ' },
    { id: 'admin', label: 'އެޑްމިން' },
    { id: 'budget', label: 'ބަޖެޓް' },
    { id: 'general-documents', label: 'ޖެނެރަލް ޑޮކިއުމެންޓްސް' },
    { id: 'general-observation', label: 'ޖެނެރަލް އޮބްސަވޭޝަން' },
    { id: 'foundation', label: 'ފައުންޑޭޝަން' },
    { id: 'questionnaire', label: 'ސުވާލުފޯމް' },
];

const secondaryTabsMap = {
    'lt': [
        { id: 'lt1', label: 'ލީޑިން ޓީޗަރ 1' },
        { id: 'lt2', label: 'ލީޑިން ޓީޗަރ 2' },
        { id: 'sen-lt', label: 'ސެން ލީޑިން ޓީޗަރ' },
        { id: 'lesson-plan-fs', label: 'ލެސަން ޕްލޭން (ފައުންޑޭޝަން ސްޓޭޖް)' },
        { id: 'lesson-plan-ks', label: 'ލެސަން ޕްލޭން (ކީ ސްޓޭޖް)' },
        { id: 'lesson-obs-fs', label: 'ލެސަން އޮބްސަވޭޝަން (ފައުންޑޭޝަން ސްޓޭޖް)' },
        { id: 'lesson-obs-ks', label: 'ލެސަން އޮބްސަވޭޝަން (ކީ ސްޓޭޖް)' },
    ],
    'principal-dp': [
        { id: 'principal', label: 'ޕްރިންސިޕަލް' },
        { id: 'deputy-principal', label: 'ޑެޕިއުޓީ ޕްރިންސިޕަލް' },
    ],
    'admin': [
        { id: 'admin-administrator', label: 'އެޑްމިނިސްޓްރޭޓަރ' },
        { id: 'admin-hr', label: 'އެޗްއާރް' },
    ],
    'general-documents': [
        { id: 'literacy-ambassador', label: 'ލިޓަރަސީ އެމްބެސަޑަރ' },
        { id: 'pd-cordinator', label: 'ޕީޑީ ކޯޑިނޭޓަރ' },
        { id: 'sse-focal', label: 'އެސްއީއީ ފޯކަލް' },
        { id: 'general-others', label: 'އެހެނިހެން' },
    ],
    'questionnaire': [
        { id: 'parent-data', label: 'ބެލެނިވެރިންގެ ޑޭޓާ' },
        { id: 'student-data', label: 'ދަރިވަރުންގެ ޑޭޓާ' },
        { id: 'teacher-data', label: 'މުދައްރިސުންގެ ޑޭޓާ' },
        { id: 'comments', label: 'ކޮމެންޓްސް' },
    ],
};

function SSEToolkit() {
    const [activePrimaryTab, setActivePrimaryTab] = useState('lt');
    const [activeSecondaryTab, setActiveSecondaryTab] = useState('lt1');

    const handlePrimaryTabClick = (tabId) => {
        setActivePrimaryTab(tabId);
        const children = secondaryTabsMap[tabId];
        if (children && children.length > 0) {
            setActiveSecondaryTab(children[0].id);
        } else {
            setActiveSecondaryTab(tabId);
        }
    };

    const handleSecondaryTabClick = (tabId) => {
        setActiveSecondaryTab(tabId);
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
            'sen-lt': { title: 'SEN Leading Teacher', titleDv: 'ސެން ލީޑިން ޓީޗަރ', csv: 'SEN.csv', source: 'SEN-LT', hideObservations: true },


            principal: { title: 'Principal Checklist', titleDv: 'ޕްރިންސިޕަލް ޗެކްލިސްޓް', csv: 'Principal.csv', source: 'Principal', rowRange: { start: 3, end: 39 }, hideObservations: true },
            'deputy-principal': { title: 'Deputy Principal Checklist', titleDv: 'ޑެޕިއުޓީ ޕްރިންސިޕަލް ޗެކްލިސްޓް', csv: 'Principal.csv', source: 'DeputyPrincipal', rowRange: { start: 40, end: 84 }, hideObservations: true },
            'admin-administrator': { title: 'Admin Checklist - Administrator', titleDv: 'އެޑްމިން ޗެކްލިސްޓް - އެޑްމިނިސްޓްރޭޓަރ', csv: 'Administrator.csv', source: 'Admin-Administrator' },
            'admin-hr': { title: 'Admin Checklist - HR', titleDv: 'އެޑްމިން ޗެކްލިސްޓް - އެޗްއާރް', csv: 'HR.csv', source: 'Admin-HR', hideObservations: true },
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
                <div className="header-left">
                    <h1 className="page-title">
                        <span className="title-dv font-dhivehi" dir="rtl">ސްކޫލް ރިވިއު ޓޫލްކިޓް</span>
                    </h1>
                </div>
            </header>

            {/* Primary Navigation Strip */}
            <div className="tab-row primary-tabs" role="tablist">
                {primaryTabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-pill ${activePrimaryTab === tab.id ? 'active' : ''}`}
                        onClick={() => handlePrimaryTabClick(tab.id)}
                        role="tab"
                        aria-selected={activePrimaryTab === tab.id}
                    >
                        <span className="tab-label-dv font-dhivehi" dir="rtl">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Secondary Navigation Strip (If Applicable) */}
            {secondaryTabsMap[activePrimaryTab] && (
                <div className="tab-row secondary-tabs" role="tablist">
                    {secondaryTabsMap[activePrimaryTab].map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-pill secondary ${activeSecondaryTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleSecondaryTabClick(tab.id)}
                            role="tab"
                            aria-selected={activeSecondaryTab === tab.id}
                        >
                            <span className="tab-label-dv font-dhivehi" dir="rtl">{tab.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Content Area */}
            <div className="toolkit-content">
                {renderContent(activeSecondaryTab)}
            </div>
        </div>
    );
}

export default SSEToolkit;
