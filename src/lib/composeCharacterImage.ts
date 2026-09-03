import { pets } from '../data/pets'
import { backgrounds } from '../data/backgrounds'
import type { DecorateData } from '../components/DecorateStep'

const CANVAS_W = 1200
const CANVAS_H = 1200

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Same rounded rect, but with a small triangular tail poking out of the bottom edge —
// traced as one continuous path so the fill/stroke reads as a single speech bubble
// instead of a plain tag with a separate triangle glued underneath.
function speechBubblePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  tailFromLeft: number,
  tailW: number,
  tailH: number,
) {
  const tailX0 = x + tailFromLeft
  const tailX1 = tailX0 + tailW
  const tailApexX = tailX0 + tailW * 0.3
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.lineTo(tailX1, y + h)
  ctx.lineTo(tailApexX, y + h + tailH)
  ctx.lineTo(tailX0, y + h)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function composeCharacterImage(characterUrl: string, data: DecorateData): Promise<Blob> {
  const [bg, character, pet] = await Promise.all([
    loadImage(backgrounds[data.bgIdx].image),
    loadImage(characterUrl),
    loadImage(pets[data.petIdx].image),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas context를 만들 수 없어요.')
  ctx.imageSmoothingEnabled = false

  drawCover(ctx, bg, CANVAS_W, CANVAS_H)

  const charH = CANVAS_H * 0.73
  const charW = charH * (character.width / character.height)
  const charX = (CANVAS_W - charW) / 2
  const charY = CANVAS_H * 0.94 - charH
  ctx.drawImage(character, charX, charY, charW, charH)

  const petH = charH * (85 / 210)
  const petW = petH * (pet.width / pet.height)
  const petX = charX - petW * 0.1
  const petY = charY + charH - petH + petH * 0.02
  ctx.drawImage(pet, petX, petY, petW, petH)

  if (data.name.trim()) {
    ctx.font = `bold ${Math.round(CANVAS_H * 0.036)}px 'Inter', sans-serif`
    const text = data.name.trim()
    const metrics = ctx.measureText(text)
    const padX = CANVAS_H * 0.02
    const padY = CANVAS_H * 0.014
    const tagW = metrics.width + padX * 2
    const tagH = CANVAS_H * 0.036 + padY * 2
    const tagX = (CANVAS_W - tagW) / 2
    const tagY = CANVAS_H * 0.955 - tagH / 2
    ctx.fillStyle = '#000000'
    roundRect(ctx, tagX, tagY, tagW, tagH, 6)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, tagX + padX, tagY + tagH / 2 + 1)
  }

  if (data.favorite.trim()) {
    const text = `❤️ ${data.favorite.trim()}`
    ctx.font = `bold ${Math.round(CANVAS_H * 0.026)}px 'Inter', sans-serif`
    const maxW = CANVAS_W * 0.32
    const padX = CANVAS_H * 0.018
    const padY = CANVAS_H * 0.014
    const metrics = ctx.measureText(text)
    const bubbleW = Math.min(metrics.width, maxW) + padX * 2
    const bubbleH = CANVAS_H * 0.026 + padY * 2
    const bubbleX = CANVAS_W * 0.59
    const bubbleY = CANVAS_H * 0.02

    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#3a2110'
    ctx.lineWidth = CANVAS_H * 0.006
    const tailW = CANVAS_H * 0.018
    const tailH = CANVAS_H * 0.016
    speechBubblePath(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 10, bubbleW * 0.12, tailW, tailH)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#3a2110'
    ctx.textBaseline = 'middle'
    ctx.save()
    ctx.beginPath()
    ctx.rect(bubbleX, bubbleY, bubbleW, bubbleH)
    ctx.clip()
    ctx.fillText(text, bubbleX + padX, bubbleY + bubbleH / 2 + 1)
    ctx.restore()
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('이미지 생성에 실패했어요.'))), 'image/png')
  })
}
