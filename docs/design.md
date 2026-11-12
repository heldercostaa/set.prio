# Design notes

The interface follows an Apple utility direction: clear content hierarchy, system typography, neutral grouped surfaces, compact controls, and semantic accents.

## References

- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Design Resources](https://developer.apple.com/design/resources/)
- [Apple font terms](https://developer.apple.com/fonts/)

Radix supplies accessible web primitives. It is not an official Apple component library.

## Tokens

| Role            | Color   |
| --------------- | ------- |
| Canvas          | #111113 |
| Grouped surface | #1c1c1e |
| Primary text    | #f5f5f7 |
| Secondary text  | #a1a1a6 |
| Separator       | #38383a |
| Link/focus      | #78b8ff |
| P0              | #ff6961 |
| P1              | #ffb266 |
| P2              | #ffe066 |
| P3              | #70d7c7 |

The app uses dark appearance throughout, including native form controls, dialogs, browser chrome metadata, the installation manifest, and image exports. It remains dark when the operating system prefers light. There is no appearance switch.

The neutral and semantic palette adapts Apple's platform design guidance for browser rendering. Text accents are adjusted for contrast instead of assuming native platform color APIs exist in CSS.

Spacing uses Tailwind’s rem-based scale. Component radii and typography scale with the browser’s root font size. System typography uses weight and spacing to establish hierarchy without a custom downloaded font.

The canonical SVG retains its original #1C1C1E base, #3A3A3C track, white knob, #FF453A dot, and shadow. The supplied dark square is unchanged throughout the app and exports. PNGs are rasterized from that asset.

## Interaction

Desktop shows three day columns. Mobile shows a day selector, keeping every action available at 320px. The explicit priority selector is the keyboard and touch alternative to dragging.

Artist details use a Radix modal with a fixed heading and scrollable content. Mobile displays a bottom sheet. Focus returns to the originating artist or its moved replacement card.

Motion emphasizes card relocation, modal entry, and export feedback. Reduced-motion preferences disable transition animation. Hover previews supplement the clickable modal; touch users get all information through the modal.

CSS selectors are scoped to components. Biome's descending-specificity rule is disabled for CSS because it compares selectors from unrelated component scopes. Application accessibility rules remain enabled.

## Export layout

The PNG uses the same dark grouped surfaces, rounded column outlines, day icons, separators, priority badges, counts, and bordered artist labels as the board. Labels flow into rows and wrap long names; each column height is measured from its contents. The export stays 1440 CSS pixels wide and renders at 2× resolution, independently of the current viewport. Day SVGs in public/icons are serialized from the pinned Lucide icons; their license is included alongside them.

## Utility refinements

Typography uses readable artist labels and quieter metadata. Grouped surfaces stay flat; separators establish hierarchy without decorative gradients. The genre estimate notice remains visible as a plain information row. Segmented controls and modal dismissal targets retain 44px hit areas.

Semantic Tailwind tokens map canvas, surface, raised surface, content, muted text, separators, and accents to the shared palette. Component utilities own layout, visual treatments, responsive rules, and compound interaction states. Global CSS contains shared tokens, base styles, motion, and a small compatibility layer for dynamically selected priority colors. These are web adaptations, not Apple-provided components.

The board uses a compact navigation bar, one task heading, uniform calendar symbols, flat priority headings, and quiet artist surfaces. Color identifies priority while separators organize the work area. Hover never changes label geometry.

## Appearance

Dark is the first-visit default. The header provides a persistent light appearance option. Semantic tokens adapt grouped backgrounds, labels, separators, focus rings, and priority accents together. Apple devices use San Francisco through the system font stack; no separately downloaded Apple font is redistributed. Translucency is reserved for floating controls, with opaque semantic surfaces as fallback.
