import { createClient, type MicroCMSImage } from 'microcms-js-sdk'
import { cacheLife, cacheTag } from 'next/cache'

import { type Work } from './microcms'

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
})

export async function getWorks(limit?: number) {
  'use cache'
  cacheTag('works')
  cacheLife('hours')
  // 画像がない作品は WebGL の切り替えに使えないので、画像があるものだけ取る（型もそれに合わせる）
  const { contents } = await client.getList<Work & { image: MicroCMSImage }>({
    endpoint: 'work',
    queries: {
      limit,
      fields: 'id,slug,title,year,role,image,video',
      filters: 'image[exists]',
    },
  })
  return contents
}

export type WorkContent = Awaited<ReturnType<typeof getWorks>>[number]
