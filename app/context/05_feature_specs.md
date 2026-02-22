# Feature Specifications

## 8. Navigation Layout

> **Reference:** The navigation should follow a sidebar layout with clear separation between Review Toolkit (checklists) and School Profile.

### Sidebar Navigation Structure

```
┌─────────────────────────────────┐
│  🏛️  School Logo/Brand         │
├─────────────────────────────────┤
│  📊  Overview (Dashboard)       │  → /dashboard
├─────────────────────────────────┤
│  📋  Review Toolkit ←(Active)   │  → /review-toolkit
│       All checklists + surveys  │
├─────────────────────────────────┤
│  🏫  School Profile             │  → /school-profile
│       School information forms  │
├─────────────────────────────────┤
│    Results/Achievements       │  → /results
├─────────────────────────────────┤
│  📊  Analytics                  │  → /analytics
├─────────────────────────────────┤
│  ❓  Support                    │  → /support
└─────────────────────────────────┘
```

### Menu Items (Dhivehi Labels)

| Icon | Dhivehi | English | Route | Content |
|------|---------|---------|-------|---------|
| 📊 | ވެށި | Overview | `/dashboard` | Dashboard with quick stats |
| 📋 | ރިވިއު ޓޫލްކިޓް | Review Toolkit | `/review-toolkit` | All checklists + Budget + Questionnaires (Parent/Student/Teacher) |
| 🏫 | ސްކޫލް ފޯމް | School Profile | `/school-profile` | School information (16 sections) |
| 📊 | ތަފާސް | Results | `/results` | Results & achievements |
| 📈 | ކުރިއެރުން | Analytics | `/analytics` | Charts & analysis |
| ❓ | ދެހީ | Support | `/support` | Help & documentation |

### Review Toolkit Content (Tabs)

The **Review Toolkit** page contains horizontal tabs for all Data Collection Tools:

| Row | Tabs |
|-----|------|
| **Primary Row** | Dimension 1, Dimension 2, Dimension 3, Dimension 4, Dimension 5, Leading Teacher (dropdown) |
| **Secondary Row** | Principal, Admin, Budget, General, Others, Foundation, Extra Curricular |
| **Questionnaire Tab** | Parent Data, Student Data, Teachers Data (as dropdown or separate tabs) |

### School Profile (Separate Page)

**School Profile** is accessible via its own sidebar menu item with 16 data entry sections covering school information, staff data, student enrollment, infrastructure, etc.

### Layout Specifications

| Element | Specification |
|---------|---------------|
| Sidebar Width | 280px (collapsed: 60px) |
| Sidebar Position | Right side (RTL layout) |
| Active State | Blue highlight with border |
| Icons | Lucide React icons |
| Font | Faruma for Dhivehi labels |

---

## 9. Feature Modules

### 1. School Profile Tab

- School basic information
- Staff data (teachers, admin, technical)
- Student enrollment by grade/gender
- Infrastructure details
- 16 sections with editable fields

### 2. Dimension Checklists (D1-D5)

| Component | File | Data Source |
|-----------|------|-------------|
| Dimension1.jsx | src/components/sse/ | Backend.csv (filtered) |
| Dimension2.jsx | src/components/sse/ | Backend.csv (filtered) |
| Dimension3.jsx | src/components/sse/ | Backend.csv (filtered) |
| Dimension4.jsx | src/components/sse/ | Backend.csv (filtered) |
| Dimension5.jsx | src/components/sse/ | Backend.csv (filtered) |

### 3. Leading Teacher (LT) Checklists

| Module | File | Purpose |
|--------|------|---------|
| LT1 | LT1.jsx | Leading Teacher checklist 1 |
| LT2 | LT2.jsx | Leading Teacher checklist 2 |
| SEN-LT | SEN_LT.jsx | Special Educational Needs LT |
| Foundation | Foundation.jsx | Foundation stage checklist |
| LessonPlanFS | LessonPlanFS.jsx | Foundation stage lesson plans |
| LessonPlanKS | LessonPlanKS.jsx | Key stage lesson plans |
| LessonObservationFS | LessonObservationFS.jsx | Foundation observation |
| LessonObservationKS | LessonObservationKS.jsx | Key stage observation |

