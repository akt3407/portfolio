'use client'

import { useGSAP } from '@gsap/react'
import type { Work } from '@lib/microcms'
import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useRef, useState } from 'react'

gsap.registerPlugin(useGSAP, ScrambleTextPlugin)

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

  useGSAP(
    () => {
      if (shown.current === index) return
      shown.current = index

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      gsap.utils.toArray<HTMLElement>('[data-scramble]', container.current).forEach((el) => {
        const text = el.dataset.scramble!
        gsap.to(el, {
          duration: reduce ? 0 : 1.75,
          overwrite: true,
          scrambleText: { text, chars: 'upperCase' },
        })
      })
    },
    { dependencies: [work, index], scope: container },
  )

  return (
    <div ref={container} className="mt-2 flex justify-between">
      <div className="flex items-start gap-1">
        <small data-scramble={texts.index} className="text-fluid-xs/none">
          {first.index}
        </small>
        <h2 data-scramble={texts.title} className="text-fluid-slg/none">
          {first.title}
        </h2>
      </div>
      <div>
        <p data-scramble={texts.year} className="text-right text-fluid-xs/none">
          {first.year}
        </p>
        <p data-scramble={texts.role} className="mt-1 text-fluid-xs/none">
          {first.role}
        </p>
      </div>
    </div>
  )
}
