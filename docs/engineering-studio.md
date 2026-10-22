# What I Do — The Engineering Studio

## A. Files changed

| Path | Reason |
| --- | --- |
| `src/components/WhatIDo.tsx` | Local scene ownership, verified service copy, semantic single-open accordion, keyboard navigation, and selected-heading scroll preservation. |
| `src/components/styles/WhatIDo.css` | Editorial grid, readable copy/tags, real plus/minus controls, bounded stage, tablet/mobile layouts and reduced-motion styling. Removes global Hero rim overrides and scroll-dependent typography/spacing. |
| `src/components/Workstation/WorkstationScene.tsx` | Independent original workstation asset, skeleton, mixer, camera, lighting, bounds fitting, visibility scheduling and fallback. |
| `src/components/Character/utils/heroFraming.ts` | Removes the workstation branch from the portrait controller; preserves the existing Hero/About camera and pose calculations and their handoff timing. Furniture stays hidden in the portrait scene. |
| `src/components/Character/Scene.tsx` | Limits portrait rendering to Hero/About visibility. What I Do renders through its own stage. |
| `public/images/workstation-fallback.png` | Transparent image captured directly from the original rendered workstation for unavailable WebGL or a failed scene chunk. |
| `docs/qa/engineering-studio/` | Before/after screenshots and numeric browser verification records. |

No dependency, original model, Hero pose, preloader, Navbar, About, Career, project or other section source was changed.

Checkpoint: `/tmp/sumitport-before-engineering-studio-20261023.tar.gz`.

## B. Design changes

Desktop uses a 46/54 column split with a measured gap. The left contains genuine HTML section text, a separate workstation stage and a restrained Design / Engineer / Deliver caption. The right uses an editorial capability index with thin rules, clear titles, 14px descriptions and 11px capability labels. The `02 / ENGINEERING EXPERTISE` label follows About's existing `01` label.

Tablet below 1024px and mobile use a single column: heading, introduction, workstation, then service rows. Section height follows content; short viewports scroll naturally. No sticky/fixed workstation, negative section margins, particles, extra decorative geometry or opaque overlap cover was added.

## C. Confirmed causes and 3D changes

### Existing implementation audit

The old What I Do owned an empty stage placeholder while globally moving the Hero canvas. Desktop used a viewport-fixed canvas whose dimensions and position were independent of the grid. Mobile moved that canvas out of Landing using global CSS variables. This architecture allowed the monitor region to cross text boundaries and persist into adjacent sections. The old service color selectors also targeted the Hero rim globally. These were ownership and layout issues, rather than evidence of a malformed asset.

The original encrypted GLB is 2,337,360 bytes and contains 131 nodes, 62 meshes, a 68-joint skinned rig, and the complete desk/chair/monitor/keyboard. The existing shared typing filter compares dotted names against loader-sanitized names, matching zero tracks. The portrait's paused introduction intentionally remains unchanged.

### New local scene

What I Do loads a separate original GLTF instance near its stage. Its scene objects, skeleton, materials, textures, mixer and camera are independent; no cached mutable scene is shared with Hero. The authored `typing` clip supplies the entire seated pose and 207 tracks. Existing blink/key clips remain local. Reduced motion freezes the authored typing pose. The fallback PNG omits only the oversized ground during its capture, then immediately restores the live ground; every PNG edge has alpha zero, avoiding a tinted rectangular edge when contained on mobile.

Measured workstation bounds, excluding the oversized transparent ground, are approximately:

- Minimum: `[-2.6686, 2.6535, -2.6276]`
- Maximum: `[7.9492, 14.8695, 7.7368]`
- Center: `[2.6403, 8.7615, 2.5546]`

The existing three-quarter root orientation `[-0.04, 0.7, 0]` and unit scale are retained locally. A 32° perspective camera fits every measured mesh box with depth-aware padding; near/far are `0.1/200`. At 1440×900 the camera is approximately `[2.6403, 8.7615, 28.9668]`. Resize recomputes the fit. Projected mesh bounds remain inside the stage at every tested size.

The canvas clears with alpha zero and has no pointer interaction region. The original ground is retained for grounding. Steady neutral key/fill, controlled mint rim, lavender/pink accent, and restrained monitor illumination light the workstation. Service selection changes only the local rim color; the camera and model do not orbit or rebuild.

