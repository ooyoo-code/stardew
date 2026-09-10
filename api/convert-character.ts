import type { VercelRequest, VercelResponse } from '@vercel/node'
import { convertCharacterCore } from './_lib/convertCharacterCore.js'

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

    const result = await convertCharacterCore(apiKey, body.imageBase64, body.mimeType)

    if (!result.ok) {
      res.status(result.status).json({ error: result.error })
      return
    }

    res.status(200).json({ imageBase64: result.imageBase64, mimeType: result.mimeType })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : '알 수 없는 오류' })
  }
}
