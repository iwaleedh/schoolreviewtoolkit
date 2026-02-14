import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import './Dimension.css';
import CommentSummary from './CommentSummary';

function CommentsTable({ title, titleDv }) {
    const [showSummary, setShowSummary] = useState(true);
    
    // Fetch comments from all three sources
    const parentsDataRaw = useQuery(api.parentSurvey.getAllWithComments) ?? { parents: [] };
    const studentsDataRaw = useQuery(api.studentSurvey.getAllWithComments) ?? { students: [] };
    const teachersDataRaw = useQuery(api.teacherSurvey.getAllWithComments) ?? { teachers: [] };
    
    // Normalize data for summary component
    const parentsData = useMemo(() => {
        const data = parentsDataRaw.parents || parentsDataRaw || [];
        return data.map(p => ({
            id: p.parentId || p.id,
            name: p.parentName || p.studentName || p.name || 'Unknown',
            comment: p.comment,
            created: p.created,
            type: 'parent'
        })).filter(p => p.comment);
    }, [parentsDataRaw]);
    
    const studentsData = useMemo(() => {
        const data = studentsDataRaw.students || studentsDataRaw || [];
        return data.map(s => ({
            id: s.studentId || s.id,
            name: s.studentName || s.name || 'Unknown',
            comment: s.comment,
            created: s.created,
            type: 'student'
        })).filter(s => s.comment);
    }, [studentsDataRaw]);
    
    const teachersData = useMemo(() => {
        const data = teachersDataRaw.teachers || teachersDataRaw || [];
        return data.map(t => ({
            id: t.teacherId || t.id,
            name: t.teacherName || t.name || 'Unknown',
            comment: t.comment,
            created: t.created,
            type: 'teacher'
        })).filter(t => t.comment);
    }, [teachersDataRaw]);

    // Combine all comments into rows for table display
    const commentRows = useMemo(() => {
        const rows = [];
        const maxLength = Math.max(parentsData.length, studentsData.length, teachersData.length);

        for (let i = 0; i < maxLength; i++) {
            rows.push({
                parent: parentsData[i] || null,
                student: studentsData[i] || null,
                teacher: teachersData[i] || null,
            });
        }

        return rows;
    }, [parentsData, studentsData, teachersData]);

    // Calculate totals
    const totalParents = parentsData.length;
    const totalStudents = studentsData.length;
    const totalTeachers = teachersData.length;

    if (!parentsDataRaw && !studentsDataRaw && !teachersDataRaw) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading comments...</p>
            </div>
        );
    }

    return (
        <div className="dimension-container editable">
            {/* Header */}
            <div className="dimension-header">
                <h2 className="dimension-title">
                    <span className="title-en">{title}</span>
                    <span className="title-dv font-dhivehi" dir="rtl">{titleDv}</span>
                </h2>
                <div className="dimension-stats">
                    <span className="stat-badge blue font-dhivehi">ވާލިދިންނާ: {totalParents}</span>
                    <span className="stat-badge green font-dhivehi">ދަރިވަރުން: {totalStudents}</span>
                    <span className="stat-badge purple font-dhivehi">މުދައްރިސުން: {totalTeachers}</span>
                </div>
            </div>
            
            {/* Summary Section */}
            <div className="mb-6">
                <div className="flex justify-center mb-6">
                    <button
                        onClick={() => setShowSummary(!showSummary)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-dhivehi font-semibold text-sm transition-all shadow-sm ${
                            showSummary 
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200' 
                                : 'bg-violet-600 text-white hover:bg-violet-700'
                        }`}
                    >
                        <span className="text-lg">{showSummary ? '📊' : '📈'}</span>
                        <span>{showSummary ? 'ޚުލާސާ ފޮރުވާ' : 'ޚުލާސާ ދައްކާ'}</span>
                    </button>
                </div>
                
                {showSummary && (
                    <CommentSummary 
                        parentsData={parentsData}
                        studentsData={studentsData}
                        teachersData={teachersData}
                    />
                )}
            </div>

            {/* Comments Table */}
            <div className="comments-table-container">
                <table className="comments-table">
                    <thead>
                        <tr>
                            <th className="col-parents">
                                <span className="header-icon">👤</span>
                                Parents
                            </th>
                            <th className="col-students">
                                <span className="header-icon">🎓</span>
                                Students
                            </th>
                            <th className="col-teachers">
                                <span className="header-icon">👨‍🏫</span>
                                Teachers
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {commentRows.length > 0 ? (
                            commentRows.map((row, index) => (
                                <tr key={index}>
                                    <td className="col-parents">
                                        {row.parent?.comment ? (
                                            <div className="comment-card parent">
                                                <div className="comment-header">
                                                    <span className="commenter-name">{row.parent.name}</span>
                                                    <span className="comment-date">
                                                        {new Date(row.parent.created).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="comment-text">{row.parent.comment}</p>
                                            </div>
                                        ) : (
                                            <span className="no-comment">-</span>
                                        )}
                                    </td>
                                    <td className="col-students">
                                        {row.student?.comment ? (
                                            <div className="comment-card student">
                                                <div className="comment-header">
                                                    <span className="commenter-name">{row.student.name}</span>
                                                    <span className="comment-date">
                                                        {new Date(row.student.created).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="comment-text">{row.student.comment}</p>
                                            </div>
                                        ) : (
                                            <span className="no-comment">-</span>
                                        )}
                                    </td>
                                    <td className="col-teachers">
                                        {row.teacher?.comment ? (
                                            <div className="comment-card teacher">
                                                <div className="comment-header">
                                                    <span className="commenter-name">{row.teacher.name}</span>
                                                    <span className="comment-date">
                                                        {new Date(row.teacher.created).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="comment-text">{row.teacher.comment}</p>
                                            </div>
                                        ) : (
                                            <span className="no-comment">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="no-comments-cell">
                                    <div className="empty-comments">
                                        <p>No comments yet.</p>
                                        <p>Comments from Parent, Student, and Teacher questionnaires will appear here.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CommentsTable;
