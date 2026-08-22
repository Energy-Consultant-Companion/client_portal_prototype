import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '@/store/demo'
import { transition } from '@/motion/tokens'
import { EnvelopeIcon } from '@/icons'

/*
 * Toasts are the hinge of this prototype. There is no mail client here, so the
 * moment a message leaves one side is represented by a toast — and when that
 * message is a magic link, the toast's action *is* the link. That makes them
 * the one piece of chrome that earns the emphasised entrance.
 */
export function Toasts() {
  const toasts = useDemo((s) => s.toasts)
  const dismiss = useDemo((s) => s.dismissToast)
  const navigate = useNavigate()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-xl z-50 flex flex-col items-center gap-sm px-lg">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98, transition: transition.exit }}
            transition={transition.emphasis}
            className="pointer-events-auto flex w-full max-w-[560px] items-start gap-sm rounded-xl
                       border border-border-inverse bg-surface-inverse px-lg py-md
                       shadow-[0_12px_32px_rgba(11,13,16,0.28)]"
          >
            {t.kind === 'mail' && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...transition.base, delay: 0.12 }}
                className="mt-[2px] text-brand-inverse"
              >
                <EnvelopeIcon />
              </motion.span>
            )}
            <span className="flex flex-1 flex-col gap-[3px]">
              <span className="text-base font-medium text-fg-inverse">{t.title}</span>
              {t.detail && (
                <span className="text-sm leading-[20px] text-fg-inverse-muted">{t.detail}</span>
              )}
            </span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  dismiss(t.id)
                  navigate(t.action!.to)
                }}
                className="mt-[1px] shrink-0 rounded-full border border-border-inverse-strong px-md py-[7px]
                           text-sm font-medium text-fg-inverse transition-colors hover:bg-surface-inverse-active"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Schließen"
              className="mt-[3px] shrink-0 text-fg-inverse-muted transition-colors hover:text-fg-inverse"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M3.5 3.5l7 7M10.5 3.5l-7 7"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
