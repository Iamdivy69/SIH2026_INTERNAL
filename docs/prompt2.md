# PARAKH AI — Agent Prompt: Phases 9–13 (Hardening Pass)

## Context

Phases 0–8 are built and verified: auth, adaptive assessment (rule-based), results/knowledge/learning-path screens, AI Tutor, Admin gap view + question generator, theming, demo rehearsal. This prompt builds **on top of** that verified foundation — do not re-architect what's already working. Timeline is no longer a hard 24h constraint; build each phase properly and verify it before moving to the next.

Five upgrades, each is its own phase:

9. Assessment proctoring (fullscreen lock + tab-switch violation tracking)
10. Learning Path redesigned as a progressive visual journey (not a static list)
11. Knowledge Profile made genuinely informative (trends, history, per-concept insight)
12. Adaptive difficulty engine upgraded to a hybrid Elo-lite + multi-factor model
13. Question bank expanded to 100+ per concept (800+ total) via AI-assisted bulk generation, with true no-repeat serving and per-user variation

---

## Honesty constraints (read before building)

- **Proctoring cannot literally prevent tab-switching or app-switching** — no browser can fully block this from JS. What you're building is _detection and response_ (fullscreen exit, visibility change, window blur → counted as a violation), not a hard lock. Do not build or describe this as "impossible to cheat" — describe it accurately as violation detection with consequences.
- **The "advanced" difficulty engine is Elo-lite, not full IRT.** Real Item Response Theory (3-parameter logistic with discrimination and guessing parameters) needs large calibration datasets you don't have. What you're building — paired Elo-style ratings for students and questions, updated after every response — is a legitimate, real, and honestly "advanced for a prototype" approach. Describe it that way, not as clinical psychometrics.
- **"No questions should ever repeat" is scoped to per-user history**, not literally-once-ever across the whole platform. A question can and should be shown to multiple different students — repetition across the _same student's_ account history is what's being eliminated.

---

## New/changed data models

```
Question (extends existing model):
  + eloRating: Number (default seeded by difficulty tier: easy~1000, medium~1250, hard~1500)
  + timesCorrect: Number (default 0)
  + timesAnswered: Number (default 0)
  (existing: concept, difficulty, text, options, correctAnswer, explanation, exposure, source)

StudentConcept (extends existing model):
  + abilityRating: Number (Elo-style, default ~1100, separate from the 0-100 `mastery` display value)
  (existing: userId, concept, mastery, updatedAt)

MasteryLog (NEW):
  userId, concept, mastery, abilityRating, delta, timestamp
  — one row appended every time mastery updates. Powers Knowledge Profile trend/history.

AssessmentSession (NEW):
  userId, sessionId, startedAt, completedAt, status: 'in_progress' | 'completed' | 'terminated'
  violationCount: Number (default 0)
  violations: [{ type: 'tab_switch' | 'fullscreen_exit' | 'window_blur', timestamp }]
  terminationReason: String (nullable)
```

---

## Phase 9 — Assessment Proctoring

