'use client'

import type { Work } from '@lib/microcms'
import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useEffect, useRef, useState } from 'react'

gsap.registerPlugin(ScrambleTextPlugin)

interface WorkItemProps {
  work: Work
  index: number
}

const toTexts = (work: Work, index: number) => ({
  index: String(index).padStart(2, '0'),
  title: work.title,
  year: String(work.year),
  role: work.role,
})

export default function WorkItem({ work, index }: WorkItemProps) {
  const container = useRef<HTMLDivElement>(null)
  const texts = toTexts(work, index)
  // 文字は最初の1回だけ React が描き、以降は ScrambleText が書き換える。
  // React が同じテキストノードを更新しないように、children は初回の値で固定する
  const [first] = useState(texts)
  // 初回表示（と開発時の StrictMode の再実行）ではスクランブルさせない
  const shown = useRef(index)

  useEffect(() => {
    if (shown.current === index) return
    shown.current = index

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tweens = gsap.utils.toArray<HTMLElement>('[data-scramble]', container.current).map((el) =>
      gsap.to(el, {
        duration: reduce ? 0 : 1.75,
        scrambleText: { text: el.dataset.scramble!, chars: 'upperCase' },
      }),
    )
    // 作品の切り替え・ページ離脱（Activity で隠れる時も含む）では revert せず最後まで進める。
    // useGSAP の revert だと文字が開始前に戻り、Home に戻ったとき作品とズレたまま止まる
    return () => tweens.forEach((tween) => tween.progress(1))
  }, [index])

  return (
    <div ref={container} className="mt-2 flex justify-between">
      <h2 data-scramble={texts.title} className="text-fluid-slg">
        {first.title}
      </h2>
      <div>
        <p data-scramble={texts.year} className="text-right text-xs">
          {first.year}
        </p>
        <p data-scramble={texts.role} className="mt-1 text-xs">
          {first.role}
        </p>
      </div>
    </div>
  )
}
