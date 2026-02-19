import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { useSSEData } from '../context/SSEDataContext';
import { 
    calculateIndicatorScore, 
    calculateOutcomeScore, 
    calculateSubstrandDistribution 
} from '../utils/backendScoring';

/**
 * Hook to load and process dimension data for Backend page
 * Loads D1-D5 CSV files, merges with SSEDataContext scores, calculates all scores
 * 
 * @param {string} dimension - Dimension ID ('D1', 'D2', 'D3', 'D4', 'D5')
 * @returns {Object} { data, loading, error, hierarchy }
 */
export function useDimensionData(dimension) {
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { indicatorScores, indicatorSources, ltScores, pendingLTScores } = useSSEData();

    // Load CSV file
    useEffect(() => {
        if (!dimension) {
            setLoading(false);
            return;
        }

        const loadDimensionData = async () => {
            try {
                setLoading(true);
                setError(null);

                const basePath = import.meta.env.BASE_URL || '/';
                const fileName = `${dimension}.csv`;
                const response = await fetch(`${basePath}Checklist/${fileName}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to load ${fileName}: ${response.status}`);
                }

                const csvText = await response.text();
                
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const filteredData = results.data.filter(row => {
                            const indicatorCode = row['IndicatorCode'] || row['indicatorCode'] || row['BD'] || row['bd'] || '';
                            return indicatorCode && indicatorCode !== 'IndicatorCode' && indicatorCode !== 'BD';
                        });
                        setRawData(filteredData);
                        setLoading(false);
                    },
                    error: (err) => {
                        setError(err instanceof Error ? err : new Error(String(err)));
                        setLoading(false);
                    },
                });
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                setLoading(false);
            }
        };

        loadDimensionData();
    }, [dimension]);

    // Build hierarchy with calculated scores
    const hierarchy = useMemo(() => {
        if (!rawData || rawData.length === 0) return [];

        const strandMap = new Map();

        // Process each row to build hierarchy
        rawData.forEach((row) => {
            const getField = (...names) => {
                for (const name of names) {
                    if (row[name] !== undefined && row[name] !== '' && row[name] !== null) {
                        return row[name];
                    }
                }
                return '';
            };

            // Handle different column names for indicator code (IndicatorCode or BD)
            const indicatorCode = getField('IndicatorCode', 'indicatorCode', 'BD', 'bd');
            const indicatorText = getField('Indicators', 'Indicator');
            const outcomeNo = getField('OutcomeNo');
            const outcomeTitle = getField('Outcomes', 'Outcome');
            const substrandNo = getField('SubstrandNo');
            const substrandTitle = getField('Substrand');
            const strandKey = getField('StrandNo and Strand', 'StarndNo and Strand', 'Strand');

            if (!indicatorCode) return;

            // Get all data points for this indicator from SSEDataContext
            const dataPoints = collectDataPoints(indicatorCode, ltScores, pendingLTScores, indicatorScores, indicatorSources);
            
            // Calculate indicator score
            const indicatorResult = calculateIndicatorScore(dataPoints);

            // Initialize strand
            if (!strandMap.has(strandKey)) {
                strandMap.set(strandKey, {
                    id: strandKey,
                    title: strandKey,
                    substrands: new Map(),
                });
            }
            const strand = strandMap.get(strandKey);

            // Initialize substrand
            if (!strand.substrands.has(substrandNo)) {
                strand.substrands.set(substrandNo, {
                    id: substrandNo,
                    title: substrandTitle,
                    outcomes: new Map(),
                });
            }
            const substrand = strand.substrands.get(substrandNo);

            // Initialize outcome
            if (!substrand.outcomes.has(outcomeNo)) {
                substrand.outcomes.set(outcomeNo, {
                    id: outcomeNo,
                    title: outcomeTitle,
                    indicators: [],
                });
            }
            const outcome = substrand.outcomes.get(outcomeNo);

            // Add indicator with calculated score
            outcome.indicators.push({
                code: indicatorCode,
                text: indicatorText,
                score: indicatorResult.score,
                breakdown: indicatorResult.breakdown,
                sources: indicatorResult.sources,
                achieved: indicatorResult.achieved,
                total: indicatorResult.total,
                percentage: indicatorResult.percentage,
                dataPoints: indicatorResult.dataPoints,
            });
        });

        // Calculate outcome and substrand scores
        const result = [];
        strandMap.forEach((strand) => {
            const strandObj = {
                id: strand.id,
                title: strand.title,
                substrands: [],
            };

            strand.substrands.forEach((substrand) => {
                const outcomesArray = [];
                
                substrand.outcomes.forEach((outcome) => {
                    // Calculate outcome score from indicators
                    const outcomeResult = calculateOutcomeScore(outcome.indicators);
                    
                    outcomesArray.push({
                        id: outcome.id,
                        title: outcome.title,
                        score: outcomeResult.score,
                        breakdown: outcomeResult.breakdown,
                        indicators: outcomeResult.indicators,
                    });
                });

                // Calculate substrand distribution
                const distribution = calculateSubstrandDistribution(outcomesArray);

                strandObj.substrands.push({
                    id: substrand.id,
                    title: substrand.title,
                    outcomes: outcomesArray,
                    distribution,
                });
            });

            result.push(strandObj);
        });

        return result;
    }, [rawData, ltScores, pendingLTScores, indicatorScores, indicatorSources]);

    return { data: rawData, loading, error, hierarchy };
}

/**
 * Collect all data points for an indicator from multiple sources
 */
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

/**
 * Normalize LT score values
 */
function normalizeLTValue(value) {
    if (value === null || value === undefined || value === '') return null;
    const strValue = String(value).toLowerCase().trim();
    if (strValue === 'yes' || strValue === '1' || strValue === 'true') return 'yes';
    if (strValue === 'no' || strValue === '0' || strValue === 'false') return 'no';
    if (strValue === 'nr' || strValue === 'na' || strValue === 'n/a') return 'nr';
    return null;
}

/**
 * Normalize indicator score values
 */
function normalizeIndicatorValue(value) {
    if (value === null || value === undefined) return null;
    const strValue = String(value).toLowerCase().trim();
    if (strValue === 'yes') return 'yes';
    if (strValue === 'no') return 'no';
    if (strValue === 'nr' || strValue === 'na') return 'nr';
    return null;
}

export default useDimensionData;
