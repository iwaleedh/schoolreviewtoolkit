import { useState, useEffect } from 'react';
import Papa from 'papaparse';

/**
 * Hook to load and parse checklist CSV data
 * @param {string} fileName - Name of the CSV file (e.g., "Dimension 1.csv")
 * @returns {Object} { data, headers, loading, error, grouped, titleRows }
 */
export function useChecklistData(fileName) {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [grouped, setGrouped] = useState(null);
    const [titleRows, setTitleRows] = useState([]); // Store title rows for display

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch the CSV file from the Checklist folder
                const response = await fetch(`/Checklist/${fileName}`);
                if (!response.ok) {
                    throw new Error(`Failed to load ${fileName}: ${response.status}`);
                }

                let csvText = await response.text();

                // Split into lines to find the header row
                const lines = csvText.split('\n');

                // Find the index of the header row (contains 'IndicatorCode' or 'indicatorCode')
                let headerRowIndex = -1;
                const extractedTitles = [];

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim().toLowerCase();
                    if (line.includes('indicatorcode')) {
                        headerRowIndex = i;
                        break;
                    }
                    // Collect title rows before the header
                    const rawLine = lines[i].trim();
                    if (rawLine) {
                        // Extract all non-empty values from the row (handles leading commas)
                        const parts = rawLine.split(',')
                            .map(p => p.trim().replace(/^"|"$/g, '')) // Remove quotes
                            .filter(p => p && p.length > 2 && !/^[0-9.\s]+$/.test(p)); // Filter short/numeric values

                        if (parts.length > 0) {
                            // Join meaningful parts, preferring Dhivehi text
                            extractedTitles.push(parts.join(' ').trim());
                        }
                    }
                }

                // If header row found, extract data starting from header row
                if (headerRowIndex > 0) {
                    setTitleRows(extractedTitles);
                    csvText = lines.slice(headerRowIndex).join('\n');
                } else {
                    setTitleRows([]);
                }

                // Parse CSV with PapaParse
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setHeaders(results.meta.fields || []);

                        // Filter out duplicate header rows and section title rows embedded in data
                        const filteredData = results.data.filter(row => {
                            // Skip rows where StrandNo and Strand equals the header name itself
                            const strandValue = row['StrandNo and Strand'] || row['StarndNo and Strand'] || '';
                            if (strandValue === 'StrandNo and Strand') return false;

                            // Skip empty data rows (no indicator code)
                            const indicatorCode = row['IndicatorCode'] || row['indicatorCode'] || '';
                            if (!indicatorCode || indicatorCode === 'IndicatorCode') return false;

                            return true;
                        });

                        // Preprocess data to fill in cascading hierarchy values
                        const processedData = fillCascadingValues(filteredData);
                        setData(processedData);

                        // Group data hierarchically: Strand > Substrand > Outcome > Indicators
                        const groupedData = groupByHierarchy(processedData);
                        setGrouped(groupedData);

                        setLoading(false);
                    },
                    error: (err) => {
                        setError(err);
                        setLoading(false);
                    },
                });
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        if (fileName) {
            loadData();
        }
    }, [fileName]);

    return { data, headers, loading, error, grouped, titleRows };
}

/**
 * Fill in cascading/hierarchical values from previous rows
 * Many CSVs only put Strand/Substrand/Outcome on the first row of a group
 */
