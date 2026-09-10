import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PNG } from 'pngjs'
import { STYLE_REFERENCE_BASE64, STYLE_REFERENCE_MIME_TYPE } from './_lib/styleReference.js'

const GEMINI_MODEL = 'gemini-2.5-flash-image'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const STYLE_PROMPT = `You will get two images: a STYLE REFERENCE sprite, then a photo of a real person.

Your job: redraw the person from the photo as a single FULL-BODY character sprite that follows the STYLE REFERENCE's art style and proportions EXACTLY, so that every character generated this way looks like part of the same consistent set. Do not vary the style, proportions, or level of detail from the reference — only the person's likeness changes.

Match from the reference, precisely:
- Proportions: same chibi head-to-body ratio (the head is a large simple rounded shape, roughly 2.2–2.4 head-heights make up the full body height), same simple small limbs.
- Outline: the same uniform thick black outline weight around the whole silhouette and between major color areas.
- Face: simple round/oval eyes as flat single-tone shapes with one small white highlight each, NO visible nose (at most a single tiny dot/mark), a small closed or neutral flat-line mouth. Do not add detailed irises, eyelashes, nose shading, or lip shading — keep faces exactly as simple as the reference.
- Shading: flat cel-shaded colors with at most one darker shadow tone per color area — no gradients, no soft airbrushed shading, no photographic texture.
- Pose and framing: standing straight, facing forward, arms relaxed at sides, centered with a small even margin on all sides, entire body visible from head to feet — like a character-select portrait. Do NOT crop to just the head/shoulders.

Take from the photo ONLY:
- Hair color, length, and style; skin tone; face shape; and any distinctive features (glasses, facial hair, accessories); clothing colors/type if visible. The result should be recognizable as that specific person — but drawn with the reference's exact style and proportions, not the reference's hairstyle or outfit.

Background: render on a solid plain white background (#FFFFFF) only — no scenery, no ground, no shadow, no gradient, no texture.

Fully redraw everything as low-resolution pixel art — do not keep any photographic or realistic detail.`

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY가 설정되지 않았어요. Vercel 프로젝트 환경변수에 키를 추가해주세요.',
    })
    return
  }

  try {
    const body = req.body as { imageBase64?: string; mimeType?: string }

    if (!body?.imageBase64 || !body?.mimeType) {
      res.status(400).json({ error: '이미지 데이터가 없어요.' })
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
              { inlineData: { mimeType: STYLE_REFERENCE_MIME_TYPE, data: STYLE_REFERENCE_BASE64 } },
              { inlineData: { mimeType: body.mimeType, data: body.imageBase64 } },
            ],
          },
        ],
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      res.status(geminiRes.status).json({ error: `Gemini API 오류: ${errText}` })
      return
    }

    const data = (await geminiRes.json()) as {
      candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[]
    }
    const parts = data?.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p) => p.inlineData?.data)

    if (!imagePart?.inlineData?.data) {
      res.status(502).json({ error: '변환된 이미지를 받지 못했어요. 다시 시도해주세요.' })
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

    res.status(200).json({ imageBase64: resultBase64, mimeType: resultMimeType })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : '알 수 없는 오류' })
  }
}
