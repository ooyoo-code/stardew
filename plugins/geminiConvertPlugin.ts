import type { Plugin, Connect } from 'vite'
import { PNG } from 'pngjs'

const GEMINI_MODEL = 'gemini-2.5-flash-image'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const STYLE_PROMPT = `Turn this photo into a single FULL-BODY character sprite in the exact pixel-art style of the farming game Stardew Valley: 16-bit, chibi proportions (slightly oversized head, small simple body), simple flat colors, thick black outlines.

Framing: show the ENTIRE body from head to feet, standing straight, facing forward, centered in the frame with a small even margin on all sides — like a character-select portrait. Do NOT crop to just the head/shoulders.

Likeness: study the photo carefully and match the person's actual features as closely as pixel art allows — hair color, hair length and style, skin tone, face shape, and any distinctive features (glasses, facial hair, hairstyle accessories, etc.). The result should be recognizable as that specific person, not a generic character.

Background: render on a solid plain white background (#FFFFFF) only — no scenery, no ground, no shadow, no gradient, no texture.

Fully redraw everything as low-resolution pixel art — do not keep any photographic or realistic detail.`

function readRequestBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

/** Flood-fills near-white pixels connected to the image border and makes them transparent. */
function cutOutWhiteBackground(pngBuffer: Buffer): Buffer {
  const png = PNG.sync.read(pngBuffer)
  const { width, height, data } = png
  const visited = new Uint8Array(width * height)
  const stack: number[] = []

  const isBackground = (idx: number) => {
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]
    return r > 230 && g > 230 && b > 230 && Math.max(r, g, b) - Math.min(r, g, b) < 20
  }

  const visit = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return
    const p = y * width + x
    if (visited[p]) return
    if (!isBackground(p * 4)) return
    visited[p] = 1
    stack.push(x, y)
  }

  for (let x = 0; x < width; x++) {
    visit(x, 0)
    visit(x, height - 1)
  }
  for (let y = 0; y < height; y++) {
    visit(0, y)
    visit(width - 1, y)
  }

  while (stack.length) {
    const y = stack.pop()!
    const x = stack.pop()!
    data[(y * width + x) * 4 + 3] = 0
    visit(x + 1, y)
    visit(x - 1, y)
    visit(x, y + 1)
    visit(x, y - 1)
  }

  return PNG.sync.write(png)
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

          const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: STYLE_PROMPT },
                    { inlineData: { mimeType: body.mimeType, data: body.imageBase64 } },
                  ],
                },
              ],
            }),
          })

          if (!geminiRes.ok) {
            const errText = await geminiRes.text()
            res.statusCode = geminiRes.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `Gemini API 오류: ${errText}` }))
            return
          }

          const data = (await geminiRes.json()) as {
            candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[]
          }
          const parts = data?.candidates?.[0]?.content?.parts ?? []
          const imagePart = parts.find((p) => p.inlineData?.data)

          if (!imagePart?.inlineData?.data) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: '변환된 이미지를 받지 못했어요. 다시 시도해주세요.' }))
            return
          }

          const resultMimeType = imagePart.inlineData.mimeType ?? 'image/png'
          let resultBase64 = imagePart.inlineData.data

          if (resultMimeType === 'image/png') {
            try {
              const cutOut = cutOutWhiteBackground(Buffer.from(resultBase64, 'base64'))
              resultBase64 = cutOut.toString('base64')
            } catch {
              // If background removal fails for any reason, fall back to the raw image.
            }
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              imageBase64: resultBase64,
              mimeType: resultMimeType,
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
