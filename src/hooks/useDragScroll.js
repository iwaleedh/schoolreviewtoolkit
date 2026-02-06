import { useRef, useState, useCallback } from 'react';

/**
 * useDragScroll - Custom hook for drag-to-scroll functionality
 * Enables click-and-drag horizontal scrolling on a container
 */
export function useDragScroll() {
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onMouseDown = useCallback((e) => {
        if (!containerRef.current) return;

        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setScrollLeft(containerRef.current.scrollLeft);
        containerRef.current.style.cursor = 'grabbing';
        containerRef.current.style.userSelect = 'none';
    }, []);

    const onMouseLeave = useCallback(() => {
        if (!containerRef.current) return;
        setIsDragging(false);
        containerRef.current.style.cursor = 'grab';
        containerRef.current.style.userSelect = 'auto';
    }, []);

    const onMouseUp = useCallback(() => {
        if (!containerRef.current) return;
        setIsDragging(false);
        containerRef.current.style.cursor = 'grab';
        containerRef.current.style.userSelect = 'auto';
    }, []);

    const onMouseMove = useCallback((e) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // Scroll speed multiplier
        containerRef.current.scrollLeft = scrollLeft - walk;
    }, [isDragging, startX, scrollLeft]);

    return {
        containerRef,
        isDragging,
        handlers: {
            onMouseDown,
            onMouseLeave,
            onMouseUp,
            onMouseMove,
        },
    };
}

export default useDragScroll;