### 4. Staff Checklists

| Module | File | Data Source |
|--------|------|-------------|
| Principal | Principal.jsx | PrincipalDP.csv |
| Admin | Admin.jsx | AdminHr.csv |
| Budget | Budget.jsx | BudgetChecklist.csv |
| General | General.jsx | GeneralD.csv |
| Others | Others.jsx | OtherStaffs.csv |

### 5. Questionnaire Data

| Module | File | Purpose |
|--------|------|---------|
| ParentData | ParentData.jsx | Parent survey responses |
| StudentData | StudentData.jsx | Student survey responses |
| TeachersData | TeachersData.jsx | Teacher survey responses |

### 6. Analysis & Reporting

| Module | File | Features |
|--------|------|----------|
| Report | analysis/Report.jsx | Full A4 report generator |
| Results | Results.jsx | Results summary and analytics |
| GeneralObs | GeneralObs.jsx | General observations |

---

## 12. Review Workflow System

> **Purpose:** Track the lifecycle of school reviews from draft to completion with proper state management.

### Review States

| State | Description | Actions Available |
|-------|-------------|-------------------|
| **DRAFT** | School is entering data | Save, Edit, Delete |
| **SUBMITTED** | School submits for QAD review | View only (school), Accept/Reject (QAD) |
| **UNDER_REVIEW** | QAD is actively reviewing | Add comments, Score, Request revision |
| **REVISION_REQUESTED** | QAD requests changes from school | Edit, Resubmit (school) |
| **APPROVED** | Review complete and approved | Generate report, Archive |
| **ARCHIVED** | Historical record | View only |

### State Transitions

```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → ARCHIVED
                  ↓              ↓
           REVISION_REQUESTED ←─┘
                  ↓
               SUBMITTED (resubmit)
```

### Review Workflow API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reviews/:schoolId/submit` | POST | Submit review for QAD |
| `/api/reviews/:schoolId/status` | GET | Get current review status |
| `/api/reviews/:schoolId/approve` | POST | QAD approves review |
| `/api/reviews/:schoolId/revision` | POST | QAD requests revision |
| `/api/reviews/:schoolId/history` | GET | Get state change history |

### Review Timeline Display

| Component | Description |
|-----------|-------------|
| Timeline View | Visual representation of state changes |
| Status Badge | Current state indicator in header |
| Action Buttons | Context-appropriate buttons based on state |
| History Log | Who changed what, when |

---

## 13. Notification System

> **Purpose:** Keep users informed of important events, deadlines, and required actions.

### Notification Types

| Type | Icon | Trigger | Recipients |
|------|------|---------|------------|
| **Deadline Reminder** | ⏰ | 7, 3, 1 days before due | School users |
| **Review Submitted** | 📤 | School submits review | QAD Reviewers |
| **Revision Requested** | 🔄 | QAD requests changes | School users |
| **Review Approved** | ✅ | QAD approves review | School users |
| **Intervention Due** | 📋 | Intervention milestone approaching | SA, School |
| **Score Alert** | ⚠️ | Score drops below threshold | SA, Admin |
| **System Update** | 🔔 | System announcements | All users |

### Notification Channels

| Channel | Description | Configuration |
|---------|-------------|---------------|
| **In-App** | Bell icon with badge count | Always on |
| **Email** | Email notifications | User preference |
| **Push** | Browser push (future) | User opt-in |

### Notification API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications` | GET | Get user's notifications |
| `/api/notifications/:id/read` | PUT | Mark as read |
| `/api/notifications/read-all` | PUT | Mark all as read |
| `/api/notifications/preferences` | GET/PUT | Notification settings |

### Notification UI Components

