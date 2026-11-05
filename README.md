# Daily Data

A mobile-first data analyst learning app, now installable as a Progressive Web App.

## Install on a phone

Open the deployed HTTPS website in a regular browser.

- **iPhone / iPad:** open in Safari, tap Share → Add to Home Screen. Keep Open as Web App enabled if offered, then tap Add.
- **Android:** open in Chrome, then use Install app / Add to Home screen from its menu. If the browser offers an installation prompt, Progress → Install Daily Data opens it.
- **Other browsers:** Progress → Add to home screen shows instructions. Installation availability depends on the browser.

The app uses the existing orange Daily Data logo and opens in a standalone window. No app store is needed. Installation itself has not been tested on a physical iPhone or Android device.

## Offline use and updates

Visit once online and wait until Progress says **Lessons ready for offline reading**. The application, all 54 lessons and their illustrations are then cached. Optional Google Fonts use system fallbacks without network access.

Progress and private notes stay in browser localStorage; they do not sync between devices. Installing on some platforms can create a different storage context. Export a backup from Progress before installing or switching browsers, then restore if needed.

For future application updates, bump `CACHE` in `sw.js` whenever changing a cached file. The new release downloads in the background and becomes active after existing app windows close, keeping HTML and scripts from the same release. Device/browser storage eviction can remove offline files and local progress.

## Vercel

Deploy this repository as a static website with the repository root as the output. No build command or dependency installation is required. `vercel.json` prevents stale service-worker and manifest HTTP caching. Service workers need HTTPS (or localhost for development).

## Validation

- JavaScript syntax passed for `pwa.js` and `sw.js`.
- Manifest icon paths and PNG dimensions verified: 192, 512, maskable 512 and Apple touch 180 pixels.
- Browser verified: offline-ready indicator, installation help opens and closes, no initial console errors.
- Stopped the local web server, reloaded the app successfully, navigated to Today and opened a lesson from the cached release.

## Files

`index.html`, `style.css`, `app.js`, `content.js`: learning app.

`manifest.webmanifest`, `pwa.js`, `sw.js`, `icons/`: installation and offline support.
