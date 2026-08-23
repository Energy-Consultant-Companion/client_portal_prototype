import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useDemo, seed } from '@/store/demo'
import { listVariants, rowVariants, transition } from '@/motion/tokens'
import { Button, Eyebrow } from '@/components/primitives'
import { HeldHeader, HeldFooter } from '@/components/chrome/HeldHeader'
import { CheckIcon } from '@/icons'

/*
 * Not in the design — the artboards jump from „Schritt 1 von 3" straight to the
 * mail. But a form that submits into nothing is the one place a click dummy
 * feels broken, so this fills the gap using only the copy already established
 * on the inquiry page.
 *
 * It also quietly offers the presenter the way across to the other side.
 */
export function InquirySent() {
  const inquiries = useDemo((s) => s.inquiries)
  const ownId = useDemo((s) => s.ownInquiryId)
  const own = inquiries.find((i) => i.id === ownId)
  const accepted = own?.state === 'angenommen'

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <HeldHeader variant="phone" />

      <div className="flex flex-1 justify-center px-[80px] pt-[120px] pb-[96px]">
        <div className="w-full max-w-[720px]">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...transition.emphasis, delay: 0.1 }}
            className="mb-xl flex size-[44px] items-center justify-center rounded-full bg-fg text-fg-inverse"
          >
            <CheckIcon size={20} strokeWidth={1.8} />
          </motion.span>

          <Eyebrow className="pb-md">ANFRAGE · SCHRITT 1 VON 3 ERLEDIGT</Eyebrow>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition.slow, delay: 0.16 }}
            className="pb-md font-display text-3xl font-semibold leading-[44px] tracking-tight"
          >
            Ihre Anfrage liegt bei Frau Held.
          </motion.h1>
          <p className="max-w-[560px] pb-2xl text-md leading-[29px] text-fg-muted">
            Eine Bestätigung ist an {own?.email ?? seed.inquiryDefaults.email} unterwegs. Mehr müssen
            Sie jetzt nicht tun — den nächsten Schritt schickt Ihnen Frau Held.
          </p>

          <motion.div
            variants={listVariants}
            initial="initial"
            animate="animate"
            className="border-t border-border pt-lg"
          >
            <Eyebrow className="pb-md">WAS DANACH PASSIERT</Eyebrow>
            {[
              { text: 'Ich lese Ihre Anfrage — in der Regel am selben Tag.', state: 'laeuft' },
              {
                text: 'Passt es, bekommen Sie per Mail einen Link zu Ihrem eigenen Bereich.',
                state: 'kommt',
              },
              {
                text: 'Dort tragen Sie in Ruhe die Details ein und wählen den Termin fürs Erstgespräch.',
                state: 'kommt',
              },
            ].map((step, i) => (
              <motion.div
                key={step.text}
                variants={rowVariants}
                className="flex items-start gap-md border-b border-border-subtle py-md last:border-0"
              >
                <span className="numeric-mono w-[18px] shrink-0 pt-[3px] text-2xs text-fg-subtle">
                  0{i + 1}
                </span>
                <span
                  className={`flex-1 text-base leading-[22px] ${
                    step.state === 'laeuft' ? 'text-fg' : 'text-fg-muted'
                  }`}
                >
                  {step.text}
                </span>
                {step.state === 'laeuft' && <Eyebrow tone="brand">LÄUFT</Eyebrow>}
              </motion.div>
            ))}
          </motion.div>

          {/* Demo affordance: in reality this wait is hours, not seconds. */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition.slow, delay: 0.5 }}
            className="mt-2xl flex items-center gap-lg rounded-xl bg-surface-sunken px-lg py-md"
          >
            <div className="flex flex-1 flex-col gap-[3px]">
              <Eyebrow>IM PROTOTYP</Eyebrow>
              <p className="text-base text-fg-muted">
                {accepted
                  ? 'Frau Held hat Ihre Anfrage angenommen — der Zugang ist raus.'
                  : 'Sehen Sie sich die andere Seite an: dieselbe Anfrage auf dem Tisch von Frau Held.'}
              </p>
            </div>
            <Link to={accepted ? '/aufnahme' : '/ensera/anfragen'} className="shrink-0">
              <Button variant="secondary">
                {accepted ? 'Aufnahme öffnen' : 'Als Beraterin ansehen'}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <HeldFooter />
    </div>
  )
}