| Component | Location | Features |
|-----------|----------|----------|
| NotificationBell | Header | Badge count, dropdown list |
| NotificationList | Dropdown/Page | Grouped by date, mark read |
| NotificationSettings | Settings page | Channel preferences |

---

## 14. Audit Trail & Activity Log

> **Purpose:** Track all user actions for accountability and compliance.

### Tracked Actions

| Category | Actions Tracked |
|----------|-----------------|
| **Authentication** | Login, Logout, Failed attempts |
| **Scores** | Indicator changes, Outcome grades, Comments |
| **Documents** | Uploads, Downloads, Deletions |
| **Reviews** | State changes, Submissions, Approvals |
| **Admin** | User management, School creation, Config changes |
| **Data** | Imports, Exports, Bulk updates |

### Audit Log Structure

```javascript
AuditLog {
  id: string
  timestamp: DateTime
  userId: string
  userName: string
  action: string  // 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT'
  resource: string  // 'indicator' | 'outcome' | 'review' | 'user'
  resourceId: string
  schoolId: string
  previousValue: JSON
  newValue: JSON
  ipAddress: string
  userAgent: string
}
```

### Audit API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/audit/logs` | GET | Get audit logs (Admin only) |
| `/api/audit/logs/school/:id` | GET | Get school-specific logs |
| `/api/audit/logs/user/:id` | GET | Get user-specific logs |
| `/api/audit/export` | POST | Export audit logs |

### Score History

| Feature | Description |
|---------|-------------|
| Version History | See all previous values for any indicator |
| Change Comparison | Side-by-side view of changes |
| Restore Previous | Ability to revert to previous value (Admin) |

---

## 15. Evidence & Document Management

> **Purpose:** Allow schools to attach supporting evidence to indicators and outcomes.

### Supported File Types

| Category | Extensions | Max Size |
|----------|------------|----------|
| **Images** | jpg, jpeg, png, gif, webp | 10MB |
| **Documents** | pdf, doc, docx | 20MB |
| **Spreadsheets** | xls, xlsx | 10MB |
| **Videos** | mp4 (future) | 100MB |

### Evidence Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Indicator Evidence** | Proof of indicator achievement | Photos, documents |
| **Meeting Minutes** | Records of meetings | PDF, Word |
| **Policies** | School policies | PDF |
| **Training Records** | Staff training certificates | Images, PDF |
| **Student Work** | Samples of student achievements | Images |

### File Upload API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/files/upload` | POST | Upload file (multipart) |
| `/api/files/:id` | GET | Get file metadata |
| `/api/files/:id/download` | GET | Download file |
| `/api/files/:id` | DELETE | Delete file |
| `/api/files/indicator/:code` | GET | Get files for indicator |

### Storage Configuration

| Provider | Environment | Configuration |
|----------|-------------|---------------|
| Local FileSystem | Development | `./uploads/` |
| AWS S3 | Production | `BUCKET_NAME`, `AWS_REGION` |
| Cloudinary | Alternative | `CLOUD_NAME`, `API_KEY` |

### Evidence UI

| Component | Features |
|-----------|----------|
| FileUploader | Drag-drop, preview, progress |
| FileList | Thumbnails, download, delete |
| FileViewer | In-app preview for images/PDFs |
| AttachmentBadge | Count indicator on checklist items |

---

## 16. Calendar & Scheduling

> **Purpose:** Schedule QAD review visits and track important deadlines.

### Calendar Features

| Feature | Description |
|---------|-------------|
| **QAD Visit Scheduler** | Schedule external review dates |
| **Deadline Calendar** | View all submission deadlines |
| **Milestone Tracker** | Intervention milestone dates |
| **Academic Calendar** | Term dates, holidays |

### Calendar Events

| Event Type | Color | Description |
|------------|-------|-------------|
| QAD Visit | Blue | Scheduled external review |
| Submission Due | Red | Review submission deadline |
| Intervention | Orange | Intervention milestone |
| Holiday | Gray | School holidays |
| Meeting | Green | Scheduled meetings |

