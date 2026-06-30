# VDJ Punit — Portfolio Website

Your site is fully wired up: HTML + CSS + JS + config.json all talk to each other.
Everything in `config.json` (name, bio, gallery, reels, reviews, events, etc.) auto-populates the page — edit that one file to update content without touching HTML.

## What's left to do: add your real media files

The HTML/JS reference these paths. Drop your actual files in with these exact names (or update the paths in `config.json`):

- `images/hero/hero-video.mp4` — background video for hero section
- `images/hero/hero-photo.jpg` — fallback poster image
- `images/about/profile.jpg` — your photo in the About section
- `images/gallery/club-1.jpg`, `wedding-1.jpg`, `garba-1.jpg`, `festival-1.jpg`, `club-2.jpg`, `wedding-2.jpg` — gallery photos
- `images/reviews/avatar-1.jpg` ... `avatar-4.jpg` — reviewer avatars
- `images/reviews/video-thumb-1.jpg` — thumbnail for video review
- `images/events/event-1.jpg`, `event-2.jpg` — event posters
- `images/press-kit.pdf` — downloadable press kit
- `images/bg-music.mp3` — optional background music

## Also update in `config.json`

- Replace `REPLACE_ID_1` etc. under `reels` with your real Instagram reel URLs
- Replace `REPLACE_VIDEO_ID` and `REPLACE_ID_1/2/3` under `showreel` with your real YouTube video IDs
- If you want booking form emails (not just WhatsApp), set `emailjs.enabled: true` and fill in your EmailJS public key/service ID/template ID (sign up free at emailjs.com), then add this script tag before `js/main.js` in `index.html`:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
  ```

## How it works

- The booking form opens WhatsApp with a pre-filled message — no backend needed.
- Gallery filters, lightbox, reel popups (via Instagram oEmbed), reviews, showreel playlist, and events are all generated dynamically from `config.json` by `js/main.js`.
- All design tokens (colors, fonts, spacing) live in `css/tokens.css` — change a CSS variable there to restyle the whole site.

## To preview

Just open `index.html` in a browser, or run a local server:
```
python3 -m http.server 8000
```
then visit `http://localhost:8000`.
