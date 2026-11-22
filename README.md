<div align="center">

# ✈ Aero Flight

**Free focus timer. No signup.**

Turn every focus session into a flight. Pick a route, tear your boarding pass, watch your plane cross a real world map, and land safely when the timer ends.

[**Live demo**](https://fabulous-sable-77557b.netlify.app) · [Report a bug](https://github.com/shubhamgtm) · [Join the Discord](https://discord.gg/Prr3ux4Kc2)

![HTML5](https://img.shields.io/badge/HTML5-121421?style=flat&logo=html5&logoColor=eaff00)
![CSS3](https://img.shields.io/badge/CSS3-121421?style=flat&logo=css3&logoColor=eaff00)
![JavaScript](https://img.shields.io/badge/JavaScript-121421?style=flat&logo=javascript&logoColor=eaff00)
![PWA](https://img.shields.io/badge/PWA-installable-121421?style=flat&logoColor=eaff00)
![No signup](https://img.shields.io/badge/signup-none-eaff00?style=flat&labelColor=121421)

<!-- Add your own screenshots to the docs/ folder, then uncomment: -->
<!-- ![Aero Flight on desktop](docs/screenshot-desktop.png) -->
<!-- ![Aero Flight on mobile](docs/screenshot-mobile.png) -->

</div>

---

## About

Aero Flight is a free, browser-based focus timer that works as a commitment device. Instead of staring at a plain countdown, you choose a departure and destination airport, tear a boarding pass, and "fly" for as long as you set the timer. The **timer length decides your session, not the flight distance**.

There are no accounts and no backend. Everything is stored in your browser, and once loaded the app works offline.

## Features

| | |
|---|---|
| 🎫 **Boarding pass ritual** | Drag the stub (or press *Tear & board*) to commit to the session. |
| 🗺️ **Live world map** | Your plane follows the real great-circle route as time passes (OpenStreetMap by default, Google Maps optional). |
| 🔊 **Cabin ambience** | Steady generated cabin noise with its own volume. Loops seamlessly, no audio files. |
| 🎵 **Your own music** | Paste a YouTube or Spotify link (playlist, album, video, track). Playlists are saved in your browser and keep playing while you work. |
| 🔓 **Unlockable routes** | Start with short regional hops; every completed flight extends your reach by 600 km. |
| 🧘 **Pure Mode** | Only the timer and a thin progress bar. Exit with **Esc** or a double-tap. |
| 🌓 **Dark & light themes** | Follows your device, with a manual toggle that is remembered. |
| 📱 **Responsive** | Built for phones, tablets, laptops and desktops, portrait and landscape. |
| 📦 **Installable PWA** | Add it to your home screen or desktop. Works offline after the first load. |
| 📒 **Flight log & sharing** | See your recent flights and share a completed flight. |
| 🔒 **Private** | No accounts, analytics or ads. Data never leaves your device. |

Pages: Home · About · Aero Flight for Students · Aero Flight for Developers · Privacy.

## Quick start

Aero Flight is plain HTML, CSS and JavaScript. There is no build step and nothing to install except a way to serve the folder (the offline service worker needs `http://localhost` or HTTPS).

```bash
git clone https://github.com/shubhamgtm/<your-repo-name>.git
cd <your-repo-name>
python -m http.server 8000      # or: npx serve
```

Open <http://localhost:8000/>.

## Deploy

Upload the folder to any static host that provides HTTPS, for example **Netlify** (drag the folder onto *Deploys*), **GitHub Pages** or **Cloudflare Pages**. No settings are needed.

> **After you change any file, raise `VERSION` in `sw.js`** (for example `aero-flight-v9`). Otherwise visitors who already installed the app keep seeing the cached old version. Reload twice to pick up an update.

## Install as an app

- **Android / Chrome / Edge (desktop):** use the *Install* button in the header or on the home page.
- **iPhone / iPad:** open in Safari, tap **Share**, then **Add to Home Screen**.

## How to use

1. On the home page choose a duration (25 / 50 / 90 minutes or a custom 5-180) and an intent (Study, Work or Create).
2. Pick your departure airport and an unlocked destination.
3. Tear the boarding pass to start the flight.
4. Focus. Open **Ambience** or **Music** if you like, or switch to **Pure Mode**.
5. When the timer ends you land safely, unlock new destinations, and can share the flight.

Ending a flight early with **Abort** does not count.

## Music

- **YouTube:** video, `youtu.be`, shorts and playlist links work. They play inside a privacy-friendly `youtube-nocookie.com` player.
- **Spotify:** playlist, album, track, episode and show links work. Spotify's embedded player plays full songs only if you are logged in to Spotify in the same browser; otherwise you hear 30-second previews.
- Saved playlists live in `localStorage` (up to 20). Music needs an internet connection.

## Use Google Maps (optional)

By default Aero Flight uses OpenStreetMap, which needs no key. To use Google Maps you need **your own API key** and a Google Cloud billing account (Google offers a free monthly allowance; check current pricing).

1. Create a project at <https://console.cloud.google.com/> and link billing.
2. Enable **Maps JavaScript API** and create an API key.
3. Restrict the key (it is visible in the page source): *Websites* with your domain, for example `https://your-site.netlify.app/*` and `http://localhost:8000/*`, and *API restriction* to Maps JavaScript API.
4. In `app.js`, set `const GMAPS_KEY='YOUR_KEY';` and redeploy.

If Google rejects the key, the app falls back to OpenStreetMap automatically. OpenStreetMap's public tile server is meant for light use; for a very busy site use Google Maps or another tile provider.

## Customize

All settings are near the top of `app.js`:

| What | Where |
|------|-------|
| Your links (GitHub, Discord, email, featured project) | `LK` |
| "More from" project cards | `PROJECTS` |
| Airports (code, city, latitude, longitude) | `AP` |
| Seat types per intent | `SEAT` |
| Unlock speed (km gained per completed flight) | `reach()` and the lock hint in the `plan` view (default `600`; change both) |
| Google Maps key | `GMAPS_KEY` |
| Colors and themes | CSS variables at the top of `style.css` |

## Project structure

```text
AeroFlight/
├── index.html              # page shell, header, footer, panels
├── style.css               # dark/light themes and responsive layout
├── app.js                  # all application logic
├── sw.js                   # service worker (offline cache)
├── manifest.webmanifest    # PWA manifest
├── icon.svg                # app icon
├── icon-192.png            # app icons
├── icon-512.png
├── icon-maskable-512.png
├── docs/                   # put screenshots here
├── LICENSE
└── README.md
```

## Tech stack

- Vanilla **HTML, CSS and JavaScript** (no framework, no build step)
- **Web Audio API** for generated cabin noise and the landing chime
- **Service Worker + Web App Manifest** for offline use and installation
- **Leaflet** (pinned `1.9.4` from jsDelivr) with OpenStreetMap tiles, or the **Google Maps JavaScript API**
- YouTube and Spotify **embedded players** for music
- `localStorage` for all saved data (key: `aeroflight.v1`)

## Browser support

Current versions of Chrome, Edge, Firefox and Safari on desktop, Android and iOS. Installing as an app works in Chrome, Edge and Safari (via *Add to Home Screen*). Full screen is not available on iPhone Safari.

## Privacy

Aero Flight collects **no personal data**. Your flights, settings, playlists and theme are stored only in your browser. Location is never required; if you choose *Use my location*, it is used once to suggest the nearest airport and is not stored or sent anywhere. Third parties contacted: jsDelivr (map library), OpenStreetMap or Google Maps (the map), and YouTube or Spotify only when you add and play a playlist. Like any website, they can see your IP address. The Privacy page also has a button to delete all your data.

## Author

**Shubham Gautam**, a developer from Nepal.

- GitHub: [@shubhamgtm](https://github.com/shubhamgtm)
- Discord: <https://discord.gg/Prr3ux4Kc2>
- Email / DM: chat.shubhamgtm@gmail.com (I will respond as soon as possible)

If Aero Flight helps you focus, you can support me by following me on GitHub, giving this repository a ⭐, or sending me a message.

### More from Shubham

- [**QRify**](https://qrifyyy.netlify.app): free QR code generator, no sign-up
- [KeyRush](https://github.com/shubhamgtm/KeyRush-By-Shubham-Gautam)
- [ZipLink](https://github.com/shubhamgtm/ZipLink-By-Shubham)

## Acknowledgements

- [Leaflet](https://leafletjs.com/) (BSD-2-Clause)
- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Google Maps Platform (only if you add your own key)

## License

Released under the [MIT License](LICENSE). You are free to use, modify and share it, as long as the copyright notice stays. Change the license if you prefer a different one.
