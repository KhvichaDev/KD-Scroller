export interface KDScrollerOptions {
    scrollMode?: 'group' | 'item';
    continuousSpeed?: number;
    itemWidth?: number | string | null;
    gap?: number | string | null;
    btnTheme?: 'auto' | 'light' | 'dark' | string;
    hideArrowsOnTouch?: boolean;
    hideArrowsBelow?: number;
    leftIcon?: string;
    rightIcon?: string;
    onReachEnd?: ((done: () => void) => void | Promise<void>) | null;
    loadingDelay?: number;
}

declare class KDScroller {
    constructor(selector: string | HTMLElement, options?: KDScrollerOptions);
    destroy(): void;
}

export default KDScroller;
