# Design System: Scaler Academy

## 1. Visual Theme & Atmosphere

- Overall feeling: Professional, performance-oriented, and education-forward, with a crisp enterprise marketing aesthetic.
- Visual density: Medium to high; content-rich sections with frequent headings, supporting copy, cards, media embeds, and program detail blocks.
- Brand posture: Confident, practical, and aspirational; emphasizes outcomes, credibility, and AI-era career relevance.
- Signature motifs: Strong blue CTA system, large bold headlines, square corners, modular curriculum cards, image-led storytelling, and a light background with dark text.

### Key Characteristics

- Clear hierarchy built around large headline-first sections
- Modular sections that stack educational content in digestible blocks
- Blue-centric brand palette with minimal decorative color variation
- Hard-edge geometry: no visible rounding in core buttons and surfaces

## 2. Color Palette & Roles

| Role | Semantic Name | Value | Usage |
| --- | --- | --- | --- |
| Primary action | Scaler Blue | #004CE5 | Main CTA buttons, brand emphasis, active states |
| Accent | Deep Link Blue | #011A53 | Secondary buttons, link-like emphasis, dark text-accent contrast |
| Surface | White | #FFFFFF | Page background and primary surface fill |
| Text | Black | #000000 | Primary body and headline text |
| Border | Light Blue Tint | #E6F0FF | Secondary button fill, subtle contrast panels |

### Primary

- #004CE5 as the primary action and strongest brand color.
- #00236E as a deeper supporting blue for brand depth and contrast.
- #011A53 as a dark blue used for secondary action text and link-style emphasis.

### Interactive

- Links use deep navy-blue tones rather than bright underlines or decorative colors.
- Primary button color stays saturated blue for high salience.
- Secondary button uses a pale blue fill with dark text, signaling a lower-priority action.

### Neutral Scale

- White is the dominant base surface.
- Black is used for text, giving maximum contrast and directness.
- Light blue-tinted neutral surfaces substitute for gray in secondary UI treatments.

### Surface & Overlay

- Surface token: White page and card background.
- Overlay token: Not explicitly evidenced; likely minimal and only used for media/player overlays and modal-like interactions if present.

### Theme Modes

The branding evidence indicates a light color scheme. No dark mode evidence was observed.

#### Light Mode

- Background: #FFFFFF
- Surface: #FFFFFF
- Text: #000000
- Accent: #004CE5
- Notes: Light, high-contrast, and content-forward; most emphasis comes from blue action color rather than shadow or tint.

#### Dark Mode

- Background: Not evidenced
- Surface: Not evidenced
- Text: Not evidenced
- Accent: Not evidenced
- Notes: No dark mode evidence was provided.

### Shadows & Depth

- Border/ring treatment: Very minimal; square, flat UI with emphasis on color and spacing rather than shadow.
- Card shadow stack: No visible button shadow; overall depth appears restrained.
- Focus treatment: Not explicitly evidenced; likely a simple ring or outline compatible with the flat system.

## 3. Typography Rules

### Font Family

- Primary: Clash Grotesk
- Monospace: Not evidenced
- OpenType Features: Not evidenced; likely standard sans-serif rendering with strong geometric proportions.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Hero headline | Clash Grotesk | 74px | Not evidenced; likely bold/semibold | Not evidenced | Not evidenced | Large marketing headline; used for the main program title |
| Section heading | Clash Grotesk | 40px | Not evidenced; likely bold/semibold | Not evidenced | Not evidenced | Used for major section anchors and curriculum blocks |
| Body | Clash Grotesk | 74px in raw tokens, but this appears to be a token error or misclassification | Not evidenced | Not evidenced | Not evidenced | Observed body copy is clearly much smaller than 74px; treat this token as unreliable |
| Label / Eyebrow | Clash Grotesk | Not evidenced | Not evidenced | Not evidenced | Not evidenced | Used for small context labels such as program framing and track labels |
| Caption / Meta | Clash Grotesk | Not evidenced | Not evidenced | Not evidenced | Not evidenced | Used for timeline, session counts, and supporting metadata |

