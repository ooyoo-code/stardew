import { useState } from 'react'
import { pets } from '../data/pets'
import { backgrounds } from '../data/backgrounds'
import { composeCharacterImage } from '../lib/composeCharacterImage'
import btnDownload from '../assets/btn-download.png'
import btnShare from '../assets/btn-share.png'
import btnRedecorate from '../assets/btn-redecorate.png'
import type { DecorateData } from './DecorateStep'

type Message = 'error' | 'opened-ios' | 'share-unsupported' | null

export default function DownloadStep({
  characterUrl,
  data,
  onBackToDecorate,
}: {
  characterUrl: string
  data: DecorateData
  onBackToDecorate: () => void
}) {
  const [busyAction, setBusyAction] = useState<'download' | 'share' | null>(null)
  const [message, setMessage] = useState<Message>(null)

  const fileName = `${data.name.trim() || '내캐릭터'}_스타듀밸리.png`

  // iOS Safari doesn't support the `download` attribute on blob links — clicking
  // one just opens (or shares) the file instead of saving it quietly. Opening the
  // image in a new tab there lets the user long-press → "이미지 저장" themselves,
  // with no extra share sheet popping up on its own.
  const isIOS = () =>
    /iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    if (isIOS()) {
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
      return
    }
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownload = async () => {
    setBusyAction('download')
    setMessage(null)
    try {
      const blob = await composeCharacterImage(characterUrl, data)
      downloadBlob(blob)
      setMessage(isIOS() ? 'opened-ios' : null)
    } catch {
      setMessage('error')
    } finally {
      setBusyAction(null)
    }
  }

  const handleShare = async () => {
    setBusyAction('share')
    setMessage(null)
    try {
      const blob = await composeCharacterImage(characterUrl, data)
      const file = new File([blob], fileName, { type: 'image/png' })
      const shareData = { files: [file], title: '나만의 농부 캐릭터' }

      // Some browsers expose navigator.share without navigator.canShare (older
      // support), so only use canShare as a pre-check when it actually exists —
      // don't require it, or we'd wrongly skip real sharing on those browsers.
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData)
      } else {
        downloadBlob(blob)
        setMessage('share-unsupported')
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      setMessage('error')
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-[24px] rounded-2xl border-6 border-[#d2984a] bg-[#f5f0e2] p-5 shadow-[4px_4px_0_rgba(0,0,0,0.25)]">
      <div className="relative flex h-[260px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-3 border-dashed border-[#c09060] p-4">
        <img src={backgrounds[data.bgIdx].image} alt="" className="absolute inset-0 size-full object-cover" />

        {data.favorite.trim() && (
          <div className="absolute top-2 left-[59%] z-10 max-w-[130px]">
            <div className="relative rounded-lg border-3 border-[#3a2110] bg-white px-2.5 py-1.5 shadow-[3px_3px_0_rgba(0,0,0,0.25)]">
              <p className="flex items-start gap-1 text-[12px] leading-tight font-bold break-words text-[#3a2110]">
                <span className="shrink-0">❤️</span>
                <span>{data.favorite}</span>
              </p>
              <div className="absolute -bottom-[7px] left-6 size-3 rotate-45 border-r-3 border-b-3 border-[#3a2110] bg-white" />
            </div>
          </div>
        )}

        <div className="relative z-10 flex items-end">
          <img src={characterUrl} alt="완성된 캐릭터" className="max-h-[190px] w-auto object-contain" />
          <img
            src={pets[data.petIdx].image}
            alt={pets[data.petIdx].name}
            className="max-h-[75px] w-auto translate-x-[-10%] translate-y-[2%] object-contain"
          />
        </div>
        {data.name.trim() && (
          <p className="relative z-10 rounded bg-black px-3 py-1 text-[13px] font-bold whitespace-nowrap text-white">
            {data.name}
          </p>
        )}
      </div>

      {message === 'error' && (
        <p className="-mt-3 text-center text-[12px] text-[#b3261e]">
          이미지를 만드는 데 문제가 생겼어요. 다시 시도해주세요.
        </p>
      )}
      {message === 'share-unsupported' && (
        <p className="-mt-3 text-center text-[12px] text-[#a6743a]">
          이 브라우저는 공유를 지원하지 않아 대신 다운로드했어요.
        </p>
      )}
      {message === 'opened-ios' && (
        <p className="-mt-3 text-center text-[12px] text-[#a6743a]">
          새 탭에 이미지가 열렸어요. 길게 눌러서 "이미지 저장"을 눌러주세요!
        </p>
      )}

      <div className="flex w-full max-w-[264px] items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busyAction === 'download'}
          className="transition-transform not-disabled:active:scale-95 disabled:opacity-50"
        >
          <img src={btnDownload} alt="다운로드" className="h-[52px] w-auto" />
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={busyAction === 'share'}
          className="transition-transform not-disabled:active:scale-95 disabled:opacity-50"
        >
          <img src={btnShare} alt="공유" className="h-[52px] w-auto" />
        </button>
      </div>

      <button
        type="button"
        onClick={onBackToDecorate}
        className="w-full max-w-[264px] transition-transform active:scale-95"
      >
        <img src={btnRedecorate} alt="다시 꾸미기" className="w-full" />
      </button>
    </div>
  )
}
