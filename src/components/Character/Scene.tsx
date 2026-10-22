import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/loadingContext";
import { createHeroFraming } from "./utils/heroFraming";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setHeroContentTimeline } from "../utils/GsapScroll";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { markReady, isLoading } = useLoading();
  const loadingRef = useRef(isLoading);
  const startIdleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    loadingRef.current = isLoading;
    if (!isLoading) startIdleRef.current?.();
  }, [isLoading]);

  useEffect(() => {
    if (canvasDiv.current) {
      const canvasElement = canvasDiv.current;
      const rect = canvasDiv.current.getBoundingClientRect();
      const container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;
      const staticHero = import.meta.env.DEV && new URLSearchParams(window.location.search).has("sceneStatic");
      const disposeContentTimeline = setHeroContentTimeline();

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        disposeContentTimeline();
        markReady();
        return;
      }
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(container.width, container.height, false);
      renderer.domElement.style.display = "block";
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
      let restoreHeroPose: (() => void) | undefined;
      let applyHeroPose: ((weight: number) => void) | undefined;
      let framing: ReturnType<typeof createHeroFraming> | undefined;
      let disposeAnimations: (() => void) | undefined;
      let disposeHover: (() => void) | undefined;
      let contextAvailable = true;
      let resizeFrame = 0;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      const characterAsset = setCharacter(renderer, scene, camera);
      const { loadCharacter } = characterAsset;
      let isMounted = true;
      let startAnimation: () => void = () => undefined;

      loadCharacter().then((gltf) => {
        if (gltf && isMounted) {
          const animations = setAnimations(gltf, !reducedMotion && !staticHero);
          disposeAnimations = animations.dispose;
          if (hoverDivRef.current && !reducedMotion) {
            disposeHover = animations.hover(gltf, hoverDivRef.current);
          }
          mixer = animations.mixer;
          restoreHeroPose = animations.restoreHeroPose;
          applyHeroPose = animations.applyHeroPose;
          const character = gltf.scene;
          scene.add(character);
          framing = createHeroFraming(character, camera, canvasElement, staticHero);
          startAnimation();
          headBone = character.getObjectByName("spine006") || null;
          screenLight = character.getObjectByName("screenlight") || null;
          markReady();
          let introStarted = false;
          startIdleRef.current = () => {
            if (introStarted || !isMounted) return;
            introStarted = true;
            light.turnOnLights(reducedMotion || staticHero);
            animations.startSafeIdle();
          };
          if (!loadingRef.current) startIdleRef.current();
          window.addEventListener("resize", onResize);
        } else if (isMounted) {
          markReady();
        }
      }).catch(() => {
        if (isMounted) markReady();
      });

      let mouse = { x: 0, y: 0 };
      const headOffset = { x: 0, y: 0 };

      const onResize = () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => handleResize(renderer, camera, canvasDiv));
      };
      const stageResizeObserver = "ResizeObserver" in window
        ? new ResizeObserver(onResize)
        : null;
      stageResizeObserver?.observe(canvasElement);

      const onMouseMove = (event: MouseEvent) => {
        if (reducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
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
        cancelTouchReset = handleTouchEnd((x, y) => { mouse = { x, y }; });
      };

      const resetPointer = () => { mouse = { x: 0, y: 0 }; };
      document.documentElement.addEventListener("pointerleave", resetPointer);
      window.addEventListener("blur", resetPointer);
      document.addEventListener("mousemove", onMouseMove);
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      const onContextLost = (event: Event) => {
        event.preventDefault();
        delete document.documentElement.dataset.heroRendered;
        contextAvailable = false;
        cancelAnimationFrame(animationFrameId);
        animationLoopStarted = false;
      };
      const onContextRestored = () => { contextAvailable = true; startAnimation(); };
      renderer.domElement.addEventListener("webglcontextlost", onContextLost);
      renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
      let animationFrameId = 0;
      let animationLoopStarted = false;
      let stageVisible = true;
      const renderSize = new THREE.Vector2();
      const animate = () => {
        if (!isMounted || !stageVisible || !contextAvailable || document.hidden) {
          animationLoopStarted = false;
          return;
        }
        animationFrameId = requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), .25);
        if (contextAvailable && document.visibilityState === "visible") {
          // Remove last frame's presentation offset before the mixer writes
          // this frame's pose. The pointer offset is reapplied once below.
          // Adding the damped value without removing it first accumulates
          // rotation every frame and eventually turns the face away.
          if (headBone && !reducedMotion) {
            headBone.rotation.x -= headOffset.x;
            headBone.rotation.y -= headOffset.y;
          }
          restoreHeroPose?.();
          if (mixer && !staticHero) mixer.update(delta);
          const presentation = framing?.update(reducedMotion || staticHero ? 0 : mouse.x);
          const heroAmount = presentation?.heroAmount ?? 0;
          // The single animation controller applies this after mixer evaluation.
          // Finish restoring the seated pose before About can own the scene.
          applyHeroPose?.(presentation?.owner === "hero"
            ? THREE.MathUtils.smoothstep(heroAmount, .2, .8) : 0);
          light.setHeroLighting(heroAmount);
          const frame = canvasElement.getBoundingClientRect();
          renderer.getSize(renderSize);
          if (frame.width > 0 && frame.height > 0 &&
            (Math.abs(renderSize.x - frame.width) > .5 || Math.abs(renderSize.y - frame.height) > .5)) {
            renderer.setSize(frame.width, frame.height, false);
          }
          if (headBone && !reducedMotion) {
            const tracking = !staticHero && presentation?.owner === "hero" && heroAmount > .8 && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
            headOffset.x = THREE.MathUtils.damp(headOffset.x, tracking ? -mouse.y * .06 : 0, 5, delta);
            headOffset.y = THREE.MathUtils.damp(headOffset.y, tracking ? mouse.x * .1 : 0, 5, delta);
            // Add to the rig's animated pose instead of replacing its base rotation.
            headBone.rotation.x += headOffset.x;
            headBone.rotation.y += headOffset.y;
            light.setPointLight(screenLight);
          }
          renderer.render(scene, camera);
          if (mixer && !loadingRef.current && !document.documentElement.hasAttribute("data-hero-rendered")) {
            document.documentElement.dataset.heroRendered = "true";
          }
        }
      };
      startAnimation = () => {
        if (animationLoopStarted || !stageVisible || document.hidden || !contextAvailable) return;
        animationLoopStarted = true;
        animationFrameId = requestAnimationFrame(animate);
      };
      // The portrait serves Hero and About; What I Do owns a local workstation.
      const stages = Array.from(document.querySelectorAll<HTMLElement>("#landingDiv, #about"));
      const visibleStages = new Set<Element>();
      const updateActivity = () => {
        stageVisible = visibleStages.size > 0;
        const host = canvasElement.parentElement;
        if (host) host.style.visibility = stageVisible ? "" : "hidden";
        if (stageVisible && !document.hidden) startAnimation();
        else {
          cancelAnimationFrame(animationFrameId);
          animationLoopStarted = false;
        }
      };
      stages.forEach((stage) => {
        const bounds = stage.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < window.innerHeight) visibleStages.add(stage);
      });
      const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleStages.add(entry.target);
          else visibleStages.delete(entry.target);
        });
        updateActivity();
      });
      stages.forEach((stage) => visibilityObserver.observe(stage));
      updateActivity();
      document.addEventListener("visibilitychange", updateActivity);
      return () => {
        isMounted = false;
        delete document.documentElement.dataset.heroRendered;
        startIdleRef.current = null;
        visibilityObserver.disconnect();
        document.removeEventListener("visibilitychange", updateActivity);
        clearTimeout(debounce);
        cancelAnimationFrame(resizeFrame);
        cancelTouchReset?.();
        touchTarget?.removeEventListener("touchmove", onTouchMove);
        cancelAnimationFrame(animationFrameId);
        stageResizeObserver?.disconnect();
        disposeHover?.();
        disposeAnimations?.();
        framing?.dispose();
        disposeContentTimeline();
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
        document.removeEventListener("mousemove", onMouseMove);
        document.documentElement.removeEventListener("pointerleave", resetPointer);
        window.removeEventListener("blur", resetPointer);
        if (landingDiv) {
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
          landingDiv.removeEventListener("touchmove", onTouchMove);
        }
      };
    }
  }, [markReady]);

  return (
    <>
      <div className="character-container" aria-hidden="true">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
