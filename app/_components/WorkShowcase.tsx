'use client'

import type { WorkContent } from '@lib/microcms-client'
import Link from 'next/link'
import { useLayoutEffect, useState } from 'react'

import WorkItem from './WorkItem'
import WorkNav from './WorkNav'
import WorkVisual from './WorkVisual'

interface WorkShowcaseProps {
  works: WorkContent[]
}

// Home を離れても Activity で state と DOM が残るので、隠れるたびに key を変えて作り直す。
// 戻ってきたときは初回表示と同じく最初の作品から再生される
export default function WorkShowcase({ works }: WorkShowcaseProps) {
  const [round, setRound] = useState(0)
  useLayoutEffect(() => () => setRound((r) => r + 1), [])
  return <Showcase key={round} works={works} />
}

function Showcase({ works }: WorkShowcaseProps) {
  const [active, setActive] = useState(0)
  // Nav で前の作品に戻るときだけ波を右→左に流す。自動切り替えは最後→最初でも常に左→右
  const [reverse, setReverse] = useState(false)
  const [hovered, setHovered] = useState(false)

  const select = (index: number) => {
    setReverse(index < active)
    setActive(index)
  }
  const next = () => {
    setReverse(false)
    setActive((active + 1) % works.length)
  }

  return (
    <>
      <article>
        <Link href={`/works/${works[active]!.id}`}>
          <WorkVisual
            works={works}
            active={active}
            reverse={reverse}
            hovered={hovered}
            onHoverChange={setHovered}
          />
          <WorkItem work={works[active]!} index={active + 1} />
        </Link>
      </article>
      <WorkNav works={works} active={active} onSelect={select} onNext={next} paused={hovered} />
    </>
  )
}
