import { useState, useEffect, useRef, useMemo } from 'react';
import { generateCommentSummary } from '../../utils/textAnalysis';

// WordCloud component using wordcloud2
function WordCloud({ data, width = 400, height = 300 }) {
    const canvasRef = useRef(null);
    const [wordcloud2, setWordcloud2] = useState(null);
    
    useEffect(() => {
        import('wordcloud2').then(module => {
            setWordcloud2(module.default || module);
        });
    }, []);
    
    useEffect(() => {
        if (!wordcloud2 || !canvasRef.current || data.length === 0) return;
        
        const list = data.map(item => [item.text, item.value]);
        
        wordcloud2(canvasRef.current, {
            list,
            gridSize: 8,
            weightFactor: function(size) {
                return Math.pow(size, 0.8) * (height / 100);
            },
            fontFamily: '"Faruma", "MV Waheed", sans-serif',
            color: function() {
                const colors = ['#7c3aed', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];
                return colors[Math.floor(Math.random() * colors.length)];
            },
            rotateRatio: 0,
            backgroundColor: 'transparent',
            shrinkToFit: true,
            minSize: 10
        });
    }, [wordcloud2, data, width, height]);
    
    return (
        <canvas 
            ref={canvasRef} 
            width={width} 
            height={height}
            className="w-full"
        />
    );
}

// Sentiment Chart Component
function SentimentChart({ sentiment }) {
    const { positive, negative, neutral } = sentiment;
    
    return (
        <div className="space-y-3">
            <div>
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-green-600 font-semibold text-sm font-dhivehi">ކުރިއެރުން</span>
                    <span className="text-green-700 font-bold text-sm">{positive}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${positive}%` }}
                    />
                </div>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-yellow-600 font-semibold text-sm font-dhivehi">މެދު</span>
                    <span className="text-yellow-700 font-bold text-sm">{neutral}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${neutral}%` }}
                    />
                </div>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-red-600 font-semibold text-sm font-dhivehi">ކުރިއަރާނޭ ދާއިރު</span>
                    <span className="text-red-700 font-bold text-sm">{negative}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${negative}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// Topic Distribution Component
