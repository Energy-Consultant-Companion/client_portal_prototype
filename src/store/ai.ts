/*
 * The stand-in for the answering system.
 *
 * The product's rule — stated on the client portal itself — is that ENSERA only
 * answers from what is already in the case: appointments, deadlines, missing
 * documents, definitions. Anything with money or law attached is handed to the
 * consultant with a draft. This table encodes that split so the demo behaves
 * consistently no matter what a presenter types.
 */

export interface AutoAnswer {
  answer: string
  provenance: string
}

export interface Escalation {
  tag: string
  reason: string
  draft: {
    greeting: string
    paragraphs: string[]
    signoff: string
    signature: string
    evidence: number
    citations: { kind: 'regel' | 'dokument'; label: string; locator: string }[]
  }
}

const PROVENANCE_INSTANT = 'ENSERA · SOFORT BEANTWORTET, OHNE FRAU HELD ZU STÖREN'

/** Things ENSERA can read straight off the case. */
const answerable: { match: RegExp; answer: string }[] = [
  {
    match: /termin|kommt.*(vorbei|frau held)|vor.?ort|wann.*(kommt|treffen)|uhrzeit/i,
    answer:
      'Am Mittwoch, 19. August um 10:00 Uhr bei Ihnen. Eingeplant sind rund zwei Stunden. Sie brauchen dafür Zugang zu Keller und Dachboden.',
  },
  {
    match: /frist|bis wann|deadline|wie lange.*(zeit|noch)/i,
    answer:
      'Die nächste Frist ist Freitag, der 15. August — bis dahin sollten die beiden fehlenden Unterlagen da sein. Danach sind Sie erst zum Termin am 19. August wieder gefragt.',
  },
  {
    match: /(welche|was).*(unterlagen|dokument|fehlt|fehlen)|noch.*(fehlt|offen)/i,
    answer:
      'Es fehlen noch zwei von neun: die Heizkostenabrechnung 2024 und die Vollmacht Ihres Bruders. Sieben Unterlagen sind da und ausgelesen. Der Energieausweis wird gerade gelesen.',
  },
  {
    match: /isfp|sanierungsfahrplan|was ist ein/i,
    answer:
      'Ein individueller Sanierungsfahrplan (iSFP) ist ein Bericht, der Ihr Haus aufnimmt und die sinnvolle Reihenfolge der Maßnahmen festlegt — mit Kosten, Einsparung und Förderung pro Schritt. Mit einem iSFP steigt der Zuschuss auf viele Einzelmaßnahmen um fünf Prozentpunkte.',
  },
  {
    match: /wer.*(dran|zuständig)|was muss ich (jetzt |gerade )?tun/i,
    answer:
      'Gerade sind Sie dran: zwei Unterlagen fehlen, Frist ist Freitag der 15. August. Parallel bereitet Frau Held den Vor-Ort-Termin vor — dafür müssen Sie nichts tun.',
  },
  {
    match: /stand|wie weit|fortschritt|schritt/i,
    answer:
      'Sie sind bei Schritt drei von sechs — Unterlagen. Erstgespräch und Vertrag sind erledigt. Als Nächstes kommt der Vor-Ort-Termin am 19. August, danach die Berechnung.',
  },
  {
    match: /kosten|preis|honorar|was zahle ich/i,
    answer:
      'Für Ihren Sanierungsfahrplan sind 390 € vereinbart — das ist Ihr Anteil nach Abzug der Förderung. Der Betrag steht in Ihrem Beratungsvertrag vom 24. Juli, Abschnitt 2.',
  },
  {
    match: /foto|hochladen|scan|handy/i,
    answer:
      'Fotografieren genügt — Sie brauchen keinen Scanner. Laden Sie das Bild einfach hier hoch, wir erkennen selbst, um welche Unterlage es sich handelt und ordnen sie zu.',
  },
]

