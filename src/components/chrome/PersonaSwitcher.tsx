import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useDemo } from '@/store/demo'
import { transition } from '@/motion/tokens'
import { Eyebrow } from '@/components/primitives'

/*
 * Demo scaffolding, not part of the product. A presenter needs to hop between
 * the two sides mid-sentence, and hunting URLs breaks the story. Collapsed to a
 * single dot by default so it stays out of screenshots.
 */

const stops = {
  kundschaft: [
    { to: '/', label: 'Landing' },
    { to: '/anfrage', label: 'Anfrage stellen' },
    { to: '/aufnahme', label: 'Aufnahme' },
    { to: '/bereich', label: 'Ihr Bereich' },
  ],
  beraterin: [
    { to: '/ensera/anfragen', label: 'Anfragen' },
    { to: '/ensera/kundschaft', label: 'Kundschaft' },
    { to: '/ensera/kundschaft/reuter', label: 'Fall Reuter' },
    { to: '/ensera/kalender', label: 'Fristen' },
    { to: '/ensera/fragen', label: 'Fragen' },
    { to: '/ensera/postfach', label: 'Postfach' },
    { to: '/ensera/einrichtung', label: 'Einrichtung' },
  ],
}

export function PersonaSwitcher() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const reset = useDemo((s) => s.reset)
  const onConsultantSide = pathname.startsWith('/ensera')

  return (
    <div
      data-demo-chrome
      className="fixed right-lg bottom-lg z-40 flex flex-col items-end gap-xs print:hidden"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: transition.exit }}
            transition={transition.base}
            className="w-[248px] overflow-hidden rounded-xl border border-border bg-surface
                       shadow-[0_16px_40px_rgba(18,22,27,0.14)]"
          >
            {(['kundschaft', 'beraterin'] as const).map((persona) => (
              <div key={persona} className="border-b border-border-subtle last:border-0">
                <div className="px-md pt-sm pb-[6px]">
                  <Eyebrow tone={persona === 'beraterin' && onConsultantSide ? 'brand' : 'subtle'}>
                    {persona === 'kundschaft' ? 'ALS KUNDSCHAFT' : 'ALS BERATERIN'}
                  </Eyebrow>
                </div>
                <div className="pb-xs">
                  {stops[persona].map((s) => (
                    <button
                      key={s.to}
                      type="button"
                      onClick={() => {
                        navigate(s.to)
                        setOpen(false)
                      }}
                      className={`flex w-full items-center px-md py-[6px] text-left text-sm transition-colors
                        ${pathname === s.to ? 'font-medium text-fg' : 'text-fg-muted hover:text-fg'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                reset()
                navigate('/')
                setOpen(false)
              }}
              className="flex w-full items-center gap-xs bg-surface-sunken px-md py-sm text-left text-sm
                         text-fg-muted transition-colors hover:text-fg"
            >
              Demo zurücksetzen
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.94 }}
        transition={transition.fast}
        aria-label="Ansicht wechseln"
        className="flex h-9 items-center gap-xs rounded-full border border-border bg-surface px-sm
                   shadow-[0_4px_12px_rgba(18,22,27,0.1)]"
      >
        <span className={`size-[7px] rounded-full ${onConsultantSide ? 'bg-brand' : 'bg-fg'}`} />
        <span className="label-caps text-fg-muted">
          {onConsultantSide ? 'BERATERIN' : 'KUNDSCHAFT'}
        </span>
      </motion.button>
    </div>
  )
}
