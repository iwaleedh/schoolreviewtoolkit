/**
 * Support Page
 * 
 * Help center with FAQs, guides, and contact information
 */

import { useState, useRef } from 'react';
import {
    HelpCircle,
    Book,
    MessageCircle,
    Phone,
    Mail,
    Video,
    FileText,
    ChevronDown,
    ChevronUp,
    Search,
    ExternalLink,
    Clock,
    CheckCircle,
    AlertCircle,
    Lightbulb,
    Users,
    Settings,
    BarChart3,
    ClipboardList,
    Send,
    Star,
    MessageSquare,
    Paperclip,
    X,
    Image,
    File,
    FileImage,
} from 'lucide-react';
import './Support.css';

// FAQ categories and questions
const faqCategories = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        titleDv: 'ފެށުން',
        icon: Book,
        faqs: [
            {
                q: 'How do I start a school review?',
                qDv: 'ސްކޫލް ރިވިއު ފަށާނީ ކިހިނެއް؟',
                a: 'Navigate to "Review Toolkit" from the sidebar menu. Select the appropriate tab (Leading Teacher, Principal, Admin, etc.) and begin completing the checklist indicators. Each indicator can be marked as Met (✓), Not Met (✗), or Not Reviewed (NR).',
            },
            {
                q: 'What is the SIQAAF Framework?',
                qDv: 'ސިގާފް ފްރޭމްވޯކް އަކީ ކޮބާ؟',
                a: 'SIQAAF is the School Improvement and Quality Assurance Assessment Framework used by the Ministry of Education, Maldives. It consists of 5 Dimensions: Inclusivity, Teaching & Learning, Health & Safety, Community, and Leadership.',
            },
            {
                q: 'How do I complete the School Profile?',
                qDv: 'ސްކޫލް ޕްރޮފައިލް ފުރިހަމަ ކުރާނީ ކިހިނެއް؟',
                a: 'Go to "School Profile" from the sidebar. Fill in all 16 sections including Basic Information, Contact Details, Staff numbers, Student enrollment, Infrastructure, and more. Click "Save Section" after completing each tab, or "Save All" when finished.',
            },
            {
                q: 'Who should complete the school review?',
                qDv: 'ސްކޫލް ރިވިއު ފުރިހަމަ ކުރަންވީ ކާކު؟',
                a: 'The school review should be completed collaboratively:\n• Principal: Overall coordination and Principal checklist\n• Leading Teachers: LT checklists and classroom observations\n• Admin Staff: Administrative and budget sections\n• Department Heads: Subject-specific indicators\n\nThe Principal is responsible for final verification and submission.',
            },
            {
                q: 'How long does a complete review take?',
                qDv: 'ރިވިއު އެއް ފުރިހަމަ ކުރަން ނަގާނީ ކިހާ ވަގުތެއް؟',
                a: 'A thorough school review typically takes 2-4 weeks depending on school size:\n• Small schools (under 300 students): 1-2 weeks\n• Medium schools (300-800 students): 2-3 weeks\n• Large schools (800+ students): 3-4 weeks\n\nWe recommend completing one dimension per week for best results.',
            },
            {
                q: 'Can multiple users work on the review simultaneously?',
                qDv: 'އެއް ވަގުތެއްގައި އެތައް ބަޔަކު މަސައްކަތް ކުރެވޭނެތަ؟',
                a: 'Yes! Multiple authorized users can work on different sections simultaneously. Each user should be assigned specific checklists to avoid conflicts. Changes are synced automatically when saved.',
            },
        ],
    },
    {
        id: 'checklists',
        title: 'Checklists & Indicators',
        titleDv: 'ޗެކްލިސްޓް އަދި އިންޑިކޭޓަރ',
        icon: ClipboardList,
        faqs: [
            {
                q: 'What do the indicator scores mean?',
                qDv: 'އިންޑިކޭޓަރ ސްކޯރތައް ދައްކައިދެނީ ކޮން އެއްޗެއް؟',
                a: '✓ (Met) = The indicator requirement is fully satisfied (score: 1)\n✗ (Not Met) = The indicator requirement is not satisfied (score: 0)\nNR (Not Reviewed) = The indicator has not been assessed yet (no score)',
            },
            {
                q: 'How are Outcome grades calculated?',
                qDv: 'އައުޓްކަމް ގްރޭޑް ހިސާބުކުރާ ގޮތް؟',
                a: 'Outcome grades are based on the percentage of met indicators:\n• FA (Fully Achieved) = ≥90%\n• MA (Mostly Achieved) = 70-89%\n• A (Achieved) = 50-69%\n• NS (Not Sufficient) = <50%\n• NR (Not Reviewed) = No data',
            },
            {
                q: 'What is the 60% threshold rule?',
                qDv: '60% ތްރެޝޯލްޑް ރޫލް އަކީ ކޮބާ؟',
                a: 'For Leading Teacher checklists with multiple observers (LT1-LT10), an indicator is considered "Met" if 60% or more of the observers marked it as Met. This ensures fair assessment across multiple viewpoints.',
            },
            {
                q: 'Can I edit scores after saving?',
                qDv: 'ސޭވް ކުރުމަށްފަހު ސްކޯރ ބަދަލުކުރެވޭނެތަ؟',
                a: 'Yes, you can edit scores at any time before final submission. Simply navigate to the relevant checklist, update the indicator scores, and save again. All changes are tracked in the audit log.',
            },
            {
                q: 'What evidence should I collect for indicators?',
                qDv: 'އިންޑިކޭޓަރތަކަށް ހެކި ހޯދާނީ ކިހިނެއް؟',
                a: 'Evidence types vary by indicator but may include:\n• Documents (policies, plans, records)\n• Photos of facilities or displays\n• Meeting minutes and attendance\n• Student work samples\n• Observation notes\n• Survey results\n\nKeep evidence organized by dimension for easy reference during external reviews.',
            },
            {
                q: 'How do I handle indicators that don\'t apply to my school?',
                qDv: 'ސްކޫލަށް ނުގުޅޭ އިންޑިކޭޓަރތައް ހަދާނީ ކިހިނެއް؟',
                a: 'Mark indicators that genuinely don\'t apply as "NR" (Not Reviewed) and add a comment explaining why. For example, a primary school may mark secondary-level indicators as NR. These won\'t count against your score but must be justified.',
            },
            {
                q: 'What is the difference between LT1 and LT2 checklists?',
                qDv: 'LT1 އާއި LT2 ޗެކްލިސްޓް ތަފާތީ ކޮން ގޮތަކުން؟',
                a: 'LT1 (Leading Teacher 1) focuses on classroom environment, learning resources, and student engagement. LT2 (Leading Teacher 2) focuses on teaching methodology, assessment practices, and differentiation. Both should be completed for a comprehensive teaching evaluation.',
            },
        ],
    },
    {
        id: 'analytics',
        title: 'Analytics & Reports',
        titleDv: 'އެނަލިޓިކްސް އަދި ރިޕޯޓް',
        icon: BarChart3,
        faqs: [
            {
                q: 'How do I view my school\'s performance?',
                qDv: 'ސްކޫލުގެ ޕާފޯމަންސް ބަލާނީ ކިހިނެއް؟',
                a: 'Go to "Analytics" from the sidebar. You\'ll see an overview of scores across all dimensions, strengths and weaknesses analysis, and comparison charts. Use the view toggle to switch between Overview, Schools, and Dimensions views.',
            },
            {
                q: 'How do I generate a report?',
                qDv: 'ރިޕޯޓް ހައްދާނީ ކިހިނެއް؟',
                a: 'Navigate to "Reports" from the sidebar. Click "Generate Report" to access the report generator. You can:\n• Download as PDF (via print dialog)\n• Export data as CSV\n• Print directly',
            },
            {
                q: 'What do the dimension colors represent?',
                qDv: 'ޑައިމެންޝަން ކުލަތައް ރަމްޒުކޮށްދެނީ ކޮން އެއްޗެއް؟',
                a: 'Each dimension has a unique color for easy identification:\n• D1 Inclusivity = Purple\n• D2 Teaching & Learning = Indigo\n• D3 Health & Safety = Green\n• D4 Community = Amber\n• D5 Leadership = Rose',
            },
            {
                q: 'How do I identify areas for improvement?',
                qDv: 'ރަނގަޅުކުރަންޖެހޭ ދާއިރާތައް ދެނެގަންނާނީ ކިހިނެއް؟',
                a: 'The Analytics dashboard highlights:\n• Lowest scoring dimensions with red indicators\n• "Areas for Improvement" section showing weakest substrands\n• Schools Needing Attention alerts\n\nFocus improvement efforts on indicators and outcomes graded NS (Not Sufficient) first.',
            },
            {
                q: 'Can I compare my school with others?',
                qDv: 'އެހެން ސްކޫލުތަކާ އަޅާކިޔޭނެތަ؟',
                a: 'Yes, the Analytics dashboard includes:\n• School Rankings table showing all schools\n• Dimension-wise comparison filters\n• Atoll/regional averages\n• National benchmarks\n\nUse these to identify best practices from high-performing schools.',
            },
            {
                q: 'How often should I generate reports?',
                qDv: 'ރިޕޯޓް ހައްދަންވީ ކިހާ ގިނައިން؟',
                a: 'We recommend generating reports:\n• Weekly during active review periods (progress tracking)\n• Monthly for management review\n• Quarterly for school board meetings\n• Annually for official QAD submission\n\nInterim reports help track progress; final reports are for official records.',
            },
        ],
    },
    {
        id: 'technical',
        title: 'Technical Help',
        titleDv: 'ޓެކްނިކަލް އެހީ',
        icon: Settings,
        faqs: [
            {
                q: 'The page is loading slowly. What should I do?',
                qDv: 'ޕޭޖް ލޯޑްވުން ލަސްވެއްޖެ. ކީއްކުރާނީ؟',
                a: 'Try these solutions:\n1. Refresh the page (Ctrl+R or Cmd+R)\n2. Clear your browser cache\n3. Check your internet connection\n4. Try a different browser (Chrome recommended)\n5. Contact support if the issue persists',
            },
            {
                q: 'My data wasn\'t saved. What happened?',
                qDv: 'ޑޭޓާ ސޭވް ނުވީ. ވީގޮތަކީ ކޮބާ؟',
                a: 'Data may not save if:\n• You lost internet connection\n• The session expired (please log in again)\n• There was a server error\n\nAlways wait for the "Saved" confirmation before navigating away. If issues persist, contact technical support.',
            },
            {
                q: 'Which browsers are supported?',
                qDv: 'ސަޕޯޓްކުރާ ބްރައުޒާތައް؟',
                a: 'The School Review Toolkit works best on:\n• Google Chrome (recommended)\n• Mozilla Firefox\n• Microsoft Edge\n• Safari\n\nPlease ensure your browser is updated to the latest version for the best experience.',
            },
            {
                q: 'Can I use the app on mobile devices?',
                qDv: 'މޯބައިލް ޑިވައިސްތަކުގައި ބޭނުންކުރެވޭނެތަ؟',
                a: 'Yes! The School Review Toolkit is fully responsive and works on tablets and smartphones. For the best experience on mobile, we recommend using the device in landscape orientation when completing checklists.',
            },
            {
                q: 'How do I reset my password?',
                qDv: 'ޕާސްވޯޑް ރީސެޓް ކުރާނީ ކިހިނެއް؟',
                a: 'To reset your password:\n1. Click "Forgot Password" on the login page\n2. Enter your registered email address\n3. Check your email for reset link\n4. Create a new strong password\n\nIf you don\'t receive the email within 5 minutes, check spam folder or contact support.',
            },
            {
                q: 'Can I work offline?',
                qDv: 'އިންޓަނެޓާ ނުލައި މަސައްކަތް ކުރެވޭނެތަ؟',
                a: 'Limited offline functionality is available:\n• View previously loaded checklists\n• Make changes locally\n• Changes sync when connection is restored\n\nHowever, we recommend working online for the best experience and to ensure data is saved properly.',
            },
            {
                q: 'How do I clear the browser cache?',
                qDv: 'ބްރައުޒާ ކެޗް ސާފުކުރާނީ ކިހިނެއް؟',
                a: 'To clear cache:\n\nChrome: Settings > Privacy > Clear browsing data\nFirefox: Settings > Privacy > Clear Data\nEdge: Settings > Privacy > Clear browsing data\nSafari: Preferences > Privacy > Manage Website Data\n\nSelect "Cached images and files" and clear for the last 24 hours.',
            },
            {
                q: 'I\'m getting an error message. What should I do?',
                qDv: 'އެރަރ މެސެޖެއް އެބަ އާދޭ. ކީއްކުރާނީ؟',
                a: 'When you encounter an error:\n1. Note the error message and code\n2. Take a screenshot if possible\n3. Try refreshing the page\n4. Clear browser cache and try again\n5. If error persists, contact support with details\n\nCommon errors usually resolve with a simple refresh.',
            },
        ],
    },
    {
        id: 'account',
        title: 'Account & Access',
        titleDv: 'އެކައުންޓް އަދި އެކްސެސް',
        icon: Users,
        faqs: [
            {
                q: 'How do I create a new user account?',
                qDv: 'އާ އެކައުންޓެއް ހައްދާނީ ކިހިނެއް؟',
                a: 'New accounts are created by school administrators or the QAD:\n1. Contact your school Principal or Admin\n2. Provide your full name, position, and email\n3. You\'ll receive an email invitation\n4. Click the link and set your password\n\nOnly authorized personnel can access the system.',
            },
            {
                q: 'What are the different user roles?',
                qDv: 'ތަފާތު ޔޫޒަރ ރޯލްތަކަކީ ކޮބާ؟',
                a: 'User roles and their permissions:\n• Principal: Full access to school\'s review and reports\n• Teacher: Complete assigned checklists only\n• Admin: School profile and administrative sections\n• QAD Reviewer: External review access\n• System Admin: User management and configuration',
            },
            {
                q: 'How do I change my email address?',
                qDv: 'އީމެއިލް އެޑްރެސް ބަދަލުކުރާނީ ކިހިނެއް؟',
                a: 'To update your email:\n1. Go to your profile settings\n2. Click "Edit" next to email\n3. Enter new email address\n4. Verify through confirmation email\n\nOr contact your school administrator to update it in the system.',
            },
            {
                q: 'My account is locked. What should I do?',
                qDv: 'އެކައުންޓް ލޮކް ވެއްޖެ. ކީއްކުރާނީ؟',
                a: 'Accounts lock after 5 failed login attempts for security. To unlock:\n1. Wait 30 minutes and try again\n2. Use "Forgot Password" to reset\n3. Contact your school admin or support\n\nThis protects your account from unauthorized access.',
            },
        ],
    },
];