function fillCascadingValues(data) {
    let lastStrand = '';
    let lastSubstrand = '';
    let lastSubstrandNo = '';
    let lastOutcome = '';
    let lastOutcomeNo = '';

    return data.map((row) => {
        const newRow = { ...row };

        // Get current values
        const strand = row['StrandNo and Strand'] || row['StarndNo and Strand'] || row['Strand'] || '';
        const substrand = row['Substrand'] || '';
        const substrandNo = row['SubstrandNo'] || '';
        const outcome = row['Outcomes'] || '';
        const outcomeNo = row['OutcomeNo'] || '';

        // If current row has values, update "last seen"
        if (strand) lastStrand = strand;
        if (substrand) lastSubstrand = substrand;
        if (substrandNo) lastSubstrandNo = substrandNo;
        if (outcome) lastOutcome = outcome;
        if (outcomeNo) lastOutcomeNo = outcomeNo;

        // Fill in missing values from "last seen"
        // Use appropriate column name based on what exists
        if (!strand) {
            newRow['StrandNo and Strand'] = lastStrand;
        }
        if (!substrand) newRow['Substrand'] = lastSubstrand;
        if (!substrandNo) newRow['SubstrandNo'] = lastSubstrandNo;
        if (!outcome) newRow['Outcomes'] = lastOutcome;
        if (!outcomeNo) newRow['OutcomeNo'] = lastOutcomeNo;

        return newRow;
    });
}

/**
 * Group flat CSV data into hierarchical structure
 * Strand > Substrand > Outcome > Indicators
 * Handles various CSV column naming conventions
 */
function groupByHierarchy(data) {
    const strandMap = new Map();

    // Helper to get value from multiple possible column names
    const getField = (row, ...possibleNames) => {
        for (const name of possibleNames) {
            if (row[name] !== undefined && row[name] !== '') {
                return row[name];
            }
        }
        return '';
    };

    data.forEach((row) => {
        // Handle various column naming conventions
        const strandKey = getField(row,
            'StrandNo and Strand',
            'StarndNo and Strand',
            'Strand'
        ) || 'Unknown';

        const substrandKey = getField(row, 'SubstrandNo') || 'Unknown';
        const substrandTitle = getField(row, 'Substrand');
        const outcomeNo = getField(row, 'OutcomeNo') || 'Unknown';
        const outcomeTitle = getField(row, 'Outcomes');

        // Handle indicator code variations (some CSVs use lowercase)
        const indicatorCode = getField(row, 'indicatorCode', 'IndicatorCode');

        // Initialize strand if not exists
        if (!strandMap.has(strandKey)) {
            strandMap.set(strandKey, {
                id: strandKey,
                title: strandKey,
                substrands: new Map(),
            });
        }

        const strand = strandMap.get(strandKey);

        // Initialize substrand if not exists
        if (!strand.substrands.has(substrandKey)) {
            strand.substrands.set(substrandKey, {
                id: substrandKey,
                title: substrandTitle,
                outcomes: new Map(),
            });
        }

        const substrand = strand.substrands.get(substrandKey);

        // Initialize outcome if not exists
        if (!substrand.outcomes.has(outcomeNo)) {
            substrand.outcomes.set(outcomeNo, {
                id: outcomeNo,
                title: outcomeTitle,
                indicators: [],
            });
        }

        const outcome = substrand.outcomes.get(outcomeNo);

        // Add indicator with flexible column names
        outcome.indicators.push({
            code: indicatorCode,
            text: getField(row, 'Indicators'),
            informant: getField(row,
                'ސުވާލުކުރާނެ ފަރާތް',
                'ސުވާލުކުރާނެ ފަރާތް/Informant/Interviiewee/stakeholder'
            ),
            evidence: getField(row,
                'ބަލާނެ ލިޔެކިޔުން',
                'ބަލާނެ ލިޔެކިޔުން/Evidence'
            ),
            comment: getField(row, 'Comment'),
            observations: getField(row, 'General Observations'),
        });
    });

    // Convert Maps to Arrays for easier rendering
    const result = [];
    strandMap.forEach((strand) => {
        const strandObj = {
            id: strand.id,
            title: strand.title,
            substrands: [],
        };

        strand.substrands.forEach((substrand) => {
            const substrandObj = {
                id: substrand.id,
                title: substrand.title,
                outcomes: [],
            };

            substrand.outcomes.forEach((outcome) => {
                substrandObj.outcomes.push({
                    id: outcome.id,
                    title: outcome.title,
                    indicators: outcome.indicators,
                });
            });

            strandObj.substrands.push(substrandObj);
        });

        result.push(strandObj);
    });

    return result;
}

export default useChecklistData;
