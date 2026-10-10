import type { WorkContent } from '@lib/microcms-client'

interface WorkNavProps {
  works: WorkContent[]
  active: number
  onSelect: (index: number) => void
  onNext: () => void
  // 作品画像をホバー中はボーダーを止める＝切り替えも止まる
  paused: boolean
}

export default function WorkNav({ works, active, onSelect, onNext, paused }: WorkNavProps) {
  return (
    <nav aria-label="Works" className="fixed right-8 bottom-8">
      <ul className="flex flex-wrap justify-center gap-x-8">
        {works.map((work, i) => (
          <li key={work.id}>
            <button
              type="button"
              aria-current={i === active ? 'true' : undefined}
              onClick={() => onSelect(i)}
              className="text-fluid-xs/none relative block min-w-29.5 border-b border-orange-300 pb-1.5 text-left text-orange-300 transition-colors duration-700 aria-current:text-primary"
            >
              {work.title}
              {i === active && (
                // 埋まり切ったら次の作品へ。表示時間はこのアニメーションの長さで決まる
                <span
                  aria-hidden="true"
                  onAnimationEnd={onNext}
                  style={{ animationPlayState: paused ? 'paused' : undefined }}
                  className="absolute inset-x-0 -bottom-px h-px origin-left animate-work-progress bg-primary motion-reduce:animate-none"
                />
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
