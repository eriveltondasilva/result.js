import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const sourcePath = resolve("CHANGELOG.md")
const targetPath = resolve("docs/changelog.md")

const frontMatter = `---\neditLink: false\n---\n\n`;

const content = readFileSync(sourcePath, "utf-8")

writeFileSync(targetPath, frontMatter + content)
