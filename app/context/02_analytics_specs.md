# Analytics Specifications

## 3. Admin Analytics & Dashboard Requirements

> **Critical Feature:** The Admin role must have comprehensive analytics capabilities to monitor all schools' performance, identify strengths and weaknesses, and make data-driven decisions.

### 1. School Strengths & Weaknesses Analysis

**Data Source:** School Profile Tab inputs

The system should analyze and visualize school performance across these categories:

| Category | Data Points | Analysis Type |
|----------|-------------|---------------|
| **Resources** | Budget allocation, infrastructure, facilities, equipment | Gap analysis, utilization rate |
| **Results** | Academic outcomes, exam pass rates, student progress | Trend analysis, comparison |
| **Human Resources** | Teacher qualifications, training, staff turnover | Capacity analysis |
| **Student Population** | Enrollment by grade/gender, SEN students, attendance | Demographics, trends |
| **Staff Population** | Teacher-student ratio, admin support, specialists | Adequacy assessment |

**Visualizations Required:**

- Radar/Spider charts showing strength areas vs weak areas
- Bar charts comparing resource allocation
- Trend lines showing improvement/decline over time
- Heat maps for quick identification of problem areas

### 2. Dimension-wise Analytics

**Location:** Analytics Tab (visible to Admin and authorized users)

#### Per-Dimension Analysis (D1-D5 Separately)

For each dimension, display:

| Metric | Description | Visualization |
|--------|-------------|---------------|
| Overall Score | Percentage of indicators met | Gauge/Progress ring |
| Outcome Distribution | Count of FA/MA/A/NS/NR grades | Stacked bar chart |
| Strand Breakdown | Score per strand within dimension | Horizontal bar chart |
| Strengths | Top 5 highest-scoring substrands | Ranked list (green) |
| Weaknesses | Bottom 5 lowest-scoring substrands | Ranked list (red) |
| Improvement Areas | Substrands with most NR indicators | Attention list (amber) |

#### Combined Dimension Analysis (All D1-D5 Together)

| View | Purpose | Visualization |
|------|---------|---------------|
| Dimension Comparison | Compare D1 vs D2 vs D3 vs D4 vs D5 scores | Radar chart |
| Overall School Score | Weighted or average across all dimensions | Large score display |
| Cross-Dimension Weakness | Indicators weak across multiple dimensions | Matrix view |
| Correlation Analysis | How dimensions relate to each other | Correlation heatmap |

### 3. Admin Dashboard - Cross-School Analytics

**Location:** Admin Dashboard (ADMIN role only)

#### Individual School View

| Feature | Description |
|---------|-------------|
| School Selector | Dropdown to select any school |
| School Scorecard | Summary card with overall scores |
| Dimension Radar | Visual comparison of D1-D5 for selected school |
| Profile Summary | Key stats from School Profile |
| Review History | Historical scores and completion dates |

#### Combined Schools View (All Schools Together)

| Feature | Description |
|---------|-------------|
| Schools Leaderboard | Ranked list of all schools by overall score |
| Lowest Scoring Schools | **Highlighted section** showing bottom 10 schools requiring attention |
| Dimension Rankings | Which schools excel/struggle in each dimension |
| Geographic View | Map showing school performance by location (if data available) |
| Comparison Tool | Select 2-5 schools to compare side-by-side |

#### Lowest Scoring Schools Section
>
> **Priority Display:** Schools that scored lowest should be prominently displayed

| Column | Description |
|--------|-------------|
| Rank | Position (1 = lowest score) |
| School Name | School identifier |
| Overall Score | Combined dimension score (%) |
| Weakest Dimension | The dimension with lowest score |
| Status | Review status (Complete/In Progress/Not Started) |
| Action | Link to view full analytics or assign reviewer |

**Sorting Options:**

- By Overall Score (ascending = lowest first)
- By Specific Dimension Score
- By Review Date
- By Improvement Rate

### Advanced Data Filtering & Query System

> **For ADMIN and SCHOOL_ADMIN roles:** A powerful query interface to filter and analyze specific data points across all schools.

#### Query Builder Interface

