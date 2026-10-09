import fs from 'fs/promises'
import path from 'path'

const SCHEMAS_DIR = path.join(process.cwd(), 'microcms-schemas')
const OUTPUT_FILE = path.join(process.cwd(), 'lib', 'microcms.ts')

type FieldKind =
  | 'text'
  | 'textArea'
  | 'richEditor'
  | 'richEditorV2'
  | 'media'
  | 'number'
  | 'boolean'
  | 'select'
  | 'date'
  | 'relation'
  | 'relationList'

interface Field {
  fieldId: string
  name: string
  kind: FieldKind
  required: boolean
}

interface Schema {
  id: string
  name: string
  endpoint: string
  kind: 'list' | 'object'
  fields: Field[]
}

function fieldKindToTypeScript(field: Field): string {
  switch (field.kind) {
    case 'text':
    case 'textArea':
    case 'richEditor':
    // 初期設定（richEditorFormat=html）では HTML 文字列で返る
    case 'richEditorV2':
    case 'select':
      return 'string'
    case 'media':
      return 'MicroCMSImage'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'date':
      return 'string'
    // 未対応の種類は any にせず unknown にして、使う側で型を確かめさせる
    default:
      return 'unknown'
  }
}

function generateTypeDefinition(schema: Schema): string {
  const interfaceName = schema.id.charAt(0).toUpperCase() + schema.id.slice(1)

  let typeDef = `// ${schema.name} (${schema.kind})\n`
  typeDef += `export interface ${interfaceName} {\n`

  for (const field of schema.fields) {
    const fieldType = fieldKindToTypeScript(field)
    const optional = field.required ? '' : '?'
    typeDef += `  ${field.fieldId}${optional}: ${fieldType};\n`
  }

  typeDef += '}\n\n'

  // MicroCMSDateを含むレスポンス型
  typeDef += `export interface ${interfaceName}Response extends ${interfaceName}, MicroCMSDate {}\n\n`

  // リスト型の場合はリストレスポンス型も生成
  if (schema.kind === 'list') {
    typeDef += `export interface ${interfaceName}ListResponse {\n`
    typeDef += `  contents: ${interfaceName}Response[];\n`
    typeDef += `  totalCount: number;\n`
    typeDef += `  offset: number;\n`
    typeDef += `  limit: number;\n`
    typeDef += '}\n\n'
  }

  return typeDef
}

async function main() {
  console.log('Starting type generation...\n')

  const schemaFiles = await fs.readdir(SCHEMAS_DIR)
  const jsonFiles = schemaFiles.filter((file) => file.endsWith('.json'))

  let output = `// このファイルは自動生成されています。手動で編集しないでください。\n`
  output += `// Generated at: ${new Date().toISOString()}\n\n`
  output += `import type { MicroCMSDate, MicroCMSImage } from 'microcms-js-sdk';\n\n`

  for (const file of jsonFiles) {
    const filePath = path.join(SCHEMAS_DIR, file)
    const schemaJson = await fs.readFile(filePath, 'utf-8')
    const schema: Schema = JSON.parse(schemaJson)

    console.log(`Generating types for ${schema.name} (${schema.endpoint})...`)
    output += generateTypeDefinition(schema)
  }

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true })
  await fs.writeFile(OUTPUT_FILE, output, 'utf-8')

  console.log(`\n✓ Types generated successfully at ${OUTPUT_FILE}`)
}

main()
