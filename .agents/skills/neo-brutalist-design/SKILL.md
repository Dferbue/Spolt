---
name: neo-brutalist-design
description: "Use when creating, reviewing, or modifying Spolt frontend UI so the work follows the project's visual identity: sporty neo-brutalism, black/white contrast, Spolt pink accents, hard shadows, bold typography, dense Angular screens, modals, cards, buttons, forms, and responsive layouts."
---

# Spolt Visual Style

Use this skill for any frontend change in `spolt-frontend/` that affects visible UI, layout, CSS, component markup, modals, cards, buttons, forms, dashboards, event screens, friend screens, profile screens, admin screens, or welcome pages.

Spolt's look is **sporty neo-brutalist with a modern app shell**: white content surfaces, black structure, hard offset shadows, saturated pink accents, bold uppercase labels, compact cards, and pragmatic responsive behavior.

## Source Of Truth

Before making broad visual changes, inspect nearby component CSS and global tokens:

- `spolt-frontend/src/styles.css`
- The component `.css` next to the edited `.html`/`.ts`
- Similar screens in `pages/eventos/`, `pages/amigos/`, `pages/perfil/`, `pages/admin/`, and `shared/components/`

Prefer existing local class names and patterns over creating a new design vocabulary.

## Core Tokens

Use global variables where available:

```css
:root {
  --black: #0a0a0a;
  --white: #ffffff;
  --green: #10b981;
  --pink: #ff006e;
  --bg-dark: #121212;
  --bg-light: #f5f5f5;
  --gray: #666666;
  --border-radius: 8px;
  --font-main: 'Inter', system-ui, sans-serif;
}
```

Primary palette:

- Structure: `#000`, `#111`, `#0a0a0a`
- Surfaces: `#fff`, `#f9f9f9`, `#f5f5f5`, `#fafafa`
- Brand accent: `var(--pink, #ff006e)`
- Success/state accents: `#10b981`, `#22c55e`, `#b9fbc0`
- Warning/type accents: `#ffd166`, `#00f5d4`, `#ffb3d9`
- Error/destructive: `#ef4444`, `#ff4b4b`

Do not introduce a new dominant color system unless the feature already has entity-specific colors, such as sport colors.

## Structural Style

Use hard geometry:

- Borders: `2px` to `4px solid #111` or `#000`
- Shadows: unblurred offsets like `4px 4px 0 #111`, `6px 6px 0 var(--pink)`, `8px 8px 0 #ff006e`
- Radius: usually `8px` or `12px` in app screens; sharper boxes are acceptable for title blocks and admin panels
- Backgrounds: white cards on light dotted/gridded content areas, or dark shell/sidebar surfaces
- Motion: small transforms only, usually translate or scale, with `0.15s` to `0.3s`

Avoid glassy gradients, soft decorative glows, excessive blur, rounded pill-heavy UI, and large marketing-style decorative sections inside app workflows.

## Typography

Use `var(--font-main)` / Inter by default. Typography should feel strong and scannable:

- Main titles: `font-weight: 900` or `950`, uppercase when matching the screen
- Labels, tags, buttons: uppercase, `font-weight: 800` or `900`, small letter spacing up to `1px`
- Body text: readable, usually `font-weight: 600` or `700` for important UI copy
- Monospace is reserved for compact badges or data-like labels, such as `DM Mono` in dashboard headers

Do not use viewport-scaled font sizes. On mobile, reduce fixed sizes through media queries.

## Layout Patterns

For app pages:

- Keep the sidebar/dark shell intact.
- Use white main surfaces with strong black/pink emphasis.
- Use constrained content widths such as `max-width: 1000px` or `1200px`.
- Prefer dense, functional layouts over hero/marketing sections.
- Use `box-sizing: border-box` on interactive blocks that can shrink.

Common page heading:

```css
.title-box {
  display: inline-block;
  background: #fff;
  border: 3px solid #000;
  padding: 10px 40px;
  box-shadow: 6px 6px 0 var(--pink, #ff006e);
}

.title-box h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
}
```

Common card:

```css
.spolt-card {
  background: #fff;
  border: 2px solid #111;
  border-radius: 12px;
  box-shadow: 5px 5px 0 var(--pink, #ff006e);
  padding: 1.2rem 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.spolt-card:hover {
  transform: translateY(-4px) translateX(-2px);
  box-shadow: 8px 8px 0 #111;
}
```

## Buttons And Controls

Buttons should look physical and decisive:

```css
.spolt-btn {
  background: var(--pink, #ff006e);
  color: #fff;
  border: 3px solid #111;
  box-shadow: 4px 4px 0 #111;
  padding: 12px 18px;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.spolt-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #111;
}
```

For secondary actions, prefer white/black buttons with the same border and shadow language. Destructive actions can use black/white structure plus red accent, not an entirely new style.

Inputs and selects:

- Use `border: 2px` or `3px solid #111`
- Keep backgrounds white on light screens and `#111`/`var(--black)` on auth-dark screens
- Focus state should use `var(--pink)` border or a subtle ring
- Preserve native control clarity; do not hide important affordances

## Tags And Status

Tags are compact, bordered, bold, and state-colored:

```css
.spolt-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border: 2px solid #111;
  border-radius: 6px;
  box-shadow: 2px 2px 0 #111;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
```

Use existing semantic colors for event states and sport/event types whenever possible.

## Modals

Modal styling is a major Spolt identity element:

- Fixed overlay with dark translucent backdrop
- White modal content
- `3px` or `4px` black border
- Pink or black hard shadow, often `8px 8px 0 var(--pink)`
- Strong uppercase title
- Actions stacked on small modals or arranged clearly on wider ones
- High z-index consistent with existing modal patterns

For modal behavior, also use the `spolt-modal-patterns` skill when available.

## Responsive Rules

Spolt UI must stay dense but usable:

- At `max-width: 600px`, reduce padding, title size, tab padding, and button text size.
- Avoid horizontal overflow by using `min-width: 0`, `box-sizing: border-box`, and `text-overflow: ellipsis` on constrained controls.
- Keep bottom spacing for mobile navigation where existing screens use it.
- Convert verbose tags to compact dots/icons only when the existing screen already does so and the meaning remains accessible.
- Do not let hard shadows create unintended page overflow on mobile.

When making responsive visual work, also use the `responsive-brutalism` skill when available.

## Admin Screens

Admin UI should be more operational and information-dense, but still brutalist:

- Use strong boxed sections with black borders and pink shadows.
- Keep tables, lists, filters, and forms scan-friendly.
- Use restrained animation.
- Preserve admin/CEO role affordances and permission clarity.

When changing admin UI, also use the `spolt-admin-panel` skill.

## Auth And Welcome Screens

Auth screens may use the darker minimalist variant:

- Dark surfaces: `var(--bg-dark)` and `var(--black)`
- White text
- Pink primary action
- Softer `1px` borders are acceptable in auth forms if the surrounding page already uses that pattern

Welcome/public pages can be more expressive, but should still use the same palette, typography, and black/pink structure.

## Review Checklist

Before finishing a UI change:

- Does the component reuse nearby style patterns and global variables?
- Are borders, shadows, typography, and colors consistent with Spolt?
- Are hover, active, disabled, empty, loading, and error states accounted for when relevant?
- Does the layout work at desktop, tablet, and narrow mobile sizes?
- Are text labels contained without overlap or clipping?
- Are modals layered and scrollable correctly?
- Did the change avoid unrelated visual refactors?
