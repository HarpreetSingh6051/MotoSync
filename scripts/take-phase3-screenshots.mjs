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

const PORT = 8092

server.listen(PORT, async () => {
  console.log(`Phase 3 Screenshot Server listening on port ${PORT}`)

  const targets = [
    // Splash Screen (360, 390, 430)
    {
      url: `http://localhost:${PORT}/splash?hold=true&settled=true&w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase3_splash_390w.png',
      delay: 2000,
    },
    {
      url: `http://localhost:${PORT}/splash?hold=true&settled=true&w=360&h=800`,
      width: 360,
      height: 800,
      file: 'phase3_splash_360w.png',
      delay: 2000,
    },
    {
      url: `http://localhost:${PORT}/splash?hold=true&settled=true&w=430&h=932`,
      width: 430,
      height: 932,
      file: 'phase3_splash_430w.png',
      delay: 2000,
    },

    // Onboarding Scene 1: "Find your pack" (360, 390, 430)
    {
      url: `http://localhost:${PORT}/onboarding?slide=0&w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase3_onboarding_scene1_390w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/onboarding?slide=0&w=360&h=800`,
      width: 360,
      height: 800,
      file: 'phase3_onboarding_scene1_360w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/onboarding?slide=0&w=430&h=932`,
      width: 430,
      height: 932,
      file: 'phase3_onboarding_scene1_430w.png',
      delay: 1500,
    },

    // Onboarding Scene 2: "Ride in sync" (360, 390, 430)
    {
      url: `http://localhost:${PORT}/onboarding?slide=1&w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase3_onboarding_scene2_390w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/onboarding?slide=1&w=360&h=800`,
      width: 360,
      height: 800,
      file: 'phase3_onboarding_scene2_360w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/onboarding?slide=1&w=430&h=932`,
      width: 430,
      height: 932,
      file: 'phase3_onboarding_scene2_430w.png',
      delay: 1500,
    },

    // Onboarding Scene 3: "Split the tank" (360, 390, 430)
    {
      url: `http://localhost:${PORT}/onboarding?slide=2&w=390&h=844`,
      width: 390,
      height: 844,
      file: 'phase3_onboarding_scene3_390w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/onboarding?slide=2&w=360&h=800`,
      width: 360,
      height: 800,
      file: 'phase3_onboarding_scene3_360w.png',
      delay: 1500,
    },
    {
      url: `http://localhost:${PORT}/onboarding?slide=2&w=430&h=932`,
      width: 430,
      height: 932,
      file: 'phase3_onboarding_scene3_430w.png',
      delay: 1500,
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
          `--virtual-time-budget=${item.delay}`,
          `--screenshot=${outPath}`,
          item.url,
        ],
        (err) => {
          if (err) console.error(`Error on ${item.file}:`, err)
          else console.log(`✓ Saved ${item.file}`)
          resolve()
        }
      )
    })
  }

  console.log('All Phase 3 screenshots captured successfully!')
  server.close(() => process.exit(0))
})
