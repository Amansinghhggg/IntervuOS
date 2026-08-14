# IntervuOS Design System & Styling Architecture Guide (`styling.md`)
> **Standard Operating Procedure for UI/UX & Frontend Engineers**  
> *Crafted for high-trust Enterprise ATS & Candidate Practice Portals (Linear / Stripe / Vercel Aesthetic).*

---

## 1. Executive Design Philosophy

### The Golden Rule: Human Design vs. "AI-Generated" Clichés
Most AI-generated web apps look unmistakably generic: they overuse giant glowing radial blur gradients, heavy `rounded-3xl` bubble cards, hyper-saturated rainbow borders, uppercase bold fonts everywhere, and 5 different bright purple buttons competing on a single screen.

**IntervuOS adheres to a disciplined, human-crafted design language:**
1. **Restraint Over Decoration**: Depth is created with quiet, intentional surface hierarchy—not floating glow blobs or heavy dropshadows.
2. **Single Primary CTA per View**: Every screen has exactly **one** primary intention. Only this button receives solid purple fill (`#5B3AF2`). Secondary and tertiary actions use quiet tints or outlines.
3. **Enterprise Trust & Data Density**: Employers must feel they are using a serious, production-grade hiring platform (like Stripe Radar or Linear Insights). Candidates must feel empowered by clean, transparent, stress-free tooling.
4. **8px Spatial System**: All spacing, padding, margins, and gaps strictly follow an 8px grid scale (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`).

---

## 2. Color System & Design Tokens (Tailwind v4 `@theme`)

All colors are centralized in `frontend/src/index.css`. Never hardcode random hex values or ad-hoc Tailwind colors in component JSX.

```css
@theme {
  /* Surface & Canvas System */
  --color-canvas: #0B0B0E;              /* App base background */
  --color-canvas-secondary: #101015;    /* Deep background contrast */
  --color-surface: #16161E;             /* Card & container surface */
  --color-surface-hover: #1E1E2A;       /* Interactive hover surface */
  
  /* Primary Accent System */
  --color-primary: #5B3AF2;             /* High-intent solid primary CTA */
  --color-primary-hover: #472CD7;       /* Primary hover state */
  --color-primary-tint: rgba(99, 56, 246, 0.15); /* Selected pills & badges */
  
  /* Borders & Dividers */
  --color-border: #232330;              /* Standard 1px card/divider border */
  --color-border-active: #6338F6;       /* Active focus / selected border */
  
  /* Typography Hierarchy */
  --color-text-primary: #FFFFFF;        /* Headings & key metrics (19.8:1 AAA) */
  --color-text-secondary: #94A3B8;      /* Supporting descriptions & labels */
  --color-text-muted: #6E7A8A;          /* Inactive hints, timestamps, icons */
  --color-text-accent: #C4B5FD;         /* Active tags, links, selected pills */
  
  /* Semantic Status Indicators */
  --color-success: #10B981;             /* Emerald: Strong Hire / Passing / Complete */
  --color-warning: #F59E0B;             /* Amber: Borderline / In Progress / Pending */
  --color-danger: #F43F5E;              /* Rose: Review Required / Insufficient */
}
```

### The 60-30-10 Color Distribution Rule
- **60% Base / Canvas**: Deep neutral dark canvas (`#0B0B0E`).
- **30% Structural Surfaces**: Clean card containers (`#16161E`) and subtle 1px borders (`#232330`).
- **10% Intentional Accent**: High-focus purple (`#5B3AF2` / `--color-primary-tint`) and status colors.

---

## 3. Typography & Text Hierarchy

We use Google's **Inter** typeface with optical tracking and disciplined font weighting.

| Element | Size | Weight | Tracking | Case | Color Token |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Title (`h1`)** | `20px - 24px` (`text-xl sm:text-2xl`) | `500` (`font-medium`) | `tracking-tight` | Sentence case | `var(--text-primary)` |
| **Section Header (`h2`)** | `14px - 16px` (`text-sm sm:text-base`) | `500` (`font-medium`) | `normal` | Sentence case | `var(--text-primary)` |
| **Card Header (`h3`)** | `14px - 16px` (`text-sm sm:text-base`) | `500` (`font-medium`) | `normal` | Sentence case | `var(--text-primary)` |
| **Body & Form Text** | `12px - 14px` (`text-xs sm:text-sm`) | `400` (`font-normal`) | `normal` | Sentence case | `var(--text-secondary)` |
| **Key Metric Value** | `20px - 28px` (`text-xl sm:text-2xl`) | `500` (`font-medium`) | `tracking-tight` | Numeric | Semantic / Primary |
| **Eyebrow / Status Tag** | `10px - 11px` (`text-[10px] text-[11px]`) | `500` (`font-medium`) | `normal` | Sentence case | `var(--color-text-accent)` |

### Typography Guidelines:
- **NO ALL-CAPS Headings**: Never write `MOCK INTERVIEW STUDIO` in uppercase. Use clean **Sentence case**: `Mock interview studio`.
- **Restrained Font Weights**: Avoid `font-black` and `font-extrabold` across standard UI. Reserve `font-semibold` (600) for critical numbers and `font-medium` (500) for titles.

---

## 4. Layout Architecture & Viewport Usage

### Avoiding the "Sticky Note / Boxed-in" Trap
Never constrain standard dashboard pages with arbitrary small widths (like `max-w-3xl` or `max-w-5xl`) that leave massive empty black voids on modern monitors.

```jsx
/* Standard Full-Width Page Container */
<div className="w-full min-h-screen bg-[var(--background)] font-['Inter'] pb-20 text-[var(--text-primary)]">
  <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 space-y-6">
    {/* Page Header */}
    {/* 12-Column Responsive Workspace */}
  </div>
</div>
```

### Standard 12-Column Dashboard Grid
- **Main Interaction Area**: `lg:col-span-8` (Forms, Pipelines, Reports, Job Configurations).
- **Sticky Summary / Action Console**: `lg:col-span-4` (Live overview, parameter validation, primary CTA with `sticky top-6`).

---

## 5. UI Component Design Rules

### 1. Button System (Action Hierarchy)

```jsx
/* Single Primary CTA (Highest Intent on the Screen) */
<button className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-[0.99] text-white font-medium text-xs rounded-xl shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
  Launch Mock Interview
</button>

/* Secondary Action / Selection Pill (Selected State) */
<button className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)] transition-all duration-150">
  Selected Option
</button>

/* Neutral / Inactive Pill */
<button className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[var(--background)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--border)]/80 transition-all duration-150">
  Inactive Option
</button>
```

### 2. Cards & Containers
- **Border**: Clean 1px solid `border border-[var(--border)]` (optional subtle hover highlight: `hover:border-[var(--color-border-active,#6338F6)]/60`).
- **Surface**: `bg-[var(--card)]` (`#16161E`).
- **Radius**: `rounded-2xl` (`16px`). Avoid exaggerated pill corners.
- **Shadow**: `shadow-xs` or `shadow-sm`. Do not use `shadow-2xl`.

### 3. Inputs & Textareas
- **Surface**: `bg-[var(--background)]` (`#0B0B0E`) nested inside card surfaces.
- **Border**: `border border-[var(--border)]` (`#232330`).
- **Focus**: `focus:outline-none focus:border-[var(--color-border-active,#6338F6)]`.
- **Radius & Padding**: `px-3.5 py-2.5 rounded-xl text-xs sm:text-sm`.

### 4. Modals & Dialog Drawers
- **Backdrop**: `bg-black/70 backdrop-blur-sm`.
- **Card**: Flat `bg-[var(--card)] border border-[var(--border)]/80 rounded-2xl max-w-3xl shadow-xl`.
- **Close Button**: Quiet top-right square button `p-1.5 rounded-lg bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]`.

### 5. Semantic Status Badges
```jsx
/* Strong Hire / Pass */
<span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  Strong Hire
</span>

/* Hire / Passing */
<span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--primary-tint)] text-[var(--color-text-accent)] border border-[var(--primary)]/30">
  Hire
</span>

/* Borderline */
<span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
  Borderline
</span>

/* Needs Improvement */
<span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
  Needs Improvement
</span>
```

---

## 6. Portal-Specific UX Guidelines

### For Employer Portal:
- **Tone**: Authoritative, executive, data-driven ATS.
- **Layouts**: High-clarity candidate evaluation tables, searchable campaign pipelines, instant STAR scoring cards, and audio playback transcript review.
- **Actions**: Batch export, candidate status triage (Hire / Reject / Hold), campaign configuration.

### For Candidate Portal:
- **Tone**: Stress-reducing, transparent, welcoming, confidence-building.
- **Layouts**: Transparent credit balance pill, structured step-by-step interview setup, instant question-by-question technical feedback reports.
- **Actions**: Launch mock interview, top up credits, review past evaluation archives.

---

## 7. Pre-Commit UI Quality Checklist
Before shipping any new page or modifying an existing feature, verify:
- [ ] Only **ONE** solid `#5B3AF2` primary button is visible on screen.
- [ ] No unclosed or hardcoded legacy colors (e.g. `bg-slate-900`, `text-indigo-600`, `text-white-400`).
- [ ] Headings are in **Sentence case** and use `font-medium` (500 weight).
- [ ] Layout utilizes full screen width (`px-4 sm:px-8 xl:px-10`) without artificial boxed-in constraints.
- [ ] All inputs and buttons have fast `transition-colors duration-150` interactions.
- [ ] Build passes with `npm run build` with **0 errors**.
