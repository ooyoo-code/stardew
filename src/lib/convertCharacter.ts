const MAX_DIMENSION = 1024

/**
 * Downscales the photo to a max dimension before upload. Phone photos can be
 * several MB at 3000px+, which slows both the upload and Gemini's own
 * processing — the model only needs enough detail to read hair/face/outfit,
 * not full resolution, since the output is low-res pixel art anyway.
 */
function resizeToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('canvas context를 만들 수 없어요.'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지 처리에 실패했어요.'))
            return
          }
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            const base64 = result.split(',')[1] ?? ''
            resolve({ base64, mimeType: 'image/jpeg' })
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        0.85,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('이미지를 불러오지 못했어요.'))
    }
    img.src = objectUrl
  })
}

export async function convertPhotoToCharacter(file: File): Promise<string> {
  const { base64, mimeType } = await resizeToBase64(file)

  const res = await fetch('/api/convert-character', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64, mimeType }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error ?? '캐릭터 변환에 실패했어요.')
  }

  return `data:${data.mimeType};base64,${data.imageBase64}`
}
