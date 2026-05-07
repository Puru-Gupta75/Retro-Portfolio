# Design System Strategy: The Phosphor Ghost

## 1. Overview & Creative North Star
This design system is a high-resolution love letter to the late-1980s monochrome computing era. Moving beyond a simple "retro skin," our Creative North Star is **"The Phosphor Ghost."** 

This concept leans into the persistence of light on a cathode-ray tube. We are building a "Retro-Brutalist" interface that rejects modern soft aesthetics in favor of geometric severity, intentional asymmetry, and high-contrast editorial layouts. The experience should feel like a high-end, bespoke terminal—architectural, authoritative, and unapologetically digital. We break the "template" look by using ASCII art as structural framing and leveraging scanline textures to add a tactile, physical soul to the void.

---

## 2. Colors: The Amber Spectrum
Our palette is anchored in the high-energy glow of amber (#FFB000) against the infinite depth of deep charcoal and black.

### Tonal Hierarchy
- **Primary Glow:** Use `primary` (#ffd597) and `primary_container` (#ffb000) for active elements. The container color represents the "core" of the light, while the primary color represents the bleed/glow.
- **The Void (Backgrounds):** `surface` (#131313) is our canvas. Use `surface_container_lowest` (#0e0e0e) for "recessed" areas (like terminal inputs) and `surface_bright` (#393939) for high-impact structural blocks.

### The "No-Line" Rule
**Explicit Instruction:** Prohibit 1px solid CSS borders for sectioning. 
In this system, boundaries are defined by light and shadow, not lines. To separate content, use background shifts (e.g., a `surface_container_low` card sitting on a `surface` background). If a visual break is required, use a row of ASCII characters (e.g., `_ _ _ _` or `+ + + +`) rather than a standard `<hr>` or border-stroke.

### Surface Hierarchy & Nesting
Treat the UI as stacked layers of dark glass. 
- **Level 1:** `surface` (The Base)
- **Level 2:** `surface_container_low` (Information Groups)
- **Level 3:** `surface_container_high` (Interactive Modals/Floating Command Lines)

### The "Glass & Gradient" Rule
To achieve a premium feel, apply a subtle `linear-gradient` to main CTAs using `primary` to `primary_container`. For floating elements, use a 90% opacity on your surface colors combined with a `backdrop-blur(4px)` to simulate the light scattering effect of a thick glass CRT monitor.

---

## 3. Typography: Monospaced Authority
The typography system uses **Space Grotesk** to bridge the gap between technical monospaced fonts and high-end editorial type.

- **Display (Large Scale):** `display-lg` (3.5rem) and `display-md` (2.75rem) should be used for hero statements. Tighten the letter spacing (`letter-spacing: -0.05em`) to give it a modern, aggressive edge.
- **The Command Line (Headlines):** `headline-sm` (1.5rem) is your primary navigational anchor. Treat these as "system headers."
- **Body & Labels:** `body-md` (0.875rem) handles the bulk of information. 

**Identity through Type:** Every heading should be preceded by a character-based "prompt" (e.g., `> TITLE` or `:: TITLE`). This reinforces the terminal identity without needing heavy imagery.

---

## 4. Elevation & Depth: Tonal Layering
We reject drop shadows in their traditional sense. Depth is an optical illusion created by the "persistence" of amber light.

- **The Layering Principle:** Achieve lift by "stacking" container tiers. A `surface_container_highest` block placed over a `surface_dim` background provides all the hierarchy needed.
- **Ambient Glow:** Instead of grey shadows, use a `0px 0px 15px` blur of the `surface_tint` (#ffba43) at 5% opacity for floating elements. This mimics the "inner glow" of a phosphor screen.
- **The "Ghost Border" Fallback:** If a container needs more definition, use a "Ghost Border": the `outline_variant` (#524533) at 15% opacity. This provides a faint architectural guide without breaking the monochrome immersion.

---

## 5. Components

### Buttons
- **Primary:** Solid `primary_container` (#ffb000) with `on_primary` (#432c00) text. 0px border radius.
- **Secondary:** Transparent background with a `ghost-border` (15% opacity `outline`). Text is `primary`.
- **States:** On hover, the button should "flicker" (opacity shift from 100% to 90%) to mimic a CRT refresh.

### Input Fields
- **Styling:** Use `surface_container_lowest` for the field background. 
- **The Cursor:** Always include a blinking block cursor (`_`) at the end of active labels or within text fields to maintain the terminal "living" state.
- **Labels:** Use `label-sm` in `on_surface_variant` (#d7c4ac), always in uppercase.

### Cards & Lists
- **Rule:** No dividers. Use vertical spacing (32px or 48px) to separate list items. 
- **Layout:** Use intentional asymmetry. For example, a card’s header might be offset to the left, while the body text is indented by 24px to create a "nested code" look.

### Special Component: The Scanline Overlay
Apply a fixed, non-interactive `div` over the entire viewport with a CSS repeating-linear-gradient. This adds a subtle "texture" that grounds the digital colors in a physical retro reality.

---

## 6. Do's and Don'ts

### Do:
- **Do** embrace ASCII art (e.g., `[ OK ]`, `( * )`, `>>>>>`) for status indicators and icons.
- **Do** use 0px border radius for every single element. 
- **Do** use high-contrast layout shifts. Place a small `label-sm` next to a massive `display-lg` to create editorial tension.
- **Do** ensure accessibility by maintaining the high contrast of Amber-on-Black (AAA rated).

### Don't:
- **Don't** use "Soft" colors. Avoid any hues outside the defined Amber/Neutral spectrum.
- **Don't** use standard iconography (like FontAwesome). Create icons using keyboard characters or custom-built pixel-grid SVG shapes.
- **Don't** use traditional box-shadows. They break the flat, brutalist aesthetic of the terminal.
- **Don't** use rounded corners. This system is built on a rigid, 1980s hardware grid.

---

## 7. Signature Texture: The "Flicker"
For high-priority alerts (Error states using `error` #ffb4ab), use a subtle keyframe animation that mimics a voltage drop—a quick, 0.1s opacity jitter. This makes the design feel reactive and alive, like a piece of vintage hardware struggling to contain the data it’s displaying.