import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { useSSEData } from '../context/SSEDataContext';
import { 
    calculateIndicatorScore, 
    calculateOutcomeScore, 
    calculateSubstrandDistribution 
} from '../utils/backendScoring';
import { getGradeFromPercentage } from '../utils/constants';

const DIMENSION_IDS = ['D1', 'D2', 'D3', 'D4', 'D5'];

/**
 * Hook to load and aggregate all dimension data for Summary page
 * Loads D1-D5 CSV files, merges with SSEDataContext scores, calculates dimension scores
 * 
 * @returns {Object} { dimensions, loading, error }
 */
export function useAllDimensionsData() {
    const [rawData, setRawData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { indicatorScores, indicatorSources, ltScores, pendingLTScores } = useSSEData();

    useEffect(() => {
        const loadAllDimensions = async () => {
            try {
                setLoading(true);
                setError(null);

                const basePath = import.meta.env.BASE_URL || '/';
                const loadPromises = DIMENSION_IDS.map(async (dimId) => {
                    const fileName = `${dimId}.csv`;
                    const response = await fetch(`${basePath}Checklist/${fileName}`);
                    
                    if (!response.ok) {
                        console.warn(`Failed to load ${fileName}: ${response.status}`);
                        return { dimId, data: [] };
                    }

                    const csvText = await response.text();
                    
                    return new Promise((resolve) => {
                        Papa.parse(csvText, {
                            header: true,
                            skipEmptyLines: true,
                            complete: (results) => {
                                const filteredData = results.data.filter(row => {
                                    const indicatorCode = row['IndicatorCode'] || row['indicatorCode'] || row['BD'] || row['bd'] || '';
                                    return indicatorCode && indicatorCode !== 'IndicatorCode' && indicatorCode !== 'BD';
                                });
                                resolve({ dimId, data: filteredData });
                            },
                            error: (err) => {
                                console.warn(`Parse error for ${dimId}:`, err);
                                resolve({ dimId, data: [] });
                            },
                        });
                    });
                });

                const results = await Promise.all(loadPromises);
                const dataMap = {};
                results.forEach(({ dimId, data }) => {
                    dataMap[dimId] = data;
                });
                setRawData(dataMap);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                setLoading(false);
            }
        };

        loadAllDimensions();
    }, []);

    const dimensions = useMemo(() => {
        const result = {};

        DIMENSION_IDS.forEach((dimId) => {
            const dimensionRawData = rawData[dimId] || [];
            
            if (dimensionRawData.length === 0) {
                result[dimId] = {
                    score: 0,
                    grade: 'NR',
                    indicatorCount: 0,
                    strands: [],
                    hasData: false,
                };
                return;
            }

            const strandMap = new Map();
            let totalIndicatorCount = 0;
            const allOutcomes = [];

            dimensionRawData.forEach((row) => {
                const getField = (...names) => {
                    for (const name of names) {
                        if (row[name] !== undefined && row[name] !== '' && row[name] !== null) {
                            return row[name];
                        }
                    }
                    return '';
                };

                const indicatorCode = getField('IndicatorCode', 'indicatorCode', 'BD', 'bd');
                const outcomeNo = getField('OutcomeNo');
                const outcomeTitle = getField('Outcomes', 'Outcome');
                const strandKey = getField('StrandNo and Strand', 'StarndNo and Strand', 'Strand');

                if (!indicatorCode) return;
                totalIndicatorCount++;

                const dataPoints = collectDataPoints(indicatorCode, ltScores, pendingLTScores, indicatorScores, indicatorSources);
                const indicatorResult = calculateIndicatorScore(dataPoints);

                if (!strandMap.has(strandKey)) {
                    strandMap.set(strandKey, {
                        id: strandKey,
                        title: strandKey,
                        outcomes: new Map(),
                    });
                }
                const strand = strandMap.get(strandKey);

                if (!strand.outcomes.has(outcomeNo)) {
                    strand.outcomes.set(outcomeNo, {
                        id: outcomeNo,
                        title: outcomeTitle,
                        indicators: [],
                    });
                }
                const outcome = strand.outcomes.get(outcomeNo);

                outcome.indicators.push({
                    code: indicatorCode,
                    score: indicatorResult.score,
                });
            });

            const strandsArray = [];
            strandMap.forEach((strand) => {
                const outcomesArray = [];
                
                strand.outcomes.forEach((outcome) => {
                    const outcomeResult = calculateOutcomeScore(outcome.indicators);
                    outcomesArray.push({
                        id: outcome.id,
                        title: outcome.title,
                        score: outcomeResult.score,
                        breakdown: outcomeResult.breakdown,
                    });
                    allOutcomes.push({ score: outcomeResult.score });
                });

                const distribution = calculateSubstrandDistribution(outcomesArray);

                strandsArray.push({
                    id: strand.id,
                    title: strand.title,
                    outcomes: outcomesArray,
                    distribution,
                });
            });

            const dimensionScore = calculateDimensionScoreFromOutcomes(allOutcomes);

            result[dimId] = {
                score: dimensionScore.percentage,
                grade: dimensionScore.grade,
                indicatorCount: totalIndicatorCount,
                strands: strandsArray,
                hasData: allOutcomes.length > 0,
            };
        });

        return result;
    }, [rawData, ltScores, pendingLTScores, indicatorScores, indicatorSources]);

    return { dimensions, loading, error };
}

function collectDataPoints(indicatorCode, ltScores, pendingLTScores, indicatorScores, indicatorSources) {
    const dataPoints = [];
    const ltColumns = ['LT1', 'LT2', 'LT3', 'LT4', 'LT5', 'LT6', 'LT7', 'LT8', 'LT9', 'LT10'];
    
    ltColumns.forEach(column => {
        const pendingValue = pendingLTScores?.[indicatorCode]?.[column]?.value;
        if (pendingValue !== undefined && pendingValue !== null && pendingValue !== '') {
            dataPoints.push({ source: column, value: normalizeLTValue(pendingValue) });
            return;
        }
        
        const serverValue = ltScores?.[indicatorCode]?.[column];
        if (serverValue !== undefined && serverValue !== null && serverValue !== '') {
            dataPoints.push({ source: column, value: normalizeLTValue(serverValue) });
        }
    });

    const indicatorValue = indicatorScores?.[indicatorCode];
    if (indicatorValue !== undefined && indicatorValue !== null) {
        const sourceName = indicatorSources?.[indicatorCode] || 'Checklist';
        dataPoints.push({ 
            source: sourceName, 
            value: normalizeIndicatorValue(indicatorValue) 
        });
    }

    return dataPoints;
}

function normalizeLTValue(value) {
    if (value === null || value === undefined || value === '') return null;
    const strValue = String(value).toLowerCase().trim();
    if (strValue === 'yes' || strValue === '1' || strValue === 'true') return 'yes';
    if (strValue === 'no' || strValue === '0' || strValue === 'false') return 'no';
    if (strValue === 'nr' || strValue === 'na' || strValue === 'n/a') return 'nr';
    return null;
}

function normalizeIndicatorValue(value) {
    if (value === null || value === undefined) return null;
    const strValue = String(value).toLowerCase().trim();
    if (strValue === 'yes') return 'yes';
    if (strValue === 'no') return 'no';
    if (strValue === 'nr' || strValue === 'na') return 'nr';
    return null;
}

function calculateDimensionScoreFromOutcomes(outcomes) {
    const validOutcomes = outcomes.filter(o => o.score !== undefined);
    
    if (validOutcomes.length === 0) {
        return { percentage: 0, grade: 'NR' };
    }

    let weightedSum = 0;
    validOutcomes.forEach(outcome => {
        switch (outcome.score) {
            case 3: weightedSum += 100; break;
            case 2: weightedSum += 80; break;
            case 1: weightedSum += 40; break;
            case 0: weightedSum += 0; break;
        }
    });

    const percentage = Math.round(weightedSum / validOutcomes.length);
    const grade = getGradeFromPercentage(percentage);

    return { percentage, grade };
}

export default useAllDimensionsData;
