import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const sourcePath = resolve('CHANGELOG.md')
const targetPath = resolve('docs/changelog.md')

if (!existsSync(sourcePath)) {
  throw new Error(
    'CHANGELOG.md does not exist in the root directory. Please create it before running this script.',
  )
}

const frontMatter = `---\neditLink: false\n---\n\n`

const content = readFileSync(sourcePath, 'utf-8')

mkdirSync(dirname(targetPath))

writeFileSync(targetPath, frontMatter + content)
