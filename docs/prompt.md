# PARAKH AI — Hackathon Build Agent Prompt (v2)

## Role

You are building **PARAKH AI**, an AI-powered adaptive learning and assessment platform, for a solo builder with a **24-hour** deadline. Execute the phases below **in order**. Each phase must be genuinely working and backend-verified before moving to the next — no stubbed/fake logic standing in for a feature that's in scope. Report status at the end of each phase per the "Reporting instructions" at the bottom.

This is still a hackathon build, not a production system — but within the 7 features listed below, **build them for real**: real persisted data, real computed adaptive logic, real auth. The only things allowed to be "mocked" are the ones explicitly marked mock below (question bank seed content, and the specific items in the cut list).

---

## Non-negotiable scope boundaries

**Build exactly these 7 features. Nothing else.** Scope is fixed — depth over breadth is how "do it properly" and "24 hours" coexist.

1. Auth: email/password signup + login (JWT-based)
2. Dashboard (real logged-in student, pulled from DB)
3. Adaptive assessment flow (6–8 MCQs, rule-based difficulty adaptation, computed and persisted server-side)
4. "Why this question?" explainability panel (driven by real backend reasoning, not decoration)
5. Results → Knowledge Profile (mastery bars per concept, computed from real stored responses)
6. Personalized Learning Path (ordered list derived from real mastery data + a hardcoded prerequisite map)
7. AI Tutor (real LLM call, backend-assembled context from the student's actual DB state)
8. One Admin screen: knowledge-gap view (aggregated from real seeded student data) + working "Generate Question" (real LLM call, persists result to DB) with a validation checklist

(Numbered 1–8 for clarity; treat as one scope block.)

**Do NOT build any of the following.** If you find yourself about to implement one, stop and move on:

- Google OAuth or any social login — email/password only
- Onboarding wizard (goals/subjects/preferences collection flow)
- Full question bank CRUD UI, question health/discrimination/exposure dashboards
- Institutional/multi-institution reporting beyond the single admin gap view
- Interactive knowledge graph visualization (nodes/edges) — use a color-coded list/bar view instead
- Real psychometrics: IRT, Elo, Bayesian knowledge tracing — the rule-based logic in Phase 3 is the adaptive engine, and it should be real (computed + persisted), just not psychometrically calibrated
- Confidence slider, human-review/approval workflow for AI-generated questions
- Password reset / email verification flows — signup + login only

If ambiguous whether something is in scope, default to NOT building it and flag it instead of deciding silently.

---

## Tech stack

- **Frontend:** React + Vite, React Router, Tailwind CSS with `dark:` variants — full light and dark theme support with a toggle, both must look intentional, not just "dark mode via CSS invert"
- **Backend:** Node.js + Express, real REST API — this is where the adaptive logic, mastery calculations, and auth live. Not a passthrough to the frontend.
- **Database:** MongoDB (Mongoose models) — Users, Questions, Responses, StudentConcepts (mastery per concept per student) all persisted for real
- **Auth:** JWT, bcrypt for password hashing, protected routes/middleware on the backend, protected routes on the frontend (redirect to login if no valid token)
- **AI calls:** Backend endpoints call an LLM API (Groq or Claude, key stays server-side in env) for AI Tutor and AI Question Generator only
- **Deploy target:** Frontend on Vercel/Netlify, backend on Render/Railway; MongoDB Atlas free tier

---

## Design direction: Scaler / Khan Academy–inspired, dual-theme

Reference feel, not literal copy: clean card-based layouts, generous whitespace, confident use of a single accent color for progress/mastery indicators, clear typographic hierarchy, friendly-but-serious edtech tone (not childish, not generic SaaS-dashboard-template).

**Both themes are first-class** — build with CSS variables / Tailwind's dark mode from the start, not retrofitted:

- Light mode: soft off-white background, dark text, accent color pops against light surfaces
- Dark mode: true dark surface (not pure black), same accent color re-tuned for contrast, avoid low-contrast gray-on-gray text
- Theme toggle persists (localStorage) and is reachable from every screen
- Mastery color coding (green/yellow/red) must stay legible and consistent across both themes — check contrast in both, don't just reuse light-mode colors in dark mode
- Avoid: glassmorphism, childish gamification badges, generic default-Tailwind-component look, giant walls of text

---

## Critical design constraint: single source of truth

Mastery per concept must live in **MongoDB**, read through **one backend API**, and never be locally recomputed or duplicated in frontend state. Dashboard, Results, Knowledge Profile, Learning Path, AI Tutor context, and Admin view must all read the same persisted numbers. If practice/assessment changes BST mastery, every one of those screens must reflect it on next load without special-casing.

---

## Phase 0 — Setup (1 hr)

**Deliverables:**

- Frontend: Vite + React + Tailwind (with dark mode config) scaffolded, React Router with routes: `/`, `/login`, `/signup`, `/dashboard`, `/assessment`, `/assessment/results`, `/knowledge`, `/learning-path`, `/ai-tutor`, `/admin`
- Backend: Express app scaffolded, MongoDB connection via Mongoose, env config (`.env` for Mongo URI, JWT secret, LLM API key)
- Mongoose models: `User`, `Question`, `Response`, `StudentConcept`
- Basic layout shell + theme toggle wired end-to-end (even before real content, confirm light/dark switching works everywhere)

**Verify:** frontend and backend both run, MongoDB connects, theme toggle flips the whole shell correctly in both modes.

---

## Phase 1 — Auth (2–2.5 hrs)

**Deliverables:**

- Backend: `POST /api/auth/signup` (email, password, name — bcrypt hash, create User), `POST /api/auth/login` (verify, issue JWT), auth middleware that validates JWT on protected routes
- Frontend: `/signup` and `/login` pages matching the design direction, store JWT (httpOnly cookie preferred; localStorage acceptable for hackathon speed — pick one and be consistent), redirect to `/dashboard` on success, protected-route wrapper that redirects unauthenticated users to `/login`
- On signup, seed a new `StudentConcept` row per concept (Arrays, Linked Lists, Binary Trees, BST, AVL, Graphs, BFS, Dijkstra) with starting mastery values matching the design doc's example student, so every new signup has a populated profile to demo with

**Verify:** signup creates a real user in MongoDB with a hashed password, login returns a valid JWT, hitting a protected route without a token fails, hitting it with a valid token succeeds and returns that user's actual data.

---

## Phase 2 — Question Bank + Adaptive Engine (backend) (3 hrs)

**Deliverables:**

- Seed script: 15–20 MCQs across BST and AVL concepts (this is the mock content — question text is fine to hand-write/generate once, not live-generated), each with `concept`, `difficulty`, `options`, `correctAnswer`, `explanation`, `exposure` (increment on each serve)
- Backend adaptive selection logic (real, computed, not hardcoded sequence) implementing:

```
IF answer correct:
    increase mastery for that concept (+6 to +8), persist to StudentConcept
    if 2 consecutive correct on same concept -> select harder difficulty next
IF answer incorrect:
    decrease mastery for that concept (-4 to -6), persist to StudentConcept
    select same-or-easier difficulty next, same concept (reinforcement)
IF question already served this session:
    deprioritize (skip if an alternative at the target difficulty/concept exists)
Increment question.exposure on serve
End assessment after 7 questions
```

- Endpoints: `GET /api/assessment/next` (returns next question + reasoning object for the "why this question" panel), `POST /api/assessment/answer` (persists Response, updates StudentConcept, returns updated mastery + next-question reasoning)

**Verify:** run a full assessment via API calls (Postman/curl is fine for this check) with an all-correct sequence and an all-incorrect sequence, confirm mastery moves in the right direction both times and is actually persisted in MongoDB between requests.

---

## Phase 3 — Assessment UI + Explainability Panel (2.5 hrs)

**Deliverables:**

- `/assessment` page wired to Phase 2 endpoints: question card, 4 options, progress indicator ("~7 questions", not "Question 3 of 7"), submit button, brief "Analyzing response... Updating knowledge profile... Selecting next question..." transition (750–1200ms delay is fine — it sells the adaptive story, doesn't need to be real processing time)
- "Why this question?" panel rendering the reasoning object returned by the backend (e.g. "Weak concept (BST 43%)", "Low exposure", "Reinforcement after recent miss") — must reflect what the backend actually computed, not a frontend guess

**Verify:** complete two full assessment runs live in the browser (one mostly-correct, one mostly-incorrect), confirm difficulty visibly shifts and the explanation panel text matches what actually happened each time.

---

## Phase 4 — Results, Knowledge Profile, Learning Path (2 hrs)

**Deliverables:**

- `GET /api/student/state` — returns the logged-in student's full StudentConcept data
- Results screen (shown right after assessment completes): overall mastery %, Strong / Developing / Needs Attention buckets computed from real data, one AI-insight sentence (template string built from real numbers is fine, no LLM call needed here)
- `/knowledge`: mastery bar per concept, color-coded (green ≥70%, yellow 40–69%, red <40%), legible in both themes
- `/learning-path`: ordered list from mastery + hardcoded prerequisite map (BST → BST Deletion → AVL → AVL Rotations), rendered ✓ done / → next / 🔒 locked

**Verify:** all three screens plus the Dashboard pull from `GET /api/student/state` and show identical, consistent numbers. Run another assessment, confirm all four update together on next load.

---

## Phase 5 — AI Tutor (2 hrs)

**Deliverables:**

- Backend `POST /api/tutor/ask`: assembles a system prompt from the logged-in student's real StudentConcept + recent Response data (concept mastery, accuracy, recent attempts on the concept being asked about), calls the LLM, returns the response. Key stays server-side.
- Frontend `/ai-tutor`: chat-style UI, 2–4 suggested prompts, renders responses
- System prompt instructs the model to ground its answer in the provided real numbers and use hedged language ("your recent responses suggest," "possible misconception")

**Verify:** ask the same question before and after a fresh assessment run (mastery numbers changed) and confirm the AI's response actually reflects the new numbers, not generic tutoring text.

---

## Phase 6 — Admin: Knowledge Gap + AI Question Generator (2 hrs)

**Deliverables:**

- Seed 3–4 additional mock student accounts with varied StudentConcept data (for aggregate gap view — these can be created directly via seed script, no need to sign them up through the UI)
- `/admin` page: aggregated concept-gap ranking across all seeded students (real aggregation query against MongoDB, not hardcoded numbers)
- `POST /api/admin/generate-question`: real LLM call constrained by subject/topic/concept/difficulty/type from a form, persists the generated question to the `Question` collection with `source: "AI Generated"`
- Frontend: generator form → submit → display generated question + a validation checklist (✓ one correct answer, ✓ concept relevance, ✓ explanation generated, ✓ difficulty within target, ✓ duplicate check against existing bank by simple text-similarity or exact-match check — this one check can be real and cheap to implement, the rest can be static checkmarks shown post-generation)

**Verify:** generator produces a well-formed MCQ for 3 different concept/difficulty combos, and each generated question actually appears in MongoDB afterward.

---

## Phase 7 — Theme Polish + Full Pass (2 hrs)

**Deliverables:**

- Full pass across all 9 screens (login, signup, dashboard, assessment, results, knowledge, learning-path, ai-tutor, admin) in both light and dark mode — fix any contrast issues, inconsistent spacing, default-looking components
- Confirm the Scaler/Khan Academy-inspired direction reads consistently: card structure, accent color usage, typography scale

**Verify:** screenshot or walk every screen in both themes, nothing looks unfinished or default-Tailwind.

---

## Phase 8 — Demo Rehearsal (1.5–2 hrs)

**Deliverables:** walk the full demo path start to finish exactly as scripted below, fix anything broken, time it.

**Demo script:**

1. Sign up live (or log into a pre-seeded account) → Dashboard shows real mastery, weak areas flagged (BST, AVL)
2. Start adaptive assessment → answer correctly a couple times → show difficulty increasing → answer one wrong → show reinforcement question + "why this question" panel
3. Finish assessment → results screen (buckets + AI insight)
4. Knowledge Profile → mastery bars updated, matching results
5. Learning Path → BST → AVL sequencing shown
6. AI Tutor → ask "why am I struggling with BST deletion" → real grounded response using this session's actual numbers
7. Admin → show AVL as an institution-wide gap → generate a new AVL question live → show it land in the checklist, confirm it's now in the DB
8. Toggle light/dark mode once during the demo to show both are fully designed, not an afterthought

---

## If you're running behind: cut in this order, not silently

If time is genuinely running out, deprioritize in this exact order — announce the cut, don't just skip it unannounced:

1. Admin duplicate-check logic → make it a static checkmark instead of real
2. AI Question Generator's constrained variety → fewer form options, one solid path that works
3. Theme polish pass → ship dark mode fully done, light mode "good enough" (or vice versa) rather than both half-done
4. Learning path prerequisite map → reduce to BST → AVL only, drop the finer sub-steps
5. Do NOT cut: auth, the adaptive engine being real/persisted, or the AI Tutor being grounded in real data — these are the load-bearing "we did it properly" pieces given the explicit ask.

---

## Reporting instructions

At the end of each phase, report:

- What was built, and confirmation it's real (backend-computed/persisted) not stubbed, for anything in the 8-item scope list
- Any cut taken from the fallback list above, and why
- Any place you deviated from this prompt and why
- Whether the phase's "Verify" criteria passed

Do not expand scope back toward the original 65-section design doc, and do not silently mock something that's supposed to be real per this prompt — flag it instead.
