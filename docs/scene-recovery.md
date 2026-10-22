# Hero scene recovery

## Root cause and ownership

The repository loads the original `/models/character.enc?v=2`. Decrypting and inspecting its GLB scene confirms one skinned character rig plus eight workstation roots (chair/support, monitor/light, keyboard, floor, desk and supporting planes). There is no separate wrong character import. Previously those furniture roots remained visible in Hero, while three independent GSAP timelines captured and wrote the same camera position and model rotation. Hero projection then ran on top of whichever camera state those timelines retained through refresh or resize. This allowed the lower body and workstation to occupy the portrait viewport.

The loader now only loads/disposes the asset. One presentation controller owns the root rotation, camera position/projection, section activation and furniture visibility. It derives state from current section bounds rather than remembered tween start values. Hero and About hide the eight furniture roots; What I Do restores their original visibility. No model mesh, asset, material or skeleton was deleted. Tech Stack retains its independent R3F canvas.

## Character, camera and motion

The original intro clip establishes its authored final pose before rendering. The frozen development acceptance capture disables mixer motion, pointer tracking and scroll presentation. It shows the original forward-facing cap, full face, shoulders and torso.

Head bounds were measured as approximately `[-1.473, 11.903, -1.013]` to `[1.454, 14.883, 1.662]`. Portrait framing uses these bounds and the actual layout slot. At 1440×900, Hero root rotation is `[0,0,0]`, scale `[1,1,1]`, and camera position is approximately `[-0.009,12.133,34.946]`. Those values return after visiting What I Do. About fits its existing left column. What I Do fits the original seated rig and workstation; the surrounding ground remains visible but does not determine camera distance.

The mixer owns bones, bounded pointer response applies only in Hero, and the presentation controller owns root/camera transforms. GSAP now owns only Hero text presentation and existing light entrance. Renderer resizing leaves CSS canvas dimensions in control. The light entrance no longer overwrites the responsive rim position.

## White strip and rectangular backdrop

The GLTF has a wide light tabletop, confirmed in the What I Do capture. It was previously unscoped and is now excluded from Hero along with all furniture. The earlier preloader midpoint clip is already absent; its exit remains opacity-only. The supplied brief did not include the original strip screenshot, so its historical pixels cannot be attributed exclusively to the desk or loader. Both possible sources are now excluded from Hero.

Canvas alpha and clear color were inspected: alpha enabled, clear RGBA `[0,0,0,0]`, transparent CSS, and no scene background. Existing radial atmospheric styling is retained. Hero's bottom alpha fade is now scoped to Hero, and the Hero rim is hidden during About/inactive ownership. The workstation no longer inherits the portrait mask.

## Verification

Actual Chromium/WebGL captures and state inspection cover 1920×1080, 1440×900, 1280×800, 1024×768, 768×1024, 390×844 and 360×800; additionally 1440×600. Checks cover frozen Hero, normal resting pose, idle, pointer left/right, partial scroll, About, desktop/mobile What I Do, reverse scroll, top refresh, refresh at `#expertise`, breakpoint resize and development hot reload. The short tablet layout scrolls vertically to its CTAs.

All Hero snapshots contain one character canvas, no visible furniture, no horizontal overflow and no context loss. Refresh at `#expertise` restores workstation ownership; returning top restores Hero ownership. Tech Stack spheres render in their separate canvas while the shared character is inactive. Browser capture recorded no runtime exceptions, console errors, WebGL errors or failed asset requests.

TypeScript and production build (`npm run build`), ESLint (`npm run lint`) and `git diff --check` pass. There is no configured test command. Vite retains its existing large-chunk warning. Verification used Chromium software WebGL, not physical mobile hardware or other browser engines.

## Files changed in this repair

- `src/components/Character/Scene.tsx`
- `src/components/Character/utils/character.ts`
- `src/components/Character/utils/heroFraming.ts`
- `src/components/Character/utils/lighting.ts`
- `src/components/Character/utils/resizeUtils.ts`
- `src/components/utils/GsapScroll.ts`
- `src/components/styles/Landing.css`
- `src/components/styles/WhatIDo.css`

Captures and inspection JSON: `docs/qa/scene-recovery/`.

Pre-repair working-tree archive: `/tmp/sumitport-before-scene-recovery-20261022.tar.gz`. Existing uncommitted work was preserved. No publishing, package changes or unrelated content changes were made.
