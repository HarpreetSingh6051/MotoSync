import http from 'http'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end('<html><body style="background:black;color:white"><h1>Motosync Test</h1></body></html>')
})

server.listen(8099, () => {
  const cmd = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless=new --window-size=390,844 --screenshot="C:\\Users\\user\\.gemini\\antigravity\\brain\\b0c81165-8a40-43e6-8918-2d4c046ef6c6\\test_run.png" http://localhost:8099`
  exec(cmd, (err, stdout, stderr) => {
    console.log('Result:', { err, stdout, stderr })
    server.close(() => process.exit(0))
  })
})