### Calendar API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calendar/events` | GET | Get events for date range |
| `/api/calendar/events` | POST | Create event (QAD/Admin) |
| `/api/calendar/events/:id` | PUT | Update event |
| `/api/calendar/events/:id` | DELETE | Delete event |
| `/api/calendar/school/:id` | GET | Get school's calendar |

### Scheduling Workflow

| Step | Actor | Action |
|------|-------|--------|
| 1 | QAD | Proposes visit date |
| 2 | School | Confirms or requests change |
| 3 | System | Sends reminders (7d, 3d, 1d before) |
| 4 | QAD | Marks visit as completed |

---

## 17. Offline Support (PWA)

> **Purpose:** Enable data entry in remote schools without reliable internet.

### Progressive Web App Features

| Feature | Description |
|---------|-------------|
| **Installable** | Add to home screen on mobile/desktop |
| **Offline Access** | View cached data without internet |
| **Background Sync** | Queue changes and sync when online |
| **Push Notifications** | Receive alerts even when app closed |

### Offline Capabilities

| Feature | Offline Behavior |
|---------|------------------|
| View Checklists | ✅ Cached CSV data |
| Enter Scores | ✅ Saved locally, synced later |
| View Reports | ✅ Cached reports |
| Upload Files | ⏳ Queued for upload |
| Submit Review | ⏳ Queued for submission |

### Data Sync Strategy

| Priority | Data Type | Sync Frequency |
|----------|-----------|----------------|
| High | Score changes | Immediate when online |
| Medium | File uploads | Background when online |
| Low | Static data (CSV) | Daily refresh |

### Conflict Resolution

| Scenario | Resolution |
|----------|------------|
| Same field edited offline by 2 users | Last write wins + notification |
| Server version newer | Prompt user to merge |
| Offline changes while logged out | Discard with warning |

### Service Worker

```javascript
// Cache strategies
const CACHE_FIRST = ['csv', 'static assets'];
const NETWORK_FIRST = ['api calls', 'dynamic data'];
const STALE_WHILE_REVALIDATE = ['user data', 'school profile'];
```

---

## 18. Comparison & Benchmarking

> **Purpose:** Compare school performance against various benchmarks.

### Comparison Types

| Type | Description | Access |
|------|-------------|--------|
| **School vs National Average** | Compare to all schools | All users |
| **School vs Atoll Average** | Compare to regional schools | All users |
| **School vs Similar Size** | Compare to similar enrollment | All users |
| **School vs Previous Year** | Year-over-year comparison | All users |
| **Multi-School Comparison** | Side-by-side comparison | Admin, SA |

### Benchmark Data

| Metric | Calculation | Update Frequency |
|--------|-------------|------------------|
| National Average | Mean of all school scores | Daily |
| Atoll Average | Mean per atoll/region | Daily |
| Size Category Average | Small/Medium/Large schools | Daily |
| Percentile Rank | School's position in distribution | Daily |

### Comparison Visualizations

| Chart Type | Purpose |
|------------|---------|
| Radar Overlay | School vs Benchmark on all dimensions |
| Bar Comparison | Side-by-side dimension scores |
| Trend Comparison | Historical trend vs benchmark |
| Percentile Gauge | Position in national ranking |

### Comparison API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/benchmarks/national` | GET | Get national averages |
| `/api/benchmarks/atoll/:code` | GET | Get atoll averages |
| `/api/benchmarks/school/:id/compare` | GET | Get school comparison data |
| `/api/benchmarks/rankings` | GET | Get national rankings |

---

## 19. Data Import & Export

> **Purpose:** Enable bulk data operations and integrations with other systems.

### Export Options

| Format | Content | Use Case |
|--------|---------|----------|
| **PDF Report** | Full formatted review report | Official submission |
| **Excel Data** | Raw score data with metadata | Analysis |
| **CSV Backup** | All school data | Backup/Migration |
| **JSON API** | Structured data export | Integration |

