import { useMemo } from 'react';

const SCORE_COLORS = {
    0: '#dc2626',
    1: '#ec4899',
    2: '#22c55e',
    3: '#15803d',
};

function CustomOutcomeBarChart({ outcomes, indicatorScores, indicatorTextMap = {} }) {
    const chartData = useMemo(() => {
        return outcomes.map(outcome => {
            const indicatorDetails = outcome.indicators.map(indCode => {
                const score = indicatorScores?.[indCode];
                return {
                    code: indCode,
                    score: typeof score === 'number' ? score : 0,
                };
            });

            const scores = indicatorDetails.map(i => i.score);
            const totalScore = scores.reduce((sum, s) => sum + s, 0);
            const maxPossible = scores.length * 3;
            const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

            return {
                outcomeNo: outcome.outcomeNo,
                title: outcome.title,
                score: totalScore,
                maxScore: maxPossible,
                percentage,
                indicators: indicatorDetails,
            };
        });
    }, [outcomes, indicatorScores]);

    const maxScore = useMemo(() => {
        if (chartData.length === 0) return 10;
        return Math.max(...chartData.map(d => d.maxScore), 10);
    }, [chartData]);

    // Aggregate all indicators across all outcomes
    const indicatorTableData = useMemo(() => {
        const scored1 = [];
        const scored0 = [];

        outcomes.forEach(outcome => {
            outcome.indicators.forEach(indCode => {
                const score = indicatorScores?.[indCode];
                const indicatorScore = typeof score === 'number' ? score : 0;

                if (indicatorScore === 1) {
                    scored1.push({ code: indCode, outcomeNo: outcome.outcomeNo });
                } else {
                    scored0.push({ code: indCode, outcomeNo: outcome.outcomeNo });
                }
            });
        });

        return { scored1, scored0 };
    }, [outcomes, indicatorScores]);

    if (chartData.length === 0) {
        return (
            <div className="chart-empty">
                <p>No outcome data available</p>
            </div>
        );
    }

    return (
        <div className="custom-outcome-chart">
            <div className="chart-body">
                <div className="chart-y-axis"></div>

                <div className="chart-columns-row">
                    {chartData.map(outcome => {
                        const heightPercent = (outcome.score / maxScore) * 100;
                        const avgScore = outcome.score / outcome.maxScore * 3;
                        const color = avgScore >= 3 ? SCORE_COLORS[3] :
                            avgScore >= 2 ? SCORE_COLORS[2] :
                                avgScore >= 1 ? SCORE_COLORS[1] : SCORE_COLORS[0];

                        return (
                            <div key={outcome.outcomeNo} className="chart-column">
                                {/* Bar */}
                                <div className="bars-container single-bar">
                                    <div className="bar-wrapper">
                                        <div
                                            className="chart-bar"
                                            style={{
                                                backgroundColor: color,
                                                height: `${heightPercent}%`,
                                                width: '40px',
                                            }}
                                        >
                                            {outcome.score > 0 && (
                                                <span className="bar-value">{outcome.score}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Label - always starts at same fixed position */}
                                <div className="x-label-wrapper custom-outcome-label">
                                    <div className="x-label" title={outcome.title}>
                                        <span className="outcome-no">{outcome.outcomeNo}</span>
                                        <span className="outcome-text" dir="rtl">{outcome.title}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Indicator Score Table */}
            <div className="indicator-score-table">
                <table className="indicator-table">
                    <thead>
                        <tr>
                            <th className="scored-1-header">
                                Indicators Scored 1
                                <span className="header-count">({indicatorTableData.scored1.length})</span>
                            </th>
                            <th className="scored-0-header">
                                Indicators Scored 0
                                <span className="header-count">({indicatorTableData.scored0.length})</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const maxRows = Math.max(
                                indicatorTableData.scored1.length,
                                indicatorTableData.scored0.length
                            );

                            if (maxRows === 0) {
                                return (
                                    <tr>
                                        <td colSpan="2" className="empty-row">
                                            No indicator data available
                                        </td>
                                    </tr>
                                );
                            }

                            return Array.from({ length: maxRows }, (_, i) => (
                                <tr key={i}>
                                    <td className="scored-1-cell">
                                        {indicatorTableData.scored1[i] && (
                                            <div className="indicator-item">
                                                <span className="indicator-code">{indicatorTableData.scored1[i].code}</span>
                                                <span className="indicator-text-desc" dir="rtl">
                                                    {indicatorTextMap[indicatorTableData.scored1[i].code] || ''}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="scored-0-cell">
                                        {indicatorTableData.scored0[i] && (
                                            <div className="indicator-item">
                                                <span className="indicator-code">{indicatorTableData.scored0[i].code}</span>
                                                <span className="indicator-text-desc" dir="rtl">
                                                    {indicatorTextMap[indicatorTableData.scored0[i].code] || ''}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ));
                        })()}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CustomOutcomeBarChart;
