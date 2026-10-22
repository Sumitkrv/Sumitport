# Portfolio 3.0 — Phase 02 Hero implementation

Local preview: **http://127.0.0.1:5175/**. This phase changes the Hero and the shared scene integration it needs. The Phase 01 work was already uncommitted; it is preserved in `/tmp/sumitport-before-phase02-20261022.tar.gz`, with a binary Git diff at `/tmp/sumitport-before-phase02-20261022.patch`. No reset or history rewrite was used.

## A. Files modified in this phase

| Exact path relative to repository root | Reason |
| --- | --- |
| `src/components/Landing.tsx` | Semantic name lines, measured portrait slot, responsive content order, Contact anchor and Hero-owned supporting links |
| `src/components/styles/Landing.css` | Three-column desktop grid; distinct tablet/mobile grids; short-height natural flow; restrained atmosphere, typography, CTAs and portrait fallback |
| `src/components/SocialIcons.tsx` | Keep verified links; remove the fixed-element scroll listener after moving links into their owning Hero |
| `src/components/styles/SocialIcons.css` | Compact, accessible social controls and Profile link in the section footer |
| `src/components/MainContainer.tsx` | Remove the former global social mount; Landing now mounts it once |
| `src/components/utils/initialFX.ts` | Reuse loader completion for one scoped masked-line entrance; no text clones, SplitText manipulation or second loading controller |
| `src/components/Character/Scene.tsx` | Adaptive projection, Hero-only portrait lighting, damped additive head tracking and neutral pointer return; fallback visibility; fix slow intro timing on low frame rates |
| `src/components/Character/utils/heroFraming.ts` | New projection helper using actual cap bounds and measured HTML slot, restoring the established About projection across the Hero exit |
| `src/components/Character/utils/lighting.ts` | Add neutral portrait fill and subtle pink edge light; blend them out before About, retain original shared lights |
| `src/components/Character/utils/animationUtils.ts` | Sample the real intro's final pose for reduced motion instead of leaving the character in its authoring T-pose |
| `public/images/hero-character.png` | Still captured from the existing character in the actual browser renderer; no generated/replacement model |
| `docs/phase-02-hero.md`, `docs/qa/phase-02/*` | This report and captured browser evidence |

Navbar, preloader, About, What I Do, Career, Work, Achievements, Skills, TechStack and Contact component/style sources were not redesigned. Existing model, texture, project-image and metadata files remain intact. Shared scene changes are needed because Hero/About/Expertise use one persistent renderer; no extra canvas or scroll framework was introduced.

## B. Hero visual changes

The desktop composition now has an identity column, measured central portrait stage and professional-role column. Name and roles use controlled widths and fluid type. The name reveals through two line masks. Mint and lavender remain restrained accents on an obsidian background. CTAs retain visible focus and real destinations: Work and Contact, with existing hash/header-offset handling.

On tablet, identity and role groups sit above the portrait; actions sit below it. On mobile, the order is greeting/name, role groups, portrait, actions, supporting links. The Hero grows naturally in short viewports. Social and Profile links now travel with their section instead of lingering as fixed elements. Profile still opens the verified LinkedIn URL; it is not presented as a resume download.

## C. Actual 3D enhancements

Inspected the encrypted model by decrypting it locally and examining its GLTF structure, then inspecting a loaded copy through Three.js. Its rest bounds are approximately `[-7.515, -0.008, -6.480]` to `[7.515, 14.893, 10.509]`, including the workstation. Whole-model bounds would therefore give poor portrait framing. The new helper measures the cap meshes and reserves a portrait envelope with shoulder/head padding, then fits it into the actual HTML stage using the existing camera's projection.

Verified clips: `introAnimation` (3.29 s), `angry` (4.17 s), `browup` (4.17 s), `typing` (2.08 s), `Blink` (5.46 s) and six keypress clips (2.08 s). Existing intro, typing, blinking and eyebrow behavior remain. No bones, morph targets, breathing clip or new gesture was invented.

Three.js sanitizes node names: the loaded names are `CAP001`, `CAP002` and `spine006`. The previous dotted head lookup missed the imported bone. Head tracking now adds damped offsets (maximum roughly .06 rad pitch and .1 rad yaw) to the animated pose, only during the Hero and for fine hover pointers. Camera parallax remains small. Leaving the document or blurring resets the pointer target. Reduced motion disables tracking/intro playback and samples the existing intro's final static pose.

A soft neutral fill and pink edge light supplement the existing teal/lavender rig during the Hero. They blend to zero at Hero exit. Existing materials are retained. The renderer still caps DPR at 1.15 on compact mobile and 1.5 otherwise.

## D. Entrance and scroll ownership

