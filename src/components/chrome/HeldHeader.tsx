import { Link } from 'react-router-dom'
import { seed } from '@/store/demo'
import { HeldMark, CheckIcon } from '@/icons'
import { Button } from '@/components/primitives'

/*
 * The client-facing header. It changes register as the relationship deepens:
 * a phone number for a stranger on the landing page, an address and an autosave
 * clock once they are inside their own case.
 */

export function HeldHeader({
  /** Shown after the wordmark once we know which house this is about. */
  address,
  /** Right side: a phone number, an autosave state, or a named person. */
  variant = 'phone',
  person,
  onCall,
}: {
  address?: string
  variant?: 'phone' | 'saved' | 'portal' | 'plain'
  person?: string
  onCall?: () => void
}) {
  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-surface px-2xl">
      <Link to="/" className="flex items-center gap-sm">
        <span className="flex items-center gap-[10px]">
          <HeldMark size={22} />
          <span className="font-display text-base font-semibold tracking-tight text-fg">
            {seed.consultant.practice}
          </span>
        </span>
        {address && (
          <>
            <span className="h-[18px] w-px bg-border" />
            <span className="text-sm text-fg-muted">{address}</span>
          </>
        )}
      </Link>

      {variant === 'phone' && (
        <span className="text-sm text-fg-muted">Lieber telefonieren? {seed.consultant.phone}</span>
      )}

      {variant === 'saved' && (
        <span className="flex items-center gap-lg">
          <span className="label-caps flex items-center gap-[6px] text-fg-subtle">
            <CheckIcon size={12} />
            AUTOMATISCH GESPEICHERT · {seed.NOW}
          </span>
          <span className="text-sm text-fg-muted">{person}</span>
        </span>
      )}

      {variant === 'portal' && (
        <span className="flex items-center gap-lg">
          <span className="text-sm text-fg-muted">{person}</span>
          <Button variant="secondary" size="sm" onClick={onCall}>
            Frau Held anrufen
          </Button>
        </span>
      )}
    </header>
  )
}

/** The client-facing footer — the data-residency promise the design makes twice. */
export function HeldFooter({ portal = false }: { portal?: boolean }) {
  return (
    <footer className="flex items-start justify-between gap-2xl border-t border-border px-2xl py-xl">
      <span className="flex shrink-0 items-center gap-lg whitespace-nowrap text-sm text-fg-muted">
        <span className="text-fg">{seed.consultant.practice}</span>
        <span>Impressum</span>
        <span>Datenschutz</span>
        {portal ? <span>Zugang beenden</span> : <span>Widerrufsrecht</span>}
        {!portal && <span>Kontakt</span>}
      </span>
      <span className="flex items-start gap-lg">
        <span className="max-w-[440px] text-right text-sm leading-[21px] text-fg-muted">
          {portal
            ? 'Ihre Daten liegen in Deutschland.'
            : 'Ihre Anfrage wird in Deutschland gespeichert und nur von mir gelesen. Kein Newsletter, keine Weitergabe.'}
        </span>
        <span className="label-caps shrink-0 whitespace-nowrap pt-[3px] text-fg-subtle">
          LÄUFT MIT ENSERA KONTAKT
        </span>
      </span>
    </footer>
  )
}
