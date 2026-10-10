'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'

export default function MagnetLink({
  children,
  className = '',
  ...props
}: React.ComponentProps<'a'>) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const xTo = useRef<gsap.QuickToFunc | null>(null)
  const yTo = useRef<gsap.QuickToFunc | null>(null)

  useGSAP(
    () => {
      const opts = { duration: 0.8, ease: 'elastic.out(1, 0.4)' }
      xTo.current = gsap.quickTo(linkRef.current, 'x', opts)
      yTo.current = gsap.quickTo(linkRef.current, 'y', opts)
    },
    { scope: wrapRef },
  )

  const magnet = (e: React.MouseEvent) => {
    const r = wrapRef.current!.getBoundingClientRect()
    xTo.current?.((e.clientX - (r.left + r.width / 2)) * 0.3)
    yTo.current?.((e.clientY - (r.top + r.height / 2)) * 0.3)
  }

  const reset = () => {
    xTo.current?.(0)
    yTo.current?.(0)
  }

  return (
    // p-6 -m-6: 反応エリアだけ広げて、レイアウトは今のまま
    <span ref={wrapRef} className="-m-6 inline-block p-6" onMouseMove={magnet} onMouseLeave={reset}>
      <a {...props} ref={linkRef} className={`inline-block ${className}`}>
        {children}
      </a>
    </span>
  )
}
