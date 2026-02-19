import { useState } from 'react';
import { useDimensionData } from '../hooks/useDimensionData';
import { DIMENSIONS } from '../utils/constants';
import HierarchyView from '../components/backend/HierarchyView';
import './Backend.css';

function Backend() {
    const [activeDimension, setActiveDimension] = useState('D1');
    const { hierarchy, loading, error } = useDimensionData(activeDimension);

    const activeDimensionInfo = DIMENSIONS.find(d => d.id === activeDimension);

    return (
        <div className="backend-page">
            <header className="backend-header">
                <div className="header-content">
                    <h1 className="backend-title">Backend</h1>
                    <p className="backend-subtitle">Scoring Calculations & Data Aggregation</p>
                </div>
            </header>

            {/* Dimension Tabs */}
            <nav className="dimension-tabs" role="tablist">
                {DIMENSIONS.map((dim) => (
                    <button
                        key={dim.id}
                        role="tab"
                        aria-selected={activeDimension === dim.id}
                        aria-controls={`panel-${dim.id}`}
                        className={`dimension-tab ${activeDimension === dim.id ? 'active' : ''}`}
                        onClick={() => setActiveDimension(dim.id)}
                        style={{
                            '--tab-color': dim.color,
                            '--tab-color-light': `${dim.color}20`,
                        }}
                    >
                        <span className="tab-id">{dim.id}</span>
                        <span className="tab-name">{dim.name}</span>
                    </button>
                ))}
            </nav>

            {/* Content */}
            <main 
                className="backend-content"
                role="tabpanel"
                id={`panel-${activeDimension}`}
                aria-labelledby={activeDimension}
            >
                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading {activeDimensionInfo?.name || activeDimension}...</p>
                    </div>
                )}

                {error && (
                    <div className="error-state">
                        <p>Error loading dimension data: {error.message}</p>
                    </div>
                )}

                {!loading && !error && hierarchy.length === 0 && (
                    <div className="empty-state">
                        <p>No data available for {activeDimension}</p>
                    </div>
                )}

                {!loading && !error && hierarchy.length > 0 && (
                    <HierarchyView 
                        hierarchy={hierarchy} 
                        dimension={activeDimensionInfo}
                    />
                )}
            </main>

            {/* Legend */}
            <footer className="backend-legend">
                <div className="legend-section">
                    <h4>Indicator Scores</h4>
                    <div className="legend-items">
                        <span className="legend-item">
                            <span className="score-indicator achieved">●</span> Achieved (≥60%)
                        </span>
                        <span className="legend-item">
                            <span className="score-indicator not-achieved">○</span> Not Achieved
                        </span>
                        <span className="legend-item">
                            <span className="score-indicator na">◷</span> N/A
                        </span>
                    </div>
                </div>
                <div className="legend-section">
                    <h4>Outcome Scores</h4>
                    <div className="legend-items">
                        <span className="legend-item">
                            <span className="score-outcome score-3">●●●</span> All (100%)
                        </span>
                        <span className="legend-item">
                            <span className="score-outcome score-2">●●○</span> Most (60-99%)
                        </span>
                        <span className="legend-item">
                            <span className="score-outcome score-1">●○○</span> Partial (&lt;60%)
                        </span>
                        <span className="legend-item">
                            <span className="score-outcome score-0">○○○</span> None (0%)
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Backend;
