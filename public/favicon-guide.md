# Favicon Implementation Guide

## Required Files
Place these files in the `public` folder:

- `favicon.ico` (16x16, 32x32, 48x48 multi-size ICO)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

## HTML Implementation
Add these tags to your `index.html` in the `<head>` section:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

## Web App Manifest
Create `public/site.webmanifest`:

```json
{
    "name": "Xen-AI",
    "short_name": "XenAI",
    "icons": [
        {
            "src": "/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "theme_color": "#f97316",
    "background_color": "#1f2937",
    "display": "standalone"
}
```