| Component | Description |
|-----------|-------------|
| Data Category Selector | Choose: Infrastructure, Staff, Students, Resources, Scores |
| Field Selector | Pick specific fields within category |
| Condition Builder | Set conditions (has/doesn't have, equals, greater than, etc.) |
| Output Format | Table, Chart, or Export (CSV/PDF) |

#### Pre-built Query Templates

| Query Name | Description | Example Output |
|------------|-------------|----------------|
| Internet Connectivity | % of schools with/without internet | 78% have internet, 22% don't |
| Lab Availability | Schools with/without computer labs | 65% have labs |
| Library Status | Schools with functional libraries | 82% have libraries |
| Teacher Qualification | % of qualified vs unqualified teachers | 91% qualified |
| Student-Teacher Ratio | Schools above/below threshold | 45% above 25:1 ratio |
| SEN Support | Schools with SEN facilities | 38% have SEN support |
| Budget Adequacy | Schools meeting budget requirements | 67% adequately funded |

#### Infrastructure Queries

| Field | Query Options |
|-------|---------------|
| Internet Connection | Has Internet / No Internet |
| Computer Lab | Has Lab / No Lab / Partial |
| Science Lab | Has Science Lab / No Science Lab |
| Library | Has Library / No Library |
| Playground | Has Playground / No Playground |
| Cafeteria | Has Cafeteria / No Cafeteria |
| Auditorium | Has Auditorium / No Auditorium |
| Sports Facilities | Has / Doesn't Have |
| Accessibility Features | Wheelchair Accessible / Not Accessible |

#### Staff Queries

| Field | Query Options |
|-------|---------------|
| Principal Qualified | Qualified / Not Qualified |
| Teacher Count | Above X / Below X / Equal to X |
| Trained Teachers % | Above 80% / 50-80% / Below 50% |
| Staff Turnover | High (>20%) / Medium / Low (<10%) |
| SEN Specialists | Has / Doesn't Have |
| Counselors | Has / Doesn't Have |

#### Student Population Queries

| Field | Query Options |
|-------|---------------|
| Total Enrollment | Ranges (0-100, 100-500, 500+) |
| Gender Ratio | Balanced / Male-heavy / Female-heavy |
| SEN Students | Has SEN / No SEN Students |
| Attendance Rate | Above 90% / 75-90% / Below 75% |
| Dropout Rate | Below 5% / 5-10% / Above 10% |

#### Performance Score Queries

| Field | Query Options |
|-------|---------------|
| Overall Score | Above 80% / 50-80% / Below 50% |
| Dimension 1 Score | Excellent / Good / Needs Improvement |
| Dimension 2 Score | Excellent / Good / Needs Improvement |
| Dimension 3 Score | Excellent / Good / Needs Improvement |
| Dimension 4 Score | Excellent / Good / Needs Improvement |
| Dimension 5 Score | Excellent / Good / Needs Improvement |
| Intervention Status | Active / Completed / None |

#### Query Results Display

```
┌─────────────────────────────────────────────────────────────┐
│  Query: Schools WITHOUT Internet Connection                 │
├─────────────────────────────────────────────────────────────┤
│  Results: 22 out of 100 schools (22%)                       │
├─────────────────────────────────────────────────────────────┤
│  # │ School Name          │ Location     │ Student Count   │
│  1 │ XYZ School           │ Atoll A      │ 234             │
│  2 │ ABC School           │ Atoll B      │ 156             │
│  ... (expandable list)                                      │
├─────────────────────────────────────────────────────────────┤
│  [Export CSV] [Export PDF] [Create Intervention Plan]       │
└─────────────────────────────────────────────────────────────┘
```

#### Combination Queries (AND/OR)

| Example Query | Logic |
|---------------|-------|
| Schools without internet AND without lab | AND condition |
| Schools with low score OR high dropout | OR condition |
| Rural schools AND below 50% score | Combined filters |

#### Query API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/query` | POST | Execute custom query |
| `/api/analytics/query/templates` | GET | Get pre-built templates |
| `/api/analytics/query/export` | POST | Export query results |
| `/api/analytics/query/save` | POST | Save custom query for reuse |

### 4. Analytics API Requirements

New endpoints needed for Admin analytics:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/school/:id/summary` | GET | Get single school analytics summary |
| `/api/analytics/school/:id/strengths` | GET | Get school strengths/weaknesses |
| `/api/analytics/school/:id/dimensions` | GET | Get dimension-wise breakdown |
| `/api/analytics/schools/all` | GET | Get all schools summary (Admin) |
| `/api/analytics/schools/rankings` | GET | Get schools ranked by score |
| `/api/analytics/schools/lowest` | GET | Get lowest scoring schools |
| `/api/analytics/comparison` | POST | Compare multiple schools |

### 5. Analytics Data Model

```
SchoolAnalytics {
  schoolId: string
  overallScore: number (0-100)
  dimensionScores: {
    D1: number,
    D2: number,
    D3: number,
    D4: number,
    D5: number
  }
  strengths: [{ area: string, score: number, category: string }]
  weaknesses: [{ area: string, score: number, category: string }]
  resourceMetrics: {
    budget: number,
    facilities: number,
    equipment: number
  }
  hrMetrics: {
    teacherStudentRatio: number,
    qualifiedTeachers: number,
    staffTurnover: number
  }
  populationMetrics: {
    totalStudents: number,
    totalStaff: number,
    senStudents: number
  }
  lastUpdated: DateTime
  reviewStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
}
```

### 6. Analytics Charts & Graphs

> **Visual Dashboard:** Comprehensive graphical representation of school performance across all key areas.

#### Dimension-wise Graphs (D1-D5)

| Dimension | Graph Type | Data Display |
|-----------|------------|--------------|
| D1: Inclusivity | Bar Chart | Outcome scores per substrand |
| D2: Teaching & Learning | Bar Chart | Outcome scores per substrand |
| D3: Health & Safety | Bar Chart | Outcome scores per substrand |
| D4: Community & Partnership | Bar Chart | Outcome scores per substrand |
| D5: Management & Leadership | Bar Chart | Outcome scores per substrand |

#### Dimension Bar Chart Specifications

> **Data Visualization:** Each dimension uses a stacked/grouped bar chart showing the count of outcomes by score level for each substrand.

**Score Color Coding:**

| Score | Color | Meaning |
|-------|-------|---------|
| **0** | 🔴 Red | Not achieved / Not Reviewed |
| **1** | 🩷 Pink | Minimally achieved |
| **2** | 🟢 Light Green | Partially achieved |
| **3** | 🟢 Dark Green | Fully achieved |

**Chart Structure:**

```

Substrand 1.1.1  ████████████████████  (outcomes: 0=2, 1=3, 2=5, 3=8)
Substrand 1.1.2  █████████████████     (outcomes: 0=1, 1=2, 2=4, 3=6)
Substrand 1.2.1  ███████████████████   (outcomes: 0=0, 1=1, 2=3, 3=9)
...

Legend: [🔴 Score 0] [🩷 Score 1] [🟢 Score 2] [🟢 Score 3]

```

**Implementation Details:**

| Element | Specification |
|---------|---------------|
| X-Axis | Substrand names (e.g., 1.1.1, 1.1.2, 1.2.1) |
| Y-Axis | Count of outcomes |
| Bar Type | Stacked horizontal or grouped vertical |
| Tooltip | Show exact count for each score level |
| Hover Effect | Highlight segment with count display |
| Export | Allow PNG/PDF export of chart |

**Data Aggregation:**

For each substrand, count outcomes by score:

- Count of outcomes with score = 0 (Red)
- Count of outcomes with score = 1 (Pink)
- Count of outcomes with score = 2 (Light Green)
- Count of outcomes with score = 3 (Dark Green)

#### Staff Performance Graphs

| Role | Chart Type | Metrics |
|------|------------|---------|
| **Principal** | Gauge + Radar | Leadership indicators, management score, overall rating |
| **Deputy Principal** | Gauge + Bar | Supervision score, delegation effectiveness |
| **Administrator** | Bar Chart | Administrative efficiency, compliance metrics |
| **Leading Teachers (LT)** | Multi-series Line | LT1-LT15 individual scores, average trend |
| **All Senior Staff Combined** | Composite Radar | Comparison across all senior roles |

#### Health & Safety Situation

| Chart | Description |
|-------|-------------|
| Health Compliance Gauge | % of health requirements met |
| Safety Checklist Progress | Progress bar for safety items |
| Incident Trend Line | Historical incidents over time |
| Health Resources Bar | Available vs Required resources |
| Risk Assessment Heatmap | Areas of concern by severity |

#### Academic Results (Last 3 Years)

| Chart Type | Data Shown |
|------------|------------|
| **Year-over-Year Line Graph** | Overall pass rate for 3 years |
| **Subject Performance Bar** | Performance by subject (Dhivehi, English, Math, Science, Islam) |
| **Grade Distribution Stacked** | % of students in each grade (A, B, C, D, F) |
| **Comparison Arrows** | Improvement/decline indicators |
| **National Average Line** | Benchmark comparison |

#### Literacy & Numeracy

| Chart | Description |
|-------|-------------|
| Literacy Rate Gauge | % of students meeting literacy standards |
| Numeracy Rate Gauge | % of students meeting numeracy standards |
| Grade-wise Breakdown | Bar chart by grade level |
| Trend Line (3 years) | Progress over time |
| Target vs Actual | Gap analysis visualization |

#### Foundation Stage

| Chart | Description |
|-------|-------------|
| Learning Outcomes Radar | All foundation stage learning areas |
| Developmental Milestones | Progress bar for each milestone category |
| Teacher Performance | Foundation stage teacher scores |
| Student Readiness | School readiness assessment results |
| Play-based Learning | Engagement metrics |

#### Overall Summary Dashboard

| Component | Visualization |
|-----------|---------------|
| **Overall Score Display** | Large circular gauge (0-100%) |
| **Dimension Comparison** | 5-point radar chart (D1-D5) |
| **Strengths Summary** | Top 5 green-highlighted cards |
| **Weaknesses Summary** | Bottom 5 red-highlighted cards |
| **Progress Timeline** | Horizontal timeline with milestones |
| **Quick Stats Cards** | Student count, Staff count, Overall grade |

#### Graph Implementation Specifications

| Library | Chart Types |
|---------|-------------|
| **Recharts** | Line, Bar, Radar, Pie, Gauge |
| **Chart.js** | Alternative for complex charts |
| **Custom SVG** | For specialized visualizations |

#### Graph Data API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/graphs/dimensions/:schoolId` | GET | Get dimension graph data |
| `/api/analytics/graphs/staff/:schoolId` | GET | Get staff performance data |
| `/api/analytics/graphs/health/:schoolId` | GET | Get health metrics |
| `/api/analytics/graphs/results/:schoolId` | GET | Get 3-year academic results |
| `/api/analytics/graphs/literacy/:schoolId` | GET | Get literacy/numeracy data |
| `/api/analytics/graphs/foundation/:schoolId` | GET | Get foundation stage data |
| `/api/analytics/graphs/summary/:schoolId` | GET | Get overall summary data |
