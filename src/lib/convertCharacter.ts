function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1] ?? ''
      resolve({ base64, mimeType: file.type })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function convertPhotoToCharacter(file: File): Promise<string> {
  const { base64, mimeType } = await fileToBase64(file)

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