Performance: 66 draw calls and 31,496 triangles in the measured stage. DPR is capped at 1.25 desktop / 1 mobile. Loading is deferred until near the stage; rendering stops offscreen and while the document is hidden. Resources/listeners/observers are disposed on unmount. No new rendering library or post-processing was added.

## D. Accordion behavior

Full-Stack starts expanded. Selecting another service closes the previous one; selecting the open row collapses it. Panels use intrinsic `0fr → 1fr` grid sizing, with an overflow wrapper outside the padded content. There are no fixed panel heights. Controls use real buttons, unique panel IDs, `aria-controls`, `aria-expanded`, labelled regions and visible focus. Closed content is excluded from accessibility with `aria-hidden` and hidden visually after collapse.

Enter/Space activate; Up/Down and Home/End move between service headings. Pointer and touch operate normally. The open control is a true minus. Hover/focus accents and tag entrance motion stay local and respect reduced motion.

Browser testing found that closing an earlier row could move the selected heading behind the Navbar. A local, temporary reading anchor now compensates through the existing scroll system only when that would happen. Wheel, touch, pointer and keyboard input cancel the compensation. Across the nine viewport checks, selected-heading displacement measured less than 0.35px.

Service facts were checked against Career, Skills, About and project entries. Pytest/Playwright, REST APIs, authentication, databases, React, TypeScript, accessibility and responsive engineering are supported. No AI platform, client outcome or new experience statistic was invented.

## E. Responsive results

Actual browser screenshots and numeric checks cover:

| Viewport | Stage + all four expanded services + all collapsed |
| --- | --- |
| 1920×1080 | Pass |
| 1440×900 | Pass |
| 1280×800 | Pass |
| 1024×768 | Pass |
| 768×1024 | Pass |
| 390×844 | Pass |
| 360×800 | Pass |
| 1440×600 | Pass |
| 1024×600 | Pass |

The main matrix contains 56 recorded states and 45 stage/service screenshots, plus regression captures. Checks assert stage/canvas bounds, separate columns or stacked order, complete model fit, visible furniture, natural unit scale, transparent clear, one open panel, zero-height closed panels, readable uncut panel/tag bounds, no overlapping rows, and no horizontal overflow.

## F. Regression verification

Before captures: preloader, Hero/Navbar, About, old What I Do and Career beginning. Hero and About camera positions, root rotations and principal arm/wrist quaternions match the saved baseline to `1e-9`. Hero retains its relaxed arms and furniture-free portrait. The workstation's authored typing pose is isolated.

Reverse scrolling restores the portrait and hides the local workstation when it leaves the viewport. Career begins with the workstation stage outside the viewport and the portrait parent hidden. Protected service-independent source files and content remain unchanged. Navbar uses the same existing visual labels; its animated DOM text layers were not edited.

Main browser matrix: no console, runtime, HTTP or WebGL errors. Supplemental refresh, keyboard, touch, reduced-motion and unavailable-WebGL checks also passed (`after/additional-verification.json`). Touch activation kept the mobile heading within 0.17px of its original position. Simulated unavailable WebGL showed the original workstation image while all service controls continued to work; only the expected renderer-construction errors appeared in that deliberately unsupported run. A final normal run again recorded zero errors.

The preloader was captured again after implementation. `after/source-regression.json` confirms that all source files outside the five listed implementation files, and the original encrypted model bytes, match the checkpoint.

## G. Build results

| Check | Actual result |
| --- | --- |
| `npm run build` | Pass — TypeScript build and Vite production bundle, 755 modules. |
| `npx tsc --noEmit -p tsconfig.app.json` | Pass. |
| `npm run lint` | Pass. |
| `git diff --check` | Pass. |
| Existing automated tests | No test script is configured in `package.json`. |

The build retains the existing advisory for chunks larger than 500kB (RGBELoader and TechStack). The new lazy workstation chunk is 5.14kB / 2.50kB gzip. No unrelated bundle restructuring was performed.

## H. Remaining issues

No known in-scope issue remains after the browser matrix, supplemental checks and repository checks. Short viewports intentionally use natural scrolling. Browser verification used local Chromium; physical-device testing was not performed.

Local preview: http://127.0.0.1:5175/#expertise