### Principles

- Headlines are large and assertive, prioritizing clarity and conversion.
- Typography stays sans-serif and modern, with no ornamental display styling.
- Hierarchy is driven by size and weight contrast rather than color variation.

## 4. Component Stylings

### Buttons and Links

- Primary CTA: Solid #004CE5 background with white text, square corners, no shadow.
- Secondary CTA: Pale blue fill (#E6F0FF) with dark blue text (#011A53), square corners, no shadow.
- Text links: Simple blue/navy text links with minimal decoration.
- Hover and active feel: Not directly evidenced; likely slight shade shift or underline-based feedback, but this is an inference.

### Cards and Containers

- Surface style: Flat, white, content-heavy containers with strong internal hierarchy.
- Radius: 0px; cards and buttons appear square.
- Border: Minimal or subtle; emphasis is on spacing rather than framing.
- Shadow or elevation: Very limited; the system prefers flat layouts.
- Internal spacing: Medium spacing between modules, with generous padding around text and media.

### Inputs and Interactive Controls

- Input treatment: Not evidenced on the captured page.
- Focus behavior: Not evidenced.
- Selection states: Program track selectors and content tabs appear likely to use color/contrast rather than heavy chrome; exact styling not observed.

### Navigation

- Structure: Header navigation exists, with a visible brand logo linking to homepage.
- Background treatment: Likely white or near-white to match the rest of the page; not explicitly evidenced.
- Link style: Minimal, text-based navigation.
- Sticky or scroll behavior: Not evidenced.

### Image Treatment

- Screenshot treatment: Full-width and embedded product/education imagery used as section anchors.
- Photography or illustration style: Real photography and screenshot-like curriculum visuals; also includes branded thumbnails and logos.
- Border and radius treatment: Image corners appear square or minimally rounded; no decorative frames are evident.

### Distinctive Components

- AI-first curriculum blocks with prompt/review/own framing
- Program/track selectors that segment learning paths by experience level
- Video embeds and social proof modules integrated into the learning narrative

## 5. Layout Principles

### Spacing System

- Base unit: 4px
- Repeated spacing values: 4, 8, 12, 16, 24, 32, 40, 48px are the most likely recurring increments inferred from the 4px base unit.

### Grid & Container

- Grid logic: Responsive modular stacking with clear vertical section separation.
- Max content width: Not explicitly evidenced; visually appears to use a standard centered marketing container.
- Section spacing: Generous vertical spacing between major marketing sections and curriculum blocks.

### Whitespace Philosophy

- Whitespace philosophy: White space is used to keep dense educational content readable, not to create a minimalist or sparse feel.
- Alignment tendencies: Left-aligned text with structured module cards and aligned metadata.
- Content width behavior: Body copy is constrained enough to support long-form scanning but still feels expansive.

### Border Radius Scale

- Micro: 0px
- Standard: 0px
- Large: 0px
- Pill: Not evidenced; core brand UI favors square geometry

## 6. Depth & Elevation

| Level | Treatment | Use |
| --- | --- | --- |
| Flat | White or tinted flat fill | Page background, sections, cards |
| Ring | Subtle outline or contrast edge | Secondary controls, structural separation |
| Card | Flat card with minimal separation | Curriculum modules, program blocks |
| Focus | Likely outline/ring-based focus treatment | Keyboard focus and accessible interaction states |

### Depth Principles

- Surface hierarchy: Built primarily through spacing, typography, and contrast instead of shadows.
- Shadow language: Essentially none in the observed button system.
- Blur, glass, or overlay behavior: Not evidenced.
- When depth is used versus avoided: Depth is avoided for the main system; it may only appear in media embeds or platform-native components.

## 7. Do's and Don'ts

### Do

- Use strong blue CTAs for primary actions.
- Keep surfaces flat, square, and structured.
- Preserve large, confident headings and concise supporting copy.

### Don't

- Don’t introduce rounded corners or soft neumorphic styling.
- Don’t rely on shadows to separate content.
- Don’t dilute the palette with many competing accent colors.

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
| --- | --- | --- |
| Mobile | Not evidenced; likely Tailwind default small screens | Stack sections vertically, compress media, preserve readable text sizes |
| Tablet | Not evidenced; likely Tailwind medium screens | Expand multi-column layouts where possible, keep curriculum modules grouped |
| Desktop | Not evidenced; likely Tailwind large screens | Use wider content grids, side-by-side media and copy, stronger section rhythm |

### Touch Targets

- Buttons should remain large enough to tap comfortably; primary CTA behavior suggests prominent touch targets.
- Interactive cards and track tabs should maintain generous spacing to prevent accidental taps.

### Collapsing Strategy

- Desktop behavior: Richer multi-column marketing and curriculum presentation.
- Tablet behavior: Likely partial column collapse while keeping program modules grouped.
- Mobile behavior: Single-column stacking with compact media and readable section blocks.
- Breakpoint-driven component changes: Curriculum and track selectors likely collapse from horizontal tabs to stacked or swipeable sections.
- Touch target and spacing adjustments: Maintain 44px+ minimum touch area and preserve vertical breathing room between stacked cards.

## 9. Agent Prompt Guide

### Quick Color Reference

- Primary CTA: #004CE5
- Background: #FFFFFF
- Heading text: #000000
- Body text: #000000
- Border or ring: #E6F0FF
- Accent: #011A53

### Quick Summary

Scaler Academy uses a light, high-contrast marketing system built for trust and conversion.
The visual language is flat, square, and highly structured, with no visible rounding in core components.
Clash Grotesk drives a modern sans-serif typographic voice with large, assertive headlines.
Primary actions are saturated blue buttons; secondary actions are pale blue with dark text.
The page relies on modular educational content blocks, track selectors, and media-led proof sections.
Whitespace is functional, supporting dense program information without feeling cluttered.
The design is professional, medium-energy, and optimized for software/AI career outcomes.

### Example Component Prompts

- Hero: Create a wide, high-contrast hero with a large bold headline, supporting educational copy, and two square blue CTA buttons on a white/light surface.
- Card: Build a flat square-corner card with minimal border, strong heading hierarchy, and compact metadata rows for curriculum details.
- Navigation: Use a simple top navigation with a visible logo, text links, and no heavy shadow or rounded treatment.
- Button or badge: Use a solid #004CE5 primary button with white text, or a pale blue secondary button with dark navy text, both square and flat.

### Ready-to-Use Prompt

Design a Scaler Academy-style landing page: light background, flat square-corner UI, Clash Grotesk typography, bold oversized headlines, primary CTA in bright blue (#004CE5), secondary CTA in pale blue (#E6F0FF), minimal shadows, and modular curriculum cards with dense but readable educational content.

### Iteration Guide

1. Keep everything flat, square, and content-first.
2. Use blue sparingly but decisively for primary actions and emphasis.
3. Preserve strong typography hierarchy and generous vertical spacing.

## Optional Appendix: Interaction Patterns

- Scroll behavior: Long-form scrolling with section-by-section narrative progression.
- Hover behavior: Likely subtle color-shift feedback rather than motion-heavy transitions.
- Click behavior: Action-oriented CTAs and section tabs for program exploration.
- Animation tone: Not strongly evidenced; likely restrained and functional.

## Optional Appendix: Content & Messaging Patterns

- Headline pattern: Outcome-driven, declarative, and often framed around transformation or future readiness.
- CTA language: Direct and conversion-oriented, e.g. “Download Brochure,” “Request a Callback,” “Placement report.”
- Trust signal pattern: Uses curriculum depth, recognizable tool names, video embeds, and program structure as proof.
- Voice and tone: Professional, ambitious, and pragmatic with an AI-era career lens.

## Optional Appendix: Observed Pages

- /academy/: Primary landing page for program positioning, CTA styling, hero, curriculum, tracks, and project modules
- YouTube embeds referenced in page content: Proof/content module styling and media integration patterns