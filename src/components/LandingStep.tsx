import type { ReactNode } from 'react'
import bgHero from '../assets/landing/bg-hero.png'
import eventBannerSurvey from '../assets/landing/event-banner-survey.png'
import eventImgEnvelope from '../assets/landing/event-img-envelope.png'
import ctaBgFooter from '../assets/landing/cta-bg-footer.png'
import ctaImgButtons from '../assets/landing/cta-img-buttons.png'
import character1 from '../assets/landing/character-1.png'
import character2 from '../assets/landing/character-2.png'
import character3 from '../assets/landing/character-3.png'
import character4 from '../assets/landing/character-4.png'
import titleImgSubtitle from '../assets/landing/title-img-subtitle.png'
import titleLogoSanghaFarm from '../assets/landing/title-logo-sangha-farm.png'
import titleLogoStardewValley from '../assets/landing/title-logo-stardew-valley.png'
import titleImgMainTitle from '../assets/landing/title-img-main-title.png'
import titleIconX from '../assets/landing/title-icon-x.svg'
import headerLogoIcon from '../assets/landing/header-logo-icon.svg'
import headerIconMenu from '../assets/landing/header-icon-menu.svg'

/** Absolute box positioned as a % of the 402x874 Figma reference frame. */
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

export default function LandingStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative w-full select-none" style={{ aspectRatio: '402 / 874' }}>
      <img
        src={bgHero}
        alt=""
        className="pointer-events-none absolute size-full object-cover"
        style={{ left: '-1.244%', top: '0%', width: '101.244%', height: '78.489%' }}
      />

      {/* tilted "survey event" washi-tape banner */}
      <Box left={-2.736} top={52.563} width={38.734} height={15.112} className="pointer-events-none flex items-center justify-center">
        <img src={eventBannerSurvey} alt="설문 참여 이벤트 · 게임 아이템 받자!" style={{ width: '95.69%', height: '93.83%', transform: 'rotate(-3.21deg)' }} />
      </Box>

      {/* tilted envelope illustration */}
      <Box left={43.284} top={34.796} width={78.603} height={35.104} className="pointer-events-none flex items-center justify-center">
        <img src={eventImgEnvelope} alt="" style={{ width: '83.40%', height: '81.81%', transform: 'rotate(-13.86deg)' }} />
      </Box>

      <img src={ctaBgFooter} alt="" className="pointer-events-none absolute size-full object-cover" style={{ left: 0, top: '77.688%', width: '100%', height: '22.312%' }} />

      <Box left={75.124} top={59.725} width={19.652} height={18.764} className="pointer-events-none">
        <img src={character4} alt="" className="size-full object-contain" />
      </Box>
      <Box left={60.945} top={62.586} width={17.413} height={15.904} className="pointer-events-none">
        <img src={character3} alt="" className="size-full object-contain" />
      </Box>
      <Box left={43.284} top={60.412} width={23.134} height={17.391} className="pointer-events-none">
        <img src={character2} alt="" className="size-full object-contain" />
      </Box>
      <Box left={31.841} top={61.671} width={17.662} height={16.133} className="pointer-events-none">
        <img src={character1} alt="" className="size-full object-contain" />
      </Box>

      <Box left={10.945} top={32.494} width={83.333} height={8.009} className="pointer-events-none">
        <img src={titleImgSubtitle} alt="온라인에서 즐기던 힐링을 실제 팝업에서!" className="size-full object-contain" />
      </Box>

      <Box left={22.388} top={26.201} width={23.632} height={5.263} className="pointer-events-none">
        <img src={titleLogoStardewValley} alt="STARDEW VALLEY" className="size-full object-contain" />
      </Box>
      <Box left={49.447} top={27.46} width={4.282} height={2.088} className="pointer-events-none flex items-center justify-center">
        <img src={titleIconX} alt="x" style={{ width: '95.49%', height: '96.03%', transform: 'rotate(2.59deg) skewX(0.09deg)' }} />
      </Box>
      <Box left={57.463} top={26.545} width={24.129} height={4.577} className="pointer-events-none">
        <img src={titleLogoSanghaFarm} alt="상하목장 ORGANIC" className="size-full object-contain" />
      </Box>

      <Box left={0} top={12.7} width={94.776} height={12.815} className="pointer-events-none overflow-hidden">
        <img
          src={titleImgMainTitle}
          alt="스타듀밸리 속 상하목장을 지켜라!"
          className="absolute max-w-none"
          style={{ left: '-13.46%', top: '-61.41%', width: '131.57%', height: '220.11%' }}
        />
      </Box>

      <Box left={4.975} top={6.865} width={27.114} height={3.089} className="overflow-hidden">
        <img src={headerLogoIcon} alt="" className="absolute" style={{ left: '2.34%', top: '-4%', width: '25.5%', height: '104%' }} />
        <p className="absolute text-[13px] font-bold text-[#16342a]" style={{ left: '30.88%', top: '31.03%' }}>
          SESAC농부
        </p>
      </Box>
      <Box left={89.801} top={7.323} width={7.463} height={3.432}>
        <img src={headerIconMenu} alt="메뉴" className="size-full" />
      </Box>

      <Box left={4.975} top={78.489} width={89.801} height={21.855}>
        <img src={ctaImgButtons} alt="" className="pointer-events-none absolute size-full" />
        <button
          type="button"
          onClick={onStart}
          aria-label="캐릭터 만들기"
          className="absolute"
          style={{ left: '1.4%', top: '1.1%', width: '96.9%', height: '44.6%' }}
        />
      </Box>
    </div>
  )
}
