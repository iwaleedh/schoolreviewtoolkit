import { memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import OutcomeRow from './OutcomeRow';

function SubstrandCard({ 
    substrand, 
    isExpanded, 
    onToggle,
    expandedOutcomes,
    onToggleOutcome
}) {
    const { distribution, outcomes } = substrand;

    return (
        <div className="substrand-card">
            {/* Substrand Header */}
            <button 
                className="substrand-header"
                onClick={onToggle}
                aria-expanded={isExpanded}
                aria-controls={`substrand-content-${substrand.id}`}
            >
                <span className="substrand-toggle">
                    {isExpanded ? (
                        <ChevronDown size={18} aria-hidden="true" />
                    ) : (
                        <ChevronRight size={18} aria-hidden="true" />
                    )}
                </span>
                <div className="substrand-info">
                    <span className="substrand-id">{substrand.id}</span>
                    <span className="substrand-title">{substrand.title}</span>
                </div>
                <div className="substrand-distribution">
                    <span className="dist-item score-3" title="All achieved">
                        <span className="dist-symbol">●●●</span>
                        <span className="dist-count">{distribution.score3}</span>
                    </span>
                    <span className="dist-item score-2" title="Most achieved">
                        <span className="dist-symbol">●●○</span>
                        <span className="dist-count">{distribution.score2}</span>
                    </span>
                    <span className="dist-item score-1" title="Partial">
                        <span className="dist-symbol">●○○</span>
                        <span className="dist-count">{distribution.score1}</span>
                    </span>
                    <span className="dist-item score-0" title="None achieved">
                        <span className="dist-symbol">○○○</span>
                        <span className="dist-count">{distribution.score0}</span>
                    </span>
                </div>
            </button>

            {/* Substrand Content */}
            {isExpanded && (
                <div 
                    id={`substrand-content-${substrand.id}`}
                    className="substrand-content"
                >
                    <div className="outcomes-list">
                        {outcomes.map((outcome) => (
                            <OutcomeRow
                                key={outcome.id}
                                outcome={outcome}
                                isExpanded={expandedOutcomes.has(outcome.id)}
                                onToggle={() => onToggleOutcome(outcome.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(SubstrandCard);
