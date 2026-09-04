import { useState, type ReactNode } from 'react'
import bgHero from '../assets/landing/bg-hero.webp'
import eventBtnSurvey from '../assets/landing/event-btn-survey.webp'
import eventImgEnvelope from '../assets/landing/event-img-envelope.webp'
import ctaBgFooter from '../assets/landing/cta-bg-footer.webp'
import ctaImgButtons from '../assets/landing/cta-img-buttons.webp'
import character1 from '../assets/landing/character-1.webp'
import character2 from '../assets/landing/character-2.webp'
import character3 from '../assets/landing/character-3.webp'
import character4 from '../assets/landing/character-4.webp'
import titleImgSubtitle from '../assets/landing/title-img-subtitle.webp'
import titleLogoSanghaFarm from '../assets/landing/title-logo-sangha-farm.webp'
import titleLogoStardewValley from '../assets/landing/title-logo-stardew-valley.webp'
import titleImgMainTitle from '../assets/landing/title-img-main-title.webp'
import headerLogoIcon from '../assets/landing/header-logo-icon.svg'
import headerIconMenu from '../assets/landing/header-icon-menu.svg'

/**
 * Absolute box positioned as a % of its nearest positioned ancestor — used inside the hero section
 * below, which defines its own local percentage frame instead of the whole page. This is what lets
 * the hero background use object-fit:cover to grow/shrink into whatever space is left above the
 * fixed-height CTA footer, while the header (overlaid on top of the hero, like the Figma design)
 * and the footer stay fixed size — so the page always fills the viewport exactly with no scroll and
 * nothing ever gets stretched, squished, or cropped, on any phone.
 */
function Box({
  left,
  top,
  width,
  height,
  className = '',
  children,
}: {
  left: number
  top: number
  width: number
  height: number
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
    >
      {children}
    </div>
  )
}

const NAV_LINKS = [
  { label: 'STORY', href: '/pamphlet.html#story' },
  { label: 'STAMP TOUR', href: '/stamptour.html' },
  { label: '페스티벌 F&B 및 굿즈', href: '/festival.html' },
  { label: '오시는 길 및 안내', href: '/festival.html#location' },
]

