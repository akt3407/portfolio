import { getWorks } from '@lib/microcms-client'

import { WorkShowcase } from './_components'

export default async function Home() {
  const works = await getWorks(3)

  return (
    <main id="main" tabIndex={-1} className="grid min-h-dvh place-items-center">
      <WorkShowcase works={works} />
    </main>
  )
}
