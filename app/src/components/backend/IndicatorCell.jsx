import { useState } from 'react';
import { getIndicatorScoreColor, getIndicatorSymbol } from '../../utils/backendScoring';

function IndicatorCell({ indicator }) {
    const [showDetails, setShowDetails] = useState(false);
    const { code, text, score, breakdown, sources, excluded, dataPoints } = indicator;
    const colors = getIndicatorScoreColor(score);
    const symbol = getIndicatorSymbol(score);

    const getValueDisplay = (value) => {
        if (value === 'yes') return { symbol: '✓', label: 'Yes', class: 'value-yes' };
        if (value === 'no') return { symbol: '✗', label: 'No', class: 'value-no' };
        if (value === 'nr') return { symbol: '○', label: 'NR', class: 'value-nr' };
        return { symbol: '—', label: 'N/A', class: 'value-na' };
    };

    // Safely access sources array
    const sourcesCount = sources?.length ?? 0;

    if (excluded) {
        return (
            <div className="indicator-cell excluded" title="Excluded from outcome calculation (NA)">
                <span className="ind-code">{code}</span>
                <span className="ind-text">{text || '-'}</span>
                <span className="ind-sources">-</span>
                <span className="ind-breakdown">NA</span>
                <span className="ind-score na">
                    <span className="score-symbol">◷</span>
                    <span className="score-label">NA</span>
                </span>
            </div>
        );
    }

    return (
        <div 
            className="indicator-cell-wrapper"
            style={{ 
                '--score-color': colors.hex,
                '--score-bg': colors.bg,
            }}
        >
            <div className="indicator-cell">
                <span className="ind-code">{code}</span>
                <span className="ind-text">{text || '-'}</span>
                <span className="ind-sources">
                    <button 
                        className="sources-trigger"
                        onClick={() => setShowDetails(!showDetails)}
                        aria-expanded={showDetails}
                        aria-label={`View source details for indicator ${code}`}
                    >
                        {sourcesCount > 0 ? (
                            <>
                                <span className="source-count">{sourcesCount}</span>
                                <span className="source-label">sources</span>
                            </>
                        ) : (
                            <span className="no-sources">No data</span>
                        )}
                    </button>
                </span>
                <span className="ind-breakdown">
                    {breakdown}
                </span>
                <span className={`ind-score ${score === 1 ? 'achieved' : score === 0 ? 'not-achieved' : 'na'}`}>
                    <span className="score-symbol">{symbol}</span>
                    <span className="score-label">{score}</span>
                </span>
            </div>

            {/* Detailed Source Breakdown */}
            {showDetails && dataPoints && dataPoints.length > 0 && (
                <div className="source-details">
                    <div className="source-details-header">
                        <h4>Data Sources</h4>
                        <span className="indicator-code-badge">{code}</span>
                    </div>
                    <div className="source-list">
                        {dataPoints.map((dp, index) => {
                            const valueDisplay = getValueDisplay(dp.value);
                            return (
                                <div key={index} className="source-item">
                                    <span className="source-name">{dp.source}</span>
                                    <span className={`source-value ${valueDisplay.class}`}>
                                        <span className="value-symbol">{valueDisplay.symbol}</span>
                                        <span className="value-label">{valueDisplay.label}</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="source-summary">
                        <span className="summary-item">
                            <span className="summary-label">Total:</span>
                            <span className="summary-value">{indicator.total}</span>
                        </span>
                        <span className="summary-item">
                            <span className="summary-label">Achieved:</span>
                            <span className="summary-value achieved">{indicator.achieved}</span>
                        </span>
                        <span className="summary-item">
                            <span className="summary-label">Percentage:</span>
                            <span className="summary-value">{indicator.percentage}%</span>
                        </span>
                    </div>
                </div>
            )}

            {showDetails && (!dataPoints || dataPoints.length === 0) && (
                <div className="source-details">
                    <div className="source-details-header">
                        <h4>No Data Available</h4>
                    </div>
                    <p className="no-data-message">
                        This indicator has not been scored in any checklist yet.
                    </p>
                </div>
            )}
        </div>
    );
}

export default IndicatorCell;