export default function LandingStep({ onStart }: { onStart: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative flex h-full w-full flex-col select-none">
      {/* hero — flexible height; the background image covers whatever space is left above the CTA
          footer, so it's the art that grows/shrinks per device, never the UI */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <img
          src={bgHero}
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-cover"
          style={{ objectPosition: 'center top' }}
        />

        <Box left={0} top={11.246} width={94.776} height={17.291} className="pointer-events-none overflow-hidden">
          <img
            src={titleImgMainTitle}
            alt="스타듀밸리 속 상하목장을 지켜라!"
            className="absolute max-w-none"
            style={{ left: '-13.46%', top: '-61.41%', width: '131.57%', height: '220.11%' }}
          />
        </Box>

        <Box left={19.701} top={29.284} width={24.814} height={7.457} className="pointer-events-none">
          <img src={titleLogoStardewValley} alt="STARDEW VALLEY" className="size-full object-contain" />
        </Box>
        <Box left={47.244} top={31.091} width={4.496} height={2.958} className="pointer-events-none flex items-center justify-center">
          <span className="font-['Galmuri11'] text-[20px] font-bold text-[#3a2612]">X</span>
        </Box>
        <Box left={54.764} top={29.774} width={25.335} height={6.484} className="pointer-events-none">
          <img src={titleLogoSanghaFarm} alt="상하목장 ORGANIC" className="size-full object-contain" />
        </Box>

        <Box left={8.334} top={37.955} width={83.333} height={10.807} className="pointer-events-none">
          <img src={titleImgSubtitle} alt="온라인에서 즐기던 힐링을 실제 팝업에서!" className="size-full object-contain" />
        </Box>

        {/* tilted envelope illustration */}
        <Box left={43.284} top={41.061} width={78.603} height={47.361} className="pointer-events-none flex items-center justify-center">
          <img src={eventImgEnvelope} alt="" style={{ width: '83.40%', height: '81.81%', transform: 'rotate(-13.86deg)' }} />
        </Box>

        {/* survey event CTA, always bobbing to draw the eye */}
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSc9lyVQM1Q8uREsulopBc--9iBxikNgrT43qN59iMdCtu4gvg/viewform?usp=dialog"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="설문 이벤트 · 미래의 나에게 보내는 편지"
          className="absolute flex items-center justify-center animate-[float-updown_2.6s_ease-in-out_infinite]"
          style={{ left: '1.5%', top: '64%', width: '32%', height: '16%' }}
        >
          <img src={eventBtnSurvey} alt="" className="size-full object-contain" />
        </a>

        <Box left={75.124} top={74.696} width={19.652} height={25.32} className="pointer-events-none">
          <img src={character4} alt="" className="size-full object-contain" />
        </Box>
        <Box left={60.945} top={78.557} width={17.413} height={21.459} className="pointer-events-none">
          <img src={character3} alt="" className="size-full object-contain" />
        </Box>
        <Box left={43.284} top={75.622} width={23.134} height={23.463} className="pointer-events-none">
          <img src={character2} alt="" className="size-full object-contain" />
        </Box>
        <Box left={31.841} top={77.321} width={17.662} height={21.767} className="pointer-events-none">
          <img src={character1} alt="" className="size-full object-contain" />
        </Box>

        {/* header — overlaid on the hero art, fixed height, never scales */}
        <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-[4.975%] py-3">
          <a href="/" className="flex items-center gap-2">
            <img src={headerLogoIcon} alt="" className="h-[26px] w-auto" />
            <p className="text-[13px] font-bold text-[#16342a]">SESAC농부</p>
          </a>
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="메뉴 열기" className="size-[26px] shrink-0">
            <img src={headerIconMenu} alt="" className="size-full" />
          </button>
        </header>
      </div>

      {/* CTA footer — fixed height, never scales. The button panel keeps the source art's native
          992:382 aspect ratio (width and height sized together) so the baked-in text is never
          stretched. It's centered horizontally and sits with a small margin top/bottom inside
          the plaque. */}
      <div className="relative z-10 w-full shrink-0" style={{ aspectRatio: '804 / 210' }}>
        <img src={ctaBgFooter} alt="" className="pointer-events-none absolute inset-0 size-full object-cover" />
        <Box left={19.152} top={4.53} width={61.696} height={90.94}>
          <img src={ctaImgButtons} alt="" className="pointer-events-none absolute size-full" />
          <button
            type="button"
            onClick={onStart}
            aria-label="캐릭터 만들기"
            className="absolute"
            style={{ left: '1.4%', top: '1.1%', width: '96.9%', height: '44.6%' }}
          />
          <a
            href="/pamphlet.html"
            aria-label="팜플렛 보기"
            className="absolute"
            style={{ left: '1.4%', top: '50%', width: '96.9%', height: '44.6%' }}
          />
        </Box>
      </div>

      {menuOpen && (
        <div className="absolute inset-0 z-30">
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <nav className="absolute top-0 right-0 flex h-full w-[76%] max-w-[300px] flex-col border-l-4 border-[#5c3a21] bg-[#f5f0e2] p-5 shadow-[-6px_0_16px_rgba(0,0,0,0.3)]">
            <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-[#c09060] pb-3">
              <p className="text-[15px] font-bold text-[#3a2110]">MENU</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="메뉴 닫기"
                className="text-[20px] leading-none text-[#3a2110]"
              >
                ✕
              </button>
            </div>
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.label} className="border-b border-dashed border-[#c09060]">
                  <a href={link.href} className="flex items-center justify-between py-3 text-[14px] font-bold text-[#3a2110]">
                    <span>{link.label}</span>
                    <span className="text-[#a6743a]">›</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}
