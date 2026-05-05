# Changelog

## v1.0.0 (03/05/2026) - Initial Release

- Horizontal scroll with smart navigation arrows that auto-hide based on scroll position.
- Two scroll modes: `group` (viewport-width paging) and `item` (single element snap).
- Intelligent auto-theming that reads card background colors and generates matching button styles.
- Grab & drag scrolling on desktop with proper cursor feedback.
- Keyboard navigation (Arrow keys) with accessibility attributes.
- Infinite scroll support via `onReachEnd` callback with built-in loader animation.
- Supports both Promise-based and done-callback patterns for async data loading.
- Edge-fade mask gradient for visual scroll-direction hints.
- Long-press continuous scrolling on navigation buttons.
- Touch-device arrow hiding option.
- Responsive breakpoint-based arrow hiding.
- Custom SVG icon support for navigation buttons.
- Full memory cleanup via `destroy()` method for SPA compatibility.
- Self-contained CSS auto-injection — zero external dependencies.
- UMD module format for universal compatibility (CDN, ESM, CommonJS).
- TypeScript type definitions included.
