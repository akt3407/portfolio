'use client'

import { useEffect, useRef, ViewTransition } from 'react'

// 一覧のホバー動画の再生位置。詳細ページの動画をここから再生して、遷移の前後で絵をつなげる。
// 読んだ後に 0 へ戻すと、開発時の StrictMode で effect が2回走った2回目で 0 になるので戻さない
let handoffTime = 0
export const handOffVideo = (time: number) => {
  handoffTime = time
}

// 一覧と詳細で同じ name を付けると、遷移中にブラウザが位置とサイズを補間する（globals.css の .work-video）。
// 一覧で動画が出ている時のクリック（work-open）だけモーフさせ、ブラウザバックなどでは動かさない
export const videoTransition = (slug: string) =>
  ({
    name: `work-video-${slug}`,
    share: { 'work-open': 'work-video', default: 'none' },
    default: 'none',
  }) as const

interface WorkVideoProps {
  slug: string
  src: string
}

export default function WorkVideo({ slug, src }: WorkVideoProps) {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = video.current!
    v.currentTime = handoffTime
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) v.play().catch(() => {})
  }, [])

  return (
    <ViewTransition {...videoTransition(slug)}>
      {/* 読み込み前でも遷移先の大きさが決まるように、動画の比率（1438×778）を先に当てておく */}
      <video
        ref={video}
        src={src}
        muted
        loop
        playsInline
        aria-hidden="true"
        className="aspect-1438/778 w-full object-cover"
      />
    </ViewTransition>
  )
}
