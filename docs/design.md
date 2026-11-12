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

The interface and image exports always use dark appearance, regardless of operating-system preference or previously saved appearance settings.

The neutral and semantic palette adapts Apple's platform design guidance for browser rendering. Text accents are adjusted for contrast instead of assuming native platform color APIs exist in CSS.

Spacing uses Tailwind’s rem-based scale. Component radii and typography scale with the browser’s root font size. System typography uses weight and spacing to establish hierarchy without a custom downloaded font.

The canonical SVG retains its original #1C1C1E base, #3A3A3C track, white knob, #FF453A dot, and shadow. The supplied dark square is unchanged throughout the app and exports. PNGs are rasterized from that asset.

## Interaction

Desktop shows three day columns. Mobile shows a day selector and supports horizontal swipes across the board: left advances a day, right goes back, stopping at Friday and Sunday. Vertical scrolling, short gestures, and active artist drags keep the selected day. Every action remains available at 320px. The explicit priority selector is the keyboard and touch alternative to dragging.

The right-hand grip extends the card’s hover surface while its layout slot stays unchanged. The extension respects neighboring cards and column edges. The hovered name shifts only enough to fit the grip, without covering other labels or wrapping the card. The grip remains draggable, and previews keep a measured gap from the expanded surface.

Floating targets use each priority’s color and dashed outline in an aligned grid above the back-to-top button. They appear only after an artist drag moves, then remain visible until drop or cancellation. Hover, focus, and a stationary touch hold keep them hidden. Artist previews and the card’s drag grip still respond to hover.

Artist details use a Radix modal with a fixed heading and scrollable content. Mobile displays a bottom sheet. Focus returns to the originating artist or its moved replacement card.

Motion emphasizes card relocation, modal entry, and export feedback. Reduced-motion preferences disable transition animation. Hover previews supplement the clickable modal; touch users get all information through the modal.

Landscape artist images show the complete source photo over a subdued, blurred copy of the same image. This preserves faces and group members across portrait and wide source photos; square catalog thumbnails keep their compact crop.

CSS selectors are scoped to components. Biome's descending-specificity rule is disabled for CSS because it compares selectors from unrelated component scopes. Application accessibility rules remain enabled.

## Export layout

The PNG uses the same dark grouped surfaces, rounded column outlines, day icons, separators, priority badges, counts, and bordered artist labels as the board. Labels flow into rows and wrap long names; each column height is measured from its contents. The export stays 1440 CSS pixels wide and renders at 2× resolution, independently of the current viewport. Day SVGs in public/icons are serialized from the pinned Lucide icons; their license is included alongside them.

## Utility refinements

Typography uses readable artist labels and quieter metadata. Grouped surfaces stay flat; separators establish hierarchy without decorative gradients. The genre estimate notice remains visible as a plain information row. Segmented controls and modal dismissal targets retain 44px hit areas.

Semantic Tailwind tokens map canvas, surface, raised surface, content, muted text, separators, and accents to the shared palette. Component utilities own layout, visual treatments, responsive rules, and compound interaction states. Global CSS contains shared tokens, base styles, motion, and a small compatibility layer for dynamically selected priority colors. These are web adaptations, not Apple-provided components.

The board uses a compact navigation bar, one task heading, uniform day symbols, flat priority headings, and quiet artist surfaces. Color identifies priority while separators organize the work area. Hover never changes label geometry.

## Appearance

The app uses a single dark palette. Semantic tokens define grouped backgrounds, labels, separators, focus rings, and priority accents consistently. Apple devices use San Francisco through the system font stack; no separately downloaded Apple font is redistributed. Translucency is reserved for floating controls, with opaque semantic surfaces as fallback.

The view switch, genre filter, and search field share surface, border, radius, typography, and icon tokens. Inset borders keep controls and touch targets at the same height, including search with its clear button. Search and filter sit together on all viewport sizes; mobile text inputs use the browser-safe 1rem size to avoid iPhone focus zoom.

Mobile exports offer Share image, CSV, and Notion. Opening the export menu prepares and caches the complete PNG; selecting Share image calls the native share sheet directly from that tap. A plan or language change invalidates the prepared image. Unsupported browsers show an unavailable state instead of offering an image download on mobile. Desktop keeps its download flow. Native sharing requires [transient user activation](https://www.w3.org/TR/web-share/#share-method), so rendering finishes before the share tap.

The watched filter combines with search and genres in both views. A recording rating, including zero, marks its set watched. Joint acts enter Watched when every member has a rated recommendation; partially watched acts remain in Not watched yet. Filtering never changes saved priorities or export scope.