/** Things ENSERA must not answer alone, with the draft it prepares instead. */
const escalations: { match: RegExp; escalation: Escalation }[] = [
  {
    match: /fenster|herbst|handwerker.*(anfang|beginn|start)|schon.*(anfangen|beginnen|tauschen)|vorher.*(bauen|anfangen)/i,
    escalation: {
      tag: 'FÖRDERUNG IN GEFAHR',
      reason:
        'Hier hängt Geld dran. Beginnen die Arbeiten vor dem Förderantrag, entfällt die Förderung — das ist eine Rechtsfolge, keine Auskunft aus den Unterlagen.',
      draft: {
        greeting: 'Guten Tag Frau Reuter,',
        paragraphs: [
          'bitte warten Sie damit noch. Der Förderantrag muss bei der BAFA eingegangen sein, bevor der erste Handwerker anfängt. Wird vorher begonnen, ist die Förderung für die Fenster verloren — auch rückwirkend lässt sich das nicht heilen.',
          'Nach unserem Termin am 19. August stelle ich den Antrag. Sie dürfen aber jetzt schon Angebote einholen und einen Termin reservieren — das gilt noch nicht als Vorhabenbeginn.',
        ],
        signoff: 'Freundliche Grüße',
        signature: 'Katrin Held',
        evidence: 2,
        citations: [
          { kind: 'regel', label: 'Vorhabenbeginn vor Antragstellung', locator: 'EBW 2.4 · REGELSTAND 2026-01' },
          { kind: 'dokument', label: 'Beratungsvertrag Reuter · Terminplan', locator: 'S. 2 · ABSCHNITT 3' },
        ],
      },
    },
  },
  {
    match: /steuer|absetzen|steuererklärung|finanzamt/i,
    escalation: {
      tag: 'KEINE STEUERAUSKUNFT',
      reason:
        'Steuerrecht darf ich nicht auslegen — das ist Beratung, für die ich nicht zugelassen bin. Ich habe die Frage unbeantwortet gelassen, statt zu raten.',
      draft: {
        greeting: 'Guten Tag Frau Reuter,',
        paragraphs: [
          'einen Zuschuss der BAFA müssen Sie nicht als Einkommen versteuern. Er mindert aber die Kosten, die Sie an anderer Stelle geltend machen können — denselben Betrag können Sie nicht doppelt ansetzen.',
          'Wie sich das bei Ihnen auswirkt, sagt Ihnen Ihre Steuerberatung verbindlich. Ich schicke Ihnen die Bescheide gern gesammelt zu, sobald sie da sind.',
        ],
        signoff: 'Freundliche Grüße',
        signature: 'Katrin Held',
        evidence: 1,
        citations: [
          { kind: 'regel', label: 'Zuschuss und Steuerbonus nicht kombinierbar', locator: '§ 35c EStG · ABS. 3' },
        ],
      },
    },
  },
  {
    match: /verkauf|verkaufen|erbe|erben|überschreib|eigentümerwechsel/i,
    escalation: {
      tag: 'NICHT IM REGELWERK',
      reason:
        'Zum Eigentümerwechsel während des Bewilligungszeitraums steht im Programm nichts Eindeutiges. Ich rate hier nicht — das gehört in Ihre Hand.',
      draft: {
        greeting: 'Guten Tag Frau Reuter,',
        paragraphs: [
          'ein Verkauf ist möglich, aber die Förderung geht nicht automatisch mit. Der Zuwendungsbescheid läuft auf Sie; überträgt man ihn nicht rechtzeitig, muss der Zuschuss zurückgezahlt werden.',
          'Wenn ein Verkauf im Raum steht, sagen Sie mir das bitte, bevor der Antrag raus ist. Dann stimmen wir die Reihenfolge ab — das ist deutlich einfacher als eine Übertragung im Nachgang.',
        ],
        signoff: 'Freundliche Grüße',
        signature: 'Katrin Held',
        evidence: 1,
        citations: [
          { kind: 'regel', label: 'Zweckbindung und Eigentümerwechsel', locator: 'EBW 5.1 · REGELSTAND 2026-01' },
        ],
      },
    },
  },
  {
    match: /widerspruch|klage|anwalt|haftung|garantie|verklagen/i,
    escalation: {
      tag: 'RECHTSFRAGE',
      reason:
        'Das ist eine Rechtsfrage, keine Auskunft aus Ihren Unterlagen. Ich habe sie stehen gelassen und Frau Held einen Entwurf vorbereitet.',
      draft: {
        greeting: 'Guten Tag Frau Reuter,',
        paragraphs: [
          'lassen Sie uns das telefonisch klären — schriftlich würde ich das ungern verkürzen. Ich rufe Sie dazu am Termin am 19. August ohnehin, kann aber auch vorher.',
          'Was ich Ihnen fachlich sagen kann, sage ich gern. Für die rechtliche Seite verweise ich Sie bewusst weiter, statt zu improvisieren.',
        ],
        signoff: 'Freundliche Grüße',
        signature: 'Katrin Held',
        evidence: 0,
        citations: [],
      },
    },
  },
]

/** A last-resort escalation for anything the table doesn't recognise. */
const fallback: Escalation = {
  tag: 'NICHT AUS DEN UNTERLAGEN',
  reason:
    'Dazu finde ich in Ihrem Fall keine belastbare Grundlage. Statt zu raten habe ich die Frage weitergegeben und einen Entwurf vorbereitet.',
  draft: {
    greeting: 'Guten Tag Frau Reuter,',
    paragraphs: [
      'danke für die Frage — die beantworte ich Ihnen lieber selbst, weil sie sich aus Ihren Unterlagen nicht sauber ableiten lässt.',
      'Ich komme darauf spätestens beim Vor-Ort-Termin am 19. August zurück. Wenn es vorher eilt, rufen Sie mich gern an.',
    ],
    signoff: 'Freundliche Grüße',
    signature: 'Katrin Held',
    evidence: 0,
    citations: [],
  },
}

export type Triage =
  | { kind: 'auto'; result: AutoAnswer }
  | { kind: 'escalate'; result: Escalation }

/**
 * Decide whether a client question can be answered from the case or has to go
 * to the consultant. Escalations win over auto-answers: a question that mentions
 * both a deadline and the start of building work is the dangerous kind.
 */
export function triage(question: string): Triage {
  for (const { match, escalation } of escalations) {
    if (match.test(question)) return { kind: 'escalate', result: escalation }
  }
  for (const { match, answer } of answerable) {
    if (match.test(question)) {
      return { kind: 'auto', result: { answer, provenance: PROVENANCE_INSTANT } }
    }
  }
  return { kind: 'escalate', result: fallback }
}
