# ForkTalent Agent Coding Guidelines & Design System Rules

> **MANDATORY INSTRUCTIONS FOR ALL AI CODING AGENTS WORKING ON ForkTalent**  
> Every agent working on the frontend must strictly adhere to the guidelines below and the comprehensive specifications in [styling.md](file:///c:/PROJECTS/ForkTalent/styling.md).

---

## 1. Core Visual & UX Principles (Human-Crafted SaaS)

1. **NO "AI-Generated" Clichés**:
   - **Never** add floating radial blur glow circles (`blur-3xl`, `bg-purple-500/20`), decorative sparkle blobs, or heavy `shadow-2xl` boundaries.
   - **Never** use ALL-CAPS bold headings. Use **Sentence case** with `font-medium` (500 weight) and `tracking-tight`.
   - **Never** create "cards inside cards inside cards" or excessive bubble containers.

2. **The Single Primary CTA Rule**:
   - Every screen has exactly **ONE** primary intention. Only this button receives solid purple fill (`bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]`).
   - All secondary actions, selected pills, and tags must use tint fill (`bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]`).

3. **No "Sticky Note / Narrow Box" Trap**:
   - Use full responsive viewport width: `w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8`.
   - Do **not** constrain dashboard pages with arbitrary small widths (e.g. `max-w-3xl` or `max-w-5xl`) that leave empty black side voids on desktop monitors.

4. **8px Spatial Scale**:
   - Use consistent 8px rhythm for gaps, margins, and padding (`p-4`, `p-5`, `p-6`, `gap-3`, `gap-4`, `gap-6`, `space-y-4`, `space-y-6`).

---

## 2. Centralized Exponent Color Tokens

Always use centralized design tokens defined in `frontend/src/index.css`:

```css
--color-canvas: #0B0B0E;              /* App background */
--color-surface: #16161E;             /* Card surface */
--color-surface-hover: #1E1E2A;       /* Hover surface */
--color-primary: #5B3AF2;             /* Single high-intent CTA */
--color-primary-hover: #472CD7;       /* Primary hover */
--color-primary-tint: rgba(99, 56, 246, 0.15); /* Selected pills & badges */
--color-border: #232330;              /* 1px border */
--color-border-active: #6338F6;       /* Focus & selected border */
--color-text-primary: #FFFFFF;        /* Heading text */
--color-text-secondary: #94A3B8;      /* Body & label text */
--color-text-muted: #6E7A8A;          /* Inactive text */
--color-text-accent: #C4B5FD;         /* Selected pill text & links */
--color-success: #10B981;             /* Emerald */
--color-warning: #F59E0B;             /* Amber */
--color-danger: #F43F5E;              /* Rose */
```

**Prohibited**: Do not introduce legacy Tailwind colors (`bg-slate-900`, `bg-indigo-600`, `text-indigo-400`, `text-white-400`, or ad-hoc hex values).

---

## 3. Pre-Commit Build Verification

Always run and verify the frontend production build before finishing any task:
```bash
cmd /c "cd /d c:\PROJECTS\ForkTalent\frontend && npm run build"
```
Ensure **0 errors** and **0 syntax issues**.
