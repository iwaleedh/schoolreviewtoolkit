# School Review Toolkit - Product Overview

> **Application Name:** School Review Toolkit  
> **Version:** Academic Year 2026  
> **Organization:** Quality Assurance Department (QAD), Ministry of Education, Maldives

---

## 1. System Context

You are an AI assistant helping to build and maintain the **School Review Toolkit** web application. This system enables:

1. **Schools** - Self-review, data entry, checklist completion, and report generation
2. **Quality Assurance Department (QAD)** - External school reviews and inspections
3. **School Administrators (SA)** - Intervention planning, progress tracking, and school improvement oversight
4. **System Administrators** - School management, user management, and system configuration

### User Roles & Permissions

| Role | Scope | Key Capabilities |
|------|-------|------------------|
| **PRINCIPAL** | Own school | Complete checklists, enter data, generate reports |
| **TEACHER** | Own school | View checklists, limited data entry |
| **QAD_REVIEWER** | Assigned schools | External reviews, inspection reports |
| **SCHOOL_ADMIN (SA)** | All schools | View weak areas, input recommendations, track interventions |
| **ADMIN** | System-wide | User management, school creation, system configuration |

### School Administrator (SA) Features

> **Purpose:** School Administrators oversee all schools' improvement journey, identifying weaknesses and managing intervention plans.

#### 1. School Weakness Analysis

| Feature | Description |
|---------|-------------|
| Weak Areas Dashboard | View lowest-scoring dimensions/strands per school |
| Cross-School Comparison | Compare weaknesses across all schools |
| Priority Ranking | Schools ranked by urgency of intervention |
| Historical Trends | Track if weaknesses are improving or worsening |

#### 2. Recommendations & Interventions

| Feature | Description |
|---------|-------------|
| Recommendation Input | Add recommendations for each identified weakness |
| Intervention Plans | Create structured improvement plans with timelines |
| Action Items | Define specific actions with assigned owners |
| Resources Allocation | Link resources/support to interventions |

#### 3. Implementation Tracking

| Feature | Description |
|---------|-------------|
| Progress Dashboard | Visual progress of all active interventions |
| Status Updates | Schools report implementation progress |
| Milestone Tracking | Key milestone achievements per plan |
| Evidence Collection | Upload proof of implementation |

#### 4. Overall Picture & Analytics

| Feature | Description |
|---------|-------------|
| Portfolio View | Bird's eye view of all schools' status |
| Intervention Impact | Measure pre/post intervention scores |
| Success Metrics | KPIs for intervention effectiveness |
| Reports | Generate SA-level summary reports |

### Terminology

- ✅ **Use:** "School Review Toolkit", "School Review"
- ❌ **Avoid:** "SSE Toolkit", "School Self Evaluation"

> **Note:** Internal module IDs (e.g., `SSE_TOOLKIT`) are retained for backward compatibility.

---

## 2. Application Overview

### Purpose

A comprehensive web portal for Maldivian school quality assurance featuring:

- Multi-dimensional checklist evaluation (5 Dimensions)
- Leading Teacher (LT) observation tools
- Questionnaire data collection (Parent/Student/Teacher)
- Automated report generation (A4 PDF/Word)
- Analytics dashboards
- Multi-school management

### Key Capabilities

| Capability | Description |
|------------|-------------|
| Checklist Evaluation | Score indicators (✓/✗/NR) and outcomes (FA/MA/A/NS/NR) |
| Data Collection | Capture survey responses with auto-calculated statistics |
| Report Generation | A4-paginated reports with TOC, charts, and analytics |
| Multi-tenancy | School isolation with role-based access control |
| Bilingual Support | English and Dhivehi (Thaana script, RTL) |
| **Admin Analytics** | Cross-school comparison, strengths/weaknesses analysis |
| **Dashboard Insights** | Lowest-scoring schools, dimension-wise rankings |
