import { useEffect, useMemo, useRef, useState } from 'react'
import iconPaw from '../assets/icon-paw.svg'
import iconFlower from '../assets/icon-flower.svg'
import iconArrowLeft from '../assets/icon-arrow-left-small.svg'
import iconArrowRight from '../assets/icon-arrow-right-small.svg'
import btnNext from '../assets/btn-next.png'
import { cycle } from '../data/customizeOptions'
import { pets } from '../data/pets'
import { backgrounds } from '../data/backgrounds'

export type DecorateData = {
  name: string
  favorite: string
  petIdx: number
  bgIdx: number
}

const REVEAL_WINDOW_MS = 650
const TILE_MS = 60
const BOUNCE_MS = 1100
const BOUNCE_ITERATIONS = 2

function PixelTiles({ cols, rows }: { cols: number; rows: number }) {
  const delays = useMemo(
    () => Array.from({ length: cols * rows }, () => Math.random() * Math.max(0, REVEAL_WINDOW_MS - TILE_MS)),
    [cols, rows],
  )

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
    >
      {delays.map((delay, i) => (
        <div
          key={i}
          className="bg-white"
          style={{ animation: `tile-vanish ${TILE_MS}ms steps(1, jump-end) ${delay}ms forwards` }}
        />
      ))}
    </div>
  )
}

