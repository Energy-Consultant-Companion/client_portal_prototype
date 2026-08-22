import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'motion/react'
import { useDemo, seed } from '@/store/demo'
import { transition } from '@/motion/tokens'
import {
  Button,
  Checkbox,
  ChipGroup,
  ChipMulti,
  Dot,
  Eyebrow,
  Field,
  Segments,
  TextArea,
} from '@/components/primitives'
import { HeldHeader } from '@/components/chrome/HeldHeader'
import { CheckIcon, UploadIcon } from '@/icons'
import type { Slot } from '@/store/types'

/*
 * Aufnahme · Schritt 2 von 3.
 *
 * The long one. Six sections, and the design makes a promise about each: leave
 * blank what you don't know, and Frau Held will see that it needs clearing at
 * the appointment. So nothing is required, and the section rail marks progress
 * rather than validity.
 *
 * The last section is the real payload: the slots come out of her calendar, and
 * picking one books it — no phone tag.
 */
export function Intake() {
  const navigate = useNavigate()
  const submitIntake = useDemo((s) => s.submitIntake)
  const slots = useDemo((s) => s.slots)
  const d = seed.intakeDefaults

  const [year, setYear] = useState(d.year)
  const [area, setArea] = useState(d.area)
  const [units, setUnits] = useState(d.units)
  const [monument, setMonument] = useState<string>(d.monument)
  const [ownership, setOwnership] = useState<string>(d.ownership)
  const [coOwnerName, setCoOwnerName] = useState(d.coOwner.name)
  const [coOwnerMail, setCoOwnerMail] = useState(d.coOwner.email)
  const [heating, setHeating] = useState<string>(d.heating)
  const [boilerYear, setBoilerYear] = useState(d.boilerYear)
  const [lastService, setLastService] = useState(d.lastService)
  const [plans, setPlans] = useState<string[]>(d.plans)
  const [note, setNote] = useState(d.note)
  const [atHand, setAtHand] = useState<string[]>(d.atHand)
  const [meetingKind, setMeetingKind] = useState<string>(d.meetingKind)
  const [slotId, setSlotId] = useState<string>(d.slotId)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  /*
   * Which sections have content. Nothing here is required — the design promises
   * you may leave gaps — so this marks how far you have worked, not validity.
   */
  const filled = useMemo(
    () => ({
      '01': Boolean(year && area && units && monument),
      '02': Boolean(ownership),
      '03': Boolean(heating && boilerYear),
      '04': plans.length > 0,
      '05': atHand.length > 0,
      '06': Boolean(slotId && meetingKind),
    }),
    [year, area, units, monument, ownership, heating, boilerYear, plans, atHand, slotId, meetingKind],
  )

  // The section you're looking at is the current one; filled sections above it
  // are ticked. That's what makes the rail read like the design's mid-form state.
  const [visible, setVisible] = useState('01')
  const done = Object.fromEntries(
    seed.intakeSections.map((s) => [s.index, filled[s.index as keyof typeof filled] && s.index < visible]),
  ) as Record<string, boolean>

  // Slots keep their design grouping (day header on each card).
  const grouped = slots

  function onSubmit() {
    submitIntake({
      slotId,
      meetingKind,
      coOwner: ownership === 'Mehreren Personen' && coOwnerName ? coOwnerName : undefined,
    })
    navigate('/bereich')
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* The header and the step strip stay put: on a form this long, „Schritt 2
          von 3" and the autosave clock are the two reassurances worth keeping. */}
      <div className="sticky top-0 z-30">
        <HeldHeader variant="saved" address={d.address} person={d.person} />

        <div className="flex h-[54px] items-center gap-lg border-b border-border bg-surface-sunken px-2xl">
          <Eyebrow>SCHRITT 2 VON 3 · AUFNAHME</Eyebrow>
          <Segments total={3} current={2} width={176} />
          <span className="flex-1" />
          <span className="text-sm text-fg-muted">
            Rund 8 Minuten · Sie können jederzeit aufhören und später weitermachen
          </span>
        </div>

        {/* A hairline reading of scroll position — the form is long enough to earn it. */}
        <motion.div className="h-[2px] origin-left bg-brand" style={{ scaleX: progress }} />
      </div>

      <div>
        <div className="flex gap-[80px] px-[80px] pt-[64px] pb-[96px]">
          <aside className="sticky top-[196px] flex h-fit w-[220px] shrink-0 flex-col">
            <Eyebrow className="pb-md">SECHS ABSCHNITTE</Eyebrow>
            {seed.intakeSections.map((s) => {
              const isDone = done[s.index]
              const isCurrent = s.index === visible
              return (
                <a
                  key={s.index}
                  href={`#abschnitt-${s.index}`}
                  className="flex items-center gap-sm border-b border-border-subtle py-sm last:border-0"
                >
                  <span className="numeric-mono w-[18px] shrink-0 text-2xs text-fg-subtle">
                    {s.index}
                  </span>
                  <span
                    className={`flex-1 text-base ${
                      isDone || isCurrent ? 'font-medium text-fg' : 'text-fg-muted'
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="flex size-[14px] shrink-0 items-center justify-center">
                    {isCurrent && !isDone ? (
                      <Dot state="brand" size={6} />
                    ) : isDone ? (
                      <span className="text-fg-subtle">
                        <CheckIcon size={13} strokeWidth={1.6} />
                      </span>
                    ) : null}
                  </span>
                </a>
              )
            })}
            <p className="border-t border-border pt-md text-sm leading-[21px] text-fg-subtle">
              Was Sie nicht wissen, lassen Sie offen. Frau Held sieht dann, dass es beim Termin
              geklärt werden muss.
            </p>
          </aside>

          <div className="min-w-0 flex-1">
            <Section onEnter={setVisible} index="01" title="Ihr Gebäude">
              <div className="grid grid-cols-[1fr_1fr_1fr_1.4fr] gap-lg">
                <Field label="BAUJAHR" value={year} onChange={setYear} />
                <Field label="WOHNFLÄCHE" value={area} onChange={setArea} />
                <Field label="WOHNEINHEITEN" value={units} onChange={setUnits} />
                <div className="flex flex-col gap-xs">
                  <Eyebrow>DENKMALSCHUTZ</Eyebrow>
                  <ChipGroup
                    name="monument"
                    size="sm"
                    options={seed.intakeOptions.monument}
                    value={monument}
                    onChange={setMonument}
                  />
                </div>
              </div>
            </Section>

            <Section
              onEnter={setVisible}
              index="02"
              title="Wem gehört das Haus?"
              hint="Gehört es mehreren, braucht der Förderantrag von allen eine Unterschrift. Das früh zu wissen erspart uns beiden Wochen."
            >
              <ChipGroup
                name="ownership"
                options={seed.intakeOptions.ownership}
                value={ownership}
                onChange={setOwnership}
              />
              {ownership !== 'Mir allein' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={transition.base}
                  className="overflow-hidden"
                >
                  <div className="mt-md rounded-lg bg-surface-sunken p-md">
                    <span className="label-caps flex items-center gap-xs pb-sm text-fg-muted">
                      <Dot state="brand" size={5} />
                      WER NOCH? — WIR FRAGEN DIREKT BEI IHR ODER IHM AN
                    </span>
                    <div className="flex items-center gap-sm">
                      <input
                        value={coOwnerName}
                        onChange={(e) => setCoOwnerName(e.target.value)}
                        placeholder="Name"
                        className="h-[46px] flex-1 rounded-md border border-border bg-surface px-[14px]
                                   text-base placeholder:text-fg-subtle focus:border-brand focus:outline-none"
                      />
                      <input
                        value={coOwnerMail}
                        onChange={(e) => setCoOwnerMail(e.target.value)}
                        placeholder="E-Mail"
                        className="h-[46px] flex-[1.6] rounded-md border border-border bg-surface px-[14px]
                                   text-base placeholder:text-fg-subtle focus:border-brand focus:outline-none"
                      />
                      <Button variant="quiet">Weitere hinzufügen</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </Section>

            <Section onEnter={setVisible} index="03" title="Ihre Heizung">
              <ChipGroup
                name="heating"
                options={seed.intakeOptions.heating}
                value={heating}
                onChange={setHeating}
              />
              <div className="mt-md grid grid-cols-[1fr_1fr_2fr] gap-lg">
                <Field label="BAUJAHR KESSEL" value={boilerYear} onChange={setBoilerYear} />
                <Field
                  label="LETZTE WARTUNG"
                  value={lastService}
                  onChange={setLastService}
                  placeholder="Weiß ich nicht"
                />
                <div className="flex flex-col gap-xs">
                  <Eyebrow>FOTO VOM TYPENSCHILD</Eyebrow>
                  <button
                    type="button"
                    className="flex h-[46px] items-center gap-sm rounded-md border border-dashed border-border-strong
                               px-[14px] text-left transition-colors hover:bg-surface-sunken"
                  >
                    <span className="text-fg-subtle">
                      <UploadIcon size={14} />
                    </span>
                    <span className="flex-1 text-base text-fg-muted">
                      Foto aufnehmen oder Datei wählen
                    </span>
                    <Eyebrow>OPTIONAL</Eyebrow>
                  </button>
                </div>
              </div>
            </Section>

            <Section
              onEnter={setVisible}
              index="04"
              title="Was Sie vorhaben"
              hint="Mehrfachauswahl. Was Sie hier auswählen, bestimmt, welches Förderprogramm für Sie in Frage kommt."
            >
              <ChipMulti
                options={seed.intakeOptions.plans}
                value={plans}
                onToggle={(v) =>
                  setPlans((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))
                }
              />
              <div className="pt-md">
                <TextArea value={note} onChange={setNote} rows={3} />
              </div>
            </Section>

            <Section
              onEnter={setVisible}
              index="05"
              title="Was liegt bei Ihnen schon herum?"
              hint="Nur ankreuzen, hochladen können Sie später. Was Sie hier nicht ankreuzen, fordern wir einzeln an — mit dem Hinweis, wo es zu finden ist."
            >
              <div className="grid grid-cols-3 gap-x-lg gap-y-md">
                {seed.intakeOptions.atHand.map((item) => (
                  <Checkbox
                    key={item}
                    label={item}
                    checked={atHand.includes(item)}
                    onChange={() =>
                      setAtHand((a) =>
                        item === 'Nichts davon zur Hand'
                          ? a.includes(item)
                            ? []
                            : [item]
                          : a.includes(item)
                            ? a.filter((x) => x !== item)
                            : [...a.filter((x) => x !== 'Nichts davon zur Hand'), item],
                      )
                    }
                  />
                ))}
              </div>
            </Section>

            <Section
              onEnter={setVisible}
              index="06"
              title="Ihr erstes Gespräch"
              hint="Rund 45 Minuten. Sie wählen, wie und wann — die Zeiten kommen direkt aus dem Kalender von Frau Held."
              last
            >
              <ChipGroup
                name="meeting"
                options={seed.intakeOptions.meetingKind}
                value={meetingKind}
                onChange={setMeetingKind}
              />

              <div className="flex items-baseline justify-between pt-lg pb-sm">
                <Eyebrow>FREIE ZEITEN · KALENDER KATRIN HELD</Eyebrow>
                <Eyebrow>STAND HEUTE, {seed.NOW}</Eyebrow>
              </div>

              <div className="grid grid-cols-3 gap-sm">
                {grouped.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    selected={slot.id === slotId}
                    onSelect={() => setSlotId(slot.id)}
                  />
                ))}
              </div>

              <div className="flex items-start gap-sm pt-md">
                <span className="mt-[7px] size-[6px] shrink-0 rounded-full bg-brand" />
                <p className="max-w-[720px] text-[14px] leading-[22px] text-fg-muted">
                  Was Sie hier wählen, ist sofort in Frau Helds Kalender geblockt — sie muss nicht
                  zurückrufen, um einen Termin zu finden. Verschieben können Sie bis 24 Stunden
                  vorher selbst.
                </p>
              </div>
            </Section>

            <div className="flex items-center gap-[22px] border-t border-border pt-xl">
              <Button variant="primary" size="lg" arrow onClick={onSubmit} disabled={!slotId}>
                Angaben abschicken
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/')}>
                Später weitermachen
              </Button>
              <p className="w-[380px] text-sm leading-[21px] text-fg-muted">
                Frau Held sieht Ihre Angaben sofort und bereitet das Gespräch damit vor. Sie bekommen
                eine Bestätigung mit Termin per Mail.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({
  index,
  title,
  hint,
  children,
  last,
  onEnter,
}: {
  index: string
  title: string
  hint?: string
  children: React.ReactNode
  last?: boolean
  onEnter?: (index: string) => void
}) {
  return (
    <motion.section
      id={`abschnitt-${index}`}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={transition.base}
      className={`relative scroll-mt-[148px] pb-[40px] ${last ? '' : 'border-b border-border'} ${
        index === '01' ? '' : 'pt-[40px]'
      }`}
    >
      {/* A sentinel just below the sticky header: whichever section's sentinel
          is in the band is the one being read. Kept separate from the section's
          own entrance animation, which fires once and never repeats. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full"
        onViewportEnter={() => onEnter?.(index)}
        viewport={{ margin: '-160px 0px -65% 0px' }}
      />
      <div className="flex items-baseline gap-[14px] pb-md">
        <span className="numeric-mono w-6 shrink-0 text-xs text-fg-subtle">{index}</span>
        <h2 className="font-display text-lg font-semibold leading-[26px] tracking-tight">{title}</h2>
      </div>
      {hint && <p className="max-w-[760px] pb-md pl-[38px] text-base text-fg-muted">{hint}</p>}
      <div className="pl-[38px]">{children}</div>
    </motion.section>
  )
}

/** A slot card. Selected goes to the inverse surface — the same treatment the
 *  design uses for anything that is now fixed rather than merely offered. */
function SlotCard({
  slot,
  selected,
  onSelect,
}: {
  slot: Slot
  selected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.985 }}
      animate={{
        backgroundColor: selected ? 'var(--color-surface-inverse)' : 'var(--color-surface)',
        borderColor: selected ? 'var(--color-surface-inverse)' : 'var(--color-border)',
      }}
      transition={transition.fast}
      className="flex flex-col gap-xs rounded-lg border px-md py-sm text-left"
    >
      <span className="flex items-center justify-between">
        <span className={`label-caps ${selected ? 'text-fg-inverse-muted' : 'text-fg-subtle'}`}>
          {slot.day}
        </span>
        {selected && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transition.fast}
            className="text-fg-inverse"
          >
            <CheckIcon size={13} strokeWidth={1.8} />
          </motion.span>
        )}
      </span>
      <span className="flex items-baseline gap-xs">
        <span
          className={`font-display text-lg font-semibold tracking-tight ${
            selected ? 'text-fg-inverse' : 'text-fg'
          }`}
        >
          {slot.start}
        </span>
        <span className={`text-sm ${selected ? 'text-fg-inverse-muted' : 'text-fg-muted'}`}>
          bis {slot.end}
        </span>
      </span>
    </motion.button>
  )
}
