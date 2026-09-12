import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

/**
 * Horizontal scrolling without a visible scrollbar: touch scrolls natively,
 * the mouse drags (with click suppression after a drag) and the wheel maps
 * vertical deltas onto the horizontal axis.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const dragged = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0 || el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e: ReactPointerEvent<T>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    const startX = e.clientX;
    const startScroll = el.scrollLeft;
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 6) dragged.current = true;
      if (dragged.current) el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      // The click event fires synchronously after pointerup — clear the flag
      // only after it has been captured (or when no click follows at all).
      setTimeout(() => {
        dragged.current = false;
      }, 0);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const onClickCapture = (e: ReactMouseEvent<T>) => {
    if (!dragged.current) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return { ref, onPointerDown, onClickCapture };
}
