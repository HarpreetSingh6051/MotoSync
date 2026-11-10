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

const server = http.createServer((req, res) => {
  let [rawPath, rawQuery] = req.url.split('?')
  let targetFile = rawPath

  if (targetFile === '/') {
    targetFile = '/index.html'
  } else if (!path.extname(targetFile)) {
    if (fs.existsSync(path.join(DIST_DIR, targetFile + '.html'))) {
      targetFile = targetFile + '.html'
    } else if (fs.existsSync(path.join(DIST_DIR, targetFile, 'index.html'))) {
      targetFile = path.join(targetFile, 'index.html')
    } else {
      targetFile = '/index.html'
    }
  }

  const filePath = path.join(DIST_DIR, targetFile)

  fs.readFile(filePath, (err, data) => {
    if (err) {
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
    if (ext === '.html') {
      let content = data.toString('utf8')
      const queryParams = new URLSearchParams(rawQuery || '')
      const w = queryParams.get('w')
      const h = queryParams.get('h')

      if (w && h) {
        const frameStyle = `
        <style>
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: ${w}px !important;
            max-width: ${w}px !important;
            height: ${h}px !important;
            overflow: hidden !important;
            background: #000000 !important;
          }
          #root {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: ${w}px !important;
            max-width: ${w}px !important;
            height: ${h}px !important;
            overflow: hidden !important;
          }
        </style>`
        content = content.replace('</head>', `${frameStyle}</head>`)
      }

      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(content)
      return
    }

    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
    res.end(data)
  })
})

const PORT = 8094

server.listen(PORT, async () => {
  console.log(`Phase 4 Screenshot Server listening on port ${PORT}`)

  const targets = [
    // 1. HOME TAB (360w, 390w, 430w)
    {
      url: `http://localhost:${PORT}/home?w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase4_tab_home_390w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/home?w=360&h=800`,
      width: 360,
      height: 800,
      file: 'phase4_tab_home_360w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/home?w=430&h=932`,
      width: 430,
      height: 932,
      file: 'phase4_tab_home_430w.png',
      delay: 1500,
    },

    // HOME: Route Planner Sheet Open
    {
      url: `http://localhost:${PORT}/home?sheet=route&w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase4_home_route_sheet_390w.png',
      delay: 1800,
    },

    // HOME: Garage & Profile Sheet Open
    {
      url: `http://localhost:${PORT}/home?sheet=garage&w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase4_home_garage_sheet_390w.png',
      delay: 1800,
    },

    // HOME: Reel Viewer Open
    {
      url: `http://localhost:${PORT}/home?sheet=reel&w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase4_home_reel_sheet_390w.png',
      delay: 1800,
    },

    // 2. PACK TAB (360w, 390w, 430w)
    {
      url: `http://localhost:${PORT}/pack?w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase4_tab_pack_390w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/pack?w=360&h=800`,
      width: 360,
      height: 800,
      file: 'phase4_tab_pack_360w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/pack?w=430&h=932`,
      width: 430,
      height: 932,
      file: 'phase4_tab_pack_430w.png',
      delay: 1500,
    },

    // PACK: Rider Sheet Open (Call + Hazard Ping)
    {
      url: `http://localhost:${PORT}/pack?rider=1&w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase4_pack_rider_sheet_390w.png',
      delay: 1800,
    },

    // 3. SPLITS TAB (360w, 390w, 430w)
    {
      url: `http://localhost:${PORT}/splits?w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase4_tab_splits_390w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/splits?w=360&h=800`,
      width: 360,
      height: 800,
      file: 'phase4_tab_splits_360w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/splits?w=430&h=932`,
      width: 430,
      height: 932,
      file: 'phase4_tab_splits_430w.png',
      delay: 1500,
    },

    // SPLITS: Add Expense Sheet Open
    {
      url: `http://localhost:${PORT}/splits?sheet=add&w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase4_splits_add_sheet_390w.png',
      delay: 1800,
    },

    // 4. DISCOVER TAB (360w, 390w, 430w)
    {
      url: `http://localhost:${PORT}/discover?w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase4_tab_discover_390w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/discover?w=360&h=800`,
      width: 360,
      height: 800,
      file: 'phase4_tab_discover_360w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/discover?w=430&h=932`,
      width: 430,
      height: 932,
      file: 'phase4_tab_discover_430w.png',
      delay: 1500,
    },

    // DISCOVER: Pack Chat Sheet Open
    {
      url: `http://localhost:${PORT}/discover?sheet=chat&w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase4_discover_chat_sheet_390w.png',
      delay: 1800,
    },
  ]

  for (const item of targets) {
    const outPath = path.join(ARTIFACT_DIR, item.file)
    console.log(`Capturing ${item.file} (${item.width}x${item.height})...`)

    await new Promise((resolve) => {
      execFile(
        CHROME_PATH,
        [
          '--headless=new',
          `--window-size=${item.width},${item.height}`,
          '--force-device-scale-factor=1',
          '--hide-scrollbars',
          '--disable-gpu',
          `--screenshot=${outPath}`,
          item.url,
        ],
        { timeout: 10000 },
        (err) => {
          if (err) console.error(`Error on ${item.file}:`, err)
          else console.log(`✓ Saved ${item.file}`)
          resolve()
        }
      )
    })
  }

  console.log('All Phase 4 screenshots captured successfully!')
  server.close(() => process.exit(0))
})
