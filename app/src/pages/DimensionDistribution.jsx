import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useDimensionData } from '../hooks/useDimensionData';
import { useSSEData } from '../context/SSEDataContext';
import { DIMENSIONS } from '../utils/constants';
import { D2_CUSTOM_GRAPHS, D5_CUSTOM_GRAPHS, calculateCustomOutcomeScore } from '../utils/customGraphs';
import StrandBarChart from '../components/results/StrandBarChart';
import CustomOutcomeBarChart from '../components/results/CustomOutcomeBarChart';
import './DimensionDistribution.css';

function DimensionDistribution() {
    const { dimensionId } = useParams();
    const navigate = useNavigate();
    const { hierarchy, loading, error } = useDimensionData(dimensionId);
    const { indicatorScores, ltScores, pendingLTScores } = useSSEData();

    const dimensionInfo = DIMENSIONS.find(d => d.id === dimensionId);

    const handleBack = () => {
        navigate('/results');
    };

    // Get indicator scores for custom graphs
    const allIndicatorScores = useMemo(() => {
        const scores = {};

        // From indicatorScores (checklist data)
        if (indicatorScores) {
            Object.entries(indicatorScores).forEach(([code, value]) => {
                scores[code] = value === 'yes' ? 1 : value === 'no' ? 0 : 0;
            });
        }

        // From ltScores (server data)
        if (ltScores) {
            Object.entries(ltScores).forEach(([code, columns]) => {
                const colScores = Object.values(columns).filter(v => v === 1 || v === 'yes' || v === '1');
                const colZeros = Object.values(columns).filter(v => v === 0 || v === 'no' || v === '0');
                if (colScores.length > colZeros.length) {
                    scores[code] = 1;
                } else {
                    scores[code] = 0;
                }
            });
        }

        // From pendingLTScores
        if (pendingLTScores) {
            Object.entries(pendingLTScores).forEach(([code, columns]) => {
                Object.values(columns).forEach((data) => {
                    if (data?.value !== undefined && data?.value !== null) {
                        const val = data.value;
                        if (val === 'yes' || val === 1 || val === '1') {
                            scores[code] = 1;
                        } else if (val === 'no' || val === 0 || val === '0') {
                            scores[code] = 0;
                        }
                    }
                });
            });
        }

        return scores;
    }, [indicatorScores, ltScores, pendingLTScores]);

    // Calculate custom graph scores for D2 and D5
    const customGraphsData = useMemo(() => {
        const graphs = [];

        // D2 Custom Graphs
        if (dimensionId === 'D2') {
            Object.entries(D2_CUSTOM_GRAPHS).forEach(([key, config]) => {
                const outcomeScores = {};

                config.outcomes.forEach(outcome => {
                    const indicatorScoreList = outcome.indicators.map(indCode => {
                        return allIndicatorScores[indCode] ?? 0;
                    });
                    outcomeScores[outcome.outcomeNo] = calculateCustomOutcomeScore(indicatorScoreList);
                });

                graphs.push({
                    key,
                    config,
                    outcomeScores
                });
            });
        }

        // D5 Custom Graphs
        if (dimensionId === 'D5') {
            Object.entries(D5_CUSTOM_GRAPHS).forEach(([key, config]) => {
                const outcomeScores = {};

                config.outcomes.forEach(outcome => {
                    const indicatorScoreList = outcome.indicators.map(indCode => {
                        return allIndicatorScores[indCode] ?? 0;
                    });
                    outcomeScores[outcome.outcomeNo] = calculateCustomOutcomeScore(indicatorScoreList);
                });

                graphs.push({
                    key,
                    config,
                    outcomeScores
                });
            });
        }

        return graphs.length > 0 ? graphs : null;
    }, [dimensionId, allIndicatorScores]);

    // Extract strengths (score 3) and help needed (score 0, 1)
    const { strengths, helpNeeded } = useMemo(() => {
        const strengths = [];
        const helpNeeded = [];

        if (!hierarchy) return { strengths, helpNeeded };

        hierarchy.forEach(strand => {
            strand.substrands?.forEach(substrand => {
                substrand.outcomes?.forEach(outcome => {
                    if (outcome.score === 3) {
                        strengths.push({
                            id: outcome.id,
                            title: outcome.title,
                            score: outcome.score,
                        });
                    } else if (outcome.score === 0 || outcome.score === 1) {
                        helpNeeded.push({
                            id: outcome.id,
                            title: outcome.title,
                            score: outcome.score,
                        });
                    }
                });
            });
        });

        return { strengths, helpNeeded };
    }, [hierarchy]);

    // Create an indicator text map for custom graphs
    const indicatorTextMap = useMemo(() => {
        const textMap = {};
        if (!hierarchy) return textMap;

        hierarchy.forEach(strand => {
            strand.substrands?.forEach(substrand => {
                substrand.outcomes?.forEach(outcome => {
                    outcome.indicators?.forEach(indicator => {
                        if (indicator.code && indicator.text) {
                            textMap[indicator.code] = indicator.text;
                        }
                    });
                });
            });
        });

        return textMap;
    }, [hierarchy]);

    if (!dimensionInfo) {
        return (
            <div className="dimension-distribution-page">
                <div className="error-state">
                    <p>Dimension not found: {dimensionId}</p>
                    <button onClick={handleBack} className="back-btn">
                        <ArrowLeft size={16} /> Back to Results
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dimension-distribution-page">
            <header className="distribution-header">
                <button onClick={handleBack} className="back-btn" aria-label="Back to Results">
                    <ArrowLeft size={20} />
                    <span>Back to Results</span>
                </button>
                <div className="header-title">
                    <span
                        className="dimension-badge"
                        style={{ backgroundColor: dimensionInfo.color }}
                    >
                        {dimensionInfo.id}
                    </span>
                    <div className="title-text">
                        <h1>{dimensionInfo.name}</h1>
                        <p className="font-dhivehi" dir="rtl">{dimensionInfo.nameDv}</p>
                    </div>
                </div>
            </header>

            <main className="distribution-content">
                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading {dimensionInfo.name}...</p>
                    </div>
                )}

                {error && (
                    <div className="error-state">
                        <p>Error loading dimension data: {error.message}</p>
                    </div>
                )}

                {!loading && !error && hierarchy.length === 0 && (
                    <div className="empty-state">
                        <p>No data available for {dimensionInfo.name}</p>
                    </div>
                )}

                {!loading && !error && hierarchy.length > 0 && (
                    <div className="chart-section">
                        <h2>Outcome Distribution by Strand</h2>
                        <p className="chart-description">
                            This chart shows the distribution of outcome scores across all strands in {dimensionInfo.name}.
                            Each group of bars represents a strand, showing how many outcomes achieved each score level.
                        </p>

                        <div className="chart-card">
                            <StrandBarChart strands={hierarchy} />
                        </div>

                        {/* Custom Graphs for D2 and D5 - Below Strand Distribution */}
                        {customGraphsData && customGraphsData.map((graphData) => (
                            <div key={graphData.key} className="custom-graph-section">
                                <h2>{graphData.config.title}</h2>
                                <p className="chart-description">
                                    This chart shows outcome scores based on selected indicator achievement.
                                    Score range: 0-3 per outcome.
                                </p>

                                <div className="chart-card">
                                    <CustomOutcomeBarChart
                                        outcomes={graphData.config.outcomes}
                                        indicatorScores={allIndicatorScores}
                                        indicatorTextMap={indicatorTextMap}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="distribution-summary">
                            <h3>Distribution Summary</h3>
                            <div className="summary-grid">
                                {hierarchy.map(strand => (
                                    <div key={strand.id} className="strand-summary-card">
                                        <h4>{strand.title}</h4>
                                        <div className="score-counts-row">
                                            <span className="count-0">{strand.distribution?.score0 || 0}</span>
                                            <span className="count-1">{strand.distribution?.score1 || 0}</span>
                                            <span className="count-2">{strand.distribution?.score2 || 0}</span>
                                            <span className="count-3">{strand.distribution?.score3 || 0}</span>
                                        </div>
                                        <div className="score-labels-row">
                                            <span>0</span>
                                            <span>1</span>
                                            <span>2</span>
                                            <span>3</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="outcomes-analysis">
                            <h3>Outcomes Analysis</h3>
                            <div className="analysis-table-container">
                                <table className="analysis-table">
                                    <thead>
                                        <tr>
                                            <th className="strengths-header">
                                                <span className="header-icon strength-icon">★</span>
                                                Strengths
                                                <span className="header-subtitle">(Score 3 - Fully Achieved)</span>
                                            </th>
                                            <th className="help-needed-header">
                                                <span className="header-icon help-icon">!</span>
                                                Help Needed
                                                <span className="header-subtitle">(Score 0-1 - Not/Partially Achieved)</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const maxRows = Math.max(strengths.length, helpNeeded.length);
                                            if (maxRows === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan="2" className="empty-row">
                                                            No outcomes data available yet
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                            return Array.from({ length: maxRows }, (_, i) => (
                                                <tr key={i}>
                                                    <td className="strengths-cell">
                                                        {strengths[i] && (
                                                            <div className="outcome-item">
                                                                <span className="outcome-id">{strengths[i].id}</span>
                                                                <span className="outcome-title">{strengths[i].title}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="help-needed-cell">
                                                        {helpNeeded[i] && (
                                                            <div className="outcome-item">
                                                                <span className="outcome-id">{helpNeeded[i].id}</span>
                                                                <span className="outcome-title">{helpNeeded[i].title}</span>
                                                                <span className={`outcome-score score-${helpNeeded[i].score}`}>
                                                                    {helpNeeded[i].score}
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
                            <div className="analysis-summary">
                                <div className="summary-item strengths-count">
                                    <span className="count-number">{strengths.length}</span>
                                    <span className="count-label">Strengths</span>
                                </div>
                                <div className="summary-item help-count">
                                    <span className="count-number">{helpNeeded.length}</span>
                                    <span className="count-label">Need Help</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default DimensionDistribution;
