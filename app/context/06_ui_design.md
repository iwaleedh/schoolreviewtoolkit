# UI Design & Standards

## 20. Mobile & Responsive Design

> **Purpose:** Optimize the application for various devices and use cases.

### Device Optimization

| Device | Primary Use | Layout |
|--------|-------------|--------|
| **Desktop** | Full data entry, reports | Full sidebar, multi-column |
| **Tablet** | QAD on-site reviews | Collapsible sidebar, touch-friendly |
| **Mobile** | Quick checks, notifications | Bottom nav, card-based |

### Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640-1024px | Collapsible sidebar, larger touch targets |
| Desktop | > 1024px | Full layout with sidebar |

### Touch Optimization

| Element | Mobile Optimization |
|---------|---------------------|
| Buttons | Minimum 44px touch target |
| Checkboxes | Larger hit area, swipe gestures |
| Forms | Native inputs, appropriate keyboards |
| Tables | Horizontal scroll, sticky headers |

### QAD Field Review Mode

| Feature | Description |
|---------|-------------|
| Simplified View | Essential info only |
| Large Touch Targets | Easy scoring on tablet |
| Voice Notes (future) | Record observations |
| Camera Integration | Quick evidence capture |

---

## 21. Dark Mode & Theme Support

> **Purpose:** Reduce eye strain and support user preferences.

### Theme Options

| Theme | Description | Use Case |
|-------|-------------|----------|
| **Light** | Default light theme | Normal use |
| **Dark** | Dark background, light text | Low-light conditions |
| **System** | Follow OS preference | Automatic |

### CSS Variables for Theming

```css
:root {
  /* Light theme (default) */
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

[data-theme="dark"] {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
}
```

### Theme Persistence

| Storage | Purpose |
|---------|---------|
| localStorage | Save user preference |
| CSS Media Query | Initial system preference |
| User Settings | Sync across devices |

---

## 23. Language & RTL Requirements

### Dhivehi (Thaana Script) Support

**Critical Requirements:**

- **Font Family:** Faruma (primary), MV Boli, Noto Sans Thaana
- **Text Direction:** RTL (Right-to-Left)
- **Font Size:** 17px (standardized for body text)
- **Line Height:** 2 (double spacing for readability)

### CSS Classes

```css
.font-dhivehi {
    font-family: 'Faruma', 'MV Boli', 'Noto Sans Thaana', sans-serif;
    direction: rtl;
    text-align: right;
    line-height: 2;
    font-size: 17px;
}
```

### Typography Hierarchy

| Element | Size | Weight |
|---------|------|--------|
| Strand Title | 20px | Bold |
| Substrand Title | 19px | Bold |
| Outcome Title | 18px | Regular |
| Indicator Text | 17px | Regular |

---

## 24. UI/UX Standards

### Color Coding

| Status | CSS Classes | Usage |
|--------|-------------|-------|
| Yes/Good/Met | `text-green-600`, `bg-green-50` | Positive indicators |
| No/Bad/Not Met | `text-red-500`, `bg-red-50` | Negative indicators |
| NR/Neutral | `text-slate-500` | Not reviewed items |

### Outcome Grade Colors

| Grade | Color |
|-------|-------|
| FA | Purple (`bg-purple-100`, `text-purple-700`) |
| MA | Green (`bg-green-100`, `text-green-700`) |
| A | Yellow (`bg-yellow-100`, `text-yellow-700`) |
| NS | Red (`bg-red-100`, `text-red-700`) |
| NR | Gray (`bg-gray-100`, `text-gray-700`) |

### Layout Standards

- **Container Width:** A4 width (`210mm`) for print compatibility
- **Page Breaks:** Use `.page-break-after` class
- **Print Styles:** Inline CSS (hex codes) for Word export
