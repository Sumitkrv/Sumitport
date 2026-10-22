import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RGBELoader } from "three-stdlib";
import setCharacter from "./utils/character";
import { createHeroArmPose } from "./utils/heroArmPose";

type PortraitHost = HTMLDivElement & {
  getAboutSnapshot?: () => unknown;
  captureAbout?: () => string | undefined;
};

/** Independently parsed asset: no Hero skeleton, mixer, camera or materials. */
export default function AboutPortrait() {
  const hostRef = useRef<PortraitHost>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(24, 1, .1, 200);
    const clock = new THREE.Clock(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const head = new THREE.Box3();
    const center = new THREE.Vector3();
    let renderer: THREE.WebGLRenderer | undefined;
    let asset: ReturnType<typeof setCharacter> | undefined;
    let pose: ReturnType<typeof createHeroArmPose> | undefined;
    let character: THREE.Object3D | undefined;
    let mixer: THREE.AnimationMixer | undefined;
    let environment: THREE.DataTexture | undefined;
    let disposed = false, loaded = false, visible = false, context = true, started = false;
    let frame = 0;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; clock.stop(); };
    const render = () => {
      if (!renderer || !loaded || !visible || !context || disposed || document.hidden) { stop(); return; }
      pose?.restore();
      if (!reduced) mixer?.update(Math.min(clock.getDelta(), .05));
      pose?.apply(1);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    const start = () => {
      if (!frame && loaded && visible && context && !disposed && !document.hidden) {
        clock.start(); frame = requestAnimationFrame(render);
      }
    };
    const fit = () => {
      if (!renderer || head.isEmpty()) return;
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Portrait ends above the seated hips. Extra width protects both shoulders;
      // the cap gets explicit top clearance at every stage aspect ratio.
      const size = head.getSize(new THREE.Vector3());
      const portraitHeight = size.y * 1.9;
      const portraitWidth = size.x * 1.9;
      const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const distance = Math.max(portraitHeight / (2 * tangent), portraitWidth / (2 * tangent * camera.aspect));
      center.set((head.min.x + head.max.x) / 2, head.max.y + .35 - portraitHeight / 2, head.max.z);
      camera.position.set(center.x, center.y, center.z + distance);
      camera.lookAt(center); camera.updateProjectionMatrix();
      start();
    };
    const fail = () => { if (!disposed) { stop(); setUnavailable(true); } };
    const lost = (event: Event) => { event.preventDefault(); context = false; fail(); };
    const restored = () => { context = true; setUnavailable(false); fit(); start(); };
    const load = async () => {
      if (started || disposed) return;
      started = true;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setClearColor(0, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        host.appendChild(renderer.domElement);
        renderer.domElement.addEventListener("webglcontextlost", lost);
        renderer.domElement.addEventListener("webglcontextrestored", restored);
        scene.add(new THREE.HemisphereLight(0xdce8ff, 0x13141f, .66));
        const key = new THREE.DirectionalLight(0xf1f5fa, 1.25); key.position.set(-5, 14, 9); scene.add(key);
        const fill = new THREE.DirectionalLight(0xf0f3ff, .5); fill.position.set(3, 14, 10); scene.add(fill);
        const mint = new THREE.DirectionalLight(0x70c6bb, .45); mint.position.set(-5, 13, -6); scene.add(mint);
        const pink = new THREE.DirectionalLight(0xd1a7dd, .4); pink.position.set(6, 12, -4); scene.add(pink);
        new RGBELoader().load("/models/char_enviorment.hdr?v=2", (texture) => {
          if (disposed) { texture.dispose(); return; }
          environment = texture; texture.mapping = THREE.EquirectangularReflectionMapping;
          scene.environment = texture; scene.environmentIntensity = .5;
          scene.environmentRotation.set(5.76, 85.85, 1);
        }, undefined, () => undefined);
        asset = setCharacter(renderer, scene, camera);
        const gltf = await asset.loadCharacter();
        if (!gltf || disposed) return;
        character = gltf.scene;
        // Capture real bind rotations before the intro writes the seated pose.
        pose = createHeroArmPose(character);
        mixer = new THREE.AnimationMixer(character);
        const intro = THREE.AnimationClip.findByName(gltf.animations, "introAnimation");
        if (intro) {
          const action = mixer.clipAction(intro);
          action.setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true;
          action.play(); mixer.update(intro.duration); action.paused = true;
        }
        // Only facial idle can animate. No typing or workstation actions run here.
        const blink = THREE.AnimationClip.findByName(gltf.animations, "Blink");
        if (blink && !reduced) mixer.clipAction(blink).play();
        character.children.forEach(root => {
          if (!root.getObjectByProperty("isSkinnedMesh", true)) root.visible = false;
        });
        character.rotation.set(0, .18, 0);
        pose.apply(1); character.updateMatrixWorld(true);
        ["CAP001", "CAP002", "Face002", "Ear001"].forEach(name => {
          const part = character?.getObjectByName(name);
          if (part) head.union(new THREE.Box3().setFromObject(part, true));
        });
        scene.add(character); loaded = true; fit(); start();
      } catch { fail(); }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { void load(); start(); } else stop();
    }, { rootMargin: "150px 0px" });
    observer.observe(host);
    const resize = new ResizeObserver(fit); resize.observe(host);
    const visibility = () => document.hidden ? stop() : start();
    document.addEventListener("visibilitychange", visibility);
    if (import.meta.env.DEV) {
      host.getAboutSnapshot = () => ({
        loaded, visible, context, reduced, camera: camera.position.toArray(), head: [head.min.toArray(), head.max.toArray()],
        bones: ["upper_armL", "upper_armR", "forearmL", "forearmR", "handL", "handR"].map(name => {
          const bone = character?.getObjectByName(name);
          return { name, quaternion: bone?.quaternion.toArray(), world: bone?.getWorldPosition(new THREE.Vector3()).toArray(),
            projected: bone?.getWorldPosition(new THREE.Vector3()).project(camera).toArray() };
        }),
        projectedHead: [head.min.clone().project(camera).toArray(), head.max.clone().project(camera).toArray()],
        root: character?.rotation.toArray(), scale: character?.scale.toArray(),
        furniture: character?.children.filter(root => !root.getObjectByProperty("isSkinnedMesh", true)).map(root => ({ name: root.name, visible: root.visible })),
        calls: renderer?.info.render.calls,
      });
      host.captureAbout = () => { if (!renderer || !loaded) return; renderer.render(scene, camera); return renderer.domElement.toDataURL(); };
    }
    return () => {
      disposed = true; stop(); observer.disconnect(); resize.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      pose?.restore(); mixer?.stopAllAction();
      if (character) mixer?.uncacheRoot(character);
      asset?.dispose(); environment?.dispose(); scene.clear();
      renderer?.domElement.removeEventListener("webglcontextlost", lost);
      renderer?.domElement.removeEventListener("webglcontextrestored", restored);
      renderer?.domElement.remove(); renderer?.dispose();
      delete host.getAboutSnapshot; delete host.captureAbout;
    };
  }, []);
  return <div className="about-portrait" ref={hostRef} aria-hidden="true" data-unavailable={unavailable || undefined}>
    {unavailable && <img src="/images/about-portrait.png" alt="" />}
  </div>;
}
