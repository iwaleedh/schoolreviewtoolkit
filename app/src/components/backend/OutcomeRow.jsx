import { memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import IndicatorCell from './IndicatorCell';
import { getOutcomeScoreColor, getOutcomeSymbol } from '../../utils/backendScoring';

function OutcomeRow({ outcome, isExpanded, onToggle }) {
    const { indicators, score, breakdown } = outcome;
    const colors = getOutcomeScoreColor(score);
    const symbol = getOutcomeSymbol(score);

    const naCount = indicators.filter(i => i.excluded).length;

    return (
        <div className="outcome-row">
            {/* Outcome Header */}
            <button 
                className="outcome-header"
                onClick={onToggle}
                aria-expanded={isExpanded}
                aria-controls={`outcome-content-${outcome.id}`}
            >
                <span className="outcome-toggle">
                    {isExpanded ? (
                        <ChevronDown size={16} aria-hidden="true" />
                    ) : (
                        <ChevronRight size={16} aria-hidden="true" />
                    )}
                </span>
                <div className="outcome-info">
                    <span className="outcome-id">{outcome.id}</span>
                    <span className="outcome-title">{outcome.title}</span>
                </div>
                <div className="outcome-score" style={{ color: colors.hex }}>
                    <span className="score-symbol">{symbol}</span>
                    <span className="score-value">{score}</span>
                </div>
                <div className="outcome-breakdown">
                    <span className="breakdown-text">
                        {breakdown.achieved}/{breakdown.total} = {breakdown.percentage}%
                    </span>
                    {naCount > 0 && (
                        <span className="na-count" title="Excluded NA indicators">
                            ({naCount} NA)
                        </span>
                    )}
                </div>
            </button>

            {/* Outcome Content - Indicators */}
            {isExpanded && (
                <div 
                    id={`outcome-content-${outcome.id}`}
                    className="outcome-content"
                >
                    <div className="indicators-header">
                        <span className="col-indicator">Indicator</span>
                        <span className="col-sources">Sources</span>
                        <span className="col-breakdown">Calculation</span>
                        <span className="col-score">Score</span>
                    </div>
                    <div className="indicators-list">
                        {indicators.map((indicator) => (
                            <IndicatorCell key={indicator.code} indicator={indicator} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(OutcomeRow);
