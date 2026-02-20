import { useState, useCallback } from 'react';
import { Database, Trash2 } from 'lucide-react';
import { useSSEData } from '../context/SSEDataContext';
import EditableChecklist from '../components/sse/EditableChecklist';
import LTChecklist from '../components/sse/LTChecklist';
import LessonPlanChecklist from '../components/sse/LessonPlanChecklist';
import ParentDataChecklist from '../components/sse/ParentDataChecklist';
import StudentDataChecklist from '../components/sse/StudentDataChecklist';
import TeacherDataChecklist from '../components/sse/TeacherDataChecklist';
import CommentsTable from '../components/sse/CommentsTable';
import './SSEToolkit.css';

// LT columns
const LT_COLUMNS = ['LT1', 'LT2', 'LT3', 'LT4', 'LT5', 'LT6', 'LT7', 'LT8', 'LT9', 'LT10'];

// Generate dummy data for all checklists
const generateDummyData = () => {
    const data = {
        // LT1 and LT2 - indicators from D1.csv (Dimension 1)
        LT1: {},
        LT2: {},
        // Other sources
        'SEN-LT': {},
        Principal: {},
        'Deputy-Principal': {},
        Administrator: {},
        HR: {},
        Budget: {},
    };

    // Generate random value (yes/no/nr)
    const randomValue = () => {
        const rand = Math.random();
        if (rand < 0.6) return 'yes';
        if (rand < 0.9) return 'no';
        return 'nr';
    };

    // LT1 indicators (from D1.csv - indicators 1-50 and some from other ranges)
    const lt1Indicators = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85,
        731, 732, 733
    ];

    // Populate LT1
    lt1Indicators.forEach(code => {
        // Randomly decide how many LT columns to fill (1-5)
        const numCols = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < numCols; i++) {
            const col = LT_COLUMNS[i];
            if (!data.LT1[col]) data.LT1[col] = {};
            data.LT1[col][String(code)] = randomValue();
        }
    });

    // Populate LT2 (similar indicators but different values)
    lt1Indicators.forEach(code => {
        const numCols = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numCols; i++) {
            const col = LT_COLUMNS[i];
            if (!data.LT2[col]) data.LT2[col] = {};
            data.LT2[col][String(code)] = randomValue();
        }
    });

    // SEN-LT indicators
    const senIndicators = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    senIndicators.forEach(code => {
        data['SEN-LT'][String(code)] = randomValue();
    });

    // Principal indicators
    const principalIndicators = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    principalIndicators.forEach(code => {
        data.Principal[String(code)] = randomValue();
    });

    // Deputy Principal indicators
    const dpIndicators = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    dpIndicators.forEach(code => {
        data['Deputy-Principal'][String(code)] = randomValue();
    });

    // Administrator indicators
    const adminIndicators = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    adminIndicators.forEach(code => {
        data.Administrator[String(code)] = randomValue();
    });

    // HR indicators
    const hrIndicators = [1, 2, 3, 4, 5, 6, 7, 8];
    hrIndicators.forEach(code => {
        data.HR[String(code)] = randomValue();
    });

    // Budget indicators
    const budgetIndicators = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    budgetIndicators.forEach(code => {
        data.Budget[String(code)] = randomValue();
    });

    return data;
};

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
    const [dummyDataLoaded, setDummyDataLoaded] = useState(false);

    // Get SSEData context functions
    const { setIndicatorLTScore, setIndicatorScore, clearAllScores, discardPendingLTScores } = useSSEData();

    // Load dummy data into all checklists
    const handleLoadDummyData = useCallback(() => {
        const dummyData = generateDummyData();

        // Load LT1 data (uses pending state - can be cleared)
        Object.entries(dummyData.LT1).forEach(([col, indicators]) => {
            Object.entries(indicators).forEach(([indicatorCode, value]) => {
                setIndicatorLTScore(indicatorCode, col, value, 'LT1');
            });
        });

        // Load LT2 data (uses pending state - can be cleared)
        Object.entries(dummyData.LT2).forEach(([col, indicators]) => {
            Object.entries(indicators).forEach(([indicatorCode, value]) => {
                setIndicatorLTScore(indicatorCode, col, value, 'LT2');
            });
        });

        // Load non-LT data (syncs to backend immediately)
        // These will require clearAllScores() to clear
        Object.entries(dummyData['SEN-LT']).forEach(([indicatorCode, value]) => {
            setIndicatorScore(indicatorCode, value, 'SEN-LT');
        });

        Object.entries(dummyData.Principal).forEach(([indicatorCode, value]) => {
            setIndicatorScore(indicatorCode, value, 'Principal');
        });

        Object.entries(dummyData['Deputy-Principal']).forEach(([indicatorCode, value]) => {
            setIndicatorScore(indicatorCode, value, 'Deputy-Principal');
        });

        Object.entries(dummyData.Administrator).forEach(([indicatorCode, value]) => {
            setIndicatorScore(indicatorCode, value, 'Administrator');
        });

        Object.entries(dummyData.HR).forEach(([indicatorCode, value]) => {
            setIndicatorScore(indicatorCode, value, 'HR');
        });

        Object.entries(dummyData.Budget).forEach(([indicatorCode, value]) => {
            setIndicatorScore(indicatorCode, value, 'Budget');
        });

        setDummyDataLoaded(true);
    }, [setIndicatorLTScore, setIndicatorScore]);

    // Clear all dummy data
    const handleClearDummyData = useCallback(async () => {
        try {
            // Clear all scores including backend-synced indicator scores
            await clearAllScores();
            // Clear pending LT scores
            ['LT1', 'LT2'].forEach(source => {
                discardPendingLTScores(source);
            });
            setDummyDataLoaded(false);
        } catch (err) {
            console.error('Failed to clear dummy data:', err);
        }
    }, [clearAllScores, discardPendingLTScores]);

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
                <div className="header-left">
                    <h1 className="page-title">
                        <span className="title-en">School Review Toolkit</span>
                        <span className="title-dv font-dhivehi" dir="rtl">ސްކޫލް ރިވިއު ޓޫލްކިޓް</span>
                    </h1>
                </div>
                <div className="header-actions">
                    <button
                        className="dummy-data-btn load"
                        onClick={handleLoadDummyData}
                        disabled={dummyDataLoaded}
                        aria-label="Load dummy test data into all checklists"
                        title="Fill all checklists with test data"
                    >
                        <Database size={16} aria-hidden="true" />
                        Load Dummy Data
                    </button>
                    <button
                        className="dummy-data-btn clear"
                        onClick={handleClearDummyData}
                        disabled={!dummyDataLoaded}
                        aria-label="Clear all test data"
                        title="Clear all test data"
                    >
                        <Trash2 size={16} aria-hidden="true" />
                        Clear Data
                    </button>
                    {dummyDataLoaded && (
                        <span className="data-status" role="status" aria-live="polite">✓ Test data loaded - check Backend tab in Reports</span>
                    )}
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
