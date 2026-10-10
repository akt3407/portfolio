import { createClient, type MicroCMSImage } from 'microcms-js-sdk'
import { cacheLife, cacheTag } from 'next/cache'

import { type Work } from './microcms'

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
})

export async function getWorks(limit = 100) {
  'use cache'
  cacheTag('works')
  cacheLife('hours')
  // 画像がない作品は WebGL の切り替えに使えないので、画像があるものだけ取る（型もそれに合わせる）
  const { contents } = await client.getList<Work & { image: MicroCMSImage }>({
    endpoint: 'work',
    queries: {
      limit,
      fields: 'id,slug,sitetype,title,year,role,image,video',
      filters: 'image[exists]',
    },
  })
  return contents
}

export type WorkContent = Awaited<ReturnType<typeof getWorks>>[number]

// works 一覧・詳細ページ用。画像の有無を問わず全件取る
export async function getAllWorks() {
  'use cache'
  cacheTag('works')
  cacheLife('hours')
  return client.getAllContents<Work>({
    endpoint: 'work',
    queries: { fields: 'id,slug,sitetype,title,year,role,image,video' },
  })
}

export type WorkListItem = Awaited<ReturnType<typeof getAllWorks>>[number]

export async function getWork(slug: string) {
  'use cache'
  cacheTag('works')
  cacheLife('hours')
  const { contents } = await client.getList<Work>({
    endpoint: 'work',
    queries: { limit: 1, filters: `slug[equals]${slug}` },
  })
  return contents[0]
}
