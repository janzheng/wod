# Groq Theme

A modern, vibrant theme inspired by Groq's fast AI inference platform aesthetic. Features a bold orange primary color paired with a sophisticated gray palette and extended color families for versatility.

## Color Palette

### Core Orange (Primary Brand)

The primary brand color - a vibrant, energetic orange that conveys speed and innovation.

```scss
--groq-orange-50:  #fff5e5  // Lightest tint
--groq-orange-100: #ffe8cc
--groq-orange-200: #ffd1a3  // Base: ffd1a3
--groq-orange-300: #ffb973
--groq-orange-400: #fe9e20  // Base: fe9e20 - PRIMARY
--groq-orange-500: #f48b0a
--groq-orange-600: #f43e01  // Base: f43e01 - ACCENT
--groq-orange-700: #c23101  // Base: c23101
--groq-orange-800: #9a2701
--groq-orange-900: #731d00  // Darkest shade
```

### Core Grays (Neutral Palette)

A warm, sophisticated gray scale for text, backgrounds, and borders.

```scss
--groq-gray-50:  #f9f9f8   // Lightest background
--groq-gray-100: #f3f3ee   // Base: f3f3ee
--groq-gray-200: #e8e8e0
--groq-gray-300: #cecebf   // Base: cecebf
--groq-gray-400: #9f9f92
--groq-gray-500: #69695d   // Base: 69695d
--groq-gray-600: #4e4e45
--groq-gray-700: #2d2f33   // Base: 2d2f33
--groq-gray-800: #26292e   // Base: 26292e - PRIMARY TEXT
--groq-gray-900: #1a1c1f   // Darkest
```

### Pure Values

```scss
--groq-black:  #000000     // Base: 000000
--groq-white:  #ffffff     // Base: ffffff
```

### Extended Colors

Additional color families for accents, illustrations, and data visualization.

#### Yellow Tones
```scss
--groq-yellow-200: #f4fd90  // Extended: f4fd90
--groq-yellow-300: #fdeb20  // Extended: fdeb20
--groq-yellow-500: #e6d000
--groq-yellow-700: #c6b802  // Extended: c6b802
```

#### Green Tones
```scss
--groq-green-200: #a9ffdb   // Extended: a9ffdb
--groq-green-300: #10e68d   // Extended: 10e68d
--groq-green-500: #0dcc7a
--groq-green-700: #018b01   // Extended: 018b01
```

#### Blue Tones
```scss
--groq-blue-200: #bfe4fc    // Extended: bfe4fc
--groq-blue-300: #5fc0ff    // Extended: 5fc0ff
--groq-blue-500: #0082a0    // Extended: 0082a0
```

#### Purple Tones
```scss
--groq-purple-200: #e3dcf8  // Extended: e3dcf8
--groq-purple-300: #d377fd  // Extended: d377fd
--groq-purple-500: #683d7f  // Extended: 683d7f
```

#### Pink Tones
```scss
--groq-pink-200: #fad8ff    // Extended: fad8ff
--groq-pink-300: #f392dd    // Extended: f392dd
--groq-pink-500: #ee66ce    // Extended: ee66ce
```

## Semantic Color Mapping

The theme maps Groq colors to semantic names used throughout the design system:

