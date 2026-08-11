# PARAKH AI — Frontend Refactor Implementation Plan

## Objective

Refactor the existing frontend from the current indigo/Inter/dark-mode design to the **Scaler Academy design system**: flat, square-corner, blue-brand, light-only, professional enterprise aesthetic.

---

## Design System Migration: Current → Target

| Aspect | Current | Target |
|---|---|---|
| **Font** | Inter | **Outfit** (free Clash Grotesk alternative) |
| **Primary CTA** | `#4f46e5` (indigo) | `#004CE5` (Scaler Blue) |
| **Secondary text/link** | indigo-700 | `#011A53` (Deep Link Blue) |
| **Secondary CTA fill** | `#f3f4f6` gray | `#E6F0FF` pale blue |
| **Page background** | `#f8f8f8` / `#111218` dark | `#FFFFFF` white |
| **Card background** | white / dark card | `#FFFFFF` white |
| **Text color** | Gray scale | `#000000` black |
| **Muted text** | `#6b7280` | `#64748B` |
| **Border radius** | `0.5rem`–`0.75rem` | **`0px`** (square, flat) |
| **Shadows** | Present on cards + buttons | **None** (flat UI) |
| **Border color** | `#e5e7eb` | `#E6F0FF` |
| **Dark mode** | Full dark/light toggle | **Removed** (light only) |
| **Spacing grid** | Mixed Tailwind defaults | **4px base** (`4, 8, 12, 16, 24, 32, 40, 48`) |
| **Visual density** | Medium | Medium-high (content-rich) |
| **Typography scale** | `h1: 1.875rem` | `h1: 2.5rem (40px)`, bold/extrabold |
| **Tone** | Emoji-heavy | Professional, clean |

---

## Quick Color Reference

| Role | Color | Usage |
|---|---|---|
| Primary CTA | `#004CE5` | Main buttons, active states, key emphasis |
| Accent / Link | `#011A53` | Secondary text, link color, nav active |
| Secondary fill | `#E6F0FF` | Secondary buttons, subtle borders, chip backgrounds |
| Background | `#FFFFFF` | Page + card surfaces |
| Text | `#000000` | Headlines, body copy |
| Muted text | `#64748B` | Supporting labels, captions |
| Mastery high | `#22c55e` | Strong (>=70%) |
| Mastery mid | `#eab308` | Developing (40-69%) |
| Mastery low | `#ef4444` | Needs Attention (<40%) |

---

## File Change Inventory

| # | File | Action |
|---|---|---|
| 1 | `frontend/index.html` | Update title, add Outfit font link |
| 2 | `frontend/src/index.css` | **Full rewrite** |
| 3 | `frontend/tailwind.config.js` | Simplify — remove dark mode tokens |
| 4 | `frontend/src/App.jsx` | Remove ThemeProvider |
| 5 | `frontend/src/context/ThemeContext.jsx` | **Delete** |
| 6 | `frontend/src/components/Layout.jsx` | Remove theme toggle + dark classes |
| 7 | `frontend/src/components/ProtectedRoute.jsx` | Remove dark classes |
| 8 | `frontend/src/pages/Login.jsx` | Full redesign |
| 9 | `frontend/src/pages/Signup.jsx` | Full redesign |
| 10 | `frontend/src/pages/Dashboard.jsx` | Major redesign |
| 11 | `frontend/src/pages/Assessment.jsx` | Restyle + remove dark overrides |
| 12 | `frontend/src/pages/Results.jsx` | Restyle + remove dark classes |
| 13 | `frontend/src/pages/Knowledge.jsx` | Restyle accordions + remove dark |
| 14 | `frontend/src/pages/LearningPath.jsx` | Flat design + remove dark |
| 15 | `frontend/src/pages/AiTutor.jsx` | Square chat bubbles + remove dark |
| 16 | `frontend/src/pages/Admin.jsx` | Restyle + remove dark |

**Total: 16 files touched, 1 deleted**

---

## Phase 1: Foundation Layer

**Goal**: Establish the new design tokens, typography, and component CSS classes. Everything in subsequent phases depends on this.

**Files**: `index.html`, `src/index.css`, `tailwind.config.js`, `src/App.jsx`, `src/context/ThemeContext.jsx`

### 1.1 — Update `frontend/index.html`

- Change `<title>` from `"frontend"` to `"PARAKH AI"`
- Add Outfit font preload from Google Fonts: weights 400, 500, 600, 700, 800

### 1.2 — Full Rewrite of `frontend/src/index.css`

**Remove entirely**:
- `@import` of Inter font
- All dark mode tokens (`surface-dark`, `card-dark`, `card-dark-2`, `shadow-card-dark`)
- All `.dark` variant selectors
- All `.dark` overrides for component classes
- All `dark:` prefixed utilities in base styles

**Add new `@theme` block**:

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: 'Outfit', system-ui, sans-serif;

  --color-brand-blue:     #004CE5;
  --color-brand-deep:     #011A53;
  --color-brand-tint:     #E6F0FF;
  --color-brand-bg:       #FFFFFF;
  --color-brand-text:     #000000;
  --color-brand-muted:    #64748B;

  --color-mastery-high:   #22c55e;
  --color-mastery-mid:    #eab308;
  --color-mastery-low:    #ef4444;
}
```

**Rewrite typography**:

```css
h1 { font-size: 2.5rem;  font-weight: 800; letter-spacing: -0.02em; }  /* 40px */
h2 { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.015em; } /* 28px */
h3 { font-size: 1.25rem; font-weight: 700; }                            /* 20px */
h4 { font-size: 1rem;    font-weight: 600; }
```

**Rewrite component classes** (all `0px` radius, no shadows, new colors):

| Class | Styles |
|---|---|
| `.card` | `bg-white`, `border border-[#E6F0FF]`, `rounded-none`, **no shadow**, `p-6` |
| `.btn-primary` | `bg-[#004CE5]`, `text-white`, `font-semibold`, `rounded-none`, `py-3 px-6`, hover `bg-[#00236E]`, focus-visible → ring |
| `.btn-secondary` | `bg-[#E6F0FF]`, `text-[#011A53]`, `font-semibold`, `rounded-none`, `py-3 px-6`, hover `bg-[#d6e5ff]` |
| `.btn-ghost` | `text-[#64748B]`, `rounded-none`, hover `bg-[#E6F0FF]` `text-[#011A53]` |
| `.input` | `bg-white`, `border-[#E6F0FF]`, `rounded-none`, `text-black`, `text-sm`, `py-2.5 px-4`, focus → `border-[#004CE5]`, **no shadow ring** |
| `.chip` | `rounded-none`, `text-xs`, `font-medium`, `px-2 py-0.5` |
| `.chip-brand` | `bg-[#E6F0FF]`, `text-[#011A53]` |
| `.chip-green` | `bg-[#e6f7ee]`, `text-[#15803d]` |
| `.chip-yellow` | `bg-[#fef9e7]`, `text-[#a16207]` |
| `.chip-red` | `bg-[#fdeaea]`, `text-[#dc2626]` |
| `.nav-link` | `text-[#000000]`, `rounded-none`, `font-medium`, `text-sm`, `px-3 py-2`, hover `text-[#004CE5]` |
| `.nav-link.active` | `text-[#011A53]`, `font-semibold`, `border-b-2 border-[#004CE5]` |
| `.mastery-bar-track` | `h-2`, `bg-[#E6F0FF]`, `rounded-none`, `overflow-hidden` |

### 1.3 — Simplify `frontend/tailwind.config.js`

- Remove `darkMode: 'class'`
- Remove `accent` color scale
- Remove `surface`, `card`, `surface-dark`, `card-dark`, `card-dark-2`
- Remove `shadow.card`, `shadow.card-dark`
- Remove Inter `fontFamily` override
- Remove `mastery` colors (now defined in `@theme`)

Since Tailwind v4 + `@tailwindcss/vite` plugin is used, the config is mostly decorative — but clean it to avoid confusion.

### 1.4 — Remove Dark Mode Infrastructure

**Delete `src/context/ThemeContext.jsx`**

**Edit `src/App.jsx`**:
- Remove `import { ThemeProvider }` line
- Remove `<ThemeProvider>` wrapper (keep `<AuthProvider>` and `<BrowserRouter>`)

---

## Phase 2: Layout & Navigation

**Goal**: Refactor the shared shell so all protected pages inherit the new design.

**Files**: `src/components/Layout.jsx`, `src/components/ProtectedRoute.jsx`

### 2.1 — Refactor `Layout.jsx`

- Remove `import { useTheme }` and all theme-related code
- Remove `SunIcon` and `MoonIcon` SVG components
- Remove theme toggle button (`#theme-toggle`)
- Remove all `dark:` prefixed Tailwind classes
- Remove inline dark mode styles (`style={{ color: theme === 'dark' ? ... }}`)

**Header design**:
- Background: `bg-white`, fully opaque (remove `bg-white/80 backdrop-blur-sm`)
- Border bottom: `border-b border-[#E6F0FF]`
- Brand: square logo `bg-[#004CE5]` (remove `rounded-lg`), text `"PARAKH AI"` in Outfit bold, `text-black`
- Nav links: use updated `.nav-link` classes, active state gets `border-b-2 border-[#004CE5]`
- User info + logout: clean text, `.btn-ghost` logout

### 2.2 — Update `ProtectedRoute.jsx`

- Replace `bg-surface` with `bg-white`
- Remove `dark:bg-surface-dark`
- Replace spinner border color with `border-[#004CE5]`

---

## Phase 3: Auth Pages

**Goal**: Redesign Login and Signup to match the scaler look.

**Files**: `src/pages/Login.jsx`, `src/pages/Signup.jsx`

### 3.1 — Refactor `Login.jsx`

- Remove `import { useTheme }`, `SunIcon`, `MoonIcon`, theme toggle button
- Remove all `theme === 'dark'` conditional styling
- Remove all `dark:` Tailwind classes

**Layout**:
- Page background: `bg-white min-h-screen`
- Centered card, max-width `max-w-[440px]`
- Brand mark: square `P` in `bg-[#004CE5]` (remove `rounded-2xl`)
- Headline: "Welcome back" in Outfit bold, `text-[40px] font-extrabold text-black`
- Subtext: `text-base text-[#64748B]`
- Card: `.card` class (flat white, `#E6F0FF` border)
- Inputs: `.input` class (square, clean)
- Primary button: `.btn-primary` full-width, "Sign in"
- Bottom link: `text-[#011A53]` → "Create one"

### 3.2 — Refactor `Signup.jsx`

Same treatment as Login:
- Remove theme toggle + icons + dark conditionals
- Headline: "Create your account"
- Same layout structure, add Name field
- Validation error colors remain `#ef4444`
- Primary button: "Create account"
- Bottom link: "Sign in"

---

## Phase 4: Dashboard

**Goal**: Major redesign of the main landing page with flat, bold, scaler-style layout.

**Files**: `src/pages/Dashboard.jsx`

### 4.1 — Refactor `Dashboard.jsx`

**Header**:
- Large heading: `text-[40px] font-extrabold text-black` — "Welcome back, [Name]"
- Subtext: `text-base text-[#64748B]`
- Remove emoji (👋)

**Stat cards** (`StatCard` sub-component):
- Flat white card, `#E6F0FF` border, `0px` radius, no shadow
- Label: `text-xs uppercase tracking-wider text-[#64748B]`
- Value: `text-[32px] font-bold`, default `text-[#004CE5]`, or mastery color
- Remove inline style colors, use Tailwind classes or semantic colors

**Weak areas alert**:
- White card with left `4px` red border (`border-l-4 border-l-[#ef4444]`)
- No background tint (remove `backgroundColor: 'rgba(239,68,68,0.06)'`)
- Text: `text-black`, weak concept names in `text-[#dc2626] font-medium`
- CTA: `.btn-primary` "Start Assessment"
- Remove ⚠ emoji

**Knowledge Profile**:
- `.card` wrapper
- Header: "Knowledge Profile" `h2` + "View full profile →" link in `text-[#011A53]`
- Mastery bars: `.mastery-bar-track` (flat, no rounded), colored fill
- Labels: concept name `text-black font-medium`, percentage + badge in mastery color

**Quick links** (3 cards):
- Flat `.card` with `#E6F0FF` border, `hover:border-[#004CE5]`
- Title: `text-black font-semibold`
- Description: `text-[#64748B] text-sm`
- Remove emojis (🎯, 🗺️, 🤖)
- Add simple SVG icons or text-only approach

**Loading & error states**: Keep structure, replace spinner/accent colors with `#004CE5`

---

## Phase 5: Assessment Flow

**Goal**: Restyle the most complex page — quiz engine with proctoring, explainability, state machine UI.

**Files**: `src/pages/Assessment.jsx`

### 5.1 — Sub-components to restyle

**`DifficultyBadge`**:
- Dots remain, labels remain, colors remain (green/yellow/red)
- Just ensure text classes don't use dark mode variants

**`WhyPanel`**:
- Flat `.card` wrapper, `#E6F0FF` border
- Toggle button: "Why this question?" in `text-[#011A53]`
- Chip indicating reason: use new `.chip-*` classes
- Metric grid (mastery %, concept, difficulty): flat metric boxes, `bg-[#F8FAFF]`
- Remove dark-override `data-dark-override` attribute

**`TransitionOverlay`**:
- Dark overlay: `bg-black/50`
- Inner card: `.card`, spinner in `#004CE5`, text in `text-[#011A53]`

**`ProgressDots`**:
- Replace circles with **squares**: `w-3 h-3`, `bg-[#004CE5]` for completed, `bg-[#E6F0FF]` for remaining
- Remove `rounded-full` and `scale` transform

**`ViolationModal`**:
- Remove `rounded-2xl` on inner elements
- Left red border accent instead of full red border — `border-l-4 border-l-[#ef4444]`
- Warning text: `text-black`
- Button: `bg-[#004CE5]` instead of `#dc2626`
- Remove ⚠️ emoji

### 5.2 — Main assessment page

**Header**:
- "Adaptive Assessment" in `h1`
- Proctoring badge: `.chip-brand`, green dot removed → text-only "Proctored"
- Subtext: `text-[#64748B]`

**Question card**:
- `.card` wrapper
- Concept chip: `.chip-brand`
- Difficulty badge: unchanged
- Question text: `text-base font-medium text-black`
- Option buttons: `w-full text-left p-4 border border-[#E6F0FF]`, selected = `border-[#004CE5] bg-[#E6F0FF]`, correct = `border-[#22c55e] bg-[#e6f7ee]`, incorrect = `border-[#ef4444] bg-[#fdeaea]`
- All option buttons: `rounded-none`, `text-sm`, letter prefix in `font-semibold`

**Answer result panel**:
- Correct: `border-l-4 border-l-[#22c55e] bg-[#e6f7ee]`
- Incorrect: `border-l-4 border-l-[#ef4444] bg-[#fdeaea]`
- Mastery delta text in contrasting color

**Submit / Next buttons**:
- `.btn-primary w-full`

**Done state / Terminated state**:
- White cards, no rounded corners
- Remove 🎉 and 🚫 emojis
- Replace with clean text and master-colored accents

---

## Phase 6: Results, Knowledge, Learning Path

**Goal**: Restyle the data visualization and learning pages.

**Files**: `src/pages/Results.jsx`, `src/pages/Knowledge.jsx`, `src/pages/LearningPath.jsx`

### 6.1 — Refactor `Results.jsx`

**Header**:
- "Assessment Complete" (remove 🎉)
- Subtext: `text-[#64748B] text-base`

**Mastery display**: Replace SVG ring with clean text display:
- Large number: `text-[64px] font-extrabold` in mastery color
- Label: "% mastery" in `text-[#64748B]`
- Insight text: `text-sm italic text-[#64748B] max-w-md` (remove quotes)

**Bucket cards** (`BucketCard`):
- Flat cards with top border accent (`border-t-[3px]` in mastery color)
- `#E6F0FF` border on other sides
- Count: large bold number in mastery color
- Concept pills: `.chip-green`, `.chip-yellow`, `.chip-red`

**CTA buttons**:
- Primary: `.btn-primary` "View Knowledge Profile"
- Secondary: `.btn-secondary` "Take Another Assessment"
- Dashboard link: `text-[#011A53]`

### 6.2 — Refactor `Knowledge.jsx`

**Header**:
- "Knowledge Profile" `h1`
- Overall mastery: large bold right-aligned, mastery color
- Subtext: `text-[#64748B]`

**Summary chips**: Use new `.chip-green`, `.chip-yellow`, `.chip-red` classes
- Remove 🔥 emoji, use text label for "Most Improved"

**`ConceptCard` accordion**:
- `.card` wrapper, border turns `border-[#004CE5]` when expanded
- Header: concept name `font-bold text-base text-black`, mastery badge as chip, percentage right-aligned
- Progress bar: `.mastery-bar-track` (flat, no rounded)
- Expanded content: flat metric cards (`bg-[#F8FAFF]`), flat form dots
- Insight box: `border-l-4 border-l-[#011A53] bg-[#F8FAFF] p-3`, `text-sm text-black`
- Remove 💡 emoji

**Sparkline SVG**: 
- Keep functional, replace `bg-slate-50 dark:bg-slate-800/40` with `bg-[#F8FAFF]`

**CTA buttons**: 
- Primary + secondary as in Results page

### 6.3 — Refactor `LearningPath.jsx`

**Header**:
- "Learning Roadmap" `h1`
- Progress percentage: large bold `text-[#004CE5]`

**Progress track**:
- `.mastery-bar-track` with `h-3`, `bg-[#004CE5]` fill

**Roadmap nodes**:
- **Replace circles with squares**: `w-12 h-12` with `rounded-none`
- Done: `bg-[#22c55e]`, Current: `bg-[#004CE5]`, Locked: `bg-[#94a3b8]`
- Icon: `✓` for done, number for current, `🔒` → replace with lock SVG icon (no emoji)
- Remove circular ping animation → static subtle shadow or left-border indicator

**Module cards**:
- Flat `.card`, left-border color: green (`#22c55e`), blue (`#004CE5`), gray (`#94a3b8`)
- Status badges: flat pills
- "Start Assessment" link: `.btn-primary text-sm inline-block`

**Modal**:
- `.card` overlay, dark backdrop
- Close button: clean `✕` → SVG icon
- Remove 🔒 emoji, use text or SVG lock

---

## Phase 7: AI Tutor & Admin

**Goal**: Restyle the chat interface and admin panel.

**Files**: `src/pages/AiTutor.jsx`, `src/pages/Admin.jsx`

### 7.1 — Refactor `AiTutor.jsx`

**Header**:
- "AI Tutor" `h1`
- Subtext: `text-[#64748B]`
- Remove 👋 emoji from greeting message

**Chat bubbles** (`Message` component):
- User: `bg-[#E6F0FF]`, `text-[#011A53]`, `rounded-none` (replace `'18px 18px 4px 18px'`)
- Assistant: `bg-white`, `border border-[#E6F0FF]`, `text-black`, `rounded-none`
- Remove all border-radius styling, use `0px` only

**Suggested prompts**:
- `.chip-brand` style: `bg-[#E6F0FF] text-[#011A53]`, `rounded-none`
- Hover: `border border-[#004CE5]`

**Input area**:
- Textarea: `.input`, `resize-none`
- Send button: `.btn-primary`, "Send"
- Bottom helper text: `text-xs text-[#64748B]`

**Typing indicator**:
- Keep dots but remove bounce animation — use simple static opacity or fade
- Dots in `bg-[#94a3b8]`, flat `rounded-none` (square dots)

### 7.2 — Refactor `Admin.jsx`

**Header**:
- "Admin Dashboard" `h1`
- Remove emojis (📊, 🤖) from section headings

**`GapBar` component**:
- Track: `.mastery-bar-track` with `bg-[#E6F0FF]`
- Fill: mastery color
- Weak students badge: flat `.chip-red`
- Labels: `text-black font-medium` for concept, `text-[#64748B]` for metadata

**AI Question Generator form**:
- `.card` wrapper
- Select: `.input` style
- Radio buttons: clean, square, `accent-[#004CE5]`
- Topic hint input: `.input`
- Generate button: `.btn-primary w-full`

**Generated question display**:
- Question text: `font-medium text-black`
- Options: flat bordered divs, correct option `border-l-4 border-l-[#22c55e]`
- Explanation: `.bg-[#F8FAFF]` card
- Validation checklist: clean text with ✓/✗, remove circular badge backgrounds → simple colored text

**`ChecklistItem`**:
- Remove circular `rounded-full` background
- Use `text-[#15803d]` ✓ in front of text for ok, `text-[#dc2626]` ✗ for fail

---

## Phase 8: Polish & Verification

**Goal**: Final consistency pass across all files.

### 8.1 — Emoji Removal (search across all files)

Search and replace all emojis:
- 👋 → removed (use name inline in greeting text)
- 🎯 → removed
- 🗺️ → removed
- 🤖 → removed
- ⚠ / ⚠️ → removed (use text or SVG icon)
- 🚫 → removed
- 🎉 → removed
- 💡 → removed
- 🔥 → removed
- 🔒 → replaced with inline SVG lock icon
- 📊 → removed
- 🤖 → removed
- ✓ and ✗ kept (functional, minimal)

### 8.2 — Remove Dark Mode Remnants

Search and remove:
- All `dark:` prefixed classes across all JSX files
- All `data-dark-override` attributes
- All `style={{ color: theme === 'dark' ? ... }}` conditionals
- All `dark:` variant selectors in CSS
- All `theme === 'dark'` checks in JSX

### 8.3 — Spacing Normalization

Audit all pages:
- Use `p-4` (16px), `p-6` (24px), `p-8` (32px) for section padding
- Use `gap-4` (16px), `gap-6` (24px), `gap-8` (32px) for flex/grid gaps
- Use `space-y-4`, `space-y-6`, `space-y-8` for vertical rhythm between sections
- Align with 4px base grid

### 8.4 — Color Consistency

Ensure all borders use `#E6F0FF` (not `#e5e7eb`, `#f3f4f6`, `#d1d5db`, etc.).
Exception: mastery/accent colors for specific feedback.
All primary text uses `text-black` or `text-[#000000]`.
All muted secondary text uses `text-[#64748B]`.

### 8.5 — Run Linter

```bash
cd frontend && npm run lint
```

Fix any lint warnings or errors introduced during refactoring.

### 8.6 — Visual Spot Check

Run the app and verify each page:
1. Login → sign in → lands on Dashboard
2. Dashboard → all stats + knowledge profile render
3. Assessment → start, answer, reveal, next, complete
4. Results → mastery display, bucket cards
5. Knowledge → accordion expand/collapse, sparkline
6. Learning Path → roadmap nodes, modal
7. AI Tutor → chat, send messages
8. Admin → gap view, generate question

---

## Execution Order (Recommended)

| Phase | Description | Est. Time | Depends on |
|---|---|---|---|
| **Phase 1** | Foundation CSS + Font + Theme Removal | 30 min | — |
| **Phase 2** | Layout + Navigation | 20 min | Phase 1 |
| **Phase 3** | Auth Pages (Login + Signup) | 30 min | Phase 1 |
| **Phase 4** | Dashboard | 45 min | Phase 1, 2 |
| **Phase 5** | Assessment Flow | 60 min | Phase 1 |
| **Phase 6** | Results + Knowledge + Learning Path | 60 min | Phase 1 |
| **Phase 7** | AI Tutor + Admin | 45 min | Phase 1 |
| **Phase 8** | Polish + Verification | 30 min | All phases |

**Total estimated time: ~5 hours**

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Outfit renders poorly at specific sizes | Font-family fallback to `system-ui, sans-serif` |
| Square corners break usability | Focus states use visible rings (`.btn-primary:focus-visible`) |
| High contrast feels harsh | Muted gray `#64748B` used for secondary text and captions |
| Missing dark mode (accessibility) | Light mode is the primary spec; users who need it can use OS/browser dark mode extensions |
| Existing CSS classes referenced across pages | Do not rename `.card`, `.btn-primary`, `.input` etc. — only restyle their rule definitions |
