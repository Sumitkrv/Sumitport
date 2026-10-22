import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/loadingContext";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { getSmoother } from "../utils/smoother";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { markReady } = useLoading();

  useEffect(() => {
    if (canvasDiv.current) {
      const canvasElement = canvasDiv.current;
      const rect = canvasDiv.current.getBoundingClientRect();
      const container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        markReady();
        return;
      }
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.15 : 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let headBone: THREE.Object3D | null = null;
      let screenLight: THREE.Object3D | null = null;
      let mixer: THREE.AnimationMixer;
      let disposeAnimations: (() => void) | undefined;
      let disposeHover: (() => void) | undefined;
      let contextAvailable = true;
      let resizeFrame = 0;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      const characterAsset = setCharacter(renderer, scene, camera);
      const { loadCharacter } = characterAsset;
      let isMounted = true;
      let introTimeout: number | undefined;
      let startAnimation: () => void = () => undefined;

      loadCharacter().then((gltf) => {
        if (gltf && isMounted) {
          const animations = setAnimations(gltf, !reducedMotion);
          disposeAnimations = animations.dispose;
          if (hoverDivRef.current && !reducedMotion) {
            disposeHover = animations.hover(gltf, hoverDivRef.current);
          }
          mixer = animations.mixer;
          const character = gltf.scene;
          scene.add(character);
          startAnimation();
          headBone = character.getObjectByName("spine.006") || null;
          screenLight = character.getObjectByName("screenlight") || null;
          markReady();
          introTimeout = window.setTimeout(() => {
            light.turnOnLights(reducedMotion);
            animations.startIntro();
          }, reducedMotion ? 0 : 350);
          window.addEventListener("resize", onResize);
        } else if (isMounted) {
          markReady();
        }
      }).catch(() => {
        if (isMounted) markReady();
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onResize = () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => handleResize(renderer, camera, canvasDiv));
      };
      const stageResizeObserver = "ResizeObserver" in window
        ? new ResizeObserver(onResize)
        : null;
      stageResizeObserver?.observe(canvasElement);

      const onMouseMove = (event: MouseEvent) => {
        if (reducedMotion) return;
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };

      const onTouchMove = (event: TouchEvent) => {
        if (reducedMotion) return;
        handleTouchMove(event, (x, y) => (mouse = { x, y }));
      };

      let debounce: number | undefined;
      let touchTarget: HTMLElement | null = null;
      let cancelTouchReset: (() => void) | undefined;
      const onTouchStart = (event: TouchEvent) => {
        if (reducedMotion) return;
        touchTarget = event.target as HTMLElement;
        const element = event.target as HTMLElement;
        if (debounce) window.clearTimeout(debounce);
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", onTouchMove, { passive: true });
        }, 200);
      };

      const onTouchEnd = () => {
        if (reducedMotion) return;
        if (debounce) window.clearTimeout(debounce);
        touchTarget?.removeEventListener("touchmove", onTouchMove);
        cancelTouchReset?.();
        cancelTouchReset = handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", onMouseMove);
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      const onContextLost = (event: Event) => {
        event.preventDefault();
        contextAvailable = false;
      };
      const onContextRestored = () => { contextAvailable = true; };
      renderer.domElement.addEventListener("webglcontextlost", onContextLost);
      renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
      let animationFrameId = 0;
      let animationLoopStarted = false;
      const animate = () => {
        if (!isMounted) {
          animationLoopStarted = false;
          return;
        }
        animationFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (contextAvailable && document.visibilityState === "visible") {
          if (!reducedMotion) {
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.22, 0.025);
          }
          if (headBone && !reducedMotion) {
            handleHeadRotation(
              headBone,
              mouse.x,
              mouse.y,
              interpolation.x,
              interpolation.y,
              THREE.MathUtils.lerp,
              getSmoother()?.scrollTop() ?? window.scrollY
            );
            light.setPointLight(screenLight);
          }
          if (mixer) {
            mixer.update(delta);
          }
          renderer.render(scene, camera);
        }
      };
      startAnimation = () => {
        if (animationLoopStarted) return;
        animationLoopStarted = true;
        animationFrameId = requestAnimationFrame(animate);
      };
      return () => {
        isMounted = false;
        if (introTimeout) window.clearTimeout(introTimeout);
        clearTimeout(debounce);
        cancelAnimationFrame(resizeFrame);
        cancelTouchReset?.();
        touchTarget?.removeEventListener("touchmove", onTouchMove);
        cancelAnimationFrame(animationFrameId);
        stageResizeObserver?.disconnect();
        disposeHover?.();
        disposeAnimations?.();
        characterAsset.dispose();
        light.dispose();
        scene.clear();
        renderer.dispose();
        window.removeEventListener("resize", onResize);
        if (canvasElement) {
          renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
          renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
          canvasElement.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          document.removeEventListener("mousemove", onMouseMove);
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
          landingDiv.removeEventListener("touchmove", onTouchMove);
        }
      };
    }
  }, [markReady]);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
