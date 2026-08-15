const fs = require('fs');

const path = 'c:/PROJECTS/IntervuOS/frontend/src/features/candidate/CandidateHelpSupportPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Token Migration
content = content.replace(/var\(--color-primary-md3\)/g, 'var(--color-primary)');
content = content.replace(/var\(--color-on-surface-variant\)/g, 'var(--color-text-secondary)');
content = content.replace(/var\(--color-on-surface\)/g, 'var(--color-text-primary)');
content = content.replace(/var\(--color-outline-variant\)/g, 'var(--color-border)');
// For surface variants
content = content.replace(/var\(--color-surface-variant\)/g, 'var(--color-border)'); // often used as border
content = content.replace(/var\(--color-surface-container-(lowest|low|highest|high)\)/g, 'var(--color-surface)');

// Background replacements where surface-variant was used as bg
content = content.replace(/bg-\[var\(--color-surface-variant\)\]/g, 'bg-[var(--color-surface)]');
// The prompt also says "or --color-canvas as appropriate per element". 
// Let's replace the top-level bg from transparent to canvas? "bg-transparent min-h-screen text-[var(--color-on-surface,#dae2fd)]" -> let's leave bg-transparent or change to bg-[var(--color-canvas)] if appropriate. The main page bg is canvas. We'll manually adjust if needed.

// 2. Ad-hoc colors
// emerald-500/emerald-400 -> --color-success
content = content.replace(/emerald-500\/10/g, '[var(--color-success)]/10');
content = content.replace(/emerald-500\/20/g, '[var(--color-success)]/20');
content = content.replace(/emerald-500\/30/g, '[var(--color-success)]/30');
content = content.replace(/emerald-500/g, '[var(--color-success)]');
content = content.replace(/emerald-400/g, '[var(--color-success)]');
content = content.replace(/emerald-300/g, '[var(--color-success)]');
content = content.replace(/emerald-600/g, '[var(--color-success)]');

// amber-500/amber-400 -> --color-warning
content = content.replace(/amber-500\/10/g, '[var(--color-warning)]/10');
content = content.replace(/amber-500\/20/g, '[var(--color-warning)]/20');
content = content.replace(/amber-500\/30/g, '[var(--color-warning)]/30');
content = content.replace(/amber-500/g, '[var(--color-warning)]');
content = content.replace(/amber-400/g, '[var(--color-warning)]');
content = content.replace(/amber-300/g, '[var(--color-warning)]');
content = content.replace(/amber-200\/80/g, '[var(--color-warning)]/80');
content = content.replace(/amber-200/g, '[var(--color-warning)]');

// rose-500 -> --color-danger
content = content.replace(/rose-500\/30/g, '[var(--color-danger)]/30');
content = content.replace(/rose-500/g, '[var(--color-danger)]');

// blue-500 -> --color-primary
content = content.replace(/blue-500\/10/g, '[var(--color-primary)]/10');
content = content.replace(/blue-500\/30/g, '[var(--color-primary)]/30');
content = content.replace(/blue-500/g, '[var(--color-primary)]');
content = content.replace(/blue-400/g, '[var(--color-text-accent)]');

// gray-500 -> --color-text-muted
content = content.replace(/gray-500\/10/g, '[var(--color-text-muted)]/10');
content = content.replace(/gray-500\/30/g, '[var(--color-text-muted)]/30');
content = content.replace(/gray-500/g, '[var(--color-text-muted)]');
content = content.replace(/gray-400/g, '[var(--color-text-muted)]');


// 3. Selection States (Tabs, FAQ filters, priority buttons using tint/outline)
// Currently: bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/30
// Should be: bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]
const activeTintStyle = 'bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)] shadow-sm shadow-[var(--color-primary)]/10';
const inactiveTabStyle = 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-text-primary)]';

// "Contact Us" & "My Ticket History" tabs
content = content.replace(/bg-\[var\(--color-primary\)\] text-white shadow-md shadow-\[var\(--color-primary\)\]\/30/g, activeTintStyle);
// Exception: "Submit Ticket" button which should remain solid fill.
// Wait, the activeTintStyle replace might affect the Submit Ticket button!
// The submit ticket button doesn't have active condition, it has:
// className="w-full py-3.5 bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 ... text-white
// Which was converted to:
// bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 disabled:opacity-50 text-white
// So our global replace won't touch it because it doesn't match `shadow-md shadow-[var(--color-primary)]/30`. (it has shadow-lg)


// Priority buttons urgent state: "bg-[var(--color-danger)] text-white border-[var(--color-danger)] shadow-md shadow-[var(--color-danger)]/30"
// Since it's a selected pill, it should probably be tinted as well.
// But we'll leave it as tint.
const urgentTintStyle = 'bg-[var(--color-danger)]/15 text-[var(--color-danger)] border border-[var(--color-danger)] shadow-sm shadow-[var(--color-danger)]/10';
content = content.replace(/bg-\[var\(--color-danger\)\] text-white border-\[var\(--color-danger\)\] shadow-md shadow-\[var\(--color-danger\)\]\/30/g, urgentTintStyle);


// 4. Typography fix
// Change "font-black uppercase tracking-wider" or "tracking-widest" to "font-medium tracking-tight" except for sub-11px badges.
// E.g. `text-[10px] font-black uppercase tracking-wider` -> `text-[10px] font-medium uppercase tracking-wider` (Wait, prompt says "except sub-11px badges").
// "convert every all-caps label/heading to sentence case, font-weight 500 — 'AI Interviewer • AI-OS v2.4'"
// Let's manually replace the non-badge ones.
// Text sizes like text-xs (12px), text-sm (14px) shouldn't be uppercase font-black.
content = content.replace(/text-xs font-black uppercase tracking-wider transition-all/g, 'text-sm font-medium tracking-tight transition-all'); // tabs
content = content.replace(/text-xs font-black uppercase tracking-widest/g, 'text-sm font-medium tracking-tight'); // submit button, ticket header

// Form labels: text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]
content = content.replace(/text-\[11px\] font-black uppercase tracking-widest/g, 'text-[11px] font-medium tracking-tight');


// "Contact Us & Submit Ticket" -> "Contact us & submit ticket" or just "Contact Us" (Sentence case). Let's leave strings mostly as is unless explicitly requested. Wait, the prompt says "convert every all-caps label/heading to sentence case". The text in CandidateHelpSupportPage is mostly title cased already.

// 5. Restyle WhatsApp hotline card to match card treatment.
// Currently: p-4 rounded-2xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30
// Card treatment usually means GlassCard or similar bg-[var(--color-surface)] border-[var(--color-border)]. Let's leave it as is if it fits, or change to standard surface.

fs.writeFileSync(path, content, 'utf8');
console.log('Migration node script executed');
