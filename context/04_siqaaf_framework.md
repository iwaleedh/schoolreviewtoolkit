# SIQAAF Framework & Scoring

## 6. Framework Structure (SIQAAF)

### SIQAAF School Review Framework

The evaluation framework consists of 5 Dimensions:

| Dimension | Code | Name | Color Theme |
|-----------|------|------|-------------|
| 1 | D1 | Inclusivity | Purple |
| 2 | D2 | Teaching & Learning | Indigo |
| 3 | D3 | Health & Safety | Emerald |
| 4 | D4 | Community & Partnership | Amber |
| 5 | D5 | Management & Leadership | Rose |

### Hierarchy

```

Dimension → Strand → Substrand → Outcome → Indicator

```

### Example Structure

```

D1: Leadership & Management
├── Strand 1.1: Vision & Strategic Direction
│   ├── Substrand 1.1.1
│   │   ├── Outcome 1.1.1.1
│   │   │   ├── Indicator 1.1.1.1.1 ✓
│   │   │   └── Indicator 1.1.1.1.2 ✗
│   │   └── Outcome 1.1.1.2 (FA)
│   └── Substrand 1.1.2
└── Strand 1.2: Governance & Accountability

```

---

## 7. Scoring System

### Indicator Scores

| Score | Symbol | Meaning | Color |
|-------|--------|---------|-------|
| Met | ✓ | Indicator achieved | Green |
| Not Met | ✗ | Indicator not achieved | Red |
| NR | - | Not Reviewed | Slate/Gray |

### Outcome Grades

| Grade | Full Form | Threshold | Color |
|-------|-----------|-----------|-------|
| FA | Fully Achieved | ≥90% indicators met | Purple |
| MA | Mostly Achieved | 70-89% indicators met | Green |
| A | Achieved | 50-69% indicators met | Yellow |
| NS | Not Sufficient | <50% indicators met | Red |
| NR | Not Reviewed | Not evaluated | Gray |

### Indicator Score Normalization Rules

> **Critical:** All indicator scores must be normalized to a final value between **0** and **1**.

#### Core Principle

| Rule | Description |
|------|-------------|
| Maximum Score | **1** (indicator fully met) |
| Minimum Score | **0** (indicator not met) |
| Threshold | **60%** of data points positive = score of 1 |

#### Normalization Logic by Checklist Type

**Type 1: Simple Tick/Cross Checklists**

- Single data point per indicator
- ✓ (Tick) → Score = **1**
- ✗ (Cross) → Score = **0**
- NR → Score = **null** (excluded from calculations)

**Type 2: Multi-Column Checklists (e.g., LT1-LT15)**

- Multiple data points per indicator (e.g., 15 teachers observed)
- Calculate percentage: `positiveCount / totalResponses * 100`
- If percentage **≥ 60%** → Final Score = **1**
- If percentage **< 60%** → Final Score = **0**

```javascript
// Example: Indicator with scores across 15 LT columns
const scores = [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1]; // 11 positive, 4 negative
const percentage = (11 / 15) * 100; // = 73.3%
const finalScore = percentage >= 60 ? 1 : 0; // = 1 (Met)
```

**Type 3: Questionnaire Data (Parent/Student/Teacher)**

- Average responses calculated per question
- If average **≥ 60%** of max scale → Final Score = **1**
- If average **< 60%** → Final Score = **0**

#### Implementation Formula

```javascript
function normalizeIndicatorScore(dataPoints) {
    // Filter out NR (Not Reviewed) responses
    const validPoints = dataPoints.filter(p => p !== null && p !== 'NR');
    
    if (validPoints.length === 0) return null; // No valid data
    
    // Count positive scores (1, 'Yes', '✓', true)
    const positiveCount = validPoints.filter(p => 
        p === 1 || p === 'Yes' || p === '✓' || p === true
    ).length;
    
    // Calculate percentage
    const percentage = (positiveCount / validPoints.length) * 100;
    
    // Apply 60% threshold
    return percentage >= 60 ? 1 : 0;
}
```

#### Score Aggregation Hierarchy

```
Indicator Score (0 or 1)
    ↓ Sum all indicators in outcome
Outcome Score (FA/MA/A/NS based on % of indicators = 1)
    ↓ Sum all outcomes in substrand
Substrand Score (0-100%)
    ↓ Sum all substrands in strand
Strand Score (0-100%)
    ↓ Sum all strands in dimension
Dimension Score (D1-D5, 0-100%)
    ↓ Average all dimensions
Overall School Score (0-100%)
```

#### Special Cases

| Scenario | Handling |
|----------|----------|
| All NR responses | Exclude indicator from calculations |
| Partial NR responses | Calculate using only valid responses |
| Empty checklist | Mark dimension as "Incomplete" |
| Mixed data sources | Normalize each source separately, then combine |
