import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { GRADE_COLORS } from '../../utils/constants';

function DimensionResultCard({
    dimension,
    score,
    grade,
    indicatorCount,
    strands,
    hasData,
    fallbackScore,
    fallbackGrade,
}) {
    const navigate = useNavigate();

    const displayScore = hasData ? score : (fallbackScore || 0);
    const displayGrade = hasData ? grade : (fallbackGrade || 'NR');
    const displayIndicatorCount = indicatorCount || 0;
    const color = dimension.color;

    const renderGradeBadge = (gradeCode) => {
        const gradeColor = GRADE_COLORS[gradeCode] || GRADE_COLORS.NR;

        return (
            <span
                className="results-grade-badge"
                style={{ backgroundColor: gradeColor.bg, color: gradeColor.text }}
            >
                {gradeCode}
            </span>
        );
    };

    const hasChartData = strands && strands.length > 0;

    const handleShowDistribution = () => {
        navigate(`/results/dimension/${dimension.id}`);
    };

    return (
        <div className="dimension-card">
            <div
                className="dimension-card-header"
                style={{
                    borderLeftColor: color,
                    backgroundColor: `${color}1A` // 10% opacity for a subtle tint
                }}
            >
                <span
                    className="dimension-badge"
                    style={{ backgroundColor: color }}
                >
                    {dimension.id}
                </span>
                <div className="dimension-info">
                    <h3>{dimension.name}</h3>
                    <p className="font-dhivehi" dir="rtl">{dimension.nameDv}</p>
                </div>
            </div>

            <div className="dimension-card-body">
                <div className="dimension-score">
                    <div className="score-circle" style={{
                        background: `conic-gradient(${color} ${displayScore * 3.6}deg, #e5e7eb 0deg)`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div className="score-inner" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                            <span className="score-value">{displayScore}%</span>
                        </div>
                    </div>
                    {renderGradeBadge(displayGrade)}
                </div>

                <div className="dimension-meta">
                    <span>{displayIndicatorCount} indicators</span>
                    {displayGrade === 'NR' ? (
                        <span className="status-pending">
                            <AlertCircle size={14} aria-hidden="true" /> Not started
                        </span>
                    ) : (
                        <span className="status-complete">
                            <CheckCircle size={14} aria-hidden="true" /> Complete
                        </span>
                    )}
                </div>

                {hasChartData && (
                    <button
                        className="chart-toggle-btn"
                        onClick={handleShowDistribution}
                        aria-label={`View outcome distribution for ${dimension.name}`}
                    >
                        <BarChart3 size={16} aria-hidden="true" />
                        Show Distribution
                    </button>
                )}
            </div>

            {!hasData && !hasChartData && fallbackScore > 0 && (
                <div className="dimension-fallback-note">
                    <span className="fallback-badge">Using checklist data</span>
                </div>
            )}
        </div>
    );
}

export default DimensionResultCard;
