import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useDemo, seed } from '@/store/demo'
import { transition } from '@/motion/tokens'
import { Button, ChipGroup, Eyebrow, Field, TextArea } from '@/components/primitives'
import { HeldHeader } from '@/components/chrome/HeldHeader'

/*
 * Anfrage · Schritt 1 von 3.
 *
 * Three questions and a paragraph — deliberately short, because at this point
 * she only needs to know whether she can help at all. The left margin spends
 * its space telling the visitor what happens next, which is what actually stops
 * people abandoning a form.
 */
export function FirstInquiry() {
  const navigate = useNavigate()
  const submit = useDemo((s) => s.submitInquiry)
  const d = seed.inquiryDefaults

  const [building, setBuilding] = useState<string>(d.building)
  const [intent, setIntent] = useState<string>(d.intent)
  const [timeframe, setTimeframe] = useState<string>(d.timeframe)
  const [story, setStory] = useState(d.story)
  const [name, setName] = useState(d.name)
  const [email, setEmail] = useState(d.email)
  const [place, setPlace] = useState(d.place)

  const ready = building && intent && timeframe && story.trim() && name.trim() && email.trim()

  function onSubmit() {
    submit({ building, intent, timeframe, story, name, email, place })
    navigate('/anfrage/gesendet')
  }

  return (
    <div className="min-h-screen bg-surface">
      <HeldHeader variant="phone" />

      <div className="flex gap-[100px] px-[80px] pt-[80px] pb-[96px]">
        <aside className="flex w-[320px] shrink-0 flex-col">
          <Eyebrow className="pb-md">ANFRAGE · SCHRITT 1 VON 3</Eyebrow>
          <h1 className="pb-md font-display text-3xl font-semibold leading-[44px] tracking-tight">
            Drei Fragen. Dann sind Sie erst mal durch.
          </h1>
          <p className="pb-xl text-base leading-[25px] text-fg-muted">
            Die Details kommen später. Jetzt reicht mir, ob ich Ihnen überhaupt helfen kann.
          </p>

          <div className="border-t border-border pt-lg">
            <Eyebrow className="pb-md">WAS DANACH PASSIERT</Eyebrow>
            {[
              'Ich lese Ihre Anfrage — in der Regel am selben Tag.',
              'Passt es, bekommen Sie per Mail einen Link zu Ihrem eigenen Bereich.',
              'Dort tragen Sie in Ruhe die Details ein und wählen den Termin fürs Erstgespräch.',
            ].map((step, i) => (
              <div key={step} className="flex gap-md pb-md">
                <span className="numeric-mono w-[18px] shrink-0 pt-[3px] text-2xs text-fg-subtle">
                  0{i + 1}
                </span>
                <span className="text-base leading-[22px] text-fg-muted">{step}</span>
              </div>
            ))}
          </div>

          <p className="border-t border-border pt-lg text-sm leading-[21px] text-fg-subtle">
            Kein Konto, kein Passwort, kein Newsletter. Ihre Angaben liegen in Deutschland und gehen
            nur an mich.
          </p>
        </aside>

        <div className="min-w-0 flex-1">
          <Question index="01" title="Um welches Gebäude geht es?">
            <ChipGroup
              name="building"
              options={seed.inquiryOptions.building}
              value={building}
              onChange={setBuilding}
            />
          </Question>

          <Question index="02" title="Was steht bei Ihnen an?">
            <ChipGroup
              name="intent"
              options={seed.inquiryOptions.intent}
              value={intent}
              onChange={setIntent}
            />
          </Question>

          <Question index="03" title="Wann soll es losgehen?">
            <ChipGroup
              name="timeframe"
              options={seed.inquiryOptions.timeframe}
              value={timeframe}
              onChange={setTimeframe}
            />
          </Question>

          <Question
            index="04"
            title="Erzählen Sie kurz, worum es geht."
            hint="Zwei Sätze genügen. Was Sie stört, was Sie vorhaben, was Sie schon wissen."
          >
            <TextArea value={story} onChange={setStory} rows={4} />
            <div className="flex items-baseline justify-between pt-xs">
              <span className="text-sm text-fg-subtle">
                Anhänge können Sie später hochladen — jetzt noch nicht nötig.
              </span>
              <Eyebrow>{story.length} ZEICHEN</Eyebrow>
            </div>
          </Question>

          <Question
            index="05"
            title="Wohin schicke ich die Antwort?"
            hint="An diese Adresse geht auch der Link zu Ihrem Bereich, falls es passt."
            last
          >
            <div className="grid grid-cols-3 gap-lg">
              <Field label="NAME" value={name} onChange={setName} />
              <Field label="E-MAIL" value={email} onChange={setEmail} type="email" />
              <Field label="ORT ODER PLZ" value={place} onChange={setPlace} />
            </div>
          </Question>

          <div className="flex items-center gap-[22px] pt-xl pl-[38px]">
            <Button variant="primary" size="lg" arrow onClick={onSubmit} disabled={!ready}>
              Anfrage senden
            </Button>
            <p className="w-[420px] text-sm leading-[21px] text-fg-muted">
              Mit dem Senden stimmen Sie zu, dass Frau Held Ihre Angaben zur Prüfung Ihrer Anfrage
              verarbeitet. Sie können das jederzeit widerrufen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Question({
  index,
  title,
  hint,
  children,
  last,
}: {
  index: string
  title: string
  hint?: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition.base, delay: Number(index) * 0.05 }}
      className={`flex flex-col pb-[36px] ${last ? '' : 'border-b border-border'} ${
        index === '01' ? '' : 'pt-[36px]'
      }`}
    >
      <div className="flex items-baseline gap-[14px] pb-md">
        <span className="numeric-mono w-6 shrink-0 text-xs text-fg-subtle">{index}</span>
        <h2 className="font-display text-[22px] font-semibold leading-[28px] tracking-tight">
          {title}
        </h2>
      </div>
      {hint && <p className="pb-md pl-[38px] text-base text-fg-muted">{hint}</p>}
      <div className="pl-[38px]">{children}</div>
    </motion.section>
  )
}
