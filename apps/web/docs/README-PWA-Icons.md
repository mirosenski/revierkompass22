# PWA Icons Setup

Für die PWA-Funktionalität werden folgende Icons benötigt:

## Erforderliche Icons

1. **pwa-192x192.png** - 192x192 Pixel PNG Icon
2. **pwa-512x512.png** - 512x512 Pixel PNG Icon (maskable)
3. **favicon.ico** - Standard Favicon
4. **apple-touch-icon.png** - Apple Touch Icon (180x180 Pixel)

## Erstellung der Icons

### Option 1: Online Tools
- [PWA Builder](https://www.pwabuilder.com/imageGenerator)
- [Favicon Generator](https://realfavicongenerator.net/)

### Option 2: Manuelle Erstellung
1. Erstellen Sie ein hochauflösendes Logo (mindestens 512x512 Pixel)
2. Exportieren Sie es in den verschiedenen Größen
3. Stellen Sie sicher, dass das 512x512 Icon als "maskable" markiert ist

### Option 3: Aus dem bestehenden Logo
Das bestehende `logo.svg` kann als Basis verwendet werden:
1. Öffnen Sie das SVG in einem Bildeditor
2. Exportieren Sie es in den verschiedenen Größen
3. Speichern Sie die Dateien im `public`-Ordner

## Dateistruktur
```
public/
├── favicon.ico
├── apple-touch-icon.png
├── pwa-192x192.png
├── pwa-512x512.png
└── robots.txt (optional)
```

## Testen der PWA
Nach dem Erstellen der Icons:
1. Führen Sie `npm run build` aus
2. Öffnen Sie die gebaute Anwendung
3. Überprüfen Sie die PWA-Funktionalität in den Browser-Entwicklertools 