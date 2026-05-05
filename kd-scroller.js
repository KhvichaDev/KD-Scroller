/**
 * KD Scroller Library
 * Author: KhvichaDev
 * A standalone, zero-dependency horizontal scroll component with navigation arrows,
 * drag-to-scroll, keyboard accessibility, and intelligent auto-theming.
 */
(function (global, factory) {
    /** Force global assignment to ensure availability in environments with conflicting AMD loaders */
    const lib = factory();
    global.KDScroller = lib;

    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = lib;
    } else if (typeof define === "function" && define.amd) {
        define([], function() { return lib; });
    }
}(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this), function () {
    'use strict';

    /** Lazily injects the library's complete stylesheet into the document head on first use,
     * making the library fully self-contained with zero external CSS dependencies.
     * Skips injection if a stylesheet with the same ID already exists, preventing duplication
     * when the developer manually includes the CSS file.
     */
    function injectCSS() {
        if (document.getElementById('kd-scroller-styles')) return;

        const css = `
            .kd-scroller-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                width: 100%;
                box-sizing: border-box;
                padding: 0 4px;
                --kd-btn-bg: #2b2b2b;
                --kd-btn-text: #ffffff;
                --kd-btn-border: rgba(255, 255, 255, 0.15);
                --kd-btn-hover-bg: #3c3c3c;
                --kd-btn-hover-border: rgba(255, 255, 255, 0.6);
                --kd-btn-size: 42px;
                --kd-btn-icon-size: 20px;
                --kd-btn-radius: 50%;
                --kd-btn-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                --kd-btn-hover-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
            }
            .kd-scroller-track {
                display: flex;
                overflow-x: auto;
                width: 100%;
                scrollbar-width: none;
                -ms-overflow-style: none;
                scroll-behavior: auto;
                flex: 1;
                position: relative;
                cursor: grab;
            }
            .kd-scroller-wrapper.is-scrolling .kd-scroller-track,
            .kd-scroller-wrapper.kd-is-dragging .kd-scroller-track > * {
                pointer-events: none;
            }
            .kd-scroller-wrapper.kd-is-dragging .kd-scroller-track {
                cursor: grabbing;
            }
            .kd-scroller-track::-webkit-scrollbar {
                display: none;
            }
            :where(.kd-scroller-track) {
                gap: 15px;
            }
            .kd-scroller-track > * {
                flex-shrink: 0 !important;
            }
            :where(.kd-scroller-track > *) {
                width: max-content;
                max-width: 100%;
                white-space: nowrap;
            }
            .kd-scroll-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                z-index: 10;
                background-color: var(--kd-btn-bg);
                border: 1px solid var(--kd-btn-border);
                color: var(--kd-btn-text);
                cursor: pointer;
                padding: 0;
                border-radius: var(--kd-btn-radius);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                width: var(--kd-btn-size);
                height: var(--kd-btn-size);
                box-shadow: var(--kd-btn-shadow);
            }
            .kd-scroll-btn.left { left: -10px; }
            .kd-scroll-btn.right { right: -10px; }
            .kd-scroll-btn:hover {
                background-color: var(--kd-btn-hover-bg);
                border-color: var(--kd-btn-hover-border);
                color: var(--kd-btn-text);
                transform: translateY(-50%) scale(1.1);
                box-shadow: var(--kd-btn-hover-shadow);
            }
            .kd-scroll-btn:active {
                transform: translateY(-50%) scale(0.95);
            }
            .kd-scroll-btn svg {
                width: var(--kd-btn-icon-size);
                height: var(--kd-btn-icon-size);
                pointer-events: none;
            }
            .kd-scroller-loader {
                display: none;
                align-self: stretch;
                align-items: center;
                justify-content: center;
                padding: 0 15px;
                flex-shrink: 0 !important;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            .kd-scroller-loader.visible {
                opacity: 1;
            }
            .kd-spinner {
                width: 22px;
                height: 22px;
                border: 3px solid var(--kd-btn-border);
                border-top-color: var(--kd-btn-text);
                border-radius: 50%;
                animation: kd-spin 0.8s linear infinite;
                box-sizing: border-box;
            }
            @keyframes kd-spin {
                to { transform: rotate(360deg); }
            }
        `;

        const style = document.createElement('style');
        style.id = 'kd-scroller-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    class KDScroller {
        constructor(selector, options = {}) {
            this.target = typeof selector === 'string' ? document.querySelector(selector) : selector;
            if (!this.target) {
                console.error('KD Scroller: Target element not found.');
                return;
            }

            const defaults = {
                scrollMode: 'group',
                continuousSpeed: 3,
                itemWidth: null,
                gap: null,
                btnTheme: 'auto',
                hideArrowsOnTouch: false,
                hideArrowsBelow: 0,
                leftIcon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>',
                rightIcon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>',
                onReachEnd: null,
                loadingDelay: 1500
            };
            this.options = { ...defaults, ...options };

            this.wrapper = null;
            this.leftBtn = null;
            this.rightBtn = null;
            this.loaderEl = null;
            this.isLongPress = false;
            this.animationFrameId = null;
            this.smoothScrollId = null;
            this.isDragging = false;
            this.startX = 0;
            this.scrollLeft = 0;
            this.hasReachedEnd = false;
            this.isLoading = false;
            /** Cache touch device capability to prevent redundant BOM checks on every scroll frame */
            this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
            this.init();
        }

        init() {
            /** Ensure the stylesheet is present before building any DOM structure */
            injectCSS();

            this.buildDOM();
            this.attachEvents();

            /** Wait for the DOM to fully settle before analyzing colors and checking overflow state */
            setTimeout(() => {
                this.applyTheme();
                this.checkScrollState();
            }, 50);
        }

        /** Smart color analysis algorithm that reads the first card's background color
         * and generates a matching set of button colors with proper contrast. This ensures
         * the navigation arrows blend naturally with any card design without manual theming.
         */
        applyTheme() {
            if (!this.wrapper) return;

            let theme = this.options.btnTheme;
            let bgColor = '#2b2b2b';

            if (theme === 'auto' && this.target.children.length > 0) {
                const cardStyle = window.getComputedStyle(this.target.children[0]);
                const cardBg = cardStyle.backgroundColor;
                if (cardBg !== 'rgba(0, 0, 0, 0)' && cardBg !== 'transparent') {
                    bgColor = cardBg;
                }
            } else if (theme === 'light') {
                bgColor = '#ffffff';
            } else if (theme === 'dark') {
                bgColor = '#2b2b2b';
            } else if (theme !== 'auto') {
                bgColor = theme;
            }

            /** Reliably convert any color string to RGB using the browser's own CSS engine
             * by temporarily assigning it to a hidden element's computed style.
             */
            const temp = document.createElement('div');
            temp.style.display = 'none';
            temp.style.color = bgColor;
            document.body.appendChild(temp);
            const computedColor = window.getComputedStyle(temp).color;
            document.body.removeChild(temp);

            const rgbMatch = computedColor.match(/\d+/g);
            if (rgbMatch && rgbMatch.length >= 3) {
                const r = parseInt(rgbMatch[0]), g = parseInt(rgbMatch[1]), b = parseInt(rgbMatch[2]);

                /** YIQ formula determines perceived brightness — values >= 128 are considered light */
                const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                const isLight = yiq >= 128;

                const textColor = isLight ? '#1a1a1a' : '#ffffff';
                const borderColor = isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
                const hoverBorderColor = isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)';

                /** For hover state, darken light backgrounds and lighten dark ones for subtle feedback */
                const step = 25;
                const hoverR = isLight ? Math.max(0, r - step) : Math.min(255, r + step);
                const hoverG = isLight ? Math.max(0, g - step) : Math.min(255, g + step);
                const hoverB = isLight ? Math.max(0, b - step) : Math.min(255, b + step);
                const hoverBgColor = `rgb(${hoverR}, ${hoverG}, ${hoverB})`;

                this.wrapper.style.setProperty('--kd-btn-bg', computedColor);
                this.wrapper.style.setProperty('--kd-btn-text', textColor);
                this.wrapper.style.setProperty('--kd-btn-border', borderColor);
                this.wrapper.style.setProperty('--kd-btn-hover-bg', hoverBgColor);
                this.wrapper.style.setProperty('--kd-btn-hover-border', hoverBorderColor);
            }
        }

        buildDOM() {
            this.wrapper = document.createElement('div');
            this.wrapper.className = 'kd-scroller-wrapper';

            this.target.classList.add('kd-scroller-track');
            /** Enable keyboard focus on the track for arrow-key navigation */
            this.target.setAttribute('tabindex', '0');

            if (this.options.gap) {
                this.target.style.gap = typeof this.options.gap === 'number' ? `${this.options.gap}px` : this.options.gap;
            }

            if (this.options.itemWidth) {
                const widthValue = typeof this.options.itemWidth === 'number' ? `${this.options.itemWidth}px` : this.options.itemWidth;
                Array.from(this.target.children).forEach(child => {
                    child.style.minWidth = widthValue;
                });
            }

            this.leftBtn = this.createButton('left', this.options.leftIcon);
            this.rightBtn = this.createButton('right', this.options.rightIcon);

            this.target.parentNode.insertBefore(this.wrapper, this.target);
            this.wrapper.appendChild(this.leftBtn);
            this.wrapper.appendChild(this.target);
            this.wrapper.appendChild(this.rightBtn);
        }

        createButton(direction, svgContent) {
            const btn = document.createElement('button');
            btn.className = `kd-scroll-btn ${direction}`;
            btn.innerHTML = svgContent;
            btn.style.display = 'none';

            btn.setAttribute('aria-label', direction === 'left' ? 'Scroll left' : 'Scroll right');
            btn.setAttribute('type', 'button');

            return btn;
        }

        showLoader() {
            if (!this.loaderEl) {
                this.loaderEl = document.createElement('div');
                this.loaderEl.className = 'kd-scroller-loader';
                this.loaderEl.innerHTML = '<div class="kd-spinner"></div>';
                this.target.appendChild(this.loaderEl);
            }
            this.loaderEl.style.display = 'flex';
            /** Force a layout recalculation so the CSS transition animates from opacity 0 */
            this.loaderEl.offsetHeight;
            this.loaderEl.classList.add('visible');

            /** Nudge scroll slightly so the loader is fully visible in the viewport */
            setTimeout(() => this.smoothScroll(60), 50);
        }

        hideLoader() {
            if (this.loaderEl) {
                this.loaderEl.classList.remove('visible');
                setTimeout(() => {
                    this.loaderEl.style.display = 'none';
                    this.checkScrollState();
                }, 300);
            }
        }

        checkScrollState() {
            const tolerance = 1;
            const isScrollable = this.target.scrollWidth > this.target.clientWidth + tolerance;

            if (!isScrollable) {
                this.leftBtn.style.display = 'none';
                this.rightBtn.style.display = 'none';
                this.target.style.webkitMaskImage = 'none';
                this.target.style.maskImage = 'none';
                return;
            }

            const showLeft = this.target.scrollLeft > tolerance;
            const showRight = Math.ceil(this.target.scrollLeft + this.target.clientWidth) < this.target.scrollWidth - tolerance;

            let arrowsAllowed = true;
            if (this.options.hideArrowsBelow > 0 && window.innerWidth < this.options.hideArrowsBelow) {
                arrowsAllowed = false;
            }
            if (this.options.hideArrowsOnTouch && this.isTouchDevice) {
                arrowsAllowed = false;
            }
            this.leftBtn.style.display = (showLeft && arrowsAllowed) ? 'flex' : 'none';
            this.rightBtn.style.display = (showRight && arrowsAllowed) ? 'flex' : 'none';

            /** Edge-fade mask gradient reveals content direction — transparent edges indicate more content */
            const maskLeft = showLeft ? 'transparent, black 60px' : 'black';
            const maskRight = showRight ? 'black calc(100% - 60px), transparent' : 'black';
            const maskGradient = `linear-gradient(to right, ${maskLeft}, ${maskRight})`;

            this.target.style.webkitMaskImage = maskGradient;
            this.target.style.maskImage = maskGradient;

            /** onReachEnd hook triggers the loader and invokes the developer's callback.
             * Supports both Promise-based and done-callback patterns for maximum flexibility.
             */
            if (!showRight) {
                if (!this.hasReachedEnd && !this.isLoading && this.options.onReachEnd && typeof this.options.onReachEnd === 'function') {
                    this.hasReachedEnd = true;
                    this.isLoading = true;
                    this.showLoader();

                    const doneCallback = () => {
                        setTimeout(() => {
                            this.hideLoader();
                            this.isLoading = false;
                        }, this.options.loadingDelay);
                    };

                    const result = this.options.onReachEnd(doneCallback);
                    if (result && typeof result.then === 'function') {
                        result.then(() => doneCallback()).catch(() => doneCallback());
                    } else if (!result && this.options.onReachEnd.length === 0) {
                        /** Auto-complete if the callback neither accepts a done parameter nor returns a Promise */
                        doneCallback();
                    }
                }
            } else {
                /** Unlock the end-reached latch when the user scrolls back, allowing re-trigger */
                this.hasReachedEnd = false;
            }
        }

       smoothScroll(amount) {
            if (amount === 0) return;

            if (this.smoothScrollId) {
                cancelAnimationFrame(this.smoothScrollId);
            }

            const start = this.target.scrollLeft;
            const duration = 400;
            const startTime = performance.now();
            
            /** Disable pointer events on cards during scroll to prevent hover flicker */
            if (this.wrapper) this.wrapper.classList.add('is-scrolling');
            
            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 4);
                
                this.target.scrollLeft = start + (amount * ease);
                
                if (progress < 1) {
                    this.smoothScrollId = requestAnimationFrame(step);
                } else {
                    this.smoothScrollId = null;
                    if (this.wrapper) this.wrapper.classList.remove('is-scrolling');
                    this.checkScrollState();
                }
            };
            
            this.smoothScrollId = requestAnimationFrame(step);
        }

        /** Pixel-perfect scroll position calculator that accounts for gaps between items.
         * In 'item' mode it snaps to the nearest single element boundary,
         * while 'group' mode scrolls by a full viewport width of visible items.
         */
        calculateTargetScroll(direction) {
            const children = Array.from(this.target.children);
            if (children.length === 0) return this.target.scrollLeft;

            const currentScroll = this.target.scrollLeft;
            const containerWidth = this.target.clientWidth;
            const tolerance = 5;

            const computedStyle = window.getComputedStyle(this.target);
            let gapValue = parseFloat(computedStyle.gap);
            if (isNaN(gapValue)) gapValue = 0;

            /** The first element has no leading gap, so offset calculation must skip the gap for index 0 */
            const getOffsetWithGap = (element, index) => {
                return index === 0 ? 0 : Math.max(0, element.offsetLeft - gapValue);
            };

            if (this.options.scrollMode === 'item') {
                if (direction === 'right') {
                    const nextIndex = children.findIndex((child, index) => getOffsetWithGap(child, index) > currentScroll + tolerance);
                    return nextIndex !== -1 ? getOffsetWithGap(children[nextIndex], nextIndex) : currentScroll;
                } else {
                    for (let i = children.length - 1; i >= 0; i--) {
                        if (getOffsetWithGap(children[i], i) < currentScroll - tolerance) {
                            return getOffsetWithGap(children[i], i);
                        }
                    }
                    return 0;
                }
            } else {
                if (direction === 'right') {
                    const cutOffIndex = children.findIndex(child => (child.offsetLeft + child.offsetWidth) > (currentScroll + containerWidth - tolerance));

                    if (cutOffIndex !== -1) {
                        const cutOff = children[cutOffIndex];
                        if (cutOff.offsetLeft <= currentScroll + tolerance) {
                            const nextIndex = cutOffIndex + 1;
                            return nextIndex < children.length ? getOffsetWithGap(children[nextIndex], nextIndex) : currentScroll;
                        }
                        return getOffsetWithGap(cutOff, cutOffIndex);
                    }
                    return currentScroll;
                } else {
                    const firstVisibleIndex = children.findIndex(child => child.offsetLeft >= currentScroll - tolerance);
                    if (firstVisibleIndex <= 0) return 0;

                    const targetScroll = currentScroll - containerWidth;

                    let bestPrevIndex = 0;
                    for (let i = firstVisibleIndex - 1; i >= 0; i--) {
                        if (children[i].offsetLeft - gapValue <= targetScroll + tolerance) {
                            bestPrevIndex = Math.min(i + 1, firstVisibleIndex - 1);
                            break;
                        }
                    }

                    return getOffsetWithGap(children[bestPrevIndex], bestPrevIndex);
                }
            }
        }

        attachButtonEvents(btn, direction) {
            let pressTimer = null;

            const stopContinuous = () => {
                if (this.animationFrameId) {
                    cancelAnimationFrame(this.animationFrameId);
                    this.animationFrameId = null;
                }
                this.isLongPress = false;
            };

            const startContinuous = () => {
                this.isLongPress = true;
                const speed = this.options.continuousSpeed;

                const loop = () => {
                    if (!this.isLongPress) return;

                    this.target.scrollLeft += (direction === 'left' ? -speed : speed);
                    this.checkScrollState();

                    if (this.target.scrollLeft <= 0 || this.target.scrollLeft >= this.target.scrollWidth - this.target.clientWidth) {
                        stopContinuous();
                        return;
                    }
                    this.animationFrameId = requestAnimationFrame(loop);
                };
                loop();
            };

            const cleanupGlobalListeners = () => {
                window.removeEventListener('mouseup', releaseHandler);
                window.removeEventListener('touchend', releaseHandler);
                window.removeEventListener('touchcancel', releaseHandler);
            };

            const releaseHandler = (e) => {
                clearTimeout(pressTimer);
                cleanupGlobalListeners();

                if (this.isLongPress) {
                    stopContinuous();
                } else {
                    /** Verify the release happened on the button itself, using elementFromPoint
                     * for touch events since e.target can be inaccurate on mobile.
                     */
                    let target = e.target;
                    if (e.type === 'touchend' && e.changedTouches.length > 0) {
                        target = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                    }

                    if (target === btn || btn.contains(target)) {
                        const targetScroll = this.calculateTargetScroll(direction);
                        const amount = targetScroll - this.target.scrollLeft;
                        this.smoothScroll(amount);
                    } else {
                        stopContinuous();
                    }
                }
            };

            const startHandler = (e) => {
                if (e.cancelable) e.preventDefault();
                stopContinuous();

                window.addEventListener('mouseup', releaseHandler);
                window.addEventListener('touchend', releaseHandler);
                window.addEventListener('touchcancel', releaseHandler);

                pressTimer = setTimeout(() => {
                    startContinuous();
                }, 200);
            };

            btn.addEventListener('mousedown', startHandler);
            btn.addEventListener('touchstart', startHandler);

            btn.addEventListener('mouseleave', () => {
                if (this.isLongPress) stopContinuous();
            });
        }

        attachEvents() {
            this.attachButtonEvents(this.leftBtn, 'left');
            this.attachButtonEvents(this.rightBtn, 'right');

            this.checkScrollHandler = () => this.checkScrollState();
            this.target.addEventListener('scroll', this.checkScrollHandler);
            window.addEventListener('resize', this.checkScrollHandler);

            /** Desktop grab & drag logic   named references enable proper cleanup in destroy() */
            this.dragStartHandler = (e) => {
                this.isDragging = true;
                this.wrapper.classList.add('kd-is-dragging');
                this.startX = e.pageX - this.target.offsetLeft;
                this.scrollLeft = this.target.scrollLeft;
                
                window.addEventListener('mouseup', this.dragStopHandler);
                window.addEventListener('mousemove', this.dragMoveHandler);
            };
            this.dragStopHandler = () => {
                if (!this.isDragging) return;
                this.isDragging = false;
                this.wrapper.classList.remove('kd-is-dragging');
                window.removeEventListener('mouseup', this.dragStopHandler);
                window.removeEventListener('mousemove', this.dragMoveHandler);
            };
            this.dragMoveHandler = (e) => {
                if (!this.isDragging) return;
                e.preventDefault();
                const x = e.pageX - this.target.offsetLeft;
                const walk = (x - this.startX) * 1.5;
                this.target.scrollLeft = this.scrollLeft - walk;
            };
            this.target.addEventListener('mousedown', this.dragStartHandler);

            this.keydownHandler = (e) => {
                /** Prevent scrolling if user is typing inside an input/textarea within a card */
                const isFormElement = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
                if (isFormElement && e.target !== this.target) return;

                const directions = { 'ArrowRight': 'right', 'ArrowLeft': 'left' };
                const direction = directions[e.key];

                if (direction) {
                    e.preventDefault();
                    const amount = this.calculateTargetScroll(direction) - this.target.scrollLeft;
                    this.smoothScroll(amount);
                }
            };
            this.target.addEventListener('keydown', this.keydownHandler);
        }

       /** Fully tears down the scroller instance, removing all event listeners,
         * restoring the original DOM structure, and clearing internal references
         * to prevent memory leaks in single-page applications.
         */
        destroy() {
            if (!this.wrapper) return;

            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            if (this.smoothScrollId) {
                cancelAnimationFrame(this.smoothScrollId);
                this.smoothScrollId = null;
            }

            this.target.removeEventListener('scroll', this.checkScrollHandler);
            window.removeEventListener('resize', this.checkScrollHandler);
            this.target.removeEventListener('mousedown', this.dragStartHandler);
            /** Clean up window listeners in case destroy is called mid-drag */
            window.removeEventListener('mouseup', this.dragStopHandler);
            window.removeEventListener('mousemove', this.dragMoveHandler);
            this.target.removeEventListener('keydown', this.keydownHandler);
            
            this.target.classList.remove('kd-scroller-track');
            this.target.style.webkitMaskImage = '';
            this.target.style.maskImage = '';
            this.target.removeAttribute('tabindex');
            
            if (this.options.gap) {
                this.target.style.gap = '';
            }
            
            if (this.options.itemWidth) {
                Array.from(this.target.children).forEach(child => child.style.minWidth = '');
            }
            
            if (this.loaderEl) {
                this.loaderEl.remove();
                this.loaderEl = null;
            }
            
            this.wrapper.parentNode.insertBefore(this.target, this.wrapper);
            this.wrapper.remove();
            this.wrapper = null;
            this.leftBtn = null;
            this.rightBtn = null;
        }
    }

    return KDScroller;
}));