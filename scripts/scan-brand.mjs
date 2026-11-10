import fs from 'fs'
import path from 'path'

const REPOS = [
  'E:/projects/kixup-rider-app',
  'E:/projects/kixup-backend',
  'E:/projects/kixup-admin-erp',
  'E:/projects/motosync-landing'
]

const SEARCH_TERMS = ['packpulse', 'Ride & Roam', 'Ride &amp; Roam']

for (const repo of REPOS) {
  const scan = (dir) => {
    let list
    try { list = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const item of list) {
      if (['node_modules', '.git', '.next', 'dist', '.expo', '.vercel', 'package-lock.json'].includes(item.name)) continue
      const full = path.join(dir, item.name)
      if (item.isDirectory()) {
        scan(full)
      } else if (/\.(ts|tsx|js|jsx|json|md|html)$/.test(item.name)) {
        try {
          const text = fs.readFileSync(full, 'utf8')
          for (const term of SEARCH_TERMS) {
            if (text.toLowerCase().includes(term.toLowerCase())) {
              console.log(`[MATCH] '${term}' in: ${full}`)
            }
          }
        } catch {}
      }
    }
  }
  scan(repo)
}
console.log('Brand scan complete.')
