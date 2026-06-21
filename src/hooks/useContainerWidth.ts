import { useCallback, useEffect, useRef, useState } from "react";

type CallbackRef = (el: HTMLDivElement | null) => void;

/**
 * Returns a callback ref to attach to a container div and the current content
 * width in px. Width updates whenever the element is resized (ResizeObserver).
 * Uses a callback ref so the observer re-attaches when the target mounts/unmounts
 * under conditional rendering.
 */
export function useContainerWidth(): [CallbackRef, number | undefined] {
  const [width, setWidth] = useState<number | undefined>(undefined);
  const observerRef = useRef<ResizeObserver | null>(null);

  const setRef = useCallback<CallbackRef>((el) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!el) {
      setWidth(undefined);
      return;
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    observerRef.current = observer;
    setWidth(el.getBoundingClientRect().width);
  }, []);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  return [setRef, width];
}
