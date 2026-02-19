import { useMemo } from 'react';

const BAR_COLORS = {
    score0: { bg: '#dc2626', label: '0 ފަށާފައިނުވޭ' },
    score1: { bg: '#ec4899', label: '1 ޙާޞިލްކުރަމުންދޭ' },
    score2: { bg: '#22c55e', label: '2 ގިނަ ކަންކަން ޙާޞިލްކޮށްފައިވޭ' },
    score3: { bg: '#15803d', label: '3 ހުރިހާ ކަމެއް ޙާޞިލްކޮށްފައި' },
};

function StrandBarChart({ strands }) {
    const chartData = useMemo(() => {
        if (!strands || strands.length === 0) return [];
        
        return strands.map(strand => {
            const dist = strand.distribution || { score0: 0, score1: 0, score2: 0, score3: 0 };
            const maxCount = Math.max(
                dist.score0 || 0,
                dist.score1 || 0,
                dist.score2 || 0,
                dist.score3 || 0,
                1
            );
            
            return {
                id: strand.id,
                title: strand.title || `Strand ${strand.id}`,
                bars: [
                    { key: 'score0', value: dist.score0 || 0, color: BAR_COLORS.score0.bg },
                    { key: 'score1', value: dist.score1 || 0, color: BAR_COLORS.score1.bg },
                    { key: 'score2', value: dist.score2 || 0, color: BAR_COLORS.score2.bg },
                    { key: 'score3', value: dist.score3 || 0, color: BAR_COLORS.score3.bg },
                ],
                maxCount,
            };
        }).reverse();
    }, [strands]);

    const maxYValue = useMemo(() => {
        if (chartData.length === 0) return 5;
        const allValues = chartData.flatMap(d => d.bars.map(b => b.value));
        return Math.max(...allValues, 1);
    }, [chartData]);

    if (chartData.length === 0) {
        return (
            <div className="chart-empty">
                <p>No strand data available</p>
            </div>
        );
    }

    return (
        <div className="substrand-chart-container">
            <div className="chart-header">
                <h4>Outcome Distribution by Strand</h4>
                <div className="chart-legend">
                    {Object.entries(BAR_COLORS).map(([key, config]) => (
                        <span key={key} className="legend-item">
                            <span 
                                className="legend-color" 
                                style={{ backgroundColor: config.bg }}
                            />
                            {config.label}
                        </span>
                    ))}
                </div>
            </div>
            
            <div className="chart-body">
                <div className="chart-y-axis"></div>
                
                <div className="chart-content">
                    <div className="chart-bars-row">
                        {chartData.map(strand => (
                            <div key={strand.id} className="chart-bar-group">
                                <div className="bars-container">
                                    {strand.bars.map(bar => {
                                        const heightPercent = (bar.value / maxYValue) * 100;
                                        return (
                                            <div key={bar.key} className="bar-wrapper">
                                                <div 
                                                    className="chart-bar"
                                                    style={{ 
                                                        backgroundColor: bar.color,
                                                        height: `${heightPercent}%`,
                                                    }}
                                                >
                                                    {bar.value > 0 && (
                                                        <span className="bar-value">{bar.value}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="chart-labels-row">
                        {chartData.map(strand => (
                            <div key={strand.id} className="x-label-wrapper">
                                <div className="x-label" title={strand.title}>
                                    {strand.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StrandBarChart;