The existing LoadingProvider calls `initialFX` after loader exit. One GSAP context reveals atmosphere, greeting, name lines, role labels, actions and supporting links; cleanup reverts only that context. Header/preloader state is untouched. Semantic text is visible if the optional entrance import fails, and reduced motion bypasses the entrance.

The existing character timeline still owns camera position and scroll rotation. `heroFraming` owns only projection zoom/view offset, measured on resize, and restores zoom 1.1/no view offset by About. There is no pinning, negative-margin compensation or new global scroll handler. Compact Hero canvas dimensions match the measured slot; the established What I Do slot takes over through its existing root data attributes. Renderer/resource cleanup and offscreen suspension from Phase 01 remain.

The animation delta cap changed from .05 to .25 seconds: the old cap prolonged a 3.29-second intro under the software renderer. No FPS improvement is claimed.

## E. Browser verification

Chrome/CDP tests used the actual running app. Final responsive measurements are in [responsive.json](qa/phase-02/responsive.json):

| Viewport | Result |
| --- | --- |
| 360 × 800 | No horizontal overflow; separate text, stage and action zones |
| 390 × 844 | Same; live character screenshot and measured canvas/slot match |
| 768 × 1024 | Tablet composition; no horizontal overflow |
| 1024 × 768 | Content grows to about 925 px; controls remain reachable through natural scrolling |
| 1280 × 800 | Three-zone desktop composition; no horizontal overflow |
| 1440 × 900 | Desktop WebGL character and left/right/settled pointer screenshots |
| 1920 × 1080 | Wide composition; no horizontal overflow |
| 1280 × 600 | Hero grows to 720 px; no clipping of document content |

Hero bottom equals About top at every measured viewport. These are section-boundary checks, not a claim that every model pixel was geometrically tested. Screenshots include [desktop WebGL](qa/phase-02/desktop-webgl.png), [mobile WebGL](qa/phase-02/mobile-webgl.png), [left pointer](qa/phase-02/pointer-left.png), [right pointer](qa/phase-02/pointer-right.png), [About](qa/phase-02/about-regression.png), [workstation](qa/phase-02/workstation-regression.png), and fallback layouts for every listed size. The final poster was recaptured after the reduced-motion pose repair; [mobile fallback](qa/phase-02/mobile-fallback.png) and [desktop reduced WebGL](qa/phase-02/desktop-reduced-webgl.png) show the final pose. Earlier size-matrix screenshots predate that pose refinement, while their layout measurements remain valid.

[Functional results](qa/phase-02/functional.json): Work and Contact anchors settle at approximately 100 px, the scroll cue reaches About, keyboard Enter activates Work, mobile menu opens/focuses correctly, and existing GitHub/LinkedIn/Profile URLs are preserved. A fresh-page follow-up corrected an early Work measurement taken before smooth scrolling had settled. The unsupported-WebGL browser keeps the original-character poster, name, roles and links visible. Reduced-motion text/controls remain visible.

The live compact canvas exactly matched the Hero slot at `335 × 335.3 px`; What I Do retained its `337 × 390 px` slot. Reverse scrolling returned the character to the Hero. All seven following sections remain in the DOM, and Career selection still updates. No uncaught runtime exceptions were observed in the saved pass. Disabled WebGL produces expected Three.js diagnostic errors; this is not reported as a zero-error console.

## F. Performance and quality

No dependencies, WebGL render passes or duplicate model scenes were added. Projection measurements run on resize, not through React state every frame. The Phase 01 offscreen rendering pause and deferred TechStack load remain. The static fallback is a small additional image captured from the existing asset. No network asset, model-size or FPS reduction is claimed.

`npm run lint` and `npm run build` pass; the build includes the configured strict `tsc -b` checks. `git diff --check` passes. There is no configured application unit-test script. Existing large Three/TechStack bundle warnings remain; they were not hidden by raising warning thresholds.

## G. Regression and preservation

The Phase 02 snapshot comparison confirms only the Hero/shared integration files listed above changed. All existing public asset contents match the pre-phase snapshot (excluding macOS tar-generated AppleDouble metadata entries); the portrait is additive. Professional data and all 14 projects remain unchanged. The navbar still has its five original labels, loading ownership is unchanged, and the later sections retain normal document flow. About/workstation screenshots were inspected to check the shared-camera handoff.

## H. Limits

Software WebGL was available, but some captures took longer than normal hardware rendering. No real-device Safari/Android/iOS test, hardware FPS benchmark or full accessibility certification was performed. External project/social destinations were preserved and inspected as URLs; their remote uptime was not tested. WebGL context restoration was not injected in this phase. Postprocessing and TechStack improvements remain outside Hero scope. OS reduced-motion changes are fully adopted on reload for the existing JavaScript effects.

Phase 02 stops here. No About redesign or later phase was started.
