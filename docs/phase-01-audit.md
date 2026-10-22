# Portfolio 3.0 — Phase 01 audit and implementation

Scope: stabilize the existing repository; retain section designs, professional content, URLs, models, images and metadata. Phase 02 has not started.

Local development URL: **http://127.0.0.1:5175/**. Port 5173 was taken over by another local project during the final handoff; this checkout now runs on an explicitly selected port. Earlier browser evidence was captured while 5173 served this portfolio.

## 1. Architecture found

Installed versions (from `npm ls`, rather than package.json version ranges): React 18.3.1, TypeScript 5.9.3, Vite 5.4.21, GSAP 3.14.2, Three.js 0.168.0, React Three Fiber 8.18.0, Drei 9.122.0, Rapier 1.5.0, React Three Postprocessing 2.19.1. ESLint 9 with TypeScript and React hooks rules. TypeScript uses strict mode and noEmit. No application test runner/script is configured.

| Owner | Responsibility and dependencies |
| --- | --- |
| `src/main.tsx` → `src/App.tsx` | React StrictMode, lazy main content and character, loading provider; optional scene error boundary |
| `src/context/LoadingProvider.tsx` / `src/components/Loading.tsx` | Readiness/fallback timeout, inert main content, loading scroll lock, indeterminate preloader; optional entrance starts after exit |
| `src/components/MainContainer.tsx` | Section order, responsive character mount, split-text cleanup, deferred desktop TechStack loading |
| `src/components/Navbar.tsx` | Sole ScrollSmoother lifecycle owner, active navigation, mobile dialog, initial hash restoration |
| `src/components/utils/smoother.ts` | Shared smoother reference, scroll locks and anchor offsets |
| `src/components/Character/Scene.tsx` | One manual Three renderer for Hero/About/Expertise; pointer/head tracking, animation mixer, scene visibility and disposal |
| `src/components/Character/utils/character.ts` | Encrypted GLTF fetch/decrypt, Draco, compile and geometry/material/texture disposal |
| `src/components/Character/utils/lighting.ts` | HDR environment, key/rim/screen lights and their entrance |
| `src/components/utils/GsapScroll.ts` | Character rotation, camera Y/Z and model-container scroll transforms |
| `src/components/WhatIDo.tsx` | Accordion and shared model placement via root data attributes/CSS variables; no separate workstation canvas |
| `src/components/Landing.tsx`, `About.tsx` | Hero scroll cue, About reveal, anchor actions; semantic copy remains HTML |
| `src/components/Career.tsx` | Locally scoped GSAP context: section progress and five experience/education entries |
| `src/components/Work.tsx`, `WorkImage.tsx` | Fourteen-slide CSS carousel, project links, lazy images and third-party screenshot fallback |
| `src/components/Achievements.tsx`, `Skills.tsx`, `Contact.tsx` | Four achievements, eight skill categories, existing contact/footer content |
| `src/components/TechStack.tsx` | Separate desktop R3F renderer, 30 shared-geometry spheres, Rapier physics, HDR and N8AO |
| `src/components/SocialIcons.tsx`, `Cursor.tsx`, `HoverLinks.tsx` | Fixed socials, nonblocking pointer follower, intentionally clipped hover-label copy |
| `src/index.css`, `src/App.css`, component stylesheets | Global tokens and containers; ordinary component CSS, no additional styling system |

No Motion/Framer Motion or Lenis is used. CSS owns hover/menu/reveal transitions, GSAP owns entrance and scroll timelines, Three owns bone tracking/rendering, and React owns state. Shared state requiring care: the smoother reference, root `data-what-*`/`--what-model-*`, the persistent character canvas/camera, and module-cached sphere textures/geometry.

Assets: 38 tracked public files were SHA-256 compared against the checkpoint, with **zero changes**. The encrypted character is approximately 2.2 MiB; its HDR is approximately 292 KiB. Public images total approximately 38 MiB, including several legacy 6–7 MiB PNGs. These were preserved. Unused progress simulation utility and unused installed dependencies (including Cannon, marquee, GSAP React integration, Vercel analytics) were identified but retained; fake progress is not connected to the loader.

## 2. Confirmed root causes

1. **Loader-owned access depended on an optional import.** Body overflow and the paused smoother were released inside `initialFX`; a failed import could leave scrolling locked. The entrance also had no lifecycle cleanup or SplitText restoration.
2. **Independent scroll locks conflicted.** The menu changed body overflow without pausing ScrollSmoother; its release could conflict with loading. Removing the scrollbar changed text wrapping/page height, causing mobile Contact to land 173–255 px too early in browser tests.
3. **Menu focus ran while CSS visibility was still hidden.** Browser focus traces showed the dialog hidden for the first frames; focusing an anchor then left focus on BODY.
4. **Active navigation kept stale state.** The observer considered only entries delivered in one callback, and never cleared the last active label between linked sections.
5. **Anchor behavior was duplicated.** Different 92/100 px offsets were embedded in Hero, About and Navbar; initial hashes were not explicitly restored after loading/layout measurement.
6. **A future scene timeline overwrote the Hero transform immediately.** What I Do's `fromTo` applied `x: -25%` during initialization, producing `translate(-50%) translate(-25%)` before scrolling. Browser inspection and screenshots confirmed the displaced Hero.
7. **Visual/render boundaries were incomplete.** The blurred rim could extend outside the model stage; the fixed character kept rendering beyond its sections. Context loss and document invisibility did not fully stop the RAF loop.
8. **Reduced-motion CSS was nested in the <=900 px media query.** Desktop users missed the global rule; split-text and screen-light pulse also ignored the preference.
9. **TechStack incurred work while offscreen.** Lazy code was requested immediately at page mount; inactive state only stopped impulses, not rendering/physics. No explicit DPR cap or material cleanup; impulse/pointer updates allocated vectors every frame.
10. **Cursor RAF ran continuously and its visual could linger after leaving the page.** No window-leave/blur/scroll reset.
11. **Hidden carousel slides remained keyboard reachable.** All project links stayed in the tab order despite being clipped offscreen.
12. **Unexplained spacing compensation.** TechStack's -100 px bottom margin canceled Contact's spacing and coupled their layout.

Existing navbar hover-label clipping was already correct and preserved. The semantic Hero/About/Expertise/Career/Work section boundaries were already in normal flow; none were rebuilt or pinned.

## 3. Exact files modified

Paths below are relative to the repository root `/Users/sumitthakur/Documents/GitHub/Sumitport`.

| File | Purpose |
| --- | --- |
| `src/index.css` | Reusable foundation tokens, stable scrollbar gutter, native scroll baseline, reduced-motion rule at all widths, remove obsolete main fade and TechStack negative margin |
| `src/App.css` | Consume content/spacing tokens; remove misplaced mobile-only reduced-motion rule |
| `src/App.tsx` | Isolate optional character failures |
| `src/context/LoadingProvider.tsx` | Own loading lock/inert state and cancellable optional entrance lifecycle |
| `src/components/Loading.tsx` | Remove scroll/entrance responsibility; synchronize exit timing with CSS |
| `src/components/styles/Loading.css` | Restore dark capsule and fit editorial loading text to the viewport |
| `src/components/utils/initialFX.ts` | Scoped GSAP context and SplitText restoration; no scroll ownership |
| `src/components/utils/smoother.ts` | Loading/menu lock ownership, token offset and shared anchor helper |
| `src/components/Navbar.tsx` | Reliable active tracking, hash restoration, scroll/focus/menu cleanup, breakpoint close |
| `src/components/styles/Navbar.css` | Header/nav tokens, 44 px toggle, scrollable short-screen menu and immediate opening visibility |
| `src/components/Landing.tsx` | Use shared anchor helper; copy/layout unchanged |
| `src/components/About.tsx` | Use shared anchor helper; copy/layout unchanged |
| `src/components/utils/GsapScroll.ts` | Prevent future timeline immediate rendering; respect reduced-motion for light pulse |
| `src/components/utils/splitText.ts` | Skip optional text motion with reduced-motion preference |
| `src/components/Character/Scene.tsx` | Intro after loader exit, visibility/context-aware RAF, listener cleanup, decorative semantics |
| `src/components/styles/Landing.css` | Bound rim decoration to existing model canvas box |
| `src/components/Cursor.tsx` | RAF only while settling; hide/reset on leave, blur and scroll; decorative semantics |
| `src/components/SceneBoundary.tsx` | New error boundary preventing optional scene failures from removing page content |
| `src/components/MainContainer.tsx` | Stable scene fallback and defer TechStack request until within 800 px of view |
| `src/components/TechStack.tsx` | Cap DPR at 1.5, pause offscreen physics/rendering, reuse vectors, dispose materials, reduced-motion text fallback |
| `src/components/Work.tsx` | Inactive slides inert/aria-hidden; all project content and URLs unchanged |
| `docs/phase-01-audit.md` | This audit, ownership contract, evidence and follow-up limits |
| `docs/qa/phase-01/*` | Browser measurements and selected screenshots |

Git started clean on `main` at `839ac5a`. A non-destructive branch, **`checkpoint/portfolio-3-phase-01`**, preserves that exact state. No reset, clean, history rewrite, asset deletion, dependency installation or publishing was performed. `dist/` is ignored build output. Existing tracked `.tsbuildinfo` cache changes are restored to their checkpoint contents after validation.

## 4. Foundation and ownership rules

Existing mint/lavender/dark colors remain canonical. Added secondary background, elevated surface, muted text, pink and border tokens. Added display/editorial/section/subheading/body/description/navigation/metadata/button font sizes; body line height/copy measure; a five-step spacing scale, column gap, gutter, content width, header height and scroll offset. These are a foundation for later prompts; section typography has not been restyled wholesale.

Global layers remain small and explicit: character 0, content 1, navigation fade 10, socials 20, cursor 30, navbar 50, mobile navigation 60, loading 100. Local stacking contexts retain their own internal order. Canvas containment and visibility fix the visual boundary rather than lifting every text layer.

Existing breakpoint responsibilities: 720 px navigation; 768 px global gutters; 820 px service layout; 900 px general compact content/split text; 1024 px character mount and desktop TechStack; 1060 px navbar email. Individual section breakpoints are deliberately retained. CSS media queries cannot consume custom properties, so these boundaries are documented rather than represented by nonfunctional CSS variables.

Future changes should preserve these contracts:

- Natural document flow owns section height; animations do not create section spacing.
- Navbar creates/kills the single smoother. `setScrollLocked` owns loading/menu access. `scrollToSection` owns offsets.
- Loading completion never depends on optional entrance code; the 8-second readiness fallback remains.
- Character timeline utilities own camera Y/Z and scroll poses; Scene owns camera X/pointer and bones. Later timelines must not initialize over earlier section transforms.
- Scene, Career, Navbar, split-text and entrance effects clean up their own work; do not globally kill other components' triggers.
- The shared workstation is the existing character model. No additional character canvas was introduced.
- Static HTML remains readable with failed WebGL or reduced motion. Offscreen carousel links must stay inert.

## 5. Browser verification

Chrome DevTools Protocol was used against the actual running app, including real screenshots, element rectangles, click/key/wheel events, reloads and network blocking. React StrictMode remained enabled.

### Responsive matrix

| Viewport | Layout and navigation |
| --- | --- |
| 360 × 800 | No horizontal overflow/duplicate IDs; mobile menu; all five anchors land at 100 px after follow-up repair |
| 390 × 844 | Same; focus/lock/escape and Contact independently retested |
| 768 × 1024 | Desktop links visible, mobile toggle hidden; all anchors and section progression checked |
| 1024 × 900 | Compact character layout; desktop links and all anchors checked |
| 1280 × 900 | Desktop layout, email and all anchors checked |
| 1440 × 1000 | Desktop layout plus shared character and sphere WebGL screenshots |
| 1920 × 1080 | Wide layout, all anchors and reverse section progression checked |

First-pass measurements are in [responsive-initial.json](qa/phase-01/responsive-initial.json); they intentionally include the mobile Contact defect found during testing. A final seven-width recheck after all code changes is in [responsive-final.json](qa/phase-01/responsive-final.json). Corrected interaction measurements are in [functional-final.json](qa/phase-01/functional-final.json). `scrollWidth - innerWidth` was -15 px due to the reserved scrollbar, not overflow. Short Contact sections on desktop end at the document bottom instead of artificially adding space to force their top to 100 px.

Verified:

- Loader exit, unlocked/inert=false page, single visible resting nav label per item, no duplicate IDs. Final handoff at `127.0.0.1:5175` confirmed the portfolio title, mobile overflow=0 and loader/inert=false. Both preloader text lines fit their 327 px container at 390 px viewport width; see [mobile preloader](qa/phase-01/mobile-preloader.png).
- About/Work/Achievements/Skills/Contact anchors; home; direct `#about` and reload restore to 100 px.
- Hero→About, About→Expertise, Expertise→Career and Career→Work normal-flow boundaries; top-to-bottom and reverse navigation. Adjacent early-section boundaries matched without intersection.
- Mobile focus on About after opening, Tab wrap, Escape/focus return, wheel lock, close-on-link and close-on-desktop resize. Emulated touch taps open the menu and navigate to Skills at 100 px; the cursor is hidden on touch. All background content is inert while the dialog is open.
- Four service toggles; Career selection moves aria-pressed; carousel advances to Telemedicine Platform with only the active slide keyboard reachable and all 14 projects retained.
- Reduced motion at desktop width: loader exits, cursor stays hidden, Hero text remains, CSS animation duration reduces, TechStack exposes its eight text labels.
- Blocked optional entrance import: loader exits, main becomes interactive, Hero text remains visible and About still scrolls.
- Blocking the character chunk exercised the 8-second readiness timeout: loader exited, main was interactive, Hero text remained and no character node mounted. Evidence is recorded in [failure-final.json](qa/phase-01/failure-final.json). The separate failed model-request test could not be completed: the software WebGL renderer stalled before its result could be read. This case is **unverified**, not a pass.
- Cursor is pointer-events:none, appears after pointer movement and disappears on scroll.
- TechStack module was absent from startup resource entries and appeared only on approaching the section; fallback contains all eight technology labels.
- Production preview smoke: metadata/title and all eight primary section IDs present, loader exits, Work anchor lands at 100 px with correct active state.

WebGL checks: original character rendered in Hero and About; workstation remained within its mobile slot (337 × 390 px at 390-wide viewport); desktop technology spheres rendered with their original textures. One character canvas on compact view, two total on desktop when the sphere scene is mounted. The character becomes hidden offscreen and resumes on reverse navigation. Selected evidence: [desktop Hero](qa/phase-01/desktop-hero.png), [desktop About](qa/phase-01/desktop-about.png), [desktop TechStack](qa/phase-01/desktop-tech.png), [mobile workstation](qa/phase-01/mobile-expertise.png), [mobile Contact](qa/phase-01/mobile-contact.png).

Console interpretation: the seven-width pass had no uncaught runtime exceptions. Deliberately disabled WebGL produces Three.js context-creation diagnostic errors, including duplicate development StrictMode attempts; the page remains usable. Network-blocking cases generate expected failed-request diagnostics. These are not being presented as a zero-error console. No hardware FPS, Lighthouse score, screen-reader certification, real-device Safari test or external project-site uptime claim is made. Software WebGL sessions slowed/stalled under repeated HMR; screenshots were captured in successful sessions and fresh sessions used for follow-up. A transient screenshot during entrance is not evidence of the settled layout. The later mobile Hero DOM check confirmed loader=false, visible actions and one canvas, but its settled screenshot timed out. WebGL context restoration was not separately tested.

## 6. Build and quality checks

- `npm run lint`: passes with no warnings.
- `npm run build`: passes, including configured `tsc -b` strict TypeScript checks.
- `git diff --check`: passes.
- No existing unit/integration test suite is configured; browser checks above were run directly through Chrome/CDP.
- Public asset hash comparison: 38/38 unchanged. Career, Achievements, Skills, Contact, metadata and dependency manifests unchanged. Hero/About/Work data and URLs preserved.
- Large-bundle warning remains: TechStack approximately **2,479.50 kB minified / 928.53 kB gzip**; shared RGBELoader/Three-related chunk **687.66 kB / 178.16 kB gzip**. Deferring TechStack changes request timing, not total bundle size. No warning threshold was raised to hide this.

## 7. Remaining issues and limits

**Critical global blockers:** none found in the completed checks; the browser limits below still apply.

**Minor / deferred section work:**

- Hero/About character framing remains intentionally large. About's cap can meet/cross the top composition boundary. These camera/art-direction decisions belong to their dedicated prompts.
- Desktop workstation framing and compact-screen monitor visibility need the dedicated What I Do pass; its original geometry remains intact, its mobile canvas matches the reserved slot, and service controls remain separate.
- TechStack's white heading overlaps pale spheres and loses contrast. This is local scene/title composition, retained for the TechStack prompt. Postprocessing quality and deeper Rapier/WASM bundle work remain.
- Crossing the 1024 px breakpoint still remounts the character because the original architecture moves it between parent containers. Cleanup and single-canvas counts were checked; a persistent-mount redesign is deferred.
- External Google Font and three screenshot-service previews are network dependent; existing image fallbacks remain. The dormant video path in WorkImage has object-URL lifecycle debt but no current project supplies video.
- Legacy large images, unused dependencies, empty exports file and unused fabricated-progress utility remain available, outside this controlled repair scope. No fake loading percentage is displayed.
- Injected model-request failure and WebGL context restoration remain unverified; hardware-browser follow-up is needed for those paths.
- Full accessibility certification and hardware/device performance profiling were not performed. Reduced-motion is read on component mount; reload after changing the OS preference for all JS effects to adopt it.

## 8. Phase 02 readiness

The stabilized foundation is ready for a bounded Hero redesign, subject to the documented local composition and device-testing limits. A reversible checkpoint exists; content/assets are preserved; build/lint and the available browser checks pass. **Phase 02 was not started.**
