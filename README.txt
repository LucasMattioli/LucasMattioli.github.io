# Lucas Mattioli — Modular Site

This version is split into small, focused files so you can edit quickly.

```
site_modular/
├─ index.html
├─ assets/
│  ├─ css/
│  │  ├─ base.css          # Colors, fonts, tokens
│  │  ├─ layout.css        # Page layout (single-column, nav, hero, cards)
│  │  ├─ components.css    # Buttons, chips, publication cards
│  │  └─ utilities.css     # Helpers (sr-only, separators, etc.)
│  └─ js/
│     ├─ theme.js          # Light/Dark toggle (optional)
│     ├─ main.js           # Year, small helpers
│     └─ render-publications.js # Build the Work list from JSON
├─ data/
│  ├─ publications.json    # Edit this file to update the Work section
│  └─ news.json            # Edit this file for the News section
└─ img/                    # Place your images here (portrait, thumbnails, etc.)
```

## How to update content
- **About** text → edit the paragraph in `index.html` (class `about-blurb`).
- **Work/Selected publications** → edit `data/publications.json`.
- **News** → edit `data/news.json`.

## Colors (palette)
- sand `#F3F3E0`, navy `#133E87`, sky `#608BC1`, powder `#CBDCEB`.
Change once in `assets/css/base.css` (`:root` variables).

## Deploy
- Drag the whole folder to GitHub Pages / Netlify / Vercel as a static site.
