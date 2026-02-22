import { memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import SubstrandCard from './SubstrandCard';

function StrandSection({ 
    strand, 
    isExpanded, 
    onToggle,
    expandedSubstrands,
    onToggleSubstrand,
    expandedOutcomes,
    onToggleOutcome
}) {
    const totalOutcomes = strand.substrands.reduce((sum, s) => sum + s.outcomes.length, 0);
    
    const totals = strand.substrands.reduce((acc, substrand) => ({
        score3: acc.score3 + substrand.distribution.score3,
        score2: acc.score2 + substrand.distribution.score2,
        score1: acc.score1 + substrand.distribution.score1,
        score0: acc.score0 + substrand.distribution.score0,
    }), { score3: 0, score2: 0, score1: 0, score0: 0 });

    return (
        <section className="strand-section">
            {/* Strand Header */}
            <button 
                className="strand-header"
                onClick={onToggle}
                aria-expanded={isExpanded}
                aria-controls={`strand-content-${strand.id}`}
            >
                <span className="strand-toggle">
                    {isExpanded ? (
                        <ChevronDown size={20} aria-hidden="true" />
                    ) : (
                        <ChevronRight size={20} aria-hidden="true" />
                    )}
                </span>
                <div className="strand-info">
                    <h3 className="strand-title">{strand.title}</h3>
                    <div className="strand-stats">
                        <span className="stat">{strand.substrands.length} substrands</span>
                        <span className="stat">{totalOutcomes} outcomes</span>
                    </div>
                </div>
                <div className="strand-totals">
                    <span className="outcome-count score-3" title="Score 3">
                        <span className="count-label">3:</span>{totals.score3}
                    </span>
                    <span className="outcome-count score-2" title="Score 2">
                        <span className="count-label">2:</span>{totals.score2}
                    </span>
                    <span className="outcome-count score-1" title="Score 1">
                        <span className="count-label">1:</span>{totals.score1}
                    </span>
                    <span className="outcome-count score-0" title="Score 0">
                        <span className="count-label">0:</span>{totals.score0}
                    </span>
                </div>
            </button>

            {/* Strand Content */}
            {isExpanded && (
                <div 
                    id={`strand-content-${strand.id}`}
                    className="strand-content"
                >
                    {strand.substrands.map((substrand) => (
                        <SubstrandCard
                            key={substrand.id}
                            substrand={substrand}
                            isExpanded={expandedSubstrands.has(substrand.id)}
                            onToggle={() => onToggleSubstrand(substrand.id)}
                            expandedOutcomes={expandedOutcomes}
                            onToggleOutcome={onToggleOutcome}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export default memo(StrandSection);
