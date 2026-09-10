import type { Plugin, Connect } from 'vite'
import { convertCharacterCore } from '../api/_lib/convertCharacterCore.js'

function readRequestBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

export function geminiConvertPlugin(): Plugin {
  return {
    name: 'gemini-convert-character',
    configureServer(server) {
      server.middlewares.use('/api/convert-character', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'GEMINI_API_KEY가 설정되지 않았어요. 프로젝트 루트의 .env 파일에 키를 추가해주세요.',
            }),
          )
          return
        }

        try {
          const body = JSON.parse(await readRequestBody(req)) as {
            imageBase64?: string
            mimeType?: string
          }

          if (!body.imageBase64 || !body.mimeType) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: '이미지 데이터가 없어요.' }))
            return
          }

          const result = await convertCharacterCore(apiKey, body.imageBase64, body.mimeType)

          if (result.error || !result.imageBase64 || !result.mimeType) {
            res.statusCode = result.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: result.error ?? '알 수 없는 오류' }))
            return
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              imageBase64: result.imageBase64,
              mimeType: result.mimeType,
            }),
          )
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : '알 수 없는 오류' }))
        }
      })
    },
  }
}