// Quick help guides
const quickGuides = [
    {
        title: 'Complete Your First Review',
        titleDv: 'ފުރަތަމަ ރިވިއު ފުރިހަމަކުރުން',
        duration: '5 min',
        icon: ClipboardList,
        steps: ['Open Review Toolkit', 'Select a checklist tab', 'Mark indicators', 'Save your progress'],
    },
    {
        title: 'Update School Profile',
        titleDv: 'ސްކޫލް ޕްރޮފައިލް އަޕްޑޭޓް',
        duration: '10 min',
        icon: Users,
        steps: ['Go to School Profile', 'Fill each section', 'Save sections', 'Verify information'],
    },
    {
        title: 'Generate a Report',
        titleDv: 'ރިޕޯޓް ހެދުން',
        duration: '2 min',
        icon: FileText,
        steps: ['Navigate to Reports', 'Review summary', 'Click Download PDF', 'Print or share'],
    },
    {
        title: 'Analyze Performance',
        titleDv: 'ޕާފޯމަންސް ދެނެގަތުން',
        duration: '5 min',
        icon: BarChart3,
        steps: ['Open Analytics', 'View dimension scores', 'Check strengths/weaknesses', 'Compare trends'],
    },
];

// Contact information
const contactInfo = {
    phone: '+960 334-1111',
    email: 'support@moe.gov.mv',
    hours: 'Sunday - Thursday, 8:00 AM - 4:00 PM',
    address: 'Ministry of Education, Velaanaage, Ameer Ahmed Magu, Male\', Maldives',
};

