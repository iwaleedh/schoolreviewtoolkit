/**
 * School Profile Page
 * 
 * Comprehensive school information form with 16 sections in tab format
 */

import { useState } from 'react';
import {
    Building,
    Users,
    GraduationCap,
    MapPin,
    Phone,
    Mail,
    Globe,
    Calendar,
    Briefcase,
    BookOpen,
    Heart,
    Shield,
    Wifi,
    Monitor,
    Save,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    DollarSign,
    Award,
    Home,
    Laptop,
} from 'lucide-react';
import './SchoolProfile.css';

// Tab configuration - organized into rows
const primaryTabs = [
    { id: 'basic', label: 'Basic Info', labelDv: 'އަސާސީ', icon: Building },
    { id: 'contact', label: 'Contact', labelDv: 'ގުޅޭނެ ގޮތް', icon: Phone },
    { id: 'administration', label: 'Administration', labelDv: 'އިދާރީ', icon: Briefcase },
    { id: 'teachers', label: 'Teachers', labelDv: 'މުދައްރިސުން', icon: GraduationCap },
    { id: 'support', label: 'Support Staff', labelDv: 'ސަޕޯޓް', icon: Users },
    { id: 'students', label: 'Students', labelDv: 'ދަރިވަރުން', icon: BookOpen },
    { id: 'sen', label: 'SEN', labelDv: 'ސެން', icon: Heart },
    { id: 'curriculum', label: 'Curriculum', labelDv: 'މުގައްރަރު', icon: BookOpen },
];

const secondaryTabs = [
    { id: 'infrastructure', label: 'Infrastructure', labelDv: 'އިންފްރާ', icon: Home },
    { id: 'facilities', label: 'Facilities', labelDv: 'ވަސީލަތް', icon: Monitor },
    { id: 'technology', label: 'Technology', labelDv: 'ޓެކް', icon: Laptop },
    { id: 'safety', label: 'Health & Safety', labelDv: 'ރައްކާތެރި', icon: Shield },
    { id: 'academic', label: 'Academic Results', labelDv: 'ނަތީޖާ', icon: GraduationCap },
    { id: 'budget', label: 'Budget', labelDv: 'ބަޖެޓް', icon: DollarSign },
    { id: 'community', label: 'Community', labelDv: 'މުޖުތަމައު', icon: Users },
    { id: 'achievements', label: 'Achievements', labelDv: 'ކާމިޔާބީ', icon: Award },
];

// All sections combined for reference
const allSections = [...primaryTabs, ...secondaryTabs];

// Initial form data
const initialFormData = {
    // Basic Information
    schoolName: '',
    schoolNameDv: '',
    schoolCode: '',
    schoolType: '',
    establishedYear: '',
    atoll: '',
    island: '',
    address: '',
    
    // Contact Details
    phone: '',
    fax: '',
    email: '',
    website: '',
    principalPhone: '',
    emergencyContact: '',
    
    // Administration
    principalName: '',
    principalNameDv: '',
    deputyPrincipalName: '',
    adminOfficerName: '',
    totalAdminStaff: '',
    
    // Teaching Staff
    totalTeachers: '',
    maleTeachers: '',
    femaleTeachers: '',
    qualifiedTeachers: '',
    trainedTeachers: '',
    expatTeachers: '',
    
    // Support Staff
    totalSupportStaff: '',
    counselors: '',
    librarians: '',
    labAssistants: '',
    itStaff: '',
    
    // Student Enrollment
    totalStudents: '',
    maleStudents: '',
    femaleStudents: '',
    foundationStudents: '',
    primaryStudents: '',
    secondaryStudents: '',
    higherSecondaryStudents: '',
    
    // SEN Students
    totalSenStudents: '',
    senTeachers: '',
    senFacilities: '',
    
    // Infrastructure
    totalClassrooms: '',
    totalBuildings: '',
    playgroundArea: '',
    hasLibrary: false,
    hasScienceLab: false,
    hasComputerLab: false,
    hasAuditorium: false,
    
    // Facilities
    hasCafeteria: false,
    hasSportsField: false,
    hasSwimmingPool: false,
    hasFirstAidRoom: false,
    hasCounselingRoom: false,
    
    // Technology
    hasInternet: false,
    internetSpeed: '',
    totalComputers: '',
    hasSmartBoards: false,
    hasProjectors: '',
    
    // Health & Safety
    hasFireExtinguishers: false,
    hasEmergencyExits: false,
    hasFirstAidKit: false,
    hasSafetyPlan: false,
    lastSafetyDrill: '',
    
    // Curriculum
    curriculum: '',
    mediumOfInstruction: '',
    additionalLanguages: '',
    extraCurricular: '',
    
    // Academic Results
    passRateYear1: '',
    passRateYear2: '',
    passRateYear3: '',
    oLevelPassRate: '',
    aLevelPassRate: '',
    topPerformingSubject: '',
    needsImprovementSubject: '',
    literacyRate: '',
    numeracyRate: '',
    nationalExamRanking: '',
    
    // Budget & Finance
    annualBudget: '',
    governmentFunding: '',
    otherFunding: '',
    teacherSalaryBudget: '',
    infrastructureBudget: '',
    resourcesBudget: '',
    maintenanceBudget: '',
    hasAuditReport: false,
    lastAuditDate: '',
    
    // Parent & Community
    ptaMeetingsPerYear: '',
    parentVolunteers: '',
    communityPartners: '',
    parentSatisfactionRate: '',
    parentEngagementLevel: '',
    communityProjects: '',
    hasParentPortal: false,
    parentCommunicationMethod: '',
    
    // Achievements & Awards
    nationalAwards: '',
    atollAwards: '',
    sportsAchievements: '',
    academicAchievements: '',
    culturalAchievements: '',
    environmentalAwards: '',
    specialRecognitions: '',
};

