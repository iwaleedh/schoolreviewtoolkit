# Developer Guide

## 25. Implementation Patterns

### 1. Creating a New Checklist Module

**Reference:** `src/components/sse/LT1.jsx`

```javascript
// 1. Define data structure
const checklistData = {
    areas: [{
        id: 'area1',
        title: 'Area Title',
        outcomes: [{
            id: 'outcome1',
            title: 'Outcome',
            indicators: [
                { id: 'ind1', text: 'Indicator text' }
            ]
        }]
    }]
};

// 2. State management
const [inputData, setInputData] = useState({});
const [expandedItems, setExpandedItems] = useState({});
const [comments, setComments] = useState({});

// 3. Scoring logic
const calculateRowPercentage = (indicatorId) => {
    // Calculate percentage of positive scores
};
```

### 2. Loading CSV Data

**Reference:** `src/hooks/useBackendData.js`

```javascript
import { useBackendData } from '../hooks/useBackendData';

// In component
const { data, headers, loading, error } = useBackendData('Dimension 2');

if (loading) return <Spinner />;
if (error) return <Error message={error.message} />;
```

### 3. Registering New Modules

**File:** `src/pages/SSEToolkit.jsx`

```javascript
// 1. Import component
import NewComponent from '../components/sse/NewComponent';

// 2. Add to tabs array
{ id: 'new-tab', label: 'New Label', icon: IconName }

// 3. Add render condition
{activeTab === 'new-tab' && <NewComponent />}
```

### 4. Report Page Structure

```jsx
<div id="page-X" className="report-page page-break-after">
    <div className="page-content font-dhivehi" dir="rtl">
        {/* RTL content */}
    </div>
    <div className="page-number">X</div>
</div>
```

---

## 26. Development Workflows

### Server Recovery Protocol

```bash
# 1. Check port
lsof -i :5173

# 2. Kill stuck process
kill -9 <PID>

# 3. Restart dev server
npm run dev

# 4. Verify at http://localhost:5173
```

### Database Operations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name <migration_name>

# Reset database
npx prisma migrate reset

# View data
npx prisma studio
```

### Build & Deploy

```bash
# Frontend build
npm run build

# Start production server
npm run preview

# Backend start
cd server && node index.js
```

---

## 27. Agents, Skills & Tools

The following agents/skills from `.agent/skills/` are recommended for specific tasks:

### Frontend Development

| Task | Recommended Skills | Purpose |
|------|-------------------|---------|
| React Components | `react-best-practices`, `react-patterns` | Component optimization, hooks usage |
| UI/UX Design | `ui-ux-pro-max`, `frontend-design` | Design system, accessibility |
| CSS/Styling | `tailwind-patterns`, `web-design-guidelines` | RTL support, responsive design |
| Forms | `form-cro`, `react-ui-patterns` | Form validation, UX patterns |

### Backend Development

| Task | Recommended Skills | Purpose |
|------|-------------------|---------|
| Prisma/Database | `prisma-expert`, `postgres-best-practices` | Schema design, queries, migrations |
| API Design | `api-patterns`, `api-documentation-generator` | RESTful design, documentation |
| Node.js | `nodejs-best-practices`, `backend-dev-guidelines` | Express patterns, error handling |
| Authentication | `clerk-auth`, `api-security-best-practices` | JWT, RBAC implementation |

---

## Quick Reference Commands

### Development

```bash
# Start frontend dev server
npm run dev

# Start backend server
cd server && node index.js
```

### Database

```bash
# Prisma commands from /server directory
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

### Build

```bash
npm run build
npm run preview
```

---

## File Structure Reference

```
SCHOOLREVIEWAPP/
├── app/                   # Frontend React app (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── sse/           # Main toolkit components
│   │   │   │   ├── analysis/  # Report and analytics
│   │   │   │   ├── Dimension1-5.jsx
│   │   │   │   ├── LT1.jsx, LT2.jsx, SEN_LT.jsx
│   │   │   │   └── SchoolProfile.jsx
│   │   │   └── ui/            # Reusable UI components
│   │   │       ├── Sidebar.jsx
│   │   │       └── Sidebar.css
│   │   ├── context/           # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Route pages
│   │   │   ├── SSEToolkit.jsx
│   │   │   └── SSEToolkit.css
│   │   ├── layouts/           # Layout components
│   │   │   ├── MainLayout.jsx
│   │   │   └── MainLayout.css
│   │   ├── config/            # Configuration files
│   │   ├── data/              # Static data files
│   │   ├── App.jsx            # Main app with routing
│   │   ├── App.css
│   │   └── index.css          # Global styles & design tokens
│   └── public/
│       └── checklists/        # CSV data files
├── context/               # Context documentation (7 files)
├── skills/                # Agent skills (30 curated folders)
├── .agent/
│   ├── workflows/         # AI workflows
│   └── templates/         # Planning templates
└── school_review_app_prompt.md  # Master Context Index
```

---

## Important Notes for AI Assistant

1. **Always use RTL** for Dhivehi text with proper `dir="rtl"` and `font-dhivehi` class
2. **Faruma font** at 17px with line-height: 2 is mandatory for Dhivehi
3. **Check existing patterns** in similar components before implementing
4. **Maintain data isolation** - each school only sees their own data
5. **Use loading states** - show spinners during API calls
6. **A4 pagination** - reports must be properly paginated for print
7. **Export compatibility** - use inline CSS (hex colors) for Word export
8. **Module ID convention** - internal IDs use `SSE_TOOLKIT`, labels show "School Review Toolkit"
