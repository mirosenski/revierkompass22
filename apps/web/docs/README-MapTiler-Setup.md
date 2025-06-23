# MapTiler API Setup

## Problem
Die Kartenfunktionalität benötigt einen MapTiler API-Schlüssel. Ohne diesen Schlüssel wird ein 403-Fehler angezeigt.

## Lösung

### Option 1: MapTiler API-Schlüssel verwenden (empfohlen)

1. Gehen Sie zu [MapTiler Cloud](https://www.maptiler.com/cloud/) und erstellen Sie ein kostenloses Konto
2. Erstellen Sie einen neuen API-Schlüssel
3. Erstellen Sie eine `.env` Datei im `apps/web/` Verzeichnis:

```bash
# apps/web/.env
VITE_MAPTILER_KEY=ihr_maptiler_api_schluessel_hier
```

### Option 2: Fallback verwenden (bereits implementiert)

Die Anwendung verwendet automatisch einen kostenlosen Fallback (CartoDB Positron), wenn kein MapTiler API-Schlüssel verfügbar ist.

## Vorteile von MapTiler

- Bessere Kartendaten
- Höhere Anfrage-Limits
- Mehr Styling-Optionen
- Bessere Performance

## Fallback-Optionen

Wenn Sie keinen MapTiler API-Schlüssel verwenden möchten, können Sie auch andere kostenlose Kartenanbieter verwenden:

- CartoDB Positron (bereits implementiert)
- OpenStreetMap
- Stamen Maps

## Hinweis

Stellen Sie sicher, dass die `.env` Datei nicht in Git eingecheckt wird (sollte bereits in `.gitignore` stehen). 