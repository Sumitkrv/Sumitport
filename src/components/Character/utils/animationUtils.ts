import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { eyebrowBoneNames, typingBoneNames } from "../../../data/boneData";
import { createHeroArmPose } from "./heroArmPose";

const setAnimations = (gltf: GLTF, shouldAnimate = true) => {
  const character = gltf.scene;
  const heroArmPose = createHeroArmPose(character);
  const mixer = new THREE.AnimationMixer(character);
  let blinkTimeout: number | undefined;
  const hoverCleanups: Array<() => void> = [];

  // Establish the real GLTF's settled, forward-facing pose before the first
  // visible frame. The intro clip begins with the cap shading the eyes; playing
  // it after the loader exits exposes that unfinished pose as the Hero image.
  const introClip = THREE.AnimationClip.findByName(gltf.animations, "introAnimation");
  if (introClip) {
    const action = mixer.clipAction(introClip);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    mixer.update(introClip.duration);
    action.paused = true;
  }

  if (shouldAnimate) {
    const clipNames = ["key1", "key2", "key5", "key6"];
    clipNames.forEach((name) => {
      const clip = THREE.AnimationClip.findByName(gltf.animations, name);
      if (clip) {
        const action = mixer?.clipAction(clip);
        action!.play();
        action!.timeScale = 1.2;
      } else {
        console.error(`Animation "${name}" not found`);
      }
    });
    const typingAction = createBoneAction(gltf, mixer, "typing", typingBoneNames);
    if (typingAction) {
      typingAction.enabled = true;
      typingAction.play();
      typingAction.timeScale = 1.2;
    }
  }
  function startSafeIdle() {
    if (!shouldAnimate) return;
    const blink = gltf.animations.find((clip) => clip.name === "Blink");
    if (blink) {
      blinkTimeout = window.setTimeout(() => mixer.clipAction(blink).play().fadeIn(0.5), 2500);
    }
  }
  function hover(gltf: GLTF, hoverDiv: HTMLDivElement) {
    const eyeBrowUpAction = createBoneAction(
      gltf,
      mixer,
      "browup",
      eyebrowBoneNames
    );
    let isHovering = false;
    if (eyeBrowUpAction) {
      eyeBrowUpAction.setLoop(THREE.LoopOnce, 1);
      eyeBrowUpAction.clampWhenFinished = true;
      eyeBrowUpAction.enabled = true;
    }
    const onHoverFace = () => {
      if (eyeBrowUpAction && !isHovering) {
        isHovering = true;
        eyeBrowUpAction.reset();
        eyeBrowUpAction.enabled = true;
        eyeBrowUpAction.setEffectiveWeight(1);
        eyeBrowUpAction.fadeIn(0.5).play();
      }
    };
    const onLeaveFace = () => {
      if (eyeBrowUpAction && isHovering) {
        isHovering = false;
        eyeBrowUpAction.fadeOut(0.6);
      }
    };
    if (!hoverDiv) return;
    hoverDiv.addEventListener("pointerenter", onHoverFace);
    hoverDiv.addEventListener("pointerleave", onLeaveFace);
    const cleanup = () => {
      hoverDiv.removeEventListener("pointerenter", onHoverFace);
      hoverDiv.removeEventListener("pointerleave", onLeaveFace);
    };
    hoverCleanups.push(cleanup);
    return cleanup;
  }
  const dispose = () => {
    heroArmPose.restore();
    if (blinkTimeout) window.clearTimeout(blinkTimeout);
    hoverCleanups.forEach((cleanup) => cleanup());
    mixer.stopAllAction();
    mixer.uncacheRoot(character);
  };
  return { mixer, startSafeIdle, hover, dispose, restoreHeroPose: heroArmPose.restore, applyHeroPose: heroArmPose.apply };
};

const createBoneAction = (
  gltf: GLTF,
  mixer: THREE.AnimationMixer,
  clip: string,
  boneNames: string[]
): THREE.AnimationAction | null => {
  const AnimationClip = THREE.AnimationClip.findByName(gltf.animations, clip);
  if (!AnimationClip) {
    console.error(`Animation "${clip}" not found in GLTF file.`);
    return null;
  }

  const filteredClip = filterAnimationTracks(AnimationClip, boneNames);

  return mixer.clipAction(filteredClip);
};

const filterAnimationTracks = (
  clip: THREE.AnimationClip,
  boneNames: string[]
): THREE.AnimationClip => {
  const filteredTracks = clip.tracks.filter((track) =>
    boneNames.some((boneName) => track.name.includes(boneName))
  );

  return new THREE.AnimationClip(
    clip.name + "_filtered",
    clip.duration,
    filteredTracks
  );
};

export default setAnimations;