function TopicDistribution({ categories }) {
    const total = Object.values(categories).flat().length || 1;
    const colors = ['#7c3aed', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];
    
    return (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
            {Object.entries(categories)
                .filter(([, indices]) => indices.length > 0)
                .sort((a, b) => b[1].length - a[1].length)
                .map(([topicName, indices], i) => {
                    const percentage = Math.round((indices.length / total) * 100);
                    return (
                        <div key={topicName} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div 
                                className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: colors[i % colors.length] }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700 truncate">{topicName}</span>
                                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{indices.length} ({percentage}%)</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ 
                                            width: `${percentage}%`,
                                            backgroundColor: colors[i % colors.length]
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}

// Manual Theme Coding Component
function ManualThemeCoding({ comments, stakeholderType, onThemesChange }) {
    const [themes, setThemes] = useState(() => {
        const saved = localStorage.getItem(`themes_${stakeholderType}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [newTheme, setNewTheme] = useState('');
    const [selectedComments, setSelectedComments] = useState(new Set());
    const [activeTheme, setActiveTheme] = useState(null);
    
    useEffect(() => {
        localStorage.setItem(`themes_${stakeholderType}`, JSON.stringify(themes));
        if (onThemesChange) onThemesChange(themes);
    }, [themes, stakeholderType, onThemesChange]);
    
    const addTheme = () => {
        if (!newTheme.trim()) return;
        const colors = ['#7c3aed', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#f97316', '#ec4899'];
        const color = colors[themes.length % colors.length];
        setThemes([...themes, { id: Date.now(), name: newTheme.trim(), commentIds: [], color }]);
        setNewTheme('');
    };
    
    const deleteTheme = (themeId) => {
        setThemes(themes.filter(t => t.id !== themeId));
    };
    
    const toggleCommentSelection = (commentId) => {
        const newSelected = new Set(selectedComments);
        if (newSelected.has(commentId)) {
            newSelected.delete(commentId);
        } else {
            newSelected.add(commentId);
        }
        setSelectedComments(newSelected);
    };
    
    const assignToTheme = (themeId) => {
        setThemes(themes.map(theme => {
            if (theme.id === themeId) {
                const existingIds = new Set(theme.commentIds);
                selectedComments.forEach(id => existingIds.add(id));
                return { ...theme, commentIds: Array.from(existingIds) };
            }
            return theme;
        }));
        setSelectedComments(new Set());
        setActiveTheme(null);
    };
    
    const removeFromTheme = (themeId, commentId) => {
        setThemes(themes.map(theme => {
            if (theme.id === themeId) {
                return { ...theme, commentIds: theme.commentIds.filter(id => id !== commentId) };
            }
            return theme;
        }));
    };
    
    const validComments = comments.filter(c => c && c.comment);
    
    return (
        <div className="space-y-4">
            {/* Add Theme */}
            <div className="flex gap-2 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                <input
                    type="text"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    placeholder="ޓީމު ނަން ލިޔޭ..."
                    className="flex-1 px-4 py-2.5 border border-violet-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
                    onKeyPress={(e) => e.key === 'Enter' && addTheme()}
                    dir="rtl"
                />
                <button
                    onClick={addTheme}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                    އިތުރުކުރާ
                </button>
            </div>
            
            {/* Themes List */}
            {themes.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    {themes.map(theme => (
                        <div 
                            key={theme.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-white shadow-sm"
                            style={{ backgroundColor: theme.color }}
                        >
                            <span className="font-medium">{theme.name}</span>
                            <span className="bg-white/25 px-1.5 py-0.5 rounded-full text-xs">{theme.commentIds.length}</span>
                            <button 
                                onClick={() => deleteTheme(theme.id)}
                                className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Comment Selection */}
            {activeTheme && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-700 mb-3 font-dhivehi">
                        &ldquo;{activeTheme.name}&rdquo; އަށް ކޮމެންޓް ހޮވާ
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => assignToTheme(activeTheme.id)}
                            disabled={selectedComments.size === 0}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm"
                        >
                            {selectedComments.size} ހޮވާފައި
                        </button>
                        <button
                            onClick={() => { setActiveTheme(null); setSelectedComments(new Set()); }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                        >
                            ކެންސަލް
                        </button>
                    </div>
                </div>
            )}
            
            {/* Comments List */}
            <div className="max-h-80 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-3 bg-gray-50/50 custom-scrollbar">
                {validComments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p className="font-dhivehi">ކޮމެންޓް ނުވެއެވެ</p>
                    </div>
                ) : (
                    validComments.map((item) => {
                        const isSelected = selectedComments.has(item.id);
                        const assignedThemes = themes.filter(t => t.commentIds.includes(item.id));
                        
                        return (
                            <div 
                                key={item.id}
                                onClick={() => activeTheme && toggleCommentSelection(item.id)}
                                className={`p-3 rounded-lg text-sm border transition-all ${
                                    isSelected 
                                        ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                } ${activeTheme ? 'cursor-pointer' : ''}`}
                            >
                                <p className="text-gray-700 mb-2 leading-relaxed" dir="rtl">{item.comment}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 font-medium">{item.name}</span>
                                    <div className="flex gap-1 flex-wrap justify-end">
                                        {assignedThemes.map(theme => (
                                            <span 
                                                key={theme.id}
                                                className="text-xs px-2 py-0.5 rounded-full text-white cursor-pointer hover:opacity-80 transition-opacity"
                                                style={{ backgroundColor: theme.color }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromTheme(theme.id, item.id);
                                                }}
                                            >
                                                {theme.name} ✕
                                            </span>
                                        ))}
                                        {!activeTheme && themes.length > 0 && (
                                            <select
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        setActiveTheme(themes.find(t => t.id === parseInt(e.target.value)));
                                                        setSelectedComments(new Set([item.id]));
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                value=""
                                            >
                                                <option value="">ޓީމަށް ލާ...</option>
                                                {themes.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// Main Summary Component
function CommentSummary({ parentsData, studentsData, teachersData }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [activeStakeholder, setActiveStakeholder] = useState('all');
    // eslint-disable-next-line no-unused-vars
    const [stakeholderThemes, setStakeholderThemes] = useState({});
    
    // Get data based on selection
    const getData = () => {
        switch (activeStakeholder) {
            case 'parents': return parentsData;
            case 'students': return studentsData;
            case 'teachers': return teachersData;
            default: return [...parentsData, ...studentsData, ...teachersData];
        }
    };
    
    const currentData = getData();
    const comments = currentData.map(d => d.comment);
    
    // Generate summaries
    const summary = useMemo(() => generateCommentSummary(comments), [comments]);
    
    const stakeholderLabels = {
        all: 'ހުރިހާ ބަޔަކު',
        parents: 'ވާލިދިންނާ',
        students: 'ދަރިވަރުން',
        teachers: 'މުދައްރިސުން'
    };
    
    const tabLabels = {
        overview: 'އޮވަރވިއު',
        keywords: 'ލަފުޒުތައް',
        sentiment: 'ސެންޓިމެންޓް',
        topics: 'މައުދަނު',
        wordcloud: 'ވޯޑް ކްލައުޑް',
        themes: 'ޓީމް ކޯޑިންގ'
    };
    
    return (
        <div className="mb-8 animate-fadeIn">
            {/* Header Section - Matching Dimension Header Style */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-violet-500 relative">
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl font-extrabold text-violet-600 tracking-tight">Comment Summary</span>
                        <span className="text-lg text-gray-500 font-medium font-dhivehi" dir="rtl">ކޮމެންޓްތަކުގެ ޚުލާސާ</span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium px-4 py-2 bg-gray-50 rounded-lg">
                        {currentData.length} ކޮމެންޓް
                    </div>
                </div>
                
                {/* Stakeholder Selector - Segmented Control Style */}
                <div className="flex flex-wrap gap-1 p-1.5 bg-gray-100 rounded-xl">
                    {Object.entries(stakeholderLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setActiveStakeholder(key)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                activeStakeholder === key
                                    ? 'bg-white text-violet-600 shadow-md border border-violet-100'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Stats Cards - Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 text-lg">
                            💬
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-violet-600">{summary.stats.withComments}</p>
                            <p className="text-xs text-gray-500 font-medium font-dhivehi">ޖުމްލަ ކޮމެންޓްތައް</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-lg">
                            😊
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{summary.sentiment.positive}%</p>
                            <p className="text-xs text-gray-500 font-medium font-dhivehi">ކުރިއެރުން</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-lg">
                            🔤
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">{summary.keywords.length}</p>
                            <p className="text-xs text-gray-500 font-medium font-dhivehi">މުހިންމު ލަފުޒުތައް</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-lg">
                            📏
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{summary.stats.avgLength}</p>
                            <p className="text-xs text-gray-500 font-medium font-dhivehi">އާންމު އަކުރުގެ ޢަދަދު</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content Card */}
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow bg-white">
                {/* Tabs Header - Pill Style */}
                <div className="flex overflow-x-auto p-2 bg-gray-50/50 border-b border-gray-100 gap-1">
                    {Object.entries(tabLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all rounded-lg ${
                                activeTab === key
                                    ? 'bg-violet-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                
                {/* Tab Content */}
                <div className="p-5">
                    {activeTab === 'overview' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4 font-dhivehi text-lg flex items-center gap-2">
                                    <span className="text-xl">🏷️</span>
                                    މުހިންމު ލަފުޒުތައް
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {summary.keywords.slice(0, 15).map((kw) => (
                                        <span 
                                            key={kw.word}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm bg-white border border-gray-200 text-gray-700"
                                        >
                                            {kw.word} <span className="text-violet-500 text-xs ml-1">{kw.count}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4 font-dhivehi text-lg flex items-center gap-2">
                                    <span className="text-xl">💭</span>
                                    މުހިންމު ޖުމްލަ ލަފުޒުތައް
                                </h3>
                                <div className="space-y-2">
                                    {summary.phrases.slice(0, 8).map((ph, i) => (
                                        <div key={ph.phrase} className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-100">
                                            <span className="text-sm font-bold text-violet-500 w-6">{i + 1}.</span>
                                            <span className="flex-1 text-sm text-gray-700 font-medium">&ldquo;{ph.phrase}&rdquo;</span>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{ph.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'keywords' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4 font-dhivehi flex items-center gap-2">
                                    <span className="text-xl">🏷️</span>
                                    މުހިންމު ލަފުޒުތައް ({summary.keywords.length})
                                </h3>
                                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                                    {summary.keywords.map((kw, i) => (
                                        <div key={kw.word} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100">
                                            <span className="text-sm font-bold text-violet-500 w-8">#{i + 1}</span>
                                            <span className="flex-1 font-semibold text-gray-700">{kw.word}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-violet-500 rounded-full"
                                                        style={{ width: `${Math.min(100, (kw.count / (summary.keywords[0]?.count || 1)) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-500 w-8 text-right font-medium">{kw.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4 font-dhivehi flex items-center gap-2">
                                    <span className="text-xl">💭</span>
                                    ޖުމްލަ ލަފުޒުތައް ({summary.phrases.length})
                                </h3>
                                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                                    {summary.phrases.map((ph, i) => (
                                        <div key={ph.phrase} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100">
                                            <span className="text-sm font-bold text-violet-500 w-8">#{i + 1}</span>
                                            <span className="flex-1 text-gray-700 italic">&ldquo;{ph.phrase}&rdquo;</span>
                                            <span className="text-sm text-gray-500 font-medium">{ph.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'sentiment' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-5 font-dhivehi text-lg flex items-center gap-2">
                                    <span className="text-xl">📊</span>
                                    އިޖާބަތަކުގެ ޖިންސު
                                </h3>
                                <SentimentChart sentiment={summary.sentiment} />
                                <div className="mt-6 grid grid-cols-3 gap-3">
                                    <div className="text-center p-4 bg-white rounded-xl border border-green-200">
                                        <p className="text-2xl font-bold text-green-600">{summary.sentiment.counts.positive}</p>
                                        <p className="text-xs text-green-700 font-medium mt-1 font-dhivehi">ކުރިއެރުން</p>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl border border-yellow-200">
                                        <p className="text-2xl font-bold text-yellow-600">{summary.sentiment.counts.neutral}</p>
                                        <p className="text-xs text-yellow-700 font-medium mt-1 font-dhivehi">މެދު</p>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl border border-red-200">
                                        <p className="text-2xl font-bold text-red-600">{summary.sentiment.counts.negative}</p>
                                        <p className="text-xs text-red-700 font-medium mt-1 font-dhivehi">ކުރިއަރާނޭ ދާއިރު</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-5 font-dhivehi text-lg flex items-center gap-2">
                                    <span className="text-xl">💬</span>
                                    ބޭނުންވާ ލަފުޒުތައް
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-4 bg-white rounded-xl border border-green-200">
                                        <p className="text-sm font-semibold text-green-700 mb-3 font-dhivehi flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            ކުރިއެރުން
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['ރަނގަޅު', 'މޮޅު', 'good', 'great', 'excellent', 'happy', 'satisfied', 'ފިނި', 'ކުރިއެރުން', 'ކުރިއަރައި'].map(w => (
                                                <span key={w} className="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-lg font-medium border border-green-100">{w}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white rounded-xl border border-red-200">
                                        <p className="text-sm font-semibold text-red-700 mb-3 font-dhivehi flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            ކުރިއަރާނޭ ދާއިރު
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['ނުރަނގަޅު', 'ދަތި', 'bad', 'terrible', 'problem', 'issue', 'concern', 'މުޝްކިލަ', 'ނުފިނި', 'ނުކުރިއަރު'].map(w => (
                                                <span key={w} className="text-xs px-2.5 py-1 bg-red-50 text-red-700 rounded-lg font-medium border border-red-100">{w}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'topics' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4 font-dhivehi text-lg flex items-center gap-2">
                                    <span className="text-xl">📑</span>
                                    މައުދަނުގެ ބެހިފައިވާ ގޮތް
                                </h3>
                                <TopicDistribution categories={summary.categories} />
                            </div>
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h4 className="font-semibold text-gray-800 mb-4 font-dhivehi flex items-center gap-2">
                                    <span className="text-xl">📋</span>
                                    މައުދަން ކެޓަގަރީތައް
                                </h4>
                                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                                    {[
                                        { color: '#7c3aed', label: 'Teaching Quality: ދަސްކުރުމުގެ މައުދަން' },
                                        { color: '#10b981', label: 'Facilities & Infrastructure: ދަމަހައި ހަދިޔާތައް' },
                                        { color: '#3b82f6', label: 'Safety & Security: އަމާންކަން' },
                                        { color: '#f59e0b', label: 'Communication: ކުއުމުނިކަން' },
                                        { color: '#ef4444', label: 'Activities & Events: ހަރަކާތްތައް' },
                                        { color: '#06b6d4', label: 'Administration: އިސްތިއުމާރު' },
                                        { color: '#84cc16', label: 'Resources & Materials: މަސާނައިތައް' },
                                        { color: '#f97316', label: 'Food & Canteen: ކާބޯހަދިޔާ' },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-100">
                                            <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></span>
                                            <span className="font-dhivehi text-gray-700">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'wordcloud' && (
                        <div className="text-center">
                            <h3 className="font-semibold text-gray-800 mb-6 font-dhivehi text-xl flex items-center justify-center gap-2">
                                <span className="text-xl">☁️</span>
                                ވޯޑް ކްލައުޑް
                            </h3>
                            {summary.wordCloudData.length > 0 ? (
                                <div className="flex justify-center bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <WordCloud 
                                        data={summary.wordCloudData} 
                                        width={600} 
                                        height={400}
                                    />
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-100">
                                    <p className="text-gray-400 font-dhivehi text-lg">ކޮމެންޓް ނުވެއެވެ</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'themes' && (
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-3 font-dhivehi text-xl flex items-center gap-2">
                                <span className="text-xl">🏷️</span>
                                މެނޫއަލް ޓީމް ކޯޑިންގ
                            </h3>
                            <p className="text-sm text-gray-500 mb-5 font-dhivehi bg-gray-50 p-3 rounded-lg border border-gray-100">
                                ކޮމެންޓްތައް ކަމަކަށް ބެހިދާ، އަމިއްލަ ޓީމްތައް ހަދާ، އަދި ކޮމެންޓް ޓީމްތަކަށް ހުއްދަދީ
                            </p>
                            <ManualThemeCoding 
                                comments={currentData}
                                stakeholderType={activeStakeholder}
                                onThemesChange={(themes) => {
                                    setStakeholderThemes(prev => ({ ...prev, [activeStakeholder]: themes }));
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CommentSummary;
