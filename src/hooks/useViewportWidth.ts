import { useEffect, useState } from 'react'

function getWidth(): number {
  if (typeof window === 'undefined') return 1280
  return window.innerWidth
}

export function useViewportWidth(): number {
  const [width, setWidth] = useState<number>(getWidth)

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return width
}
