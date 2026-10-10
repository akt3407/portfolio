// このファイルは自動生成されています。手動で編集しないでください。
// Generated at: 2026-10-09T08:45:25.516Z

import type { MicroCMSDate, MicroCMSImage } from 'microcms-js-sdk'

// 制作実績 (list)
export interface Work {
  slug?: string
  sitetype?: string
  title: string
  year: number
  role: string
  image?: MicroCMSImage
  video?: string
  detail?: string
}

export interface WorkResponse extends Work, MicroCMSDate {}

export interface WorkListResponse {
  contents: WorkResponse[]
  totalCount: number
  offset: number
  limit: number
}
