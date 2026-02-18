# School Review Toolkit - Master Context Index

> **Application Name:** School Review Toolkit
> **Version:** Academic Year 2026
> **Organization:** Quality Assurance Department (QAD), Ministry of Education, Maldives

This file serves as the **Master Index** for the project context. To avoid "context rot", referencing specific modules below when working on tasks, rather than reading this entire file.

---

## 📂 Context Modules

### 1. [Product Overview](context/01_product_overview.md)
>
> **Contains:** System Context, User Roles, Application Overview, School Administrator Features.
> **Use when:** Understanding user permissions, high-level goals, and core capabilities.

### 2. [Analytics Specifications](context/02_analytics_specs.md)
>
> **Contains:** Admin Dashboard, School Strength/Weakness Analysis, Dimension Analytics, Charts & Graphs.
> **Use when:** Building dashboards, implementing charts, or working on the Admin Analytics features.

### 3. [Technical Architecture](context/03_tech_architecture.md)
>
> **Contains:** Tech Stack, Architecture Overview, Data Architecture (CSV), API Reference, Security.
> **Use when:** Setting up databases, writing endpoints, understanding the context/hook structure.

### 4. [SIQAAF Framework](context/04_siqaaf_framework.md)
>
> **Contains:** Framework Structure (Dimensions/Strands), Scoring System, Normalization Rules.
> **Use when:** Implementing scoring logic, understanding the evaluation hierarchy.

### 5. [Feature Specifications](context/05_feature_specs.md)
>
> **Contains:** Navigation, Feature Modules (Checklists, Profiles), Review Workflow, Notifications, Audit, Evidence, Calendar, Offline Support, Benchmark, Import/Export.
> **Use when:** Building specific application features and workflows.

### 6. [UI Design & Standards](context/06_ui_design.md)
>
> **Contains:** Mobile/Response Design, Theme Support (Dark Mode), Language & RTL (Dhivehi), UI/UX Standards.
> **Use when:** Styling components, ensuring responsiveness, or adding Dhivehi text.

### 7. [Developer Guide](context/07_developer_guide.md)
>
> **Contains:** Implementation Patterns, Development Workflows, Agents/Skills Reference, File Structure.
> **Use when:** Starting new modules, debugging, deploying, or looking for code patterns.

---

## 🚀 Quick Start

* **Frontend:** `npm run dev`
* **Backend:** `cd server && node index.js`
* **Docs:** Read `context/07_developer_guide.md` for patterns.

## 🧠 AI Agent Instructions

**Do not read all context files at once.**

1. Identify the domain of your task (e.g., "Fixing Scoring" -> `04_siqaaf_framework.md` + `07_developer_guide.md`).
2. Read ONLY the relevant context files.
3. Proceed with the "Recursive Language Model" approach.
