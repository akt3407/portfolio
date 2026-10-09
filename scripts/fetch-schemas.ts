import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const SERVICE_ID = process.env.MICROCMS_SERVICE_DOMAIN
const MANAGEMENT_API_KEY = process.env.MICROCMS_MANAGEMENT_API_KEY
const BASE_URL = `https://${SERVICE_ID}.microcms-management.io/api/v1`
const SCHEMAS_DIR = path.join(process.cwd(), 'microcms-schemas')

// 取得したいAPIエンドポイント一覧
const ENDPOINTS = [{ endpoint: 'work', kind: 'list', name: '制作実績' }] as const

async function fetchSchema(endpoint: string) {
  const url = `${BASE_URL}/apis/${endpoint}`
  console.log(`Fetching schema for ${endpoint}...`)

  const response = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': MANAGEMENT_API_KEY!,
    },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch schema for ${endpoint}: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
}

async function saveSchema(
  endpointInfo: { endpoint: string; kind: string; name: string },
  apiFieldsResponse: { apiFields?: unknown[] },
) {
  const filePath = path.join(SCHEMAS_DIR, `${endpointInfo.endpoint}.json`)

  const schemaWithMetadata = {
    id: endpointInfo.endpoint,
    name: endpointInfo.name,
    endpoint: endpointInfo.endpoint,
    kind: endpointInfo.kind,
    fields: apiFieldsResponse.apiFields || [],
  }

  await fs.writeFile(filePath, JSON.stringify(schemaWithMetadata, null, 2), 'utf-8')
  console.log(`✓ Saved schema to ${filePath}`)
}

async function main() {
  console.log('Starting schema fetch...\n')

  await fs.mkdir(SCHEMAS_DIR, { recursive: true })

  for (const endpointInfo of ENDPOINTS) {
    try {
      const schema = await fetchSchema(endpointInfo.endpoint)
      await saveSchema(endpointInfo, schema)
    } catch (error) {
      console.error(`✗ Error fetching schema for ${endpointInfo.endpoint}:`, error)
      process.exit(1)
    }
  }

  console.log('\n✓ All schemas fetched successfully!')
}

main()