### Import Options

| Format | Content | Validation |
|--------|---------|------------|
| **Excel Template** | Historical scores | Schema validation |
| **CSV Bulk** | Large datasets | Type checking |
| **EMIS Integration** | Student/Staff data | API mapping |

### Import Workflow

| Step | Action | Validation |
|------|--------|------------|
| 1 | Upload file | File type, size check |
| 2 | Preview data | Show parsed data |
| 3 | Validate | Check required fields, types |
| 4 | Confirm | User reviews validation results |
| 5 | Import | Process with progress bar |
| 6 | Report | Summary of imported/skipped rows |

### Import/Export API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/export/school/:id/pdf` | GET | Export PDF report |
| `/api/export/school/:id/excel` | GET | Export Excel data |
| `/api/export/school/:id/backup` | GET | Full data backup |
| `/api/import/preview` | POST | Preview import data |
| `/api/import/execute` | POST | Execute import |
| `/api/import/template` | GET | Download import template |

### EMIS Integration (Future)

| Integration | Direction | Data |
|-------------|-----------|------|
| Student Data | EMIS → App | Enrollment, demographics |
| Staff Data | EMIS → App | Teacher qualifications |
| Results | App → EMIS | Review outcomes |

---

## 20. Editable Checklist UI Pattern

> **Purpose:** Standard UI pattern for all editable checklists (SEN-LT, LT1, LT2, Principal, Admin, etc.)

### Column Order (Left to Right)

All editable checklists MUST follow this column order:

| Order | Column | Header | Width | Purpose |
|-------|--------|--------|-------|---------|
| 1 | **Comment** | 💬 (emoji) | 60px | Comment button with popup modal |
| 2 | **Score** | Score | 80px | Single cycling score button |
| 3 | **Evidence** | ބަލާނެ ލިޔެކިޔުން (Evidence) | flex | RTL Dhivehi text from CSV |
| 4 | **Indicator** | މައުލޫމާތު (Indicator) | flex | RTL Dhivehi text from CSV |

### Score Button Behavior

**Single Cycling Button** - One button per indicator that cycles through states on each click:

```text
Click 1: Empty → ✓ (yes, green)
Click 2: ✓ → ✗ (no, red)
Click 3: ✗ → NR (gray)
Click 4: NR → Empty (dashed border)
```

| State | Icon | Color | CSS Class | Value |
|-------|------|-------|-----------|-------|
| Empty | `-` | Gray dashed | `.score-cycle-btn.empty` | `null` |
| Yes | ✓ (Check) | Green | `.score-cycle-btn.green` | `'yes'` |
| No | ✗ (X) | Red | `.score-cycle-btn.red` | `'no'` |
| NR | — (Minus) | Gray | `.score-cycle-btn.gray` | `'nr'` |

### Comment Feature

**Popup Modal** - Clicking the comment button (💬) opens a centered modal:

| Element | Position | Content |
|---------|----------|---------|
| Header | Top | Purple gradient, Dhivehi title "ކޮމެންޓް އިތުރުކުރައްވާ", X close button |
| Body | Middle | Indicator text reference, RTL textarea |
| Footer | Bottom | "Done" button |

**Comment Button States:**

- Empty: Gray border (`.comment-btn`)
- Has Comment: Green border (`.comment-btn.has-comment`)

### Required CSS Classes

```css
/* Score Cycling Button */
.score-cycle-btn { ... }
.score-cycle-btn.green { background: rgba(34, 197, 94, 0.15); }
.score-cycle-btn.red { background: rgba(239, 68, 68, 0.15); }
.score-cycle-btn.gray { background: rgba(107, 114, 128, 0.15); }
.score-cycle-btn.empty { border-style: dashed; }

/* Comment Button */
.comment-btn { ... }
.comment-btn.has-comment { color: green; border-color: green; }

/* Comment Popup Modal */
.comment-popup-overlay { position: fixed; z-index: 1000; }
.comment-popup { max-width: 500px; border-radius: lg; }
.comment-popup-header { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
```

