import { getAllWorks } from '@lib/microcms-client'
import type { Metadata } from 'next'

import WorkList from './_components/WorkList'

export const metadata: Metadata = { title: 'Works' }

export default async function Works() {
  const works = await getAllWorks()

  return (
    <main id="main" tabIndex={-1}>
      <WorkList works={works} />
    </main>
  )
}
