import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import StepIndicator from './components/StepIndicator'
import LandingStep from './components/LandingStep'
import PhotoUploadStep, { type Selection } from './components/PhotoUploadStep'
import ConvertingStep from './components/ConvertingStep'
import DecorateStep, { type DecorateData } from './components/DecorateStep'
import DownloadStep from './components/DownloadStep'
import bgScene from './assets/bg-scene.png'
import btnHome from './assets/btn-home.png'

type View = 'landing' | 'upload' | 'converting' | 'decorate' | 'download'

const COPY: Record<View, { title: string; subtitle: string }> = {
  landing: { title: '', subtitle: '' },
  upload: {
    title: '나만의 농부 캐릭터 만들기',
    subtitle: '사진을 올리거나 랜덤으로 시작해보세요!',
  },
  converting: {
    title: '사진을 농부 캐릭터로 변환 중',
    subtitle: '업로드한 사진을 픽셀 캐릭터로 바꾸고 있어요',
  },
  decorate: {
    title: '✨ 내 캐릭터 꾸미기 ✨',
    subtitle: '원하는 스타일로 세부 옵션을 조정해보세요!',
  },
  download: {
    title: '나만의 농부 캐릭터 완성!',
    subtitle: '캐릭터를 다운로드하고 공유해보세요!',
  },
}

const STEP_OF_VIEW: Record<View, number> = { landing: 0, upload: 1, converting: 1, decorate: 2, download: 3 }

/** Shrinks `ref`'s content to fit the current viewport height, so the app never needs to scroll. */
function useFitScale(ref: RefObject<HTMLElement | null>, deps: unknown[]) {
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const recompute = () => {
      const naturalHeight = el.scrollHeight
      const availableHeight = window.innerHeight
      setScale(naturalHeight > 0 ? Math.min(1, availableHeight / naturalHeight) : 1)
    }

    recompute()
    const ro = new ResizeObserver(recompute)
    ro.observe(el)
    window.addEventListener('resize', recompute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', recompute)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scale
}

function App() {
  const [view, setView] = useState<View>('landing')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [characterUrl, setCharacterUrl] = useState<string | null>(null)
  const [decorateData, setDecorateData] = useState<DecorateData>({ name: '', favorite: '', petIdx: 0, bgIdx: 0 })
  const [furthestStep, setFurthestStep] = useState(1)
  const mainRef = useRef<HTMLElement>(null)
  const scale = useFitScale(mainRef, [view])

  const handleUploadNext = (sel: Selection) => {
    if (sel.source === 'upload') {
      setView('converting')
    } else {
      setCharacterUrl(sel.src)
      setView('decorate')
      setFurthestStep((s) => Math.max(s, 2))
    }
  }

  const handleStepClick = (step: number) => {
    if (step === 1) setView('upload')
    if (step === 2 && characterUrl) setView('decorate')
    if (step === 3 && furthestStep >= 3) setView('download')
  }

  const { title, subtitle } = COPY[view]

  return (
    <div className="flex h-[100svh] w-full justify-center overflow-hidden bg-white">
      <div className="relative h-full w-full overflow-hidden bg-[#0066f2]">
        {view !== 'landing' && (
          <img
            src={bgScene}
            alt=""
            className="pointer-events-none absolute top-[16%] left-1/2 w-full min-w-[110%] -translate-x-1/2 select-none"
          />
        )}

        <main
          ref={mainRef}
          style={
            view === 'landing'
              ? undefined
              : { transform: `scale(${scale})`, transformOrigin: 'top center' }
          }
          className={
            view === 'landing'
              ? 'relative z-10 flex h-full w-full flex-col items-center'
              : 'relative z-10 flex w-full flex-col items-center gap-6 px-5 pt-8 pb-10'
          }
        >
          {view === 'landing' && <LandingStep onStart={() => setView('upload')} />}

          {view !== 'landing' && (
            <>
              <StepIndicator current={STEP_OF_VIEW[view]} reachable={furthestStep} onStepClick={handleStepClick} />

              <div className="flex flex-col items-center gap-2 text-center text-white">
                <h1 className="text-[26px] leading-normal font-black [text-shadow:2px_2px_0_#5c3a21]">
                  {title}
                </h1>
                <p className="text-[14px] leading-snug font-medium [text-shadow:1px_1px_0_#5c3a21]">
                  {subtitle}
                </p>
              </div>
            </>
          )}

          {view === 'upload' && (
            <PhotoUploadStep selection={selection} onSelectionChange={setSelection} onNext={handleUploadNext} />
          )}

          {view === 'converting' && selection?.source === 'upload' && (
            <ConvertingStep
              file={selection.file}
              onDone={(resultUrl) => {
                setCharacterUrl(resultUrl)
                setView('decorate')
                setFurthestStep((s) => Math.max(s, 2))
              }}
              onCancel={() => setView('upload')}
            />
          )}

          {view === 'decorate' && characterUrl && (
            <DecorateStep
              baseImage={characterUrl}
              data={decorateData}
              onChange={setDecorateData}
              onFinished={() => {
                setFurthestStep((s) => Math.max(s, 3))
                setView('download')
              }}
            />
          )}

          {view === 'download' && characterUrl && (
            <DownloadStep
              characterUrl={characterUrl}
              data={decorateData}
              onBackToDecorate={() => setView('decorate')}
            />
          )}
        </main>
      </div>

      {view !== 'landing' && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center">
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setView('landing')}
              className="pointer-events-auto absolute right-5 bottom-3 size-[72px] transition-transform active:scale-95"
            >
              <img src={btnHome} alt="홈으로" className="size-full" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