function Support() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [activeCategory, setActiveCategory] = useState('getting-started');
    
    // Feedback form state
    const [feedbackForm, setFeedbackForm] = useState({
        name: '',
        email: '',
        school: '',
        category: '',
        subject: '',
        message: '',
        rating: 0,
    });
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const fileInputRef = useRef(null);

    // Max file size: 5MB, Max files: 3
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const MAX_FILES = 3;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    const toggleFaq = (categoryId, faqIndex) => {
        const key = `${categoryId}-${faqIndex}`;
        setExpandedFaq(expandedFaq === key ? null : key);
    };

    const handleFeedbackChange = (field, value) => {
        setFeedbackForm(prev => ({ ...prev, [field]: value }));
    };

    const handleRatingClick = (rating) => {
        setFeedbackForm(prev => ({ ...prev, rating }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            // Check if we've reached max files
            if (attachments.length >= MAX_FILES) {
                alert(`Maximum ${MAX_FILES} files allowed`);
                return;
            }
            
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
                return;
            }
            
            // Check file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                alert(`File type not supported. Please upload images (JPG, PNG, GIF) or documents (PDF, DOC, DOCX).`);
                return;
            }
            
            // Add file with preview
            const newAttachment = {
                id: Date.now() + Math.random(),
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            };
            
            setAttachments(prev => [...prev, newAttachment]);
        });
        
        // Reset input
        e.target.value = '';
    };

    const handleRemoveAttachment = (id) => {
        setAttachments(prev => {
            const attachment = prev.find(a => a.id === id);
            if (attachment?.preview) {
                URL.revokeObjectURL(attachment.preview);
            }
            return prev.filter(a => a.id !== id);
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return FileImage;
        if (type.includes('pdf')) return FileText;
        return File;
    };

    const handleSubmitFeedback = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate form submission with attachments
        console.log('Submitting feedback:', feedbackForm);
        console.log('Attachments:', attachments.map(a => ({ name: a.name, size: a.size, type: a.type })));
        
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);
            // Reset form after success
            setTimeout(() => {
                // Clean up attachment previews
                attachments.forEach(a => {
                    if (a.preview) URL.revokeObjectURL(a.preview);
                });
                setAttachments([]);
                setFeedbackForm({
                    name: '',
                    email: '',
                    school: '',
                    category: '',
                    subject: '',
                    message: '',
                    rating: 0,
                });
                setSubmitSuccess(false);
            }, 3000);
        }, 1500);
    };

    // Filter FAQs based on search
    const filteredCategories = faqCategories.map(category => ({
        ...category,
        faqs: category.faqs.filter(
            faq =>
                faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter(category => category.faqs.length > 0 || searchQuery === '');

    return (
        <div className="support-page">
            {/* Header */}
            <header className="support-header">
                <div className="support-title">
                    <h1>
                        <span className="title-en">Help & Support</span>
                        <span className="title-dv font-dhivehi" dir="rtl">އެހީ އަދި ސަޕޯޓް</span>
                    </h1>
                    <p className="support-subtitle">
                        Find answers to common questions and get help using the School Review Toolkit
                    </p>
                </div>
            </header>

            {/* Search Bar */}
            <div className="search-section">
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search for help topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Quick Guides */}
            <section className="quick-guides-section">
                <h2 className="section-title">
                    <Lightbulb size={20} />
                    Quick Guides
                    <span className="section-title-dv font-dhivehi" dir="rtl">އަވަސް ގައިޑް</span>
                </h2>
                <div className="guides-grid">
                    {quickGuides.map((guide, idx) => {
                        const Icon = guide.icon;
                        return (
                            <div key={idx} className="guide-card">
                                <div className="guide-header">
                                    <div className="guide-icon">
                                        <Icon size={24} />
                                    </div>
                                    <div className="guide-meta">
                                        <Clock size={14} />
                                        <span>{guide.duration}</span>
                                    </div>
                                </div>
                                <h3 className="guide-title">{guide.title}</h3>
                                <p className="guide-title-dv font-dhivehi" dir="rtl">{guide.titleDv}</p>
                                <ol className="guide-steps">
                                    {guide.steps.map((step, stepIdx) => (
                                        <li key={stepIdx}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <h2 className="section-title">
                    <HelpCircle size={20} />
                    Frequently Asked Questions
                    <span className="section-title-dv font-dhivehi" dir="rtl">އާންމު ސުވާލުތައް</span>
                </h2>

                {/* Category Tabs */}
                <div className="faq-tabs">
                    {faqCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <button
                                key={category.id}
                                className={`faq-tab ${activeCategory === category.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                <Icon size={16} />
                                <span>{category.title}</span>
                            </button>
                        );
                    })}
                </div>

                {/* FAQ List */}
                <div className="faq-list">
                    {(searchQuery ? filteredCategories : faqCategories.filter(c => c.id === activeCategory)).map((category) => (
                        <div key={category.id} className="faq-category">
                            {searchQuery && (
                                <h3 className="faq-category-title">
                                    <category.icon size={18} />
                                    {category.title}
                                </h3>
                            )}
                            {category.faqs.map((faq, faqIdx) => {
                                const isExpanded = expandedFaq === `${category.id}-${faqIdx}`;
                                return (
                                    <div key={faqIdx} className={`faq-item ${isExpanded ? 'expanded' : ''}`}>
                                        <button
                                            className="faq-question"
                                            onClick={() => toggleFaq(category.id, faqIdx)}
                                        >
                                            <div className="faq-question-text">
                                                <span className="faq-q-en">{faq.q}</span>
                                                <span className="faq-q-dv font-dhivehi" dir="rtl">{faq.qDv}</span>
                                            </div>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                        {isExpanded && (
                                            <div className="faq-answer">
                                                {faq.a.split('\n').map((line, i) => (
                                                    <p key={i}>{line}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    {searchQuery && filteredCategories.length === 0 && (
                        <div className="no-results">
                            <AlertCircle size={24} />
                            <p>No results found for "{searchQuery}"</p>
                            <button onClick={() => setSearchQuery('')}>Clear search</button>
                        </div>
                    )}
                </div>
            </section>

            {/* Feedback Form Section */}
            <section className="feedback-section">
                <h2 className="section-title">
                    <MessageSquare size={20} />
                    Send Feedback or Report an Issue
                    <span className="section-title-dv font-dhivehi" dir="rtl">ފީޑްބެކް ފޮނުއްވާ</span>
                </h2>
                
                {submitSuccess ? (
                    <div className="feedback-success">
                        <CheckCircle size={48} />
                        <h3>Thank you for your feedback!</h3>
                        <p>We've received your message and will respond within 24 hours.</p>
                        <p className="font-dhivehi" dir="rtl">ތިޔަބޭފުޅާގެ ފީޑްބެކް ލިބިއްޖެ. 24 ގަޑިއިރު ތެރޭ ޖަވާބު ލިބޭނެ.</p>
                    </div>
                ) : (
                    <form className="feedback-form" onSubmit={handleSubmitFeedback}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">
                                    Full Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={feedbackForm.name}
                                    onChange={(e) => handleFeedbackChange('name', e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">
                                    Email Address <span className="required">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={feedbackForm.email}
                                    onChange={(e) => handleFeedbackChange('email', e.target.value)}
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="school">School Name</label>
                                <input
                                    type="text"
                                    id="school"
                                    value={feedbackForm.school}
                                    onChange={(e) => handleFeedbackChange('school', e.target.value)}
                                    placeholder="Enter your school name"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="category">
                                    Category <span className="required">*</span>
                                </label>
                                <select
                                    id="category"
                                    value={feedbackForm.category}
                                    onChange={(e) => handleFeedbackChange('category', e.target.value)}
                                    required
                                >
                                    <option value="">Select a category...</option>
                                    <option value="bug">Bug Report / Technical Issue</option>
                                    <option value="feature">Feature Request</option>
                                    <option value="question">General Question</option>
                                    <option value="feedback">General Feedback</option>
                                    <option value="account">Account / Access Issue</option>
                                    <option value="data">Data / Report Issue</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject">
                                Subject <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="subject"
                                value={feedbackForm.subject}
                                onChange={(e) => handleFeedbackChange('subject', e.target.value)}
                                placeholder="Brief description of your issue or feedback"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">
                                Message <span className="required">*</span>
                            </label>
                            <textarea
                                id="message"
                                value={feedbackForm.message}
                                onChange={(e) => handleFeedbackChange('message', e.target.value)}
                                placeholder="Please provide as much detail as possible. For bug reports, include steps to reproduce the issue."
                                rows={5}
                                required
                            />
                        </div>

                        {/* File Attachments */}
                        <div className="form-group attachment-group">
                            <label>Attachments</label>
                            <div className="attachment-area">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                                    multiple
                                    className="file-input-hidden"
                                />
                                
                                {attachments.length > 0 && (
                                    <div className="attachment-list">
                                        {attachments.map((attachment) => {
                                            const FileIcon = getFileIcon(attachment.type);
                                            return (
                                                <div key={attachment.id} className="attachment-item">
                                                    {attachment.preview ? (
                                                        <img 
                                                            src={attachment.preview} 
                                                            alt={attachment.name}
                                                            className="attachment-preview"
                                                        />
                                                    ) : (
                                                        <div className="attachment-icon">
                                                            <FileIcon size={24} />
                                                        </div>
                                                    )}
                                                    <div className="attachment-info">
                                                        <span className="attachment-name">{attachment.name}</span>
                                                        <span className="attachment-size">{formatFileSize(attachment.size)}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="attachment-remove"
                                                        onClick={() => handleRemoveAttachment(attachment.id)}
                                                        title="Remove file"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="attach-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={attachments.length >= MAX_FILES}
                                >
                                    <Paperclip size={18} />
                                    {attachments.length === 0 
                                        ? 'Add attachments' 
                                        : `Add more (${attachments.length}/${MAX_FILES})`
                                    }
                                </button>
                                <p className="attachment-hint">
                                    Max {MAX_FILES} files, 5MB each. Supported: JPG, PNG, GIF, PDF, DOC, DOCX
                                </p>
                            </div>
                        </div>

                        <div className="form-group rating-group">
                            <label>How would you rate your experience?</label>
                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-btn ${feedbackForm.rating >= star ? 'active' : ''}`}
                                        onClick={() => handleRatingClick(star)}
                                    >
                                        <Star size={24} fill={feedbackForm.rating >= star ? '#f59e0b' : 'none'} />
                                    </button>
                                ))}
                                <span className="rating-label">
                                    {feedbackForm.rating === 0 && 'Click to rate'}
                                    {feedbackForm.rating === 1 && 'Poor'}
                                    {feedbackForm.rating === 2 && 'Fair'}
                                    {feedbackForm.rating === 3 && 'Good'}
                                    {feedbackForm.rating === 4 && 'Very Good'}
                                    {feedbackForm.rating === 5 && 'Excellent'}
                                </span>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Message
                                    </>
                                )}
                            </button>
                            <p className="form-note">
                                <span className="required">*</span> Required fields
                            </p>
                        </div>
                    </form>
                )}
            </section>

            {/* Contact Section */}
            <section className="contact-section">
                <h2 className="section-title">
                    <MessageCircle size={20} />
                    Other Ways to Contact Us
                    <span className="section-title-dv font-dhivehi" dir="rtl">ގުޅުއްވޭނެ އެހެން ގޮތްތައް</span>
                </h2>
                <div className="contact-grid">
                    <div className="contact-card">
                        <div className="contact-icon phone">
                            <Phone size={24} />
                        </div>
                        <h3>Phone Support</h3>
                        <p className="contact-value">{contactInfo.phone}</p>
                        <p className="contact-hours">
                            <Clock size={14} />
                            {contactInfo.hours}
                        </p>
                    </div>
                    <div className="contact-card">
                        <div className="contact-icon email">
                            <Mail size={24} />
                        </div>
                        <h3>Email Support</h3>
                        <p className="contact-value">
                            <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                        </p>
                        <p className="contact-note">We respond within 24 hours</p>
                    </div>
                    <div className="contact-card">
                        <div className="contact-icon video">
                            <Video size={24} />
                        </div>
                        <h3>Video Tutorials</h3>
                        <p className="contact-value">
                            <a href="#" className="external-link">
                                Watch on YouTube <ExternalLink size={14} />
                            </a>
                        </p>
                        <p className="contact-note">Step-by-step video guides</p>
                    </div>
                </div>
            </section>

            {/* System Status */}
            <section className="status-section">
                <div className="status-card">
                    <CheckCircle size={20} className="status-icon" />
                    <div className="status-content">
                        <span className="status-label">System Status:</span>
                        <span className="status-value">All systems operational</span>
                    </div>
                    <span className="status-time">Last checked: Just now</span>
                </div>
            </section>
        </div>
    );
}

export default Support;