function SchoolProfile() {
    const [formData, setFormData] = useState(initialFormData);
    const [activeTab, setActiveTab] = useState('basic');
    const [savedSections, setSavedSections] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (field) => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    const handleSaveSection = () => {
        setIsSaving(true);
        setTimeout(() => {
            setSavedSections(prev => 
                prev.includes(activeTab) ? prev : [...prev, activeTab]
            );
            setIsSaving(false);
        }, 500);
    };

    const handleSaveAll = () => {
        setIsSaving(true);
        setTimeout(() => {
            setSavedSections(allSections.map(s => s.id));
            setIsSaving(false);
        }, 1000);
    };

    // Get current tab info
    const currentTab = allSections.find(s => s.id === activeTab);

    const renderInput = (label, labelDv, field, type = 'text', placeholder = '') => (
        <div className="form-field">
            <label>
                <span className="label-en">{label}</span>
                <span className="label-dv font-dhivehi" dir="rtl">{labelDv}</span>
            </label>
            <input
                type={type}
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={placeholder}
                className="form-input"
            />
        </div>
    );

    const renderSelect = (label, labelDv, field, options) => (
        <div className="form-field">
            <label>
                <span className="label-en">{label}</span>
                <span className="label-dv font-dhivehi" dir="rtl">{labelDv}</span>
            </label>
            <select
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="form-select"
            >
                <option value="">Select...</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    const renderCheckbox = (label, labelDv, field) => (
        <div className="form-checkbox">
            <input
                type="checkbox"
                id={field}
                checked={formData[field]}
                onChange={() => handleCheckboxChange(field)}
            />
            <label htmlFor={field}>
                <span className="label-en">{label}</span>
                <span className="label-dv font-dhivehi" dir="rtl">{labelDv}</span>
            </label>
        </div>
    );

    const renderSectionContent = (sectionId) => {
        switch (sectionId) {
            case 'basic':
                return (
                    <div className="form-grid">
                        {renderInput('School Name (English)', 'ސްކޫލް ނަން (އިނގިރޭސި)', 'schoolName', 'text', 'Enter school name')}
                        {renderInput('School Name (Dhivehi)', 'ސްކޫލް ނަން (ދިވެހި)', 'schoolNameDv', 'text', 'ސްކޫލް ނަން ލިޔުއްވާ')}
                        {renderInput('School Code', 'ސްކޫލް ކޯޑު', 'schoolCode', 'text', 'e.g., SCH-001')}
                        {renderSelect('School Type', 'ސްކޫލް ވައްތަރު', 'schoolType', [
                            { value: 'primary', label: 'Primary School' },
                            { value: 'secondary', label: 'Secondary School' },
                            { value: 'higher-secondary', label: 'Higher Secondary' },
                            { value: 'combined', label: 'Combined School' },
                        ])}
                        {renderInput('Established Year', 'ފެށުނު އަހަރު', 'establishedYear', 'number', 'e.g., 1990')}
                        {renderSelect('Atoll', 'އަތޮޅު', 'atoll', [
                            { value: 'male', label: "Male'" },
                            { value: 'ha', label: 'H.A Atoll' },
                            { value: 'hdh', label: 'H.Dh Atoll' },
                            { value: 'sh', label: 'Sh. Atoll' },
                            { value: 'n', label: 'N. Atoll' },
                            { value: 'r', label: 'R. Atoll' },
                            { value: 'b', label: 'B. Atoll' },
                            { value: 'lh', label: 'Lh. Atoll' },
                            { value: 'k', label: 'K. Atoll' },
                            { value: 'aa', label: 'A.A Atoll' },
                            { value: 'adh', label: 'A.Dh Atoll' },
                            { value: 'v', label: 'V. Atoll' },
                            { value: 'm', label: 'M. Atoll' },
                            { value: 'f', label: 'F. Atoll' },
                            { value: 'dh', label: 'Dh. Atoll' },
                            { value: 'th', label: 'Th. Atoll' },
                            { value: 'l', label: 'L. Atoll' },
                            { value: 'ga', label: 'G.A Atoll' },
                            { value: 'gdh', label: 'G.Dh Atoll' },
                            { value: 'gn', label: 'Gn. Atoll' },
                            { value: 's', label: 'S. Atoll' },
                        ])}
                        {renderInput('Island', 'ރަށް', 'island', 'text', 'Enter island name')}
                        {renderInput('Address', 'އެޑްރެސް', 'address', 'text', 'Full address')}
                    </div>
                );
            
            case 'contact':
                return (
                    <div className="form-grid">
                        {renderInput('Phone Number', 'ފޯނު ނަންބަރު', 'phone', 'tel', '+960 xxx xxxx')}
                        {renderInput('Fax Number', 'ފެކްސް ނަންބަރު', 'fax', 'tel', '+960 xxx xxxx')}
                        {renderInput('Email Address', 'އީމެއިލް', 'email', 'email', 'school@email.com')}
                        {renderInput('Website', 'ވެބްސައިޓް', 'website', 'url', 'https://')}
                        {renderInput('Principal Phone', 'ޕްރިންސިޕަލް ފޯނު', 'principalPhone', 'tel', '+960 xxx xxxx')}
                        {renderInput('Emergency Contact', 'އެމަޖެންސީ ނަންބަރު', 'emergencyContact', 'tel', '+960 xxx xxxx')}
                    </div>
                );

            case 'administration':
                return (
                    <div className="form-grid">
                        {renderInput('Principal Name', 'ޕްރިންސިޕަލް ނަން', 'principalName', 'text', 'Full name')}
                        {renderInput('Principal Name (Dhivehi)', 'ޕްރިންސިޕަލް ނަން (ދިވެހި)', 'principalNameDv', 'text', 'ފުރިހަމަ ނަން')}
                        {renderInput('Deputy Principal', 'ޑެޕިއުޓީ ޕްރިންސިޕަލް', 'deputyPrincipalName', 'text', 'Full name')}
                        {renderInput('Admin Officer', 'އެޑްމިން އޮފިސަރ', 'adminOfficerName', 'text', 'Full name')}
                        {renderInput('Total Admin Staff', 'ޖުމްލަ އެޑްމިން ސްޓާފް', 'totalAdminStaff', 'number', '0')}
                    </div>
                );

            case 'teachers':
                return (
                    <div className="form-grid">
                        {renderInput('Total Teachers', 'ޖުމްލަ މުދައްރިސުން', 'totalTeachers', 'number', '0')}
                        {renderInput('Male Teachers', 'ފިރިހެން މުދައްރިސުން', 'maleTeachers', 'number', '0')}
                        {renderInput('Female Teachers', 'އަންހެން މުދައްރިސުން', 'femaleTeachers', 'number', '0')}
                        {renderInput('Qualified Teachers', 'ތައުލީމީ މުދައްރިސުން', 'qualifiedTeachers', 'number', '0')}
                        {renderInput('Trained Teachers', 'ތަމްރީނު ލިބިފައިވާ', 'trainedTeachers', 'number', '0')}
                        {renderInput('Expatriate Teachers', 'ބިދޭސީ މުދައްރިސުން', 'expatTeachers', 'number', '0')}
                    </div>
                );

            case 'support':
                return (
                    <div className="form-grid">
                        {renderInput('Total Support Staff', 'ޖުމްލަ ސަޕޯޓް ސްޓާފް', 'totalSupportStaff', 'number', '0')}
                        {renderInput('Counselors', 'ކައުންސެލަރުން', 'counselors', 'number', '0')}
                        {renderInput('Librarians', 'ލައިބްރޭރިއަނުން', 'librarians', 'number', '0')}
                        {renderInput('Lab Assistants', 'ލެބް އެސިސްޓެންޓުން', 'labAssistants', 'number', '0')}
                        {renderInput('IT Staff', 'އައިޓީ ސްޓާފް', 'itStaff', 'number', '0')}
                    </div>
                );

            case 'students':
                return (
                    <div className="form-grid">
                        {renderInput('Total Students', 'ޖުމްލަ ދަރިވަރުން', 'totalStudents', 'number', '0')}
                        {renderInput('Male Students', 'ފިރިހެން ދަރިވަރުން', 'maleStudents', 'number', '0')}
                        {renderInput('Female Students', 'އަންހެން ދަރިވަރުން', 'femaleStudents', 'number', '0')}
                        {renderInput('Foundation Stage', 'ފައުންޑޭޝަން ސްޓޭޖް', 'foundationStudents', 'number', '0')}
                        {renderInput('Primary (Grade 1-6)', 'ޕްރައިމަރީ', 'primaryStudents', 'number', '0')}
                        {renderInput('Secondary (Grade 7-10)', 'ސެކަންޑަރީ', 'secondaryStudents', 'number', '0')}
                        {renderInput('Higher Secondary', 'ހަޔަރ ސެކަންޑަރީ', 'higherSecondaryStudents', 'number', '0')}
                    </div>
                );

            case 'sen':
                return (
                    <div className="form-grid">
                        {renderInput('Total SEN Students', 'ޖުމްލަ ސެން ދަރިވަރުން', 'totalSenStudents', 'number', '0')}
                        {renderInput('SEN Teachers', 'ސެން މުދައްރިސުން', 'senTeachers', 'number', '0')}
                        {renderInput('SEN Facilities Description', 'ސެން ވަސީލަތްތައް', 'senFacilities', 'text', 'Describe available facilities')}
                    </div>
                );

            case 'infrastructure':
                return (
                    <div className="form-grid">
                        {renderInput('Total Classrooms', 'ޖުމްލަ ކްލާސްރޫމް', 'totalClassrooms', 'number', '0')}
                        {renderInput('Total Buildings', 'ޖުމްލަ އިމާރާތް', 'totalBuildings', 'number', '0')}
                        {renderInput('Playground Area (sqm)', 'ކުޅޭ ސަރަހައްދު', 'playgroundArea', 'number', '0')}
                        <div className="checkbox-group">
                            {renderCheckbox('Has Library', 'ލައިބްރަރީ އެބަހުރި', 'hasLibrary')}
                            {renderCheckbox('Has Science Lab', 'ސައިންސް ލެބް އެބަހުރި', 'hasScienceLab')}
                            {renderCheckbox('Has Computer Lab', 'ކޮމްޕިއުޓަރ ލެބް އެބަހުރި', 'hasComputerLab')}
                            {renderCheckbox('Has Auditorium', 'އޮޑިޓޯރިއަމް އެބަހުރި', 'hasAuditorium')}
                        </div>
                    </div>
                );

            case 'facilities':
                return (
                    <div className="form-grid checkbox-grid">
                        {renderCheckbox('Cafeteria', 'ކެފެޓީރިއާ', 'hasCafeteria')}
                        {renderCheckbox('Sports Field', 'ކުޅިވަރު ދަނޑު', 'hasSportsField')}
                        {renderCheckbox('Swimming Pool', 'ފެންގަނޑު', 'hasSwimmingPool')}
                        {renderCheckbox('First Aid Room', 'ފަސްޓް އެއިޑް ރޫމް', 'hasFirstAidRoom')}
                        {renderCheckbox('Counseling Room', 'ކައުންސެލިންގ ރޫމް', 'hasCounselingRoom')}
                    </div>
                );

            case 'technology':
                return (
                    <div className="form-grid">
                        {renderCheckbox('Has Internet', 'އިންޓަނެޓް އެބަހުރި', 'hasInternet')}
                        {renderSelect('Internet Speed', 'އިންޓަނެޓް ސްޕީޑް', 'internetSpeed', [
                            { value: 'slow', label: 'Below 10 Mbps' },
                            { value: 'medium', label: '10-50 Mbps' },
                            { value: 'fast', label: '50-100 Mbps' },
                            { value: 'very-fast', label: 'Above 100 Mbps' },
                        ])}
                        {renderInput('Total Computers', 'ޖުމްލަ ކޮމްޕިއުޓަރ', 'totalComputers', 'number', '0')}
                        {renderCheckbox('Has Smart Boards', 'ސްމާޓް ބޯޑް އެބަހުރި', 'hasSmartBoards')}
                        {renderInput('Number of Projectors', 'ޕްރޮޖެކްޓަރ އަދަދު', 'hasProjectors', 'number', '0')}
                    </div>
                );

            case 'safety':
                return (
                    <div className="form-grid">
                        <div className="checkbox-group">
                            {renderCheckbox('Fire Extinguishers', 'ފަޔަރ އެކްސްޓިންގުއިޝަރ', 'hasFireExtinguishers')}
                            {renderCheckbox('Emergency Exits', 'އެމަޖެންސީ އެގްޒިޓް', 'hasEmergencyExits')}
                            {renderCheckbox('First Aid Kit', 'ފަސްޓް އެއިޑް ކިޓް', 'hasFirstAidKit')}
                            {renderCheckbox('Safety Plan', 'ސޭފްޓީ ޕްލޭން', 'hasSafetyPlan')}
                        </div>
                        {renderInput('Last Safety Drill Date', 'އެންމެ ފަހު ސޭފްޓީ ޑްރިލް', 'lastSafetyDrill', 'date')}
                    </div>
                );

            case 'curriculum':
                return (
                    <div className="form-grid">
                        {renderSelect('Curriculum', 'މުގައްރަރު', 'curriculum', [
                            { value: 'national', label: 'National Curriculum' },
                            { value: 'cambridge', label: 'Cambridge' },
                            { value: 'edexcel', label: 'Edexcel' },
                            { value: 'mixed', label: 'Mixed' },
                        ])}
                        {renderSelect('Medium of Instruction', 'ކިޔަވައިދޭ ބަސް', 'mediumOfInstruction', [
                            { value: 'dhivehi', label: 'Dhivehi' },
                            { value: 'english', label: 'English' },
                            { value: 'bilingual', label: 'Bilingual' },
                        ])}
                        {renderInput('Additional Languages', 'އިތުރު ބަސްތައް', 'additionalLanguages', 'text', 'e.g., Arabic, French')}
                        {renderInput('Extra-Curricular Activities', 'އެކްސްޓްރާ ކަރިކިޔުލާ', 'extraCurricular', 'text', 'List activities')}
                    </div>
                );

            case 'academic':
                return (
                    <div className="form-grid">
                        <div className="form-section-title full-width">
                            <h4>Pass Rates (Last 3 Years)</h4>
                        </div>
                        {renderInput('Year 1 (Current)', 'މިއަހަރު', 'passRateYear1', 'number', '0-100%')}
                        {renderInput('Year 2 (Previous)', 'ކުރީ އަހަރު', 'passRateYear2', 'number', '0-100%')}
                        {renderInput('Year 3', '3 ވަނަ އަހަރު', 'passRateYear3', 'number', '0-100%')}
                        <div className="form-section-title full-width">
                            <h4>National Examinations</h4>
                        </div>
                        {renderInput("O'Level Pass Rate (%)", "އޯލެވެލް ޕާސް ރޭޓް", 'oLevelPassRate', 'number', '0-100%')}
                        {renderInput("A'Level Pass Rate (%)", "އޭލެވެލް ޕާސް ރޭޓް", 'aLevelPassRate', 'number', '0-100%')}
                        {renderInput('National Exam Ranking', 'ގައުމީ އިމްތިހާނު ރޭންކިން', 'nationalExamRanking', 'text', 'e.g., Top 10')}
                        <div className="form-section-title full-width">
                            <h4>Subject Performance</h4>
                        </div>
                        {renderInput('Top Performing Subject', 'އެންމެ މޮޅު މާއްދާ', 'topPerformingSubject', 'text', 'e.g., Mathematics')}
                        {renderInput('Needs Improvement', 'ރަނގަޅުކުރަންޖެހޭ މާއްދާ', 'needsImprovementSubject', 'text', 'e.g., English')}
                        <div className="form-section-title full-width">
                            <h4>Literacy & Numeracy</h4>
                        </div>
                        {renderInput('Literacy Rate (%)', 'ލިޓެރެސީ ރޭޓް', 'literacyRate', 'number', '0-100%')}
                        {renderInput('Numeracy Rate (%)', 'ނިއުމެރެސީ ރޭޓް', 'numeracyRate', 'number', '0-100%')}
                    </div>
                );

            case 'budget':
                return (
                    <div className="form-grid">
                        <div className="form-section-title full-width">
                            <h4>Annual Budget</h4>
                        </div>
                        {renderInput('Total Annual Budget (MVR)', 'ޖުމްލަ އަހަރީ ބަޖެޓް', 'annualBudget', 'number', 'Amount in Rufiyaa')}
                        {renderInput('Government Funding (MVR)', 'ސަރުކާރު ފަންޑިން', 'governmentFunding', 'number', 'Amount in Rufiyaa')}
                        {renderInput('Other Funding Sources (MVR)', 'އެހެނިހެން ފަންޑިން', 'otherFunding', 'number', 'Donations, grants, etc.')}
                        <div className="form-section-title full-width">
                            <h4>Budget Allocation</h4>
                        </div>
                        {renderInput('Teacher Salaries (%)', 'މުދައްރިސުންގެ މުސާރަ', 'teacherSalaryBudget', 'number', '% of budget')}
                        {renderInput('Infrastructure (%)', 'އިންފްރާސްޓްރަކްޗަރ', 'infrastructureBudget', 'number', '% of budget')}
                        {renderInput('Resources & Materials (%)', 'ވަސީލަތްތައް', 'resourcesBudget', 'number', '% of budget')}
                        {renderInput('Maintenance (%)', 'މެއިންޓެނެންސް', 'maintenanceBudget', 'number', '% of budget')}
                        <div className="form-section-title full-width">
                            <h4>Financial Audit</h4>
                        </div>
                        {renderCheckbox('Has Audit Report', 'އޮޑިޓް ރިޕޯޓް އެބައޮތް', 'hasAuditReport')}
                        {renderInput('Last Audit Date', 'އެންމެ ފަހު އޮޑިޓް', 'lastAuditDate', 'date')}
                    </div>
                );

            case 'community':
                return (
                    <div className="form-grid">
                        <div className="form-section-title full-width">
                            <h4>Parent Engagement</h4>
                        </div>
                        {renderInput('PTA Meetings Per Year', 'ޕީޓީއޭ ބައްދަލުވުން/އަހަރު', 'ptaMeetingsPerYear', 'number', '0')}
                        {renderInput('Parent Volunteers', 'ބެލެނިވެރި ވޮލަންޓިއަރުން', 'parentVolunteers', 'number', '0')}
                        {renderInput('Parent Satisfaction Rate (%)', 'ބެލެނިވެރިންގެ ހިތްހަމަޖެހުން', 'parentSatisfactionRate', 'number', '0-100%')}
                        {renderSelect('Parent Engagement Level', 'ބެލެނިވެރިންގެ ބައިވެރިވުން', 'parentEngagementLevel', [
                            { value: 'high', label: 'High' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'low', label: 'Low' },
                        ])}
                        <div className="form-section-title full-width">
                            <h4>Communication</h4>
                        </div>
                        {renderCheckbox('Has Parent Portal', 'ޕޭރެންޓް ޕޯޓަލް އެބައޮތް', 'hasParentPortal')}
                        {renderSelect('Primary Communication Method', 'މައިގަނޑު މުއާމަލާތުގެ ގޮތް', 'parentCommunicationMethod', [
                            { value: 'app', label: 'Mobile App' },
                            { value: 'sms', label: 'SMS' },
                            { value: 'email', label: 'Email' },
                            { value: 'whatsapp', label: 'WhatsApp/Viber' },
                            { value: 'meetings', label: 'In-Person Meetings' },
                            { value: 'newsletter', label: 'Newsletter' },
                        ])}
                        <div className="form-section-title full-width">
                            <h4>Community Partnership</h4>
                        </div>
                        {renderInput('Community Partners', 'މުޖުތަމައު ޕާޓްނަރުން', 'communityPartners', 'number', 'Number of partners')}
                        {renderInput('Community Projects', 'މުޖުތަމައު ޕްރޮޖެކްޓްތައް', 'communityProjects', 'text', 'List ongoing projects')}
                    </div>
                );

            case 'achievements':
                return (
                    <div className="form-grid">
                        <div className="form-section-title full-width">
                            <h4>Awards & Recognition</h4>
                        </div>
                        {renderInput('National Awards', 'ގައުމީ އެވޯޑްތައް', 'nationalAwards', 'text', 'List awards received')}
                        {renderInput('Atoll/Regional Awards', 'އަތޮޅު އެވޯޑްތައް', 'atollAwards', 'text', 'List awards received')}
                        {renderInput('Environmental Awards', 'ތިމާވެށި އެވޯޑްތައް', 'environmentalAwards', 'text', 'List awards received')}
                        <div className="form-section-title full-width">
                            <h4>Student Achievements</h4>
                        </div>
                        {renderInput('Academic Achievements', 'އެކެޑެމިކް ކާމިޔާބީތައް', 'academicAchievements', 'text', 'Competitions, olympiads, etc.')}
                        {renderInput('Sports Achievements', 'ކުޅިވަރު ކާމިޔާބީތައް', 'sportsAchievements', 'text', 'Championships, medals, etc.')}
                        {renderInput('Cultural Achievements', 'ސަގާފީ ކާމިޔާބީތައް', 'culturalAchievements', 'text', 'Arts, music, drama, etc.')}
                        <div className="form-section-title full-width">
                            <h4>Special Recognition</h4>
                        </div>
                        {renderInput('Special Recognitions', 'ހާއްސަ ފާހަގަކުރުންތައް', 'specialRecognitions', 'text', 'Any other notable achievements')}
                    </div>
                );

            default:
                return <p>Section content not available</p>;
        }
    };

    return (
        <div className="school-profile">
            {/* Header */}
            <header className="profile-header">
                <div className="profile-title">
                    <h1>
                        <span className="title-en">School Profile</span>
                        <span className="title-dv font-dhivehi" dir="rtl">ސްކޫލް ޕްރޮފައިލް</span>
                    </h1>
                </div>
                <div className="header-actions">
                    <div className="progress-indicator">
                        <span className="progress-count">{savedSections.length}/{allSections.length}</span>
                        <span className="progress-label">Saved</span>
                    </div>
                    <button 
                        className="save-all-btn"
                        onClick={handleSaveAll}
                        disabled={isSaving}
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving...' : 'Save All'}
                    </button>
                </div>
            </header>

            {/* Primary Tabs Row */}
            <div className="tab-row primary-tabs">
                {primaryTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isSaved = savedSections.includes(tab.id);
                    return (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''} ${isSaved ? 'saved' : ''}`}
                            onClick={() => handleTabClick(tab.id)}
                        >
                            <Icon size={16} className="tab-icon" />
                            <span className="tab-label">{tab.label}</span>
                            {isSaved && <CheckCircle size={14} className="tab-saved-icon" />}
                        </button>
                    );
                })}
            </div>

            {/* Secondary Tabs Row */}
            <div className="tab-row secondary-tabs">
                {secondaryTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isSaved = savedSections.includes(tab.id);
                    return (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''} ${isSaved ? 'saved' : ''}`}
                            onClick={() => handleTabClick(tab.id)}
                        >
                            <Icon size={16} className="tab-icon" />
                            <span className="tab-label">{tab.label}</span>
                            {isSaved && <CheckCircle size={14} className="tab-saved-icon" />}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="profile-content">
                {/* Content Header */}
                <div className="content-header">
                    <div className="content-title">
                        {currentTab && (
                            <>
                                <currentTab.icon size={24} className="content-icon" />
                                <div>
                                    <h2>{currentTab.label}</h2>
                                    <span className="content-title-dv font-dhivehi" dir="rtl">
                                        {currentTab.labelDv}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="content-actions">
                        {savedSections.includes(activeTab) && (
                            <span className="saved-badge">
                                <CheckCircle size={16} />
                                Saved
                            </span>
                        )}
                        <button 
                            className="save-section-btn"
                            onClick={handleSaveSection}
                            disabled={isSaving}
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save Section'}
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="form-content">
                    {renderSectionContent(activeTab)}
                </div>
            </div>
        </div>
    );
}

export default SchoolProfile;