function OptionRow({
  icon,
  label,
  index,
  total,
  onPrev,
  onNext,
}: {
  icon: string
  label: string
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex w-full items-center justify-between rounded-lg border-2 border-[#d9cdb0] bg-[#eadfcd] px-3 py-2">
      <div className="flex items-center gap-2">
        <img src={icon} alt="" className="size-4" />
        <p className="text-[14px] font-bold text-[#3a2110]">{label}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="rounded border-2 border-[#5c3a21] bg-[#ffc233] p-1.5"
        >
          <img src={iconArrowLeft} alt="이전" className="h-2.5 w-2" />
        </button>
        <p className="w-[34px] text-center text-[14px] font-bold text-[#3a2110]">
          {index + 1} / {total}
        </p>
        <button
          type="button"
          onClick={onNext}
          className="rounded border-2 border-[#5c3a21] bg-[#ffc233] p-1.5"
        >
          <img src={iconArrowRight} alt="다음" className="h-2.5 w-2" />
        </button>
      </div>
    </div>
  )
}

export default function DecorateStep({
  baseImage,
  data,
  onChange,
  onFinished,
}: {
  baseImage: string
  data: DecorateData
  onChange: (data: DecorateData) => void
  onFinished: () => void
}) {
  const { name, favorite, petIdx, bgIdx } = data
  const isComplete = name.trim().length > 0 && favorite.trim().length > 0
  const [animPhase, setAnimPhase] = useState<'none' | 'reveal' | 'bounce'>('none')
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => timeouts.current.forEach(clearTimeout), [])

  const handleSubmit = () => {
    setAnimPhase('reveal')
    timeouts.current.push(
      setTimeout(() => setAnimPhase('bounce'), REVEAL_WINDOW_MS),
      setTimeout(onFinished, REVEAL_WINDOW_MS + BOUNCE_ITERATIONS * BOUNCE_MS),
    )
  }

  const bounceStyle =
    animPhase === 'bounce'
      ? { animation: `character-idle ${BOUNCE_MS}ms ease-in-out ${BOUNCE_ITERATIONS}` }
      : undefined
  const bubbleClassName = animPhase === 'reveal' ? 'animate-[bubble-pop_0.3s_ease-out_forwards]' : ''

  return (
    <div className="flex w-full flex-col items-center gap-[18px] rounded-2xl border-6 border-[#d2984a] bg-[#f5f0e2] p-5 shadow-[4px_4px_0_rgba(0,0,0,0.25)]">
      <div className="relative flex h-[300px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-3 border-dashed border-[#c09060] p-4">
        <img
          src={backgrounds[bgIdx].image}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        {animPhase === 'reveal' && <PixelTiles cols={14} rows={7} />}

        {favorite.trim() && (
          <div
            className={`absolute top-2 left-[59%] z-10 max-w-[130px] origin-bottom ${bubbleClassName}`}
            style={bounceStyle}
          >
            <div className="relative rounded-lg border-3 border-[#3a2110] bg-white px-2.5 py-1.5 shadow-[3px_3px_0_rgba(0,0,0,0.25)]">
              <p className="flex items-start gap-1 text-[12px] leading-tight font-bold break-words text-[#3a2110]">
                <span className="shrink-0">❤️</span>
                <span>{favorite}</span>
              </p>
              <div className="absolute -bottom-[7px] left-6 size-3 rotate-45 border-r-3 border-b-3 border-[#3a2110] bg-white" />
            </div>
          </div>
        )}

        <div className="relative z-10">
          <img
            src={baseImage}
            alt="꾸미는 중인 캐릭터"
            className="max-h-[210px] w-auto origin-bottom object-contain"
            style={bounceStyle}
          />
          {animPhase === 'reveal' && <PixelTiles cols={8} rows={9} />}

          <div className="absolute bottom-0 left-0 translate-x-[-10%] translate-y-[2%]">
            <div className="relative">
              <img
                src={pets[petIdx].image}
                alt={pets[petIdx].name}
                className="max-h-[85px] w-auto origin-bottom object-contain"
                style={bounceStyle}
              />
              {animPhase === 'reveal' && <PixelTiles cols={5} rows={5} />}
            </div>
          </div>
        </div>

        {name.trim() && (
          <p className="relative z-10 rounded bg-black px-3 py-1 text-[13px] font-bold whitespace-nowrap text-white">
            {name}
          </p>
        )}
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full overflow-hidden rounded-lg border-2 border-[#d9cdb0] bg-[#fcf9f2]">
          <div className="flex w-[90px] shrink-0 items-center justify-center bg-[#eadfcd] px-3 py-2.5">
            <p className="text-[13px] font-bold text-[#3a2110]">이름</p>
          </div>
          <input
            value={name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="이름을 입력해주세요"
            maxLength={20}
            className="w-full flex-1 bg-transparent px-3 py-2.5 text-[13px] text-[#3a2110] placeholder:text-[#7a6a53] focus:outline-none"
          />
        </div>
        <div className="flex w-full overflow-hidden rounded-lg border-2 border-[#d9cdb0] bg-[#fcf9f2]">
          <div className="flex w-[90px] shrink-0 items-center justify-center bg-[#eadfcd] px-3 py-2.5">
            <p className="text-[13px] font-bold text-[#3a2110]">좋아하는 것</p>
          </div>
          <input
            value={favorite}
            onChange={(e) => onChange({ ...data, favorite: e.target.value })}
            placeholder="좋아하는 것을 입력해주세요"
            maxLength={30}
            className="w-full flex-1 bg-transparent px-3 py-2.5 text-[13px] text-[#3a2110] placeholder:text-[#7a6a53] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <OptionRow
          icon={iconPaw}
          label="펫"
          index={petIdx}
          total={pets.length}
          onPrev={() => onChange({ ...data, petIdx: cycle(petIdx, pets.length, -1) })}
          onNext={() => onChange({ ...data, petIdx: cycle(petIdx, pets.length, 1) })}
        />
        <OptionRow
          icon={iconFlower}
          label="배경"
          index={bgIdx}
          total={backgrounds.length}
          onPrev={() => onChange({ ...data, bgIdx: cycle(bgIdx, backgrounds.length, -1) })}
          onNext={() => onChange({ ...data, bgIdx: cycle(bgIdx, backgrounds.length, 1) })}
        />
      </div>

      <button
        type="button"
        disabled={!isComplete || animPhase !== 'none'}
        onClick={handleSubmit}
        className="w-full max-w-[262px] transition-transform not-disabled:active:scale-95 disabled:opacity-40"
      >
        <img src={btnNext} alt="다음" className="w-full" />
      </button>
    </div>
  )
}
