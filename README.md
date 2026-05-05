# KD Scroller

> **🚀 Build beautiful, interactive horizontal scroll experiences in seconds — zero dependencies, zero setup.**

A fast, zero-dependency horizontal scroll component with smart navigation, drag support, and intelligent auto-theming.

**Perfect for:**

- 🛍️ Product Carousels  
- 🏷️ Category Tags  
- 🖼️ Image Galleries  
- 📊 Data Dashboards  

👉 **Try it live:** [KhvichaDev.github.io/kd-scroller](https://KhvichaDev.github.io/kd-scroller/)

[![Minzipped Size](https://img.shields.io/bundlephobia/minzip/kd-scroller?style=for-the-badge&color=success)](https://bundlephobia.com/package/kd-scroller) [![Changelog](https://img.shields.io/badge/Changelog-34A853?style=for-the-badge&logo=keepachangelog&logoColor=white)](https://github.com/KhvichaDev/kd-scroller/releases) [![Support](https://img.shields.io/badge/Support-EA4335?style=for-the-badge&logo=github&logoColor=white)](https://github.com/KhvichaDev/kd-scroller/issues)

---

## Quick Start

```javascript
new KDScroller(".my-list");
```

## Why KD Scroller?

- 🎨 **Zero CSS Setup** — Styles are injected automatically. No extra files to import.
- 🧠 **Handles Edge Cases** — Form-element keyboard guards and window-level drag cleanup.
- 🏢 **Enterprise Ready** — Works out of the box with SSR and Strict CSP environments.
- 🌍 **Built for Real-World UI** — Intelligent auto-theming matches your exact card background.

## Installation

**Via NPM (Bundlers):**

```bash
npm install kd-scroller
```

**Via CDN (Direct Browser Usage):**

```html
<script src="https://cdn.jsdelivr.net/npm/kd-scroller"></script>

<script src="https://unpkg.com/kd-scroller"></script>
```

> 💡 **Zero-Config:** CSS is automatically injected — no need to include a separate stylesheet.

## Features

- 🎯 **Smart Navigation Arrows** — Auto-show/hide based on scroll position with edge-fade gradient hints.
- 🖱️ **Grab & Drag** — Desktop drag-to-scroll with proper cursor feedback and continuous long-press arrow scrolling.
- ⌨️ **Keyboard Accessible** — Full arrow-key navigation with smart form-element detection (avoids interfering with inputs).
- 🎨 **Intelligent Auto-Theming** — Reads card background colors and generates matching button styles automatically.
- ♾️ **Infinite Scroll** — Built-in `onReachEnd` hook with loader animation, supporting both Promises and callbacks.
- 📐 **Pixel-Perfect Snapping** — Two scroll modes: `group` (viewport paging) and `item` (single element snap).
- 📱 **Touch-Friendly** — Optional arrow hiding on touch devices and responsive breakpoints.
- 🚀 **Zero Dependencies** — Pure Vanilla JS. No jQuery, no external CSS.
- ⚡ **60fps Performance** — Hardware-accelerated CSS and optimized `requestAnimationFrame` logic.
- 🧹 **SPA-Ready** — Full `destroy()` cleanup for single-page applications.

## Usage

Include the library in your project:

```javascript
import KDScroller from "kd-scroller";
```

_(Or simply load the `kd-scroller.js` file via a `<script>` tag in browser environments)._

### HTML Structure

The scroller expects a simple parent container with child elements (cards/items). No special wrapper is needed.

```html
<div class="my-list">
  <div class="card">Content 1</div>
  <div class="card">Content 2</div>
  <div class="card">Content 3</div>
  <!-- ... -->
</div>
```

### Basic Usage

```javascript
new KDScroller(".my-scrollable-list");
```

### With Options

```javascript
new KDScroller(".my-list", {
  scrollMode: "item",
  btnTheme: "light",
  gap: 20,
  itemWidth: 250,
});
```

### Infinite Scroll (Promise-based)

```javascript
new KDScroller(".product-list", {
  onReachEnd: async (done) => {
    const newItems = await fetchMoreProducts();
    appendToDOM(newItems);
    done();
  },
});
```

### Infinite Scroll (Auto-complete)

```javascript
new KDScroller(".feed", {
  onReachEnd: () => {
    loadMoreContent();
  },
  loadingDelay: 2000,
});
```

### Destroy Instance

```javascript
const scroller = new KDScroller(".my-list");

// Later, when cleaning up (e.g., SPA route change)
scroller.destroy();
```

## API Options

| Parameter           | Type             | Default     | Description                                                                                |
| ------------------- | ---------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `scrollMode`        | String           | `'group'`   | `'group'` (viewport-width paging) or `'item'` (single element snap)                        |
| `continuousSpeed`   | Number           | `3`         | Pixel speed per frame during long-press continuous scroll                                  |
| `itemWidth`         | Number \| String | `null`      | Force a fixed width on all child elements (e.g., `250` or `'250px'`)                       |
| `gap`               | Number \| String | `null`      | Override the default gap between items (e.g., `20` or `'1rem'`)                            |
| `btnTheme`          | String           | `'auto'`    | `'auto'` (reads card color), `'light'`, `'dark'`, or any CSS color string                  |
| `hideArrowsOnTouch` | Boolean          | `false`     | Hide navigation arrows on touch-capable devices                                            |
| `hideArrowsBelow`   | Number           | `0`         | Hide arrows when viewport width is below this pixel value                                  |
| `leftIcon`          | String           | Default SVG | Custom SVG string for the left arrow button                                                |
| `rightIcon`         | String           | Default SVG | Custom SVG string for the right arrow button                                               |
| `onReachEnd`        | Function         | `null`      | Callback when scroll reaches the end. Receives a `done` callback or can return a `Promise` |
| `loadingDelay`      | Number           | `1500`      | Artificial delay (ms) before hiding the loader after `done()` is called                    |

## Methods

- **`destroy()`**: Removes all event listeners, restores the original DOM structure, and clears internal references. Essential for preventing memory leaks in single-page applications.

## Customization & CSS

The library auto-injects its CSS on first use. If you prefer manual control (e.g., for Strict CSP environments or SSR frameworks like Next.js), include the standalone `kd-scroller.css` file with `id="kd-scroller-styles"` to prevent duplicate injection:

```html
<link rel="stylesheet" href="path/to/kd-scroller.css" id="kd-scroller-styles" />
```

You can override button styles and structural dimensions via CSS custom properties on the `.kd-scroller-wrapper`:

- `--kd-btn-bg` — Button background color
- `--kd-btn-text` — Button text/icon color
- `--kd-btn-border` — Button border color
- `--kd-btn-hover-bg` — Button hover background
- `--kd-btn-hover-border` — Button hover border color
- `--kd-btn-size` — Button width and height (default: `42px`)
- `--kd-btn-icon-size` — SVG icon size (default: `20px`)
- `--kd-btn-radius` — Button border radius (default: `50%`)
- `--kd-btn-shadow` — Default box shadow
- `--kd-btn-hover-shadow` — Hover state box shadow

## Contact & Support

If you have any questions, bug reports, or feature requests, please [open an issue](https://github.com/KhvichaDev/kd-scroller/issues) on the GitHub repository.

## License

MIT License © KhvichaDev
