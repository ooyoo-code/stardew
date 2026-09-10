export interface ContentBoundsFrac {
  left: number
  right: number
  top: number
  bottom: number
}

const FULL_BOUNDS: ContentBoundsFrac = { left: 0, right: 1, top: 0, bottom: 1 }

/**
 * Finds the visible (non-transparent) content box of an image, as fractions of its own
 * width/height. The AI-generated character sprites and the fixed pet art are all square
 * canvases with inconsistent transparent padding around the actual character/pet — so
 * anything that positions them relative to each other (avoiding overlap, aligning feet on
 * the same ground line, etc.) needs the real content edges, not the raw image bounds.
 */
export function getContentBoundsFrac(img: HTMLImageElement): ContentBoundsFrac {
  const naturalW = img.naturalWidth || img.width
  const naturalH = img.naturalHeight || img.height
  if (!naturalW || !naturalH) return FULL_BOUNDS

  const maxDim = 200
  const scale = Math.min(1, maxDim / Math.max(naturalW, naturalH))
  const w = Math.max(1, Math.round(naturalW * scale))
  const h = Math.max(1, Math.round(naturalH * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return FULL_BOUNDS

  ctx.drawImage(img, 0, 0, w, h)

  let data: Uint8ClampedArray
  try {
    data = ctx.getImageData(0, 0, w, h).data
  } catch {
    return FULL_BOUNDS
  }

  let minX = w
  let maxX = -1
  let minY = h
  let maxY = -1
  const ALPHA_THRESHOLD = 20

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > ALPHA_THRESHOLD) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < 0) return FULL_BOUNDS

  return {
    left: minX / w,
    right: (maxX + 1) / w,
    top: minY / h,
    bottom: (maxY + 1) / h,
  }
}

export function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
