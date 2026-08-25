# Ensera · Client Portal — interaktiver Prototyp

Ein klickbarer Prototyp für die Zusammenarbeit zwischen einer selbstständigen
Energieberaterin (Katrin Held / ENSERA) und ihrer privaten Kundschaft. Beide
Seiten laufen im Browser gegen **einen gemeinsamen Zustand**: was die Kundschaft
tut, sieht die Beraterin sofort — und umgekehrt. Genau das ist der Punkt der
Demo.

Design: Paper-Datei *Ensera*, Seite *ClientPortal · Ensera*. Die Design-Tokens
liegen 1:1 in `src/styles/theme.css`.

```bash
npm install
npm run dev      # http://localhost:5173/client_portal_prototype/
```

## Der Rundgang

Unten rechts sitzt ein **Ansichts-Umschalter** (nicht Teil des Produkts): damit
springt man zwischen Kundschaft und Beraterin, ohne URLs zu suchen. Dort liegt
auch *Demo zurücksetzen*.

1. `/` **Landing** → *Anfrage erstellen*
2. `/anfrage` drei Fragen + ein Satz → *Anfrage senden*
3. `/ensera/anfragen` die Anfrage liegt bei der Beraterin, gegen ihre sechs
   Regeln vorgeprüft → *Annehmen und Zugang senden*
4. Der Toast trägt den **Magic Link**: *Als Kundschaft öffnen* → `/aufnahme`
5. `/aufnahme` sechs Abschnitte; der gewählte Termin wird **sofort** in ihrem
   Kalender geblockt → sichtbar unter `/ensera/kalender`
6. `/bereich` der eigene Bereich: fehlende Unterlagen hochladen — Überschrift,
   Zähler, Frist und `/ensera/kundschaft/reuter` ziehen mit
7. Eine Frage stellen:
   - *„Welche Unterlagen fehlen noch?"* → sofort von ENSERA beantwortet
   - *„Können wir die Fenster schon im Herbst tauschen lassen?"* → geht an die
     Beraterin, weil Förderung dranhängt → `/ensera/fragen` hält einen Entwurf
     mit Belegen → *Freigeben und senden* → Antwort erscheint im Verlauf der
     Kundschaft, gezeichnet von ihr, und im Protokoll unter `/ensera/postfach`

Kein Backend, keine Mails, kein Login. Mail-Momente sind Toasts; wo eine Mail
einen Link enthielte, ist die Toast-Aktion dieser Link.

## Die Beraterin-Oberfläche

Drei Dinge in der Seitenleiste, die nicht bloß Dekoration sind:

- **Suchen oder fragen (⌘K).** Ein Feld, zwei Aufgaben — deshalb trägt es im
  Design die Kugel und keine Lupe. Ein Name sucht (Kundschaft, Anfragen,
  Fristen, Unterlagen, Nachrichten), eine Frage wird beantwortet: *„Wer wartet
  auf mich?"*, *„Was ist heute überfällig?"*, *„Welche Unterlagen fehlen?"*.
  Beantwortet wird ausschließlich aus dem, was im Zustand liegt — sonst sagt es
  das (`KEINE GRUNDLAGE IN DEN DATEN`), genau wie auf der Kundenseite.
- **Seitenleiste einklappen.** Das Panel-Symbol oben rechts klappt die Leiste auf
  68 px ein. Die Zählerstände bleiben als Punkte sichtbar — sie sind der Grund,
  die Leiste offen zu halten, also darf das Einklappen sie nicht verschlucken.
- **Einrichtung.** Vier Ablaufvorlagen mit eigenen Schritten. Schritte lassen
  sich am Griff ziehen oder mit ↑ ↓ verschieben, Zuständigkeit per Dropdown
  ändern, alle Texte direkt in der Tabelle bearbeiten; Schritte und Vorlagen
  kommen und gehen. Der letzte Schritt einer Vorlage bleibt bestehen — eine
  Vorlage ohne Schritte würde für keinen Fall etwas bedeuten.

**Der Zustand liegt nur im Speicher.** Ein Reload führt immer zurück in den
Ausgangszustand aus dem Design — eine Demo kann also nicht in einem halbfertigen
Zwischenstand hängen bleiben.

## Aufbau

```
src/
  styles/theme.css     Design-Tokens, wörtlich aus Paper (Tailwind-v4-@theme)
  motion/              Dauern, Easings, Varianten — eine Quelle für alle Screens
  store/               demo.ts (der Zustand + alle Aktionen), seed.ts (Design-Daten),
                       ai.ts (was ENSERA der Kundschaft beantwortet und was nicht),
                       search.ts (Suche und Praxis-Fragen der Beraterin)
  components/          primitives/ · chrome/ (Rail, Header, Toasts, Palette, Umschalter)
  screens/client/      Landing · FirstInquiry · InquirySent · Intake · ClientPortal
  screens/ensera/      Inquiries · Clients · CaseDetail · Deadlines · Questions ·
                       Outbox · Setup
```

Zwei Dinge, die beim Lesen helfen:

- **`OwnerTag`** rendert dasselbe Feld für beide Seiten unterschiedlich
  („SIE / KUNDSCHAFT" vs. „FRAU HELD / SIE"). Eine Quelle, zwei Sichten — damit
  können sie nicht auseinanderlaufen.
- **`ai.ts`** entscheidet, was sofort beantwortet wird und was eskaliert. Alles
  mit Geld oder Recht dran geht an die Beraterin, mit Entwurf und Belegen.

## Prüfen

```bash
npm run typecheck
node scripts/shoot.mjs     # jeden Screen bei 1440px nach /tmp/shots
node scripts/walk.mjs      # der komplette Rundgang durch beide Rollen
node scripts/settings.mjs  # Seitenleiste, Palette, Einrichtung
```

`walk.mjs` ist der eigentliche Test: es klickt sich durch beide Rollen und prüft
nach jedem Schritt, dass die andere Seite es sieht. `settings.mjs` prüft die
Beraterin-Oberfläche. Für beide muss der Dev-Server laufen.

## Deployment

GitHub Actions baut jeden Push auf `main` und veröffentlicht auf GitHub Pages
(`.github/workflows/deploy.yml`). Der Base-Pfad ist `/client_portal_prototype/`,
`404.html` ist die SPA-Weiche für Deeplinks. Der Workflow schaltet Pages selbst
ein (`enablement: true`) — in den Einstellungen ist nichts zu klicken.

**Es fehlt genau eine Sache:** Pages ist für dieses Repository nicht verfügbar.
Das Repo ist privat und die Organisation liegt auf dem Free-Plan; Pages aus
privaten Repos gibt es erst ab GitHub Team. Der Workflow läuft deshalb bis
`configure-pages` durch und bricht dort ab — der Build selbst ist grün.

Zwei Wege, und sie unterscheiden sich nur darin, was öffentlich wird:

| | Code | Seite | Kosten |
|---|---|---|---|
| Repo öffentlich schalten | öffentlich | öffentlich | keine |
| Org auf GitHub Team | privat | öffentlich | pro Mitglied und Monat |

In beiden Fällen ist die **Seite öffentlich erreichbar** — eine zugriffsbeschränkte
Pages-Seite gibt es nur mit Enterprise Cloud. Die Daten im Prototyp sind erfunden,
insofern ist das unkritisch; nur wissen sollte man es.

Danach genügt ein Push auf `main` oder *Actions → Deploy prototype to GitHub Pages
→ Run workflow*. Die Seite liegt dann unter
`https://energy-consultant-companion.github.io/client_portal_prototype/`.
