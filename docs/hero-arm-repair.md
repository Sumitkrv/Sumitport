# Hero arm pose repair

## Actual cause

The original `character.enc` GLB contains a usable 68-joint skinned rig. Its bind pose has horizontal arms and gently curved fingers. The existing animation setup immediately evaluates `introAnimation` at its final frame and pauses it. That final frame is the seated workstation pose: wrists forward at approximately `y=9.44, z=1.83`, with fingers pointing down. Hiding the desk did not change that pose.

The existing `typing` filter matches zero tracks because its dotted bone names differ from GLTFLoader's sanitized names. The frozen introduction, rather than a live typing action or camera distortion, causes the Hero's suspended hands. This repair preserves the workstation's existing animation behavior.

## Implementation

- `src/components/Character/utils/heroArmPose.ts`: captures the asset's arm bind rotations before animation initialization. Restores the bind wrist, palm and finger curve, then aims the existing upper arms and forearms downward using their local +Y axes and parent-relative quaternion conversion. A small left/right difference keeps the stance relaxed. No vertices, bone translations, scales, bind matrices or asset files change.
- `src/components/Character/utils/animationUtils.ts`: owns the pose helper alongside the existing mixer. Restores the exact mixer pose during disposal before stopping actions.
- `src/components/Character/Scene.tsx`: restores the previous presentation pose before every mixer update, then applies the relaxed pose only while Hero owns the character. The pose blends back to the existing animation during the Hero-to-About transition. About and What I Do receive the original joint rotations.
- `src/components/Character/utils/heroFraming.ts`: adds development-only, read-only joint diagnostics for verification. Camera behavior is unchanged.

Hero wrist positions now fall at approximately `y=7.22/7.25, z=-0.08/0.05`, naturally below the existing portrait. The head, cap, shoulder parents, spine, root orientation, typography, navigation, CTAs, lighting and camera composition are unchanged.

## Verification

Browser captures and numeric state records are in `docs/qa/hero-pose/`.

Required sizes: 1920×1080, 1440×900, 1280×800, 1024×768, 390×844 and 360×800. Checks cover initial rendered pose, settled animation, pointer movement and idle, Hero exit, About and workstation, reverse scroll, refresh and resize. The protected sections' six principal arm/wrist local quaternions are compared against `baseline.json` with a tolerance of 1e-10.

All six viewport checks passed. Live resize crossed desktop/mobile remount boundaries; workstation refresh, reduced motion and the existing static Hero diagnostic also passed. Browser records contain no console, runtime or HTTP errors. Every checked state has one character canvas, no horizontal overflow and a valid WebGL context. The before/after face and cap crop has less than 0.0004 mean difference per RGB channel on the 0–255 scale (`face-comparison.json`).

Validation commands: `npx tsc -b --pretty false`, `npm run lint`, `npm run build`, and `git diff --check`. The build retains the existing large-chunk advisory. There is no configured test script.

Checkpoint: `/tmp/sumitport-before-hero-pose-20261022.tar.gz`.

Local preview: http://127.0.0.1:5175/
