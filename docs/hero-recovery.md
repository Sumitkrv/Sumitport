# Hero recovery

## Root cause

The Hero used the original encrypted GLTF and its existing scene hierarchy. The face deformation came from the pointer controller: `headBone.rotation` received the current damped pointer offset with `+=` every render frame, without removing the previous frame's offset. This accumulated rotation until the head could turn away from the camera. The head lookup itself is valid (`spine006`, the name Three.js exposes after loading).

The intro clip also started after the loader exited. Its opening pose puts the cap brim over the eyes, and the scene marked the canvas as rendered on its first frame. That exposed the unfinished pose while the intro was still running. The camera's near/far planes are not clipping the character, and inspection of the existing camera, loaded cap bounds, shared GSAP timelines, and live render showed no asset replacement, scale mutation, or 180-degree rotation.

## Repair

- The real GLTF is initialized to the final frame of its existing intro clip before the first visible WebGL render. The model stays live and keeps its original materials and geometry; no image replaces it.
- The entrance clip is no longer replayed over the visible Hero. Existing blinking, key prop motion, typing, and bounded pointer response remain available.
- Before the skeletal mixer updates each frame, the previous head pointer offset is removed; after the mixer updates, the new damped offset is applied once. Pointer exit returns the face to the animated base pose.
- The existing camera and scroll timelines remain in place. The Hero framing helper continues to fit the actual cap bounds into the measured presentation slot and returns to the shared About projection.

## Verification

The live site was inspected at 1920 × 1080, 1440 × 900, 1280 × 800, 1024 × 768, 768 × 1024, 390 × 844, 360 × 800, and 1440 × 600. Screenshots and measurements are in [the QA folder](qa/hero-recovery/). The desktop 1440 × 900 capture shows the full face and cap, both eyes and eyebrows, nose, smile, torso, CTAs, role labels, and navigation. The short desktop capture keeps the complete head visible and lets the Hero extend to 720 px for natural scrolling. No viewport had horizontal overflow.

Pointer checks covered left, right, up, down, center, and exit. The head remained forward-facing and returned to neutral. Scrolling to About placed the section at the shared header offset; scrolling back restored the Hero camera. Reloads at the top and while scrolled both initialized the WebGL character without browser exceptions. The asset request list had no failed resources.

`npm run build`, `npm run lint`, and `git diff --check` pass. The repository has no test script. Browser QA used headless Chrome with software WebGL; a physical device or hardware GPU was not available for this run.

## Responsive measurements

| Viewport | Hero height | Character stage | Horizontal overflow |
| --- | ---: | ---: | --- |
| 1920 × 1080 | 1080 px | 565 × 860 px | No |
| 1440 × 900 | 900 px | 513 × 680 px | No |
| 1280 × 800 | 800 px | 448 × 580 px | No |
| 1024 × 768 | 925 px | 800 × 380 px | No |
| 768 × 1024 | 1024 px | 673 × 511 px | No |
| 390 × 844 | 844 px | 335 × 335 px | No |
| 360 × 800 | 800 px | 305 × 295 px | No |
| 1440 × 600 | 720 px | 513 × 500 px | No |
