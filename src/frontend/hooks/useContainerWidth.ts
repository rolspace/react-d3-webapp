import { useEffect, useState } from 'react'

/** Width of `element` in CSS px. Returns `fallback` until measured, when the width is 0 (jsdom) or without ResizeObserver. */
export function useContainerWidth(element: HTMLElement | null, fallback: number): number {
  const [width, setWidth] = useState(fallback)

  useEffect(() => {
    if (!element) {
      return
    }
    const measure = (w: number) => setWidth(w > 0 ? Math.round(w) : fallback)
    measure(element.clientWidth)
    if (typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        measure(entry.contentRect.width)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [element, fallback])

  return width
}
