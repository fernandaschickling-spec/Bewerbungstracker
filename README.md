# Bewerbungs-Dossier

Persönliches Bewerbungstracking-Tool für Ingenieure in Deutschland.

## Features

- Dashboard mit Pipeline-Übersicht und Countdown
- 7-stufige Bewerbungs-Pipeline (Recherche → Beworben → Antwort → Interview → Angebot → Zusage/Absage)
- 20 vorbefüllte Jobportale mit Direktlinks für Region Karlsruhe
- CV-Editor mit allen Standard-Sektionen
- KI-gestützte CV-Anpassung pro Stelle (über Claude.ai)
- Kontaktverwaltung pro Bewerbung mit klickbaren mailto/tel-Links
- CSV-Export und JSON-Backup
- Lokale Datenspeicherung im Browser (keine Cloud, keine Tracking-Cookies)

## Deployment auf Vercel (5 Minuten)

### Variante A: Mit GitHub-Account (empfohlen)

1. **GitHub Repository erstellen**
   - https://github.com/new öffnen
   - Name z.B. "bewerbungstracker"
   - "Private" wählen (falls nur du Zugang haben willst)
   - "Create repository" klicken

2. **Code auf GitHub hochladen**
   - Auf der nächsten Seite "uploading an existing file" klicken
   - Den gesamten Projekt-Ordner per Drag-and-drop hochladen
   - Unten "Commit changes" klicken

3. **Auf Vercel deployen**
   - https://vercel.com öffnen, mit GitHub anmelden
   - "Add New..." → "Project" klicken
   - Das eben erstellte Repository auswählen → "Import"
   - Framework wird automatisch als "Vite" erkannt
   - "Deploy" klicken
   - Nach ~30 Sekunden ist die App online unter `[name].vercel.app`

### Variante B: Ohne GitHub (Vercel CLI)

```bash
npm install -g vercel
cd bewerbungstracker
vercel
```
Den Anweisungen folgen, fertig.

## Lokal entwickeln

```bash
npm install
npm run dev
```

Dann http://localhost:5173 öffnen.

## Technik

- React 18 + Vite
- Tailwind CSS
- Lucide Icons
- localStorage für Persistenz (keine Datenbank nötig)

## Wichtig: Daten-Speicherung

Daten werden ausschließlich im Browser des Benutzers gespeichert (`localStorage`). Das bedeutet:

- Daten bleiben auch nach Schließen des Browsers erhalten
- Beim Wechsel auf einen anderen Browser/Gerät: keine Synchronisation
- Bei Browser-Cache-Löschung: Daten weg
- **Daher: regelmäßig "Backup speichern" im Dashboard nutzen**
- Backup-Datei ist eine JSON-Datei und kann jederzeit über "Backup laden" wiederhergestellt werden

## CV-Anpassung pro Stelle

Die App generiert keinen CV automatisch. Stattdessen erstellt sie einen optimierten Prompt mit allen relevanten Daten und öffnet Claude.ai. Der Benutzer fügt dort den Prompt ein, kopiert das Ergebnis zurück. Vorteile: kostenlos, sicher, neuestes Modell.
