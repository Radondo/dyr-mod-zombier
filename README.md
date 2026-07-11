# Dyr Mod Zombier 🐞🐝

A little first-person 3D garden game for the kids — walk around a fenced garden
with animal friends while zombies shuffle about outside. Built with Vite, React,
Three.js (react-three-fiber). UI is in Danish.

**Play:** https://radondo.github.io/dyr-mod-zombier/

## Controls

- **Desktop:** WASD / arrow keys to walk, click-and-drag the mouse to look around.
- **Tablet / phone:** touch the **left** side of the screen for a walking joystick,
  drag the **right** side to look around. Both work at once.

## Develop

```bash
npm install
npm run dev      # local dev server on http://localhost:5090/dyr-mod-zombier/
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the app and
publishes `dist/` to GitHub Pages. In the repo settings, set **Settings → Pages →
Source = GitHub Actions** once. The site's sub-path is configured via `base` in
[`vite.config.ts`](vite.config.ts) and must match the repository name.
