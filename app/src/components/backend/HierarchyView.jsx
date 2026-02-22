import { useState } from 'react';
import StrandSection from './StrandSection';

function HierarchyView({ hierarchy, dimension }) {
    const [expandedStrands, setExpandedStrands] = useState(new Set());
    const [expandedSubstrands, setExpandedSubstrands] = useState(new Set());
    const [expandedOutcomes, setExpandedOutcomes] = useState(new Set());

    const toggleStrand = (strandId) => {
        setExpandedStrands(prev => {
            const next = new Set(prev);
            if (next.has(strandId)) {
                next.delete(strandId);
            } else {
                next.add(strandId);
            }
            return next;
        });
    };

    const toggleSubstrand = (substrandId) => {
        setExpandedSubstrands(prev => {
            const next = new Set(prev);
            if (next.has(substrandId)) {
                next.delete(substrandId);
            } else {
                next.add(substrandId);
            }
            return next;
        });
    };

    const toggleOutcome = (outcomeId) => {
        setExpandedOutcomes(prev => {
            const next = new Set(prev);
            if (next.has(outcomeId)) {
                next.delete(outcomeId);
            } else {
                next.add(outcomeId);
            }
            return next;
        });
    };

    const expandAll = () => {
        const allStrands = new Set(hierarchy.map(s => s.id));
        const allSubstrands = new Set();
        const allOutcomes = new Set();
        
        hierarchy.forEach(strand => {
            strand.substrands.forEach(substrand => {
                allSubstrands.add(substrand.id);
                substrand.outcomes.forEach(outcome => {
                    allOutcomes.add(outcome.id);
                });
            });
        });

        setExpandedStrands(allStrands);
        setExpandedSubstrands(allSubstrands);
        setExpandedOutcomes(allOutcomes);
    };

    const collapseAll = () => {
        setExpandedStrands(new Set());
        setExpandedSubstrands(new Set());
        setExpandedOutcomes(new Set());
    };

    return (
        <div className="hierarchy-view">
            {/* Controls */}
            <div className="hierarchy-controls">
                <div className="dimension-info" style={{ '--dim-color': dimension?.color }}>
                    <h2 className="dimension-name">{dimension?.name}</h2>
                    <span className="dimension-id">{dimension?.id}</span>
                </div>
                <div className="expand-controls">
                    <button 
                        className="control-btn"
                        onClick={expandAll}
                        aria-label="Expand all sections"
                    >
                        Expand All
                    </button>
                    <button 
                        className="control-btn"
                        onClick={collapseAll}
                        aria-label="Collapse all sections"
                    >
                        Collapse All
                    </button>
                </div>
            </div>

            {/* Hierarchy Tree */}
            <div className="hierarchy-tree">
                {hierarchy.map((strand) => (
                    <StrandSection
                        key={strand.id}
                        strand={strand}
                        isExpanded={expandedStrands.has(strand.id)}
                        onToggle={() => toggleStrand(strand.id)}
                        expandedSubstrands={expandedSubstrands}
                        onToggleSubstrand={toggleSubstrand}
                        expandedOutcomes={expandedOutcomes}
                        onToggleOutcome={toggleOutcome}
                    />
                ))}
            </div>
        </div>
    );
}

export default HierarchyView;
