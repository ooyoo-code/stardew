import { useEffect, useRef, useState } from 'react'
import leafOutlineIcon from '../assets/icon-leaf-outline.svg'
import { convertPhotoToCharacter } from '../lib/convertCharacter'

// Roughly how long a real conversion takes — the bar rises in a steady, uniform line
// across this whole window instead of rushing to ~90% in a couple seconds and then
// sitting frozen while the actual request is still in flight.
const ESTIMATED_MS = 11_000
const RAMP_CAP = 90

export default function ConvertingStep({
  file,
  onDone,
  onCancel,
}: {
  file: File
  onDone: (resultUrl: string) => void
  onCancel: () => void
}) {
  const [progress, setProgress] = useState(6)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const doneRef = useRef(false)

  useEffect(() => {
    doneRef.current = false
    setError(null)
    setProgress(6)

    const startedAt = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - startedAt
      if (elapsed <= ESTIMATED_MS) {
        // Straight line from 0 to RAMP_CAP over the estimated duration — a steady,
        // predictable climb for the typical case.
        setProgress(6 + (elapsed / ESTIMATED_MS) * (RAMP_CAP - 6))
      } else {
        // Slower than expected: keep creeping forward instead of freezing, easing
        // toward (but never quite reaching) 99% so it still reads as "still working."
        const overtime = elapsed - ESTIMATED_MS
        setProgress(RAMP_CAP + (1 - Math.exp(-overtime / 8000)) * 9)
      }
    }, 100)

    convertPhotoToCharacter(file)
      .then((resultUrl) => {
        doneRef.current = true
        setProgress(100)
        setTimeout(() => onDone(resultUrl), 250)
      })
      .catch((err: Error) => {
        setError(err.message)
      })
      .finally(() => clearInterval(tick))

    return () => clearInterval(tick)
  }, [file, attempt, onDone])

  return (
    <div className="flex w-full min-h-[556px] flex-col items-center justify-center gap-6 rounded-2xl border-6 border-[#d2984a] bg-[#f5f0e2] p-5 shadow-[4px_4px_0_rgba(0,0,0,0.25)]">
      <div className="h-[26px] w-full rounded-lg border-3 border-[#5c3a21] bg-[#e5dec9] p-[3px]">
        <div
          className="h-full rounded-[4px] bg-[#4caf50] transition-[width] duration-150 ease-linear"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="flex flex-col items-center gap-[17px]">
        {error ? (
          <>
            <p className="text-center text-[16px] text-[#b3261e]">{error}</p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="rounded-lg border-2 border-[#5c3a21] bg-[#ffc233] px-4 py-2 text-[14px] font-bold text-[#3a2110] active:scale-95"
            >
              다시 시도하기
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="text-[12px] font-medium text-[#a6743a] underline"
            >
              사진 다시 선택하기
            </button>
          </>
        ) : (
          <>
            <p className="text-[20px] text-[#3a2110]">변환 중...</p>
            <div className="flex w-full items-center justify-center gap-1.5">
              <img src={leafOutlineIcon} alt="" className="size-3.5" />
              <p className="text-[12px] font-bold text-[#3a2110] opacity-80">잠시만 기다려주세요</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
