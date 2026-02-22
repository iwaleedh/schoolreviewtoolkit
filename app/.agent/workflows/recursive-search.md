---
description: How to tackle complex tasks using the Recursive Context Search (Scaffolding) strategy
---

# Recursive Context Search Workflow

> **Goal:** Solve tasks without stuffing the entire codebase into the context window.
> **Strategy:** PLAN -> SEARCH -> RETRIEVE -> EXECUTE

## 1. 📍 PLAN (The Map)

Before reading ANY code, create a plan based on the Master Context Index.

1. **Read the Master Index:** View `school_review_app_prompt.md`.
2. **Identify Domain:** Which module does this task belong to? (e.g., "Analytics" -> `context/02_analytics_specs.md`)
3. **Read Domain Context:** View the specific context file identified.
4. **Hypothesize Files:** List the specific files you *think* you need to touch (e.g., `src/components/sse/Dimension1.jsx`).

## 2. 🔍 SEARCH (The Google)

Don't guess paths. Verify them.

1. **Locate Files:** Use `find_by_name` or `grep_search` to find the exact paths of the files you hypothesized.
    * *Example:* `find_by_name(Pattern="*Dimension1*", SearchDirectory="src")`
2. **Confirm Existence:** Ensure you have the absolute paths.

## 3. 📄 RETRIEVE (The Microscope)

Read *only* what is necessary.

1. **View Target Files:** Use `view_file` on the confirmed paths.
2. **Breadth-First Search:** If you see an import (e.g., `import { calculateScore } from '../../context/SSEDataContext'`) that is critical, view that file next.
3. **Constraint:** Try not to have more than 3-5 code files open in context at once. Close/forget others if possible (conceptually).

## 4. 📝 EXECUTE (The Action)

Perform the task with high precision.

1. **Create Implementation Plan:** Write a `implementation_plan.md` if the task involves code changes.
2. **Modify Code:** Use `replace_file_content` or `multi_replace_file_content`.
3. **Verify:** Run the app or tests to confirm.

## 5. 💾 COMMIT (The Memory)

Don't let the knowledge vanish.

1. **Update Memory:** If you learned something new (e.g., "The API endpoint for scores is actually `/api/v2/scores`"), update the relevant `context/*.md` file.
2. **Update Task List:** Mark progress in `task.md`.
