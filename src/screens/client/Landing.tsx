import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { seed } from '@/store/demo'
import { listVariants, rowVariants, transition } from '@/motion/tokens'
import { Eyebrow } from '@/components/primitives'
import { HeldFooter } from '@/components/chrome/HeldHeader'
import { ArrowRightIcon } from '@/icons'
import hero from '@/assets/hero.jpg'

/*
 * Landing — condensed on purpose.
 *
 * In the design this page runs six sections deep, but it is the least important
 * screen here: a consultant would plausibly keep their own site. What it has to
 * do is establish the voice (plain, blunt, priced up front) and hand the visitor
 * to the inquiry. So we keep the hero, the three services, and the honest
 * disclaimer about what she doesn't do — and stop there.
 */

const services = [
  {
    tag: 'BAFA EBW · MEISTGEWÄHLT',
    title: 'Sanierungsfahrplan',
    body:
      'Ich sehe mir Ihr Haus an und schreibe auf, in welcher Reihenfolge sich was rechnet — mit Kosten, Einsparung und Förderung pro Schritt.',
    price: '390 €',
    priceNote: 'Ihr Anteil nach Förderung',
  },
  {
    tag: 'BEG EM · KFW 458',
    title: 'Fördermittelbegleitung',
    body:
      'Antrag, Bestätigung, Verwendungsnachweis. Ich reiche ein, halte die Fristen und rede mit BAFA und KfW. Sie unterschreiben nur.',
    price: 'ab 640 €',
    priceNote: 'je Maßnahme',
  },
  {
    tag: 'PFLICHT BEI WÄRMEPUMPE',
    title: 'Heizlast und Abgleich',
    body:
      'Heizlastberechnung nach DIN 12831 und hydraulischer Abgleich. Ohne beides zahlt die KfW die Wärmepumpe nicht.',
    price: 'ab 480 €',
    priceNote: 'nach Aufwand',
  },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-surface">
      <section className="relative h-[882px] overflow-hidden bg-surface-inverse">
        <motion.img
          src={hero}
          alt=""
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 size-full object-cover"
        />
        {/* Two veils: one to lift the nav off the image, one to seat the headline. */}
        <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-[rgba(11,13,16,0.6)] to-transparent" />
        <div className="absolute inset-0 bg-[rgba(11,13,16,0.42)]" />
        <div className="absolute inset-x-0 bottom-0 h-[340px] bg-gradient-to-t from-[rgba(11,13,16,0.68)] to-transparent" />

        <nav className="relative flex h-[92px] items-center justify-between px-[80px]">
          <span className="flex items-center gap-[10px]">
            <span className="flex size-[22px] items-center justify-center rounded-sm bg-surface">
              <span className="block size-2 rounded-full bg-fg" />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-base font-semibold tracking-tight text-fg-inverse">
                {seed.consultant.practice}
              </span>
              <span className="label-caps text-[9px] text-[rgba(255,255,255,0.55)]">
                {seed.consultant.registry}
              </span>
            </span>
          </span>
          <span className="flex items-center gap-lg">
            <span className="numeric-mono text-sm text-[rgba(255,255,255,0.78)]">
              {seed.consultant.phone}
            </span>
            <Link
              to="/anfrage"
              className="rounded-full border border-[rgba(255,255,255,0.3)] px-md py-[9px] text-sm
                         font-medium text-fg-inverse transition-colors hover:bg-[rgba(255,255,255,0.12)]"
            >
              Anfrage erstellen
            </Link>
          </span>
        </nav>

        <div className="relative flex h-[790px] flex-col justify-end px-[80px] pb-[92px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition.slow, delay: 0.2 }}
            className="flex items-center gap-[10px] pb-[28px]"
          >
            <span className="size-[6px] shrink-0 rounded-full bg-brand-inverse" />
            <span className="label-caps text-[rgba(255,255,255,0.86)]">
              ENERGIEBERATUNG FÜR WOHNGEBÄUDE · 40 KM UM PEINE
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition.slow, delay: 0.28 }}
            className="w-[540px] font-display text-[62px] font-semibold leading-[60px] tracking-tighter text-fg-inverse"
          >
            Ich sage Ihnen, was Ihr Haus braucht. Und was nicht.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition.slow, delay: 0.36 }}
            className="w-[560px] pt-lg text-md leading-[29px] text-[rgba(255,255,255,0.82)]"
          >
            Sanierungsfahrplan, Förderantrag, Begleitung bis zum Bescheid. Und wenn sich etwas für
            Sie nicht rechnet, sage ich das, bevor Sie Geld ausgeben.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition.slow, delay: 0.44 }}
            className="flex items-center gap-[20px] pt-[40px]"
          >
            <Link to="/anfrage">
              <motion.span
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={transition.fast}
                className="flex h-[52px] shrink-0 items-center gap-[10px] rounded-full bg-surface px-[26px]
                           text-base font-semibold tracking-tight text-fg"
              >
                Anfrage erstellen
                <ArrowRightIcon size={15} />
              </motion.span>
            </Link>
            <span className="label-caps leading-[18px] text-[rgba(255,255,255,0.55)]">
              DREI FRAGEN · ZWEI MINUTEN
              <br />
              ANTWORT VON MIR AM SELBEN WERKTAG
            </span>
          </motion.div>
        </div>
      </section>

      <section className="flex gap-[80px] px-[80px] py-[96px]">
        <div className="flex w-[200px] shrink-0 flex-col gap-sm">
          <Eyebrow>01 — WAS SIE BEKOMMEN</Eyebrow>
          <p className="text-sm leading-[21px] text-fg-muted">
            Festpreise. Die Förderung ziehe ich vorher ab, nicht nachher.
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="max-w-[660px] pb-2xl font-display text-3xl font-semibold leading-[44px] tracking-tight">
            Drei Dinge. Mehr braucht Ihr Haus in der Regel nicht.
          </h2>

          <motion.div
            variants={listVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-3 gap-[40px]"
          >
            {services.map((s) => (
              <motion.article
                key={s.title}
                variants={rowVariants}
                className="flex flex-col border-t-2 border-fg pt-md"
              >
                <Eyebrow className="pb-sm">{s.tag}</Eyebrow>
                <h3 className="pb-sm font-display text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="pb-lg text-base leading-[24px] text-fg-muted">{s.body}</p>
                <div className="mt-auto flex items-baseline gap-sm border-t border-border pt-sm">
                  <span className="font-display text-lg font-semibold tracking-tight">{s.price}</span>
                  <span className="text-sm text-fg-subtle">{s.priceNote}</span>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <div className="flex items-start gap-sm pt-2xl">
            <span className="mt-[7px] size-[6px] shrink-0 rounded-full bg-feedback-error" />
            <p className="max-w-[620px] text-[14px] leading-[22px] text-fg-muted">
              Was ich nicht mache: Neubau, Gewerbe, Mehrfamilienhäuser, Denkmalschutz. Das merken Sie
              schon in der Anfrage — und dann nenne ich Ihnen jemanden, der es macht.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface-inverse px-[80px] py-[80px]">
        <div className="flex items-end justify-between gap-2xl">
          <p className="max-w-[620px] font-display text-2xl font-semibold leading-[40px] tracking-tight text-fg-inverse">
            Drei Fragen und ein Satz von Ihnen. Passt Ihr Haus nicht zu mir, sage ich das ehrlich und
            nenne Ihnen jemanden, der es macht.
          </p>
          <Link
            to="/anfrage"
            className="group flex shrink-0 items-center gap-xs text-base font-medium text-brand-inverse"
          >
            Anfrage erstellen
            <motion.span
              className="inline-flex"
              initial={false}
              whileHover={{ x: 3 }}
              transition={transition.fast}
            >
              <ArrowRightIcon size={15} />
            </motion.span>
          </Link>
        </div>
      </section>

      <HeldFooter />
    </div>
  )
}
