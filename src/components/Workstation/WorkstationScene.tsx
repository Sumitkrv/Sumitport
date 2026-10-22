import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RGBELoader } from "three-stdlib";
import setCharacter from "../Character/utils/character";

export type WorkstationService = "full-stack" | "automation" | "quality" | "frontend";

type WorkstationStatus = "loading" | "ready" | "unavailable";
type InspectionHost = HTMLDivElement & {
  getWorkstationSnapshot?: () => unknown;
  captureWorkstation?: () => string | undefined;
};

const serviceColors: Record<WorkstationService, string> = {
  "full-stack": "#73cfc6",
  automation: "#b3a0d6",
  quality: "#c0d4e0",
  frontend: "#9bd6b6",
};

/** A section-local copy of the original asset, with no shared mutable scene state. */
const WorkstationScene = ({ service }: { service: WorkstationService }) => {
  const hostRef = useRef<InspectionHost>(null);
  const serviceRef = useRef(service);
  const [status, setStatus] = useState<WorkstationStatus>("loading");

  useEffect(() => { serviceRef.current = service; }, [service]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 200);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bounds = new THREE.Box3();
    const center = new THREE.Vector3();
    const meshBounds: THREE.Box3[] = [];
    const clock = new THREE.Clock(false);
    const targetColor = new THREE.Color();
    let renderer: THREE.WebGLRenderer | undefined;
    let asset: ReturnType<typeof setCharacter> | undefined;
    let character: THREE.Object3D | undefined;
    let mixer: THREE.AnimationMixer | undefined;
    let environment: THREE.DataTexture | undefined;
    let rim: THREE.DirectionalLight | undefined;
    let disposed = false;
    let started = false;
    let ready = false;
    let rendered = false;
    let visible = false;
    let contextAvailable = true;
    let frame = 0;
    let animationTracks = 0;
    let animationName: string | null = null;
    const actions: THREE.AnimationAction[] = [];

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      clock.stop();
    };

    const fail = () => {
      if (disposed) return;
      stop();
      host.dataset.renderState = "unavailable";
      setStatus("unavailable");
    };

    const render = () => {
      if (disposed || !ready || !visible || !contextAvailable || document.hidden || !renderer) {
        stop();
        return;
      }
      const delta = Math.min(clock.getDelta(), .05);
      if (!reducedMotion) mixer?.update(delta);
      targetColor.set(serviceColors[serviceRef.current]);
      if (rim) rim.color.lerp(targetColor, reducedMotion ? 1 : 1 - Math.exp(-delta * 4));
      try {
        renderer.render(scene, camera);
        rendered = true;
        frame = requestAnimationFrame(render);
      } catch {
        fail();
      }
    };

    const start = () => {
      if (frame || !ready || !visible || !contextAvailable || document.hidden || disposed) return;
      clock.start();
      frame = requestAnimationFrame(render);
    };

    const fit = () => {
      if (!renderer || bounds.isEmpty()) return;
      const rect = host.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 1.25));
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      let distance = 0;
      // Fit each measured mesh, accounting for its depth. A single global box
      // invents empty corners above the desk and unnecessarily shrinks the face.
      meshBounds.forEach((box) => {
        for (const x of [box.min.x, box.max.x]) {
          for (const y of [box.min.y, box.max.y]) {
            for (const z of [box.min.z, box.max.z]) {
              distance = Math.max(distance,
                Math.abs(x - center.x) * 1.10 / (tangent * camera.aspect) + z - center.z,
                Math.abs(y - center.y) * 1.10 / tangent + z - center.z);
            }
          }
        }
      });
      camera.position.set(center.x, center.y, center.z + distance);
      camera.lookAt(center);
      camera.updateProjectionMatrix();
      start();
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextAvailable = false;
      fail();
    };
    const onContextRestored = () => {
      if (disposed || !ready) return;
      contextAvailable = true;
      host.dataset.renderState = "ready";
      setStatus("ready");
      fit();
      start();
    };
    const onVisibilityChange = () => document.hidden ? stop() : start();

    const load = async () => {
      if (started || disposed) return;
      started = true;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.domElement.className = "workstation-canvas";
        renderer.domElement.setAttribute("aria-hidden", "true");
        Object.assign(renderer.domElement.style, {
          position: "absolute", inset: "0", display: "block", width: "100%", height: "100%", pointerEvents: "none",
        });
        renderer.domElement.addEventListener("webglcontextlost", onContextLost);
        renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
        host.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xdce7f5, 0x12151e, .72));
        const key = new THREE.DirectionalLight(0xf4f2ef, 1.35);
        key.position.set(-6, 15, 12);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xd5dff3, .38);
        fill.position.set(6, 10, 12);
        scene.add(fill);
        rim = new THREE.DirectionalLight(serviceColors[serviceRef.current], 1.05);
        rim.position.set(-6, 11, -7);
        scene.add(rim);
        const lavender = new THREE.DirectionalLight(0xd3accc, .36);
        lavender.position.set(8, 10, -4);
        scene.add(lavender);

        new RGBELoader().load("/models/char_enviorment.hdr?v=2", (texture) => {
          if (disposed) { texture.dispose(); return; }
          texture.mapping = THREE.EquirectangularReflectionMapping;
          environment = texture;
          scene.environment = texture;
          scene.environmentIntensity = .52;
          scene.environmentRotation.set(5.76, 85.85, 1);
          start();
        }, undefined, () => undefined);

        asset = setCharacter(renderer, scene, camera);
        const gltf = await asset.loadCharacter();
        if (disposed || !gltf) return;
        character = gltf.scene;
        mixer = new THREE.AnimationMixer(character);

        // The complete authored typing clip already contains the correct seated
        // body/arm pose. Playing it alone avoids both track-name filtering bugs
        // and blending the hands against the intro's different final wrist pose.
        const typing = THREE.AnimationClip.findByName(gltf.animations, "typing");
        const intro = THREE.AnimationClip.findByName(gltf.animations, "introAnimation");
        const base = typing ?? intro;
        if (base) {
          const action = mixer.clipAction(base);
          actions.push(action);
          animationName = base.name;
          animationTracks = base.tracks.length;
          action.play();
          if (!typing) {
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            mixer.update(base.duration);
            action.paused = true;
          } else {
            mixer.update(0);
            action.paused = reducedMotion;
          }
        }
        if (!reducedMotion) {
          ["Blink", "key1", "key2", "key5", "key6"].forEach((name) => {
            const clip = THREE.AnimationClip.findByName(gltf.animations, name);
            if (clip) {
              const action = mixer!.clipAction(clip);
              action.play();
              actions.push(action);
            }
          });
        }

        character.rotation.set(-.04, .7, 0);
        scene.add(character);
        character.updateMatrixWorld(true);
        const screen = character.getObjectByName("screenlight");
        if (screen instanceof THREE.Mesh) {
          const materials = Array.isArray(screen.material) ? screen.material : [screen.material];
          materials.forEach((material) => {
            if ("emissiveIntensity" in material) (material as THREE.MeshStandardMaterial).emissiveIntensity = .25;
          });
          const screenCenter = new THREE.Box3().setFromObject(screen, true).getCenter(new THREE.Vector3());
          const monitorFill = new THREE.PointLight(0xbad9df, 1.5, 12, 2);
          monitorFill.position.copy(screenCenter).add(new THREE.Vector3(-1, -.5, -2));
          scene.add(monitorFill);
        }

        // Keep the asset's original transparent ground for grounding, while
        // excluding its deliberately oversized plane from camera fitting.
        character.children.filter((root) => root.name !== "ground").forEach((root) => {
          root.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            const box = new THREE.Box3().setFromObject(object, true);
            if (box.isEmpty()) return;
            meshBounds.push(box);
            bounds.union(box);
          });
        });
        if (bounds.isEmpty()) { fail(); return; }
        bounds.getCenter(center);
        ready = true;
        host.dataset.renderState = "ready";
        setStatus("ready");
        fit();
        start();
      } catch {
        fail();
      }
    };

    const projectedBounds = () => {
      const projected = new THREE.Box3();
      camera.updateMatrixWorld(true);
      meshBounds.forEach((box) => {
        for (const x of [box.min.x, box.max.x]) {
          for (const y of [box.min.y, box.max.y]) {
            for (const z of [box.min.z, box.max.z]) projected.expandByPoint(new THREE.Vector3(x, y, z).project(camera));
          }
        }
      });
      return [projected.min.toArray(), projected.max.toArray()];
    };
    if (import.meta.env.DEV) host.getWorkstationSnapshot = () => ({
      ready, rendered, visible, contextAvailable, state: host.dataset.renderState ?? "loading",
      asset: "/models/character.enc?v=2", service: serviceRef.current,
      bounds: [bounds.min.toArray(), bounds.max.toArray()], center: center.toArray(),
      keyboardBounds: (() => {
        const keyboard = character?.getObjectByName("Keyboard");
        if (!keyboard) return null;
        const box = new THREE.Box3().setFromObject(keyboard, true);
        return [box.min.toArray(), box.max.toArray()];
      })(),
      projectedBounds: projectedBounds(),
      camera: { position: camera.position.toArray(), fov: camera.fov, aspect: camera.aspect, near: camera.near, far: camera.far },
      root: character ? { rotation: character.rotation.toArray(), scale: character.scale.toArray() } : null,
      furniture: character?.children.filter((root) => !root.getObjectByProperty("isSkinnedMesh", true))
        .map((root) => ({ name: root.name, visible: root.visible })),
      hands: ["hand.L", "hand.R", "forearm.L", "forearm.R"].map((name) => {
        const bone = character?.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(name));
        return { name, quaternion: bone?.quaternion.toArray(), position: bone?.getWorldPosition(new THREE.Vector3()).toArray() };
      }),
      animation: { name: animationName, tracks: animationTracks, actions: actions.length, reducedMotion },
      renderer: renderer ? { pixelRatio: renderer.getPixelRatio(), calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles, clearAlpha: renderer.getClearAlpha(), contextLost: renderer.getContext().isContextLost() } : null,
    });
    if (import.meta.env.DEV) host.captureWorkstation = () => {
      if (!ready || !contextAvailable || !renderer) return undefined;
      // The asset's oversized shadow plane can leave a rectangular tint when
      // a fixed-aspect PNG is contained in a narrower fallback stage.
      const ground = character?.getObjectByName("ground");
      const groundVisible = ground?.visible;
      if (ground) ground.visible = false;
      try {
        renderer.render(scene, camera);
        return renderer.domElement.toDataURL("image/png");
      } finally {
        if (ground) ground.visible = groundVisible ?? true;
        renderer.render(scene, camera);
      }
    };

    const loadObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        void load();
        loadObserver.disconnect();
      }
    }, { rootMargin: "650px 0px" });
    loadObserver.observe(host);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    visibilityObserver.observe(host);
    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(host);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      stop();
      loadObserver.disconnect();
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      mixer?.stopAllAction();
      if (mixer && character) mixer.uncacheRoot(character);
      asset?.dispose();
      scene.environment = null;
      environment?.dispose();
      scene.clear();
      if (renderer) {
        renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
        renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
        renderer.domElement.remove();
        renderer.dispose();
      }
      delete host.getWorkstationSnapshot;
      delete host.captureWorkstation;
      delete host.dataset.renderState;
    };
  }, []);

  return (
    <div className="workstation-renderer" ref={hostRef} aria-hidden="true">
      {status === "unavailable" && (
        <img className="workstation-fallback" src="/images/workstation-fallback.png" alt="" />
      )}
      {status === "loading" && <span className="workstation-loading">Preparing the studio</span>}
    </div>
  );
};

export default WorkstationScene;
