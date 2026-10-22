# About character repair

## Cause and rig inspection

About inherited the Hero instance's settled `introAnimation` frame. That frame is a seated, forward-reaching workstation pose. Hiding furniture leaves unsupported hands. The shared Hero arm correction explicitly stops when About becomes the owner. The original model has a 68-joint skinned skeleton; upper arms and forearms extend along local +Y. Its bind wrist and finger rotations provide a relaxed curl. The shared filtered typing action matches no tracks because its configured dotted names differ from sanitized loader names; the frozen intro pose is the source of the visible problem.

## Repair

`AboutPortrait.tsx` loads an independent instance of the original encrypted GLB using the existing loader. Its scene, skeleton, mixer, materials, camera, lighting and renderer belong only to About. It captures bind arm rotations before evaluating the settled intro, then uses the existing verified arm-pose math on this private skeleton. Every frame restores the animation base, evaluates facial blinking, and reapplies the complete relaxed arm chain. No typing actions run. No bone positions, scales, inverse bind matrices, mesh vertices or original asset bytes change.

The camera frames the cap, face, shoulders and upper torso with explicit top clearance and aspect-dependent distance. The wrists are below the portrait, the lower body is excluded, and the torso has a soft lower fade. Furniture remains hidden. Neutral key/fill light, restrained mint rim light and lavender light replace the lower-body glow in this local presentation. Offscreen and hidden-document rendering pauses; resize and context restoration refit the camera. Reduced motion uses the static resting pose. A transparent capture of this same original model provides the WebGL fallback.

About's heading, biography, focus areas, identity and contact interaction are unchanged. A section-specific CSS rule hides the legacy shared character only during About ownership; Hero source, transforms, animation and lighting remain unchanged. What I Do is untouched.

## Checks and evidence

Browser artifacts: `docs/qa/about-repair/`. The requested viewport matrix is 1920×1080, 1440×900, 1280×800, 1024×768, 768×1024, 390×844 and 360×800. Numeric checks cover cap/head containment, wrists below the frame, unit scale, hidden furniture, separated text/stage bounds, unchanged right-side markup and no horizontal overflow. Screenshots show the actual rendered application. All seven sizes passed. Pointer/idle, reverse scroll and refresh checks passed with zero browser console/runtime/HTTP errors. Hero camera, root and arm snapshots match the baseline exactly after pointer reset; workstation camera, root, bounds and furniture snapshots also match exactly.

The source checkpoint comparison records only `About.tsx` and `About.css` changed among existing files; 57 source/model files are byte-identical, including all Hero and workstation code. New files are the local portrait component, fallback PNG and repair evidence.

Quality commands: `npx tsc --noEmit -p tsconfig.app.json`, `npm run lint`, `npm run build`, `git diff --check`. No test script is configured. The production build retains the pre-existing large-chunk advisory. Responsive checks use Chromium viewport emulation, not physical devices.

Checkpoint: `/tmp/sumitport-before-about-repair-20261023.tar.gz`.
Local preview: http://127.0.0.1:5175/#about

Final recovery check: the WebGL canvas has an inline `display: block` from Three.js. The unavailable-state selector explicitly overrides it so the original-model fallback occupies the stage. Reduced motion, context loss and restoration were checked in Chromium.
