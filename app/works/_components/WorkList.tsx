'use client'

import type { WorkListItem } from '@lib/microcms-client'
import { cn } from '@lib/utils'
import gsap from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState, ViewTransition } from 'react'

import { handOffVideo, videoTransition } from './WorkVideo'

interface WorkListProps {
  works: WorkListItem[]
}

export default function WorkList({ works }: WorkListProps) {
  // 最後にホバーした作品。ホバーを外してもフェードアウトし終わるまで画像と動画を残す
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const work = works[active]!

  // 詳細ページへ移っても Activity で state が残るので、隠れる時にホバーを解除する
  useLayoutEffect(() => () => setHovered(false), [])

  // 動画をカーソルに少し遅れて付いてこさせる。ホバー前から追っておき、出た瞬間にカーソル位置にいるようにする
  useEffect(() => {
    const v = video.current!
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.4
    const x = gsap.quickTo(v, 'x', { duration, ease: 'power3.out' })
    const y = gsap.quickTo(v, 'y', { duration, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      x(e.clientX)
      y(e.clientY)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  // ホバー中だけ動画を頭から再生する
  useEffect(() => {
    const v = video.current!
    if (hovered && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // 再生開始前に pause() されると play() は reject されるが、意図どおりなので無視する
      v.play().catch(() => {})
    } else {
      v.pause()
      v.currentTime = 0
    }
  }, [hovered, active])

  return (
    <>
      {work.image && (
        <Image
          src={work.image.url}
          alt=""
          width={912}
          height={514}
          className={cn(
            'pointer-events-none fixed inset-0 -z-10 size-full scale-110 object-cover opacity-0 blur-md transition-opacity duration-500',
            hovered && 'opacity-100',
          )}
        />
      )}
      {/* pointer-events-none が無いと、カーソル下の動画に乗った瞬間に li の pointerleave が発火する */}
      <ViewTransition {...videoTransition(work.slug!)}>
        <video
          ref={video}
          src={work.video}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className={cn(
            'pointer-events-none fixed top-0 left-0 z-10 w-100 -translate-1/2 opacity-0 transition-opacity duration-500',
            hovered && work.video && 'opacity-100',
          )}
        />
      </ViewTransition>
      <ul className="mx-auto mt-40 grid w-[70%] grid-cols-3 gap-x-20 gap-y-20">
        {works.map((item, i) => (
          <li
            key={item.id}
            // Home と同じく、タッチのタップや止まったカーソルでは出さない。画像の無い作品は演出なし
            onPointerMove={(e) => {
              if (e.pointerType !== 'mouse' || !item.image) return
              setActive(i)
              setHovered(true)
            }}
            onPointerLeave={() => setHovered(false)}
          >
            <Link
              href={`/works/${item.slug}`}
              // 動画が出ている作品をクリックした時だけ、動画を詳細ページへ移動させる
              transitionTypes={hovered && i === active ? ['work-open'] : undefined}
              onClick={() => handOffVideo(video.current!.currentTime)}
            >
              <h2 className="text-fluid-l font-medium">{item.title}</h2>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center justify-start gap-2">
                  <p className="text-xs">{item.sitetype}</p>
                  <p className="text-xs">{item.role}</p>
                </div>
                <p className="text-xs">{item.year}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
