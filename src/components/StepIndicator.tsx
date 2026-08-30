import { Fragment } from 'react'
import sproutIcon from '../assets/icon-sprout.svg'
import arrowRightIcon from '../assets/icon-arrow-right.svg'

const steps = ['업로드', '꾸미기', '다운로드']

export default function StepIndicator({
  current,
  reachable,
  onStepClick,
}: {
  current: number
  reachable: number
  onStepClick: (step: number) => void
}) {
  return (
    <div className="flex w-full items-center gap-1">
      {steps.map((label, i) => {
        const step = i + 1
        const active = step === current
        const clickable = step !== current && step <= reachable

        return (
          <Fragment key={label}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => onStepClick(step)}
              className={`flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded border-2 border-[#5c3a21] px-0.5 py-1 ${
                active ? 'bg-[#ffc233]' : 'bg-[#a06b3e]'
              } ${clickable ? 'cursor-pointer active:scale-95' : ''}`}
            >
              {active && <img src={sproutIcon} alt="" className="size-3" />}
              <p
                className={`text-center text-[11px] leading-none font-bold whitespace-nowrap ${
                  active ? 'text-[#3a2110]' : 'text-white'
                }`}
              >
                {step}. {label}
              </p>
            </button>
            {step < steps.length && <img src={arrowRightIcon} alt="" className="size-2.5 shrink-0" />}
          </Fragment>
        )
      })}
    </div>
  )
}