### Context Functions (SSEDataContext)

| Function | Purpose | Usage |
|----------|---------|-------|
| `getIndicatorScore(code)` | Get current score | Display button state |
| `setIndicatorScore(code, value, source)` | Update score | Handle cycle click |
| `getIndicatorComment(code)` | Get comment text | Display in modal |
| `setIndicatorComment(code, comment)` | Save comment | On textarea change |

### Component Implementation

All editable checklists should use the `EditableChecklist` component:

```jsx
<EditableChecklist
  csvFileName="SEN_LT.csv"
  title="SEN Leading Teacher"
  titleDv="ސެން ލީޑިންގ ޓީޗަރ"
  source="SEN-LT"
/>
```

### Visual Reference

```
┌──────┬───────┬─────────────────────┬───────────────────────────────┐
│  💬  │ Score │ ބަލާނެ ލިޔެކިޔުން │ މައުލޫމާތު (Indicator)        │
├──────┼───────┼─────────────────────┼───────────────────────────────┤
│  💬  │  ✓   │ Evidence text RTL   │ Indicator description RTL     │
│  💬  │  ✗   │ Evidence text RTL   │ Indicator description RTL     │
│  💬  │  —   │ Evidence text RTL   │ Indicator description RTL     │
│  💬  │  -   │ Evidence text RTL   │ Indicator description RTL     │
└──────┴───────┴─────────────────────┴───────────────────────────────┘
```

---

## 21. LT Multi-Column Checklist Pattern

> **Purpose:** Specialized UI for Leading Teacher (LT) checklists with multiple observer input columns.

### Component: LTChecklist.jsx

Used for: **LT1.csv**, **LT2.csv** (and similar multi-observer checklists)

### Column Layout (Left to Right)

| Order | Column | Header | Width | Purpose |
|-------|--------|--------|-------|---------|
| 1 | **Comment** | 💬 | 40px | Comment button with popup modal |
| 2 | **Average** | Avg | 50px | Auto-calculated mean of LT scores |
| 3-12 | **LT1-LT10** | LT1...LT10 | 45px each | Individual observer input (10 columns) |
| 13 | **Evidence** | ބަލާނެ ލިޔެކިޔުން | 150px | RTL Dhivehi text |
| 14 | **Indicator** | މައުލޫމާތު | flex | RTL Dhivehi text |

### LT Score Button Behavior

Single cycling button per cell (cycle on click):

| State | Display | Color | Value |
|-------|---------|-------|-------|
| Empty | `-` | Gray | `null` |
| 1 | `1` | Green | `1` |
| 0 | `0` | Red | `0` |
| NA | `NA` | Gray | `'NA'` |

### Average Column Calculation

```javascript
// Calculate mean of numeric scores (1 or 0), ignoring NA
const avg = numericScores.reduce((a, b) => a + b, 0) / numericScores.length;
// Returns: 1, 0.X, or 'NA' if no numeric scores
```

### Drag-to-Scroll Feature

Table wrapper enables horizontal drag-scrolling:

| Feature | Description |
|---------|-------------|
| Cursor | `grab` when hovering, `grabbing` when dragging |
| Hint | "← Drag to scroll →" label at top |
| Scroll | Click and drag horizontally to pan table |
| Scrollbar | Styled purple gradient at bottom as fallback |

### Context Functions (SSEDataContext)

| Function | Purpose |
|----------|---------|
| `getIndicatorLTScore(code, ltColumn)` | Get score for specific LT column |
| `setIndicatorLTScore(code, ltColumn, value, source)` | Set score for specific LT column |

### Component Usage

```jsx
<LTChecklist
  csvFileName="LT1.csv"
  title="Leading Teacher 1"
  titleDv="ލީޑިން ޓީޗަރ 1"
  source="LT1"
/>
```
