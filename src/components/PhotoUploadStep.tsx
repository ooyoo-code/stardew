import { useRef, useState } from 'react'
import leafIcon from '../assets/icon-leaf.svg'
import uploadPlaceholder from '../assets/upload-placeholder.webp'
import btnRandom from '../assets/btn-random.webp'
import btnNext from '../assets/btn-next.webp'
import { pickRandomCharacter } from '../data/randomCharacters'

export type Selection =
  | { src: string; source: 'upload'; file: File }
  | { src: string; source: 'random' }

export default function PhotoUploadStep({
  selection,
  onSelectionChange,
  onNext,
}: {
  selection: Selection | null
  onSelectionChange: (selection: Selection) => void
  onNext: (selection: Selection) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    onSelectionChange({ src: URL.createObjectURL(file), source: 'upload', file })
  }

  const handleRandom = () => {
    const next = pickRandomCharacter(selection?.source === 'random' ? selection.src : undefined)
    onSelectionChange({ src: next, source: 'random' })
  }

  const promptText = selection ? '다른 사진 선택하기' : '사진을 업로드하세요'

  return (
    <div className="flex w-full flex-col items-center gap-6 rounded-2xl border-6 border-[#d2984a] bg-[#f5f0e2] p-5 shadow-[4px_4px_0_rgba(0,0,0,0.25)]">
      <div className="flex w-full items-center justify-center gap-1.5">
        <img src={leafIcon} alt="" className="size-3.5" />
        <p className="text-[11px] font-medium text-[#3a2110] opacity-80">
          업로드한 사진은 캐릭터 변환에만 사용돼요
        </p>
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        className={`flex w-full flex-col items-center justify-center gap-3 rounded-xl border-3 border-dashed px-4 pt-[30px] pb-[21px] transition-colors ${
          isDragging ? 'border-[#5c3a21] bg-[#efe6d0]' : 'border-[#c09060]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {selection ? (
          <img
            src={selection.src}
            alt={selection.source === 'upload' ? '업로드한 사진 미리보기' : '랜덤으로 뽑힌 캐릭터'}
            className={`h-[150px] w-[196px] rounded-lg ${
              selection.source === 'upload' ? 'object-cover' : 'object-contain'
            }`}
          />
        ) : (
          <img src={uploadPlaceholder} alt="" className="h-[150px] w-[196px] object-contain" />
        )}
        <p className="text-[26px] font-bold text-[#3a2110]">{promptText}</p>
        <p className="w-[274px] text-center text-[12px] text-[#a6743a]">
          전신 사진 권장 · JPG / PNG
        </p>
      </button>

      <div className="flex w-full flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleRandom}
          className="w-full max-w-[262px] transition-transform active:scale-95"
        >
          <img src={btnRandom} alt="랜덤으로 만들기" className="w-full" />
        </button>
        <button
          type="button"
          disabled={!selection}
          onClick={() => selection && onNext(selection)}
          className="w-full max-w-[262px] transition-transform not-disabled:active:scale-95 disabled:opacity-40"
        >
          <img src={btnNext} alt="다음" className="w-full" />
        </button>
      </div>
    </div>
  )
}
