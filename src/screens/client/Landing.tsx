import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { seed } from '@/store/demo'
import { listVariants, rowVariants, transition } from '@/motion/tokens'
import { Eyebrow } from '@/components/primitives'
import { HeldFooter } from '@/components/chrome/HeldHeader'
import { Orb } from '@/components/chrome/Orb'
import { ArrowRightIcon } from '@/icons'
import hero from '@/assets/hero.jpg'

/*
 * Landing — a stand-in, and it says so.
 *
 * This page is not the product. A consultant almost certainly already has a
 * website, and ENSERA has no business replacing it: the only thing it needs is
 * one link. So rather than pretending to be a marketing page, the page explains
 * that it is a placeholder and shows exactly where the handover happens.
 *
 * That framing is also why there are no prices here. What a consultant charges
 * is their business, and putting numbers in a prototype invites a conversation
 * about the wrong thing.
 */

const handover = [
  {
    tag: 'BLEIBT WIE ES IST',
    title: 'Ihre Website',
    body:
      'Was Sie heute haben, bleibt. Ihre Texte, Ihre Preise, Ihre Fotos — daran ändert ENSERA nichts und will es auch nicht.',
  },
  {
    tag: 'DAS EINZIGE, WAS DAZUKOMMT',
    title: 'Ein Link',
    body:
      'Ein Knopf „Anfrage erstellen", der auf Ihren Bereich zeigt. Mehr Einbau ist es nicht — kein Plugin, kein Umzug, keine neue Adresse.',
  },
  {
    tag: 'AB HIER ÜBERNEHMEN WIR',
    title: 'Alles danach',
    body:
      'Anfrage prüfen, Zugang verschicken, Unterlagen einsammeln, Fristen halten, Fragen beantworten. Das ist der Teil, den Sie gerade selbst machen.',
  },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Says what this page is before anyone reads a word of it. */}
      <div className="flex items-center justify-center gap-sm bg-surface-inverse px-lg py-[9px]">
        <Orb size={16} />
        <span className="label-caps text-fg-inverse-muted">
          PROTOTYP · DIESE STARTSEITE STEHT FÜR <span className="text-fg-inverse">IHRE EIGENE WEBSITE</span> —
          ALLES AB „ANFRAGE ERSTELLEN" IST ENSERA
        </span>
      </div>

      <section className="relative h-[882px] overflow-hidden bg-surface-inverse">
        <motion.img
          src={hero}
          alt="Wohngebiet aus der Luft, mit eingezeichneten Energiekennwerten"
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 size-full object-cover"
        />
        {/*
         * This photograph is bright — sunlit sky top, a light HUD bottom right.
         * White type needs the scrim built where the type actually sits, so:
         * dark from the left for the headline column, dark from the bottom to
         * seat the whole block, and a light touch on top for the nav.
         */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(11,13,16,0.82)] via-[rgba(11,13,16,0.34)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[420px] bg-gradient-to-t from-[rgba(11,13,16,0.78)] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-[180px] bg-gradient-to-b from-[rgba(11,13,16,0.5)] to-transparent" />

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
                         font-medium text-fg-inverse transition-colors hover:bg-[rgba(255,255,255,0.14)]"
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
            className="w-[540px] font-display text-[62px] font-semibold leading-[60px] tracking-tighter text-fg-inverse
                       [text-shadow:0_1px_24px_rgba(11,13,16,0.35)]"
          >
            Ich sage Ihnen, was Ihr Haus braucht. Und was nicht.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition.slow, delay: 0.36 }}
            className="w-[560px] pt-lg text-md leading-[29px] text-[rgba(255,255,255,0.88)]"
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
            {/* The one element that belongs to ENSERA — hence the ring on it. */}
            <Link to="/anfrage">
              <motion.span
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={transition.fast}
                className="flex h-[52px] shrink-0 items-center gap-[10px] rounded-full bg-surface px-[26px]
                           text-base font-semibold tracking-tight text-fg
                           ring-4 ring-[rgba(255,255,255,0.16)]"
              >
                Anfrage erstellen
                <ArrowRightIcon size={15} />
              </motion.span>
            </Link>
            <span className="label-caps leading-[18px] text-[rgba(255,255,255,0.62)]">
              DREI FRAGEN · ZWEI MINUTEN
              <br />
              ANTWORT VON MIR AM SELBEN WERKTAG
            </span>
          </motion.div>
        </div>
      </section>

      {/* Where the placeholder ends and the product begins. */}
      <section className="flex gap-[80px] px-[80px] py-[96px]">
        <div className="flex w-[200px] shrink-0 flex-col gap-sm">
          <Eyebrow>01 — WAS ENSERA ÄNDERT</Eyebrow>
          <p className="text-sm leading-[21px] text-fg-muted">
            Fast nichts. Und das ist der Punkt.
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="max-w-[700px] pb-md font-display text-3xl font-semibold leading-[44px] tracking-tight">
            Diese Seite gehört Ihnen. Wir hängen nur einen Knopf daran.
          </h2>
          <p className="max-w-[620px] pb-2xl text-md leading-[29px] text-fg-muted">
            Oben sehen Sie eine gebaute Beispielseite — im Betrieb wäre das einfach Ihre eigene,
            wie sie heute schon aussieht. ENSERA fängt erst hinter dem Knopf an.
          </p>

          <motion.div
            variants={listVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-3 gap-[40px]"
          >
            {handover.map((s, i) => (
              <motion.article
                key={s.title}
                variants={rowVariants}
                className={`flex flex-col border-t-2 pt-md ${
                  // The third card is ENSERA's half of the bargain.
                  i === 2 ? 'border-brand' : 'border-fg'
                }`}
              >
                <Eyebrow tone={i === 2 ? 'brand' : 'subtle'} className="pb-sm">
                  {s.tag}
                </Eyebrow>
                <h3 className="pb-sm font-display text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="text-base leading-[24px] text-fg-muted">{s.body}</p>
              </motion.article>
            ))}
          </motion.div>

        </div>
      </section>

      <section className="bg-surface-inverse px-[80px] py-[80px]">
        <div className="flex items-end justify-between gap-2xl">
          <div className="max-w-[620px]">
            <p className="font-display text-2xl font-semibold leading-[40px] tracking-tight text-fg-inverse">
              Drei Fragen und ein Satz von Ihnen. Passt Ihr Haus nicht zu mir, sage ich das ehrlich
              und nenne Ihnen jemanden, der es macht.
            </p>
            {/* The concrete version of the sentence above — and the reason the
                pre-check turns Frau Deibel away later in the demo. */}
            <div className="flex items-start gap-sm pt-lg">
              <span className="mt-[7px] size-[6px] shrink-0 rounded-full bg-feedback-warning-inverse" />
              <p className="text-[14px] leading-[22px] text-fg-inverse-muted">
                Was ich nicht mache: Neubau, Gewerbe, Mehrfamilienhäuser, Denkmalschutz. Das merken
                Sie schon in der Anfrage.
              </p>
            </div>
          </div>
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
