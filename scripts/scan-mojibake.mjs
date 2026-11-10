import fs from 'fs'
import path from 'path'

const REPOS = [
  'E:/projects/kixup-rider-app',
  'E:/projects/kixup-backend',
  'E:/projects/kixup-admin-erp',
  'E:/projects/motosync-landing'
]

const SUSPICIOUS_PATTERNS = [
  'dYOS',
  '22?C',
  '?7,890',
  'â‚¹',
  'Ã©',
  'Â°',
  '\uFFFD'
]

let foundCount = 0

for (const repo of REPOS) {
  if (!fs.existsSync(repo)) continue
  console.log(`Scanning: ${repo}`)
  const scanDir = (dir) => {
    let entries = []
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (['node_modules', '.git', '.next', 'dist', '.expo', '.vercel', 'package-lock.json'].includes(entry.name)) continue
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        scanDir(fullPath)
      } else if (/\.(ts|tsx|js|jsx|json|md|html|css)$/.test(entry.name)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8')
          for (const pattern of SUSPICIOUS_PATTERNS) {
            if (content.includes(pattern)) {
              console.log(`[MOJIBAKE] Found '${pattern}' in: ${fullPath}`)
              foundCount++
            }
          }
        } catch {}
      }
    }
  }
  scanDir(repo)
}

console.log(`Scan completed. Total occurrences found: ${foundCount}`)
if (foundCount > 0) {
  process.exit(1)
}
