import http from 'http'
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'

const DIST_DIR = 'E:\\projects\\kixup-rider-app\\dist'
const ARTIFACT_DIR = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\b0c81165-8a40-43e6-8918-2d4c046ef6c6'
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
}

// Simple static server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0]
  if (reqPath === '/' || reqPath === '/_dev/components') {
    reqPath = '/index.html'
  }
  const filePath = path.join(DIST_DIR, reqPath)

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fallback to index.html for SPA routes
      fs.readFile(path.join(DIST_DIR, 'index.html'), (fallbackErr, fallbackData) => {
        if (fallbackErr) {
          res.writeHead(404)
          res.end('Not found')
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(fallbackData)
        }
      })
      return
    }
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
    res.end(data)
  })
})

server.listen(8089, async () => {
  console.log('Static server listening on port 8089')

  const viewports = [
    { width: 360, height: 800, file: 'phase2_components_360w.png' },
    { width: 390, height: 844, file: 'phase2_components_390w.png' },
    { width: 430, height: 932, file: 'phase2_components_430w.png' },
    { width: 390, height: 2100, file: 'phase2_components_full.png' },
  ]

  for (const vp of viewports) {
    const outPath = path.join(ARTIFACT_DIR, vp.file)
    console.log(`Capturing ${vp.width}x${vp.height} -> ${outPath}`)

    await new Promise((resolve) => {
      execFile(
        CHROME_PATH,
        [
          '--headless=new',
          `--window-size=${vp.width},${vp.height}`,
          '--hide-scrollbars',
          '--virtual-time-budget=3000',
          `--screenshot=${outPath}`,
          'http://localhost:8089/',
        ],
        (err) => {
          if (err) console.error('Screenshot error:', err)
          else console.log(`Saved screenshot ${vp.width}w`)
          resolve()
        }
      )
    })
  }

  console.log('All screenshots captured successfully!')
  server.close(() => process.exit(0))
})