**Goal:** Detect tab-switches/fullscreen-exits during an assessment, track violations server-side (not just client-side, so it can't be trivially bypassed by editing frontend state), warn at each of the first 3, terminate the session on the 4th.

**Backend:**

- `POST /api/assessment/start` → creates an `AssessmentSession` row (`status: 'in_progress'`), returns `sessionId`. This becomes the source of truth for violation count — the client reports events, but the server owns the count.
- `POST /api/assessment/violation` — body `{ sessionId, type }`. Increments `violationCount`, appends to `violations[]`, returns `{ violationCount, isTerminated: violationCount > 3 }`. If it crosses the threshold, also set `status: 'terminated'`, `terminationReason: 'excessive_violations'` on that call — don't wait for a separate terminate call, avoid a race where the client could skip it.
- `GET /api/assessment/next` and `POST /api/assessment/answer` should both check `AssessmentSession.status` first — if `terminated`, reject with 403 and a clear message. This closes the loop: even if the frontend tries to keep going after termination, the backend won't serve more questions or accept more answers.
- Existing `POST /api/assessment/answer` should also stamp `sessionId → AssessmentSession` link and set `status: 'completed'` when question 7 is answered.

**Frontend:**

- On assessment start: call `document.documentElement.requestFullscreen()`, call `POST /api/assessment/start`.
- Listeners:
  - `document.addEventListener('visibilitychange', ...)` → if `document.hidden`, report `type: 'tab_switch'`
  - `document.addEventListener('fullscreenchange', ...)` → if no longer in fullscreen and assessment still in progress, report `type: 'fullscreen_exit'`
  - `window.addEventListener('blur', ...)` → report `type: 'window_blur'` (debounce this one — clicking a browser devtools panel or an OS notification can trigger it; don't double-count if it fires alongside a visibility change for the same event)
- On each violation report response: show a modal — "Violation 1 of 3: leaving the test screen is tracked. Two more will end your test." Escalate wording at 2/3, and at 3/3 make clear the _next_ one ends it.
- On `isTerminated: true`: immediately stop the assessment, show a distinct "Test terminated — too many violations" screen (not the normal results screen), do not show results/mastery updates from the partial session.
- Re-request fullscreen automatically is fine after each violation warning is dismissed, so the student can continue if they haven't hit the limit yet.

**✅ Verify:**

- Start an assessment, exit fullscreen 3 times → 3 warnings shown, assessment continues, `AssessmentSession.violationCount` = 3 in DB
- 4th violation → session terminated, further `GET /next` and `POST /answer` calls with that `sessionId` return 403
- Refresh the page mid-terminated-session → cannot resume (frontend checks session status on load, redirects to a "terminated" state, not back into the question flow)
- Completing an assessment cleanly (0 violations) still works exactly as before — this phase must not break the existing happy path

---

## Phase 10 — Learning Path as a Progressive Journey

**Goal:** Replace the static vertical step list with a visual, road/journey-style map — modules connected by a winding path, current position marked, locked modules visually distinct, matching the Scaler/Khan Academy design direction (not gamified/childish — think clean progress-map, not a game board).

**Design approach:**

- Extend the existing `PREREQ_MAP` into a full roadmap covering all 8 concepts in a sensible learning order, e.g.: Arrays → Linked Lists → Binary Trees → BST Fundamentals → BST Deletion → AVL Trees → AVL Rotations → Graphs → BFS → Dijkstra. Each entry: `{ id, label, concept, threshold, description, estimatedQuestions }`.
- Render as an SVG or CSS-based winding path (alternating left/right node placement down the page reads as "a road" without needing a game-like art style) connecting module nodes.
- Node states (same underlying logic as before, richer visual treatment):
  - `done` — filled/checked, solid accent-colored connector leading into it
  - `current` — the next actionable module, visually emphasized (glow/pulse or larger node), with a clear "Continue" CTA
  - `locked` — muted/grayscale, connector to it dashed or faded, shows the mastery threshold needed to unlock (e.g. "Unlocks at BST ≥ 70%")
- Each node expands (click/tap) to show: concept, current mastery, estimated time, and — for locked nodes — no CTA (address the earlier flagged issue: since the assessment engine always targets the globally-weakest concept, a locked node's CTA can't guarantee it'll actually serve that concept). For `current`/`done` nodes, CTA links to `/assessment` with honest copy ("targets your weakest area, which may include this module").
- Overall progress indicator at the top (e.g. "3 of 10 modules complete").

**✅ Verify:**

- Path renders correctly with a fresh account (mostly locked) and with a heavily-practiced account (mostly done) — test both visually
- Locked node thresholds match live mastery data from `GET /api/student/state`
- Works in both light and dark themes, path/connector colors have adequate contrast in both

---

## Phase 11 — Knowledge Profile: Make It Actually Informative

**Goal:** Move beyond a flat list of mastery bars into something that explains _how the student got there_ and _what to do next_, per concept.

**Backend:**

- Every mastery update (in `POST /api/assessment/answer`) now also writes a `MasteryLog` row — this is what powers trend/history, build it in Phase 12 alongside the engine rewrite so both land together, or add it now as a small addition to the existing answer endpoint if Phase 12 hasn't started yet.
- `GET /api/student/state` response should be extended per concept with: `accuracy` (correct/total from Response history), `attemptCount`, `averageResponseTime`, `trend` (`'improving' | 'declining' | 'stable'`, computed by comparing the last 3 `MasteryLog` deltas), and `recentAttempts` (last 5 Response docs for that concept, as correct/incorrect booleans for a simple visual streak).

**Frontend:**

- Each concept row becomes expandable (accordion or click-to-expand card), showing:
  - Mastery bar (existing) + a small sparkline/line chart of mastery over time from `MasteryLog` (a simple SVG polyline is enough, no charting library needed for this scale of data)
  - Accuracy %, attempts count, average response time
  - Last 5 attempts as a dot row (green/red) — same idea as a "recent form" indicator
  - Trend badge: ↑ improving / ↓ declining / → stable
  - One plain-language insight sentence per concept, templated from the real numbers (e.g., "You've improved steadily over your last 3 attempts, but your average response time on BST questions is higher than your other concepts — this can indicate the concept is understood but not yet fluent.") — reuse the hedged-language tone from the AI Tutor prompt, template-based here (no LLM call needed for this, keep it fast and free)
- Top-of-page summary keeps the existing Strong/Developing/Needs Attention chip counts, but add one more: "Most improved this week" / "Needs attention" callouts based on `MasteryLog` deltas.

**✅ Verify:**

- Run a few assessments across different sessions, confirm `MasteryLog` accumulates real rows and the sparkline reflects genuine history, not a flat line
- Trend badges correctly flip between improving/declining/stable when you deliberately answer a concept well then poorly across two sessions
- Per-concept insight sentences change when the underlying numbers change — spot-check 3 concepts

---

## Phase 12 — Hybrid Adaptive Difficulty Engine (Elo-lite + multi-factor)

**Goal:** Replace the fixed difficulty-tier thresholds (mastery <40/40-69/≥70 → difficulty 1/2/3) with a continuous, mutually-adjusting rating system, layered with the existing multi-factor signals (streaks, exposure, reinforcement-after-miss). This is the "mix of both" approach.

**Core mechanic — paired Elo update:**
On every `POST /api/assessment/answer`:

1. Compute expected probability the student answers correctly, using the logistic function on the rating gap: `expected = 1 / (1 + 10^((question.eloRating - student.abilityRating) / 400))`
2. Update both ratings toward the actual outcome:
   - `student.abilityRating += K_STUDENT * (actualScore - expected)` where `actualScore` is 1 (correct) or 0 (incorrect)
   - `question.eloRating += K_QUESTION * (expected - actualScore)` (question rating moves _opposite_ direction — if a low-rated question is missed by a high-ability student, the question's difficulty estimate should rise)
   - Recommended starting K-factors: `K_STUDENT = 24`, `K_QUESTION = 8` (questions should adjust slower than students — a single response shouldn't wildly swing an item's calibration; tune during testing if ratings feel too jumpy or too sluggish)
3. Map `abilityRating` to the existing 0–100 `mastery` display value via a simple bounded transform (e.g. `mastery = clamp(50 + (abilityRating - 1100) / 8, 0, 100)`, tune the divisor so the visible mastery numbers move at a sensible pace relative to what you had in the rule-based version) — the UI-facing `mastery` field stays 0–100 for every screen already built; only the internal selection logic changes.

**Selection layer (multi-factor, applied on top of Elo):**
`GET /api/assessment/next` candidate scoring, for the target concept's question pool (excluding already-served-to-this-user questions, see Phase 13):

```
For each candidate question:
  ratingGap = abs(question.eloRating - student.abilityRating)
  exposurePenalty = question.exposure / (question.exposure + 10)   // diminishing, favors fresher questions
  score = ratingGap + (exposurePenalty * 150)                       // weight exposure meaningfully but not dominantly

Pick from the lowest-scoring N (e.g. bottom 3) at random, not strictly the single best match
  — this is what makes question *sequences* vary between students with similar ability,
    since ties/near-ties resolve differently. This directly supports Phase 13's
    "different pattern of questions per user" requirement.
```

Keep the existing reinforcement-after-miss and consecutive-correct signals as **concept-selection** inputs (which concept to target next), while the Elo layer handles **difficulty-within-concept** selection. Reasoning object for "Why this question?" should now reflect both: e.g. `"Matched to your current BST ability level (rating 1180) · Reinforcement after a recent miss"`.

**✅ Verify:**

- Log `abilityRating` and `mastery` together for a test run — confirm mastery still moves in intuitive directions (correct → up, incorrect → down) even though the underlying math changed
- Confirm two different simulated users answering the _same_ underlying correctness pattern (e.g. both get Q1-Q3-Q5 wrong) end up served _different actual questions_ at each step, due to the randomized top-N tie-break — this is the concrete test that the algorithm supports per-user variation
- Confirm question `eloRating` actually drifts over many simulated responses (seed a script that runs ~50 varied responses across multiple fake users, confirm question ratings are no longer sitting at their exact seeded default)

---

## Phase 13 — Question Bank Expansion (AI-Assisted, 100+ per concept, No-Repeat)

**Goal:** Grow from the current ~18 hand-written BST/AVL questions to 100+ questions across **all 8 concepts** (800+ total), generated with AI assistance for volume, with real duplicate protection and a genuine no-repeat-per-user guarantee.

**Generation script (`backend/src/scripts/bulkGenerateQuestions.js`):**

- For each of the 8 concepts, define 6–10 sub-topic hints to force variety (e.g. for BST: "search", "insertion", "deletion — leaf node", "deletion — one child", "deletion — two children", "in-order traversal", "successor/predecessor", "balanced vs unbalanced", "height calculation", "duplicate handling")
- For each concept × sub-topic combination, call Groq multiple times (varying difficulty tier easy/medium/hard across calls) until each concept reaches 100+ questions
- Prompt template per call: ask for one MCQ as strict JSON (`text`, `options[4]`, `correctAnswer`, `explanation`), matching the format already used in the Phase 6 admin generator — reuse that exact prompt structure, just script it in a loop instead of one-at-a-time from the admin UI
- **Duplicate protection during bulk generation:** after each successful generation, before saving, check the new question's `text` (normalized: lowercased, punctuation stripped) against all existing questions for that concept using a cheap similarity check (e.g. Jaccard similarity on word sets, threshold ~0.7) — reject and regenerate if too similar, rather than only exact-match (bulk LLM generation is far more prone to near-duplicates than one-off admin generation was)
- Assign each generated question a starting `eloRating` from its requested difficulty tier (easy→~1000, medium→~1250, hard→~1500) — this seeds Phase 12's engine sensibly instead of everything starting at one flat value
- Log progress per concept as it runs (this will take a while — dozens to hundreds of LLM calls); make it resumable/idempotent (skip concepts already at 100+, don't regenerate what already exists) since it may need to be re-run or extended later

**No-repeat-per-user guarantee:**

- `GET /api/assessment/next` candidate query must exclude questions the user has **ever** answered before (query `Response` by `userId` + `questionId`, not just this session's `servedQuestionIds`) — this is the actual change from the current session-only exclusion. With 100+ questions per concept this won't exhaust the pool in normal use, but add a graceful fallback: if the exclusion leaves zero candidates at the target concept, relax to the next-closest concept rather than crashing or serving a repeat.
- Combined with Phase 12's randomized top-N tie-break, this is what produces genuinely different question sequences between different students, not just different-but-deterministic ones.

**✅ Verify:**

- After running the bulk script, confirm each of the 8 concepts has 100+ questions in MongoDB, with a spread of difficulty tiers and no near-duplicate pairs (spot-check a sample of ~20 questions per concept manually for repetition/quality)
- Have two test accounts each complete several full assessments back-to-back (e.g. 5 sessions of 7 questions each = 35 questions per account) — confirm zero repeated `questionId` within a single account's full history
- Compare the two accounts' question sequences at matching points in their respective mastery journeys — confirm they diverge (not identical), demonstrating per-user variation

---

## Reporting instructions (same as prior phases)

At the end of each phase, report: what was built, confirmation it's real (not stubbed), any deviation from this prompt and why, and whether the phase's Verify criteria passed. Flag any K-factor/threshold tuning you had to adjust from the recommended defaults above, and why.
