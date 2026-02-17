import { useState, useEffect } from 'react';
import Papa from 'papaparse';

/**
 * Hook to load and parse checklist CSV data
 * @param {string} fileName - Name of the CSV file (e.g., "Dimension 1.csv")
 * @param {Object} rowRange - Optional row range to filter data { start, end }
 * @returns {Object} { data, headers, loading, error, grouped, titleRows }
 */
export function useChecklistData(fileName, rowRange = null) {
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
                // Use import.meta.env.BASE_URL for GitHub Pages compatibility
                const basePath = import.meta.env.BASE_URL || '/';
                const response = await fetch(`${basePath}Checklist/${fileName}`);
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

                    // Handle row range if specified
                    let dataStartRow = headerRowIndex;
                    let dataEndRow = lines.length;

                    if (rowRange) {
                        // Row numbers are 1-based in the prop, convert to 0-based
                        // Always include the header row for proper parsing
                        if (rowRange.start) {
                            dataStartRow = Math.max(headerRowIndex, rowRange.start - 1);
                        }
                        if (rowRange.end) {
                            dataEndRow = rowRange.end;
                        }
                        // Include header row + selected data rows
                        csvText = lines.slice(headerRowIndex, headerRowIndex + 1).join('\n') + '\n' +
                            lines.slice(dataStartRow, dataEndRow).join('\n');
                    } else {
                        csvText = lines.slice(dataStartRow, dataEndRow).join('\n');
                    }
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
    }, [fileName, rowRange]);

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

    // Check if this is an LT-style CSV (has Dhivehi outcome columns)
    const isLTFormat = data.length > 0 && (
        Object.keys(data[0]).some(key => key.includes('އައުޓްކަމް')) ||
        Object.keys(data[0]).some(key => key.includes('އިންޑިކޭޓަރ'))
    );

    // For LT format, columns 3 and 4 are both named އައުޓްކަމް but represent different things
    // Column 3 (index 2) = OutcomeNo, Column 4 (index 3) = Outcome title
    const getOutcomeNoFromLT = (row) => {
        const keys = Object.keys(row);
        // First try to find the specific 'އައުޓްކަމް ނަމްބަރ' column (Outcome Number)
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].includes('އައުޓްކަމް ނަމްބަރ') || keys[i].includes('އައުޓްކަމް') && keys[i].includes('ނަމްބަރ')) {
                return row[keys[i]] || '';
            }
        }
        // Fallback: Find the first 'އައުޓްކަމް' column (OutcomeNo) for LT1/LT2 format
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].includes('އައުޓްކަމް') && !keys[i].includes('ނަމްބަރ')) {
                // Check if this looks like a number (e.g., 1.1.1.1)
                const value = row[keys[i]] || '';
                if (/^\d+(\.\d+)*$/.test(value.trim())) {
                    return value;
                }
            }
        }
        return '';
    };

    const getOutcomeTitleFromLT = (row) => {
        const keys = Object.keys(row);
        // First, try to find 'އައުޓްކަމް' column that is NOT the number column
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            // Skip the number column
            if (key.includes('އައުޓްކަމް') && !key.includes('ނަމްބަރ')) {
                const value = row[key] || '';
                // If it doesn't look like a number, it's the title
                if (!/^\d+(\.\d+)*$/.test(value.trim())) {
                    return value;
                }
            }
        }
        // Fallback: find the second 'އައުޓްކަމް' column
        let foundFirst = false;
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].includes('އައުޓްކަމް')) {
                if (foundFirst) {
                    return row[keys[i]] || '';
                }
                foundFirst = true;
            }
        }
        return '';
    };

    const getIndicatorTextFromLT = (row) => {
        const keys = Object.keys(row);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].includes('އިންޑިކޭޓަރ')) {
                return row[keys[i]] || '';
            }
        }
        return '';
    };

    // Extract strand prefix from OutcomeNo (e.g., "2.1" from "2.1.1.4")
    const getStrandFromOutcomeNo = (outcomeNo) => {
        if (!outcomeNo) return 'Unknown';
        const parts = outcomeNo.split('.');
        if (parts.length >= 2) {
            return `${parts[0]}.${parts[1]}`;
        }
        return outcomeNo;
    };

    data.forEach((row) => {
        let strandKey, substrandKey, substrandTitle, outcomeNo, outcomeTitle, indicatorText;

        if (isLTFormat) {
            // LT-style CSV with Dhivehi columns - check for proper structure first
            const hasProperStructure = Object.keys(row).some(key =>
                key.includes('ސަބް ސްޓްރޭންޑް') || key.includes('ސްޓްރޭންޑް')
            );

            if (hasProperStructure) {
                // New LT format with proper Strand/Substrand columns
                substrandKey = getField(row,
                    'ސަބް ސްޓްރޭންޑް ނަމްބަރ',
                    'SubstrandNo'
                ) || 'Unknown';

                // Get strand from column - now populated with actual strand names
                strandKey = getField(row,
                    'ސްޓްރޭންޑް އަދި ނަމްބަރ',
                    'StrandNo and Strand',
                    'Strand'
                );

                // Fallback to deriving from SubstrandNo only if strand column is empty
                if (!strandKey && substrandKey && substrandKey !== 'Unknown') {
                    const firstDigit = substrandKey.split('.')[0];
                    strandKey = `Dimension ${firstDigit}`;
                }
                strandKey = strandKey || 'Unknown';

                substrandTitle = getField(row,
                    'ސަބް ސްޓްރޭންޑް',
                    'Substrand'
                );

                outcomeNo = getOutcomeNoFromLT(row) || 'Unknown';
                outcomeTitle = getField(row,
                    'ކުރާނެ ކަންތައް (އައުޓްކަމް)',
                    'ކުރާނެ ކަންތައް'
                ) || getOutcomeTitleFromLT(row);

                indicatorText = getIndicatorTextFromLT(row);
            } else {
                // Old LT format without proper columns - derive from OutcomeNo
                outcomeNo = getOutcomeNoFromLT(row) || 'Unknown';
                outcomeTitle = getOutcomeTitleFromLT(row);
                indicatorText = getIndicatorTextFromLT(row);

                // Create virtual strand from outcome prefix (e.g., "2.1" from "2.1.1.4")
                strandKey = getStrandFromOutcomeNo(outcomeNo);

                // Use outcome's parent as substrand (e.g., "2.1.1" from "2.1.1.4")
                const parts = outcomeNo.split('.');
                if (parts.length >= 3) {
                    substrandKey = parts.slice(0, 3).join('.');
                } else {
                    substrandKey = outcomeNo;
                }
                substrandTitle = ''; // Old LT CSVs don't have substrand titles
            }
        } else {
            // Standard CSV format
            strandKey = getField(row,
                'StrandNo and Strand',
                'StarndNo and Strand',
                'Strand'
            ) || 'Unknown';

            substrandKey = getField(row, 'SubstrandNo') || 'Unknown';
            substrandTitle = getField(row, 'Substrand');
            outcomeNo = getField(row, 'OutcomeNo') || 'Unknown';
            outcomeTitle = getField(row, 'Outcomes');
            indicatorText = getField(row, 'Indicators', 'Indicator');
        }

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
            text: isLTFormat ? indicatorText : getField(row, 'Indicators', 'Indicator', 'ކަންތައްތައް'),
            informant: getField(row,
                'ސުވާލުކުރާނެ ފަރާތް',
                'ސުވާލުކުރާނެ ފަރާތް/Informant/Interviiewee/stakeholder'
            ),
            'ސުވާލުކުރާނެ ފަރާތް': getField(row,
                'ސުވާލުކުރާނެ ފަރާތް',
                'ސުވާލުކުރާނެ ފަރާތް/Informant/Interviiewee/stakeholder'
            ),
            evidence: getField(row,
                'ބަލާނެ ލިޔެކިޔުން',
                'ބަލާނެ ލިޔެކިޔުން/Evidence',
                'Evidence'
            ),
            howToCheck: getField(row,
                'ހޯދާބެލުން',
                'How to Check'
            ),
            generalObservation: getField(row,
                'General Observation',
                'ޖެނެރަލް އޮބްސަވޭޝަން'
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
