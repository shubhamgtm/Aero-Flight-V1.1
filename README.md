# Aero Flight

**Free focus timer. No signup.** Aero Flight turns every focus session into a flight: pick a route, tear your boarding pass, and land safely when the timer ends. It is a static Progressive Web App (plain HTML, CSS and JavaScript, no build step) that works offline once loaded.

Made by **Shubham Gautam**, a developer from Nepal.
GitHub: [@shubhamgtm](https://github.com/shubhamgtm) · Discord: <https://discord.gg/Prr3ux4Kc2> · Email / DM: chat.shubhamgtm@gmail.com

## Run it

The service worker (offline mode) needs `http://localhost` or HTTPS, so serve the folder:

```bash
cd AeroFlight
python -m http.server 8000
```

Open <http://localhost:8000/>. To put it online, upload the folder to any static host with HTTPS (Netlify, GitHub Pages, Cloudflare Pages). **After changing any file, raise `VERSION` in `sw.js`** so installed copies update.

## Features

- **Works on every screen**: phones, tablets, laptops and desktops, portrait and landscape, with safe-area support for notched phones
- **Dark and light mode**: toggle in the header, follows your device by default, remembered between visits
- **Flights**: home airport, destination, seat type (Study / Work / Create), generated boarding pass with a tear animation
- **Live world map**: Google Maps (with your key) or OpenStreetMap; your plane flies the real great-circle route as the timer counts down (offline fallback: a themed route map)
- **Music**: paste a YouTube or Spotify link (playlist, album, video or track), save playlists in your browser, and keep them playing while you focus. Music keeps playing when you close the panel or move between pages
- **Cabin ambience**: steady generated noise with its own volume
- **Unlock system**: start with regional hops, each completed flight extends your reach by 600 km
- **Pure Mode**: only the timer and a thin progress bar. Exit with Esc or a double-tap
- **Flight log, share button, full screen, screen wake lock, resume after reload**
- **Installable** on Android, iOS and desktop; works offline
- **Pages**: Home, About, Students, Developers, Privacy (with a "delete my data" button)
- **Creator section**: GitHub follow, Discord invite, email, featured project (QRify), and more projects (KeyRush, ZipLink)

## Music notes

- YouTube: video links, `youtu.be` links and playlist links all work; they play inside a privacy-friendly `youtube-nocookie.com` player.
- Spotify: playlist, album, track, episode and show links work. Spotify's embedded player plays full songs only if you are logged in to Spotify in the same browser; otherwise it plays 30-second previews.
- Music needs an internet connection and is not available offline.

## Use Google Maps (optional)

Google Maps needs **your own API key** and a Google Cloud billing account (there is a free monthly allowance; check current pricing). Without a key, OpenStreetMap is used.

1. Create a project at <https://console.cloud.google.com/> and link billing.
2. Enable **Maps JavaScript API** and create an API key.
3. Restrict the key (it is visible in the page source): *Websites* restriction with your site, e.g. `https://your-site.netlify.app/*` and `http://localhost:8000/*`, plus *API restriction* to Maps JavaScript API.
4. In `app.js`, set `const GMAPS_KEY='YOUR_KEY';` and redeploy.

If Google rejects the key, the app switches to OpenStreetMap by itself. OpenStreetMap's public tile server is for light use; for a very popular site use Google Maps or another provider.

## Edit the creator links and projects

Open `app.js` and find `LK` (GitHub, Discord, email, QRify URLs) and `PROJECTS` (name, link, one-line description for each project). Change the descriptions to say what each project does.

## Files

```text
index.html              page shell, header, footer, panels
style.css               themes (dark/light) and responsive layout
app.js                  all app logic
sw.js                   service worker (offline cache)
manifest.webmanifest    PWA manifest
icon.svg, icon-*.png    app icons
```

## Privacy

No accounts, analytics, ads or tracking. Settings, flights, playlists and theme live in your browser's `localStorage` only. Location is never required. Third parties contacted: jsDelivr (map library), OpenStreetMap or Google Maps (map), and YouTube/Spotify only if you add and play a playlist. Like any website they can see your IP address.

## License

Add the license of your choice.