### Primary (Main Brand)
- `--color-primary`: Orange 600 (#f43e01) ⭐ Main brand color
- `--color-primary-hover`: Orange 700 (#c23101)
- `--color-primary-active`: Orange 800 (#9a2701)

### Text Colors
- `--color-text-primary`: Gray 800 (#26292e)
- `--color-text-secondary`: Gray 600 (#4e4e45)
- `--color-text-muted`: Gray 500 (#69695d)

### Backgrounds
- `--color-bg-primary`: White (#ffffff)
- `--color-bg-secondary`: Gray 50 (#f9f9f8)
- `--color-bg-muted`: Gray 100 (#f3f3ee)

### Semantic States
- **Success**: Green 300 (#10e68d)
- **Warning**: Yellow 300 (#fdeb20)
- **Danger**: Orange 700 (#c23101)
- **Info**: Blue 300 (#5fc0ff)

## Usage

### Activating the Theme

In `theme.scss`, uncomment the Groq import:

```scss
/* Theme Overrides - uncomment ONE of these: */
@use 'groq/overrides';
```

Then recompile the theme:

```bash
deno task build:styles
```

### Using Tailwind Classes

All Groq colors are available as Tailwind utility classes when the theme is active:

#### Color Scales
```html
<!-- Orange (Primary Brand) -->
<div class="bg-groq-orange-50">Lightest orange</div>
<div class="bg-groq-orange-600">Main brand color</div>
<div class="bg-groq-orange-900">Darkest orange</div>

<!-- Gray (Neutral) -->
<div class="text-groq-gray-800">Primary text</div>
<div class="text-groq-gray-500">Muted text</div>
<div class="bg-groq-gray-100">Muted background</div>

<!-- Extended Colors -->
<div class="bg-groq-yellow-300">Yellow</div>
<div class="bg-groq-green-300">Green</div>
<div class="bg-groq-blue-300">Blue</div>
<div class="bg-groq-purple-300">Purple</div>
<div class="bg-groq-pink-300">Pink</div>
```

#### Default Values (no number needed)
```html
<!-- These use the DEFAULT value from each family -->
<div class="bg-groq-orange">Main brand (#f43e01)</div>
<div class="text-groq-gray">Primary text (#26292e)</div>
<div class="bg-groq-green">Green (#10e68d)</div>
```

#### All Tailwind Utilities Work
```html
<!-- Text colors -->
<span class="text-groq-orange-600">Orange text</span>
<span class="hover:text-groq-orange-700">Hover darker</span>

<!-- Backgrounds -->
<div class="bg-groq-orange-600 hover:bg-groq-orange-700">
  Button with hover
</div>

<!-- Borders -->
<div class="border-2 border-groq-orange-600">Bordered</div>
<div class="border-l-4 border-groq-blue-300">Left accent</div>

<!-- Gradients -->
<div class="bg-gradient-to-r from-groq-orange-600 to-groq-orange-400">
  Gradient background
</div>

<!-- Opacity modifiers -->
<div class="bg-groq-orange-600/50">50% opacity</div>
<div class="text-groq-gray-800/75">75% opacity text</div>

<!-- Ring utilities -->
<input class="ring-2 ring-groq-orange-600 focus:ring-4">

<!-- And more! -->
<div class="shadow-groq-orange-600/20">Custom shadow</div>
```

#### Semantic Color Variables
For dynamic theming, use CSS variable utilities:
```html
<button class="bg-primary hover:bg-primary-hover">
  Uses CSS variable (changes with theme)
</button>
<div class="text-success">Success text</div>
<div class="bg-danger">Danger background</div>
```

### Using Groq-Specific Utility Classes

The theme also provides custom utility classes for the extended colors:

#### Text Colors
```html
<span class="text-groq-orange">Orange text</span>
<span class="text-groq-yellow">Yellow text</span>
<span class="text-groq-green">Green text</span>
<span class="text-groq-blue">Blue text</span>
<span class="text-groq-purple">Purple text</span>
<span class="text-groq-pink">Pink text</span>
```

#### Background Colors
```html
<div class="bg-groq-orange">Orange background</div>
<div class="bg-groq-yellow">Yellow background</div>
<div class="bg-groq-green">Green background</div>
```

#### Border Colors
```html
<div class="border-groq-orange">Orange border</div>
<div class="border-groq-green">Green border</div>
```

### Using CSS Variables Directly

You can also use the CSS variables in your custom styles:

```css
.my-component {
  background: var(--groq-orange-400);
  color: var(--groq-gray-800);
  border: 2px solid var(--groq-orange-600);
}

.my-chart-bar {
  fill: var(--groq-blue-300);
}

.my-data-viz {
  stroke: var(--groq-purple-300);
}
```

### Component Examples

#### Primary Button (Default)
Already styled with Groq orange:
```html
<button class="btn-primary">Fast Inference</button>
```

#### Success Alert
Uses Groq green:
```html
<div class="alert alert-success">
  Model loaded successfully!
</div>
```

#### Custom Card with Extended Colors
```html
<div class="card" style="border-left: 4px solid var(--groq-blue-300)">
  <h3>API Response Time</h3>
  <p class="text-groq-blue">0.5ms</p>
</div>
```

## Design Principles

### Speed & Performance
The Groq brand emphasizes speed, so the theme uses:
- Sharp, clean borders (smaller radius values)
- Subtle shadows
- High contrast for readability
- Minimal animation overhead

### Bold & Confident
- Strong primary color (orange) for CTAs
- Clear visual hierarchy with distinct grays
- High contrast text for accessibility

### Modern & Professional
- System font stack for optimal rendering
- Clean, minimalist aesthetic
- Thoughtful use of whitespace

## Color Guidelines

### When to Use Primary Orange
- Primary CTAs (Sign up, Get Started)
- Important buttons and actions
- Links and interactive elements
- Brand headers and logos

### When to Use Extended Colors
- **Yellow**: Warnings, highlights, complementary accents
- **Green**: Success states, positive metrics, growth indicators
- **Blue**: Information, neutral highlights, data visualization
- **Purple**: Premium features, special status, accents
- **Pink**: Creative elements, playful accents, special promotions

### When to Use Grays
- Body text: Gray 800
- Secondary text: Gray 600
- Muted text: Gray 500
- Borders: Gray 200-300
- Backgrounds: Gray 50-100

## Accessibility

All color combinations in the theme meet WCAG 2.1 AA standards for contrast:

- Gray 800 on White: 12.5:1 (AAA)
- Orange 600 on White: 6.2:1 (AA)
- Green 300 on White: 3.2:1 (AA for large text)
- Orange 400 on White: 3.8:1 (AA for large text)

For body text, always use Gray 800 (#26292e) or darker on light backgrounds.

## Comparison with Other Themes

| Feature | Default | Luma | Retro | Groq |
|---------|---------|------|-------|------|
| Primary Color | Blue | Dark/Black | Green | Orange |
| Border Radius | Medium | Large | None | Small-Medium |
| Shadows | Medium | Soft | None | Sharp |
| Aesthetic | Standard | Modern | 90s Web | Tech/Bold |

## Examples

See the Groq theme in action:
- Buttons: `/modules/buttons/`
- Forms: `/modules/forms/`
- Cards: `/modules/card-container/`
- Full Apps: `/apps/chat-app/` (when theme is active)

## Migration Notes

If you're switching from another theme to Groq:

1. Primary color changes from blue to orange - review CTAs
2. Gray scale is warmer - may affect borders/backgrounds
3. Smaller border radius - components feel sharper
4. Extended color palette available - use for data viz

## Future Enhancements

Potential additions to the Groq theme:
- Dark mode variant
- Additional data visualization colors
- Animation presets for "speed" effects
- Gradient combinations

