import * as THREE from "three";
import gsap from "gsap";

type OpacityMaterial = THREE.Material & { opacity: number };
type EmissiveMaterial = OpacityMaterial & {
  emissive: THREE.Color;
  emissiveIntensity: number;
};

const getSingleMaterial = (
  material: THREE.Material | THREE.Material[]
): THREE.Material | null => {
  return Array.isArray(material) ? material[0] ?? null : material;
};

const isOpacityMaterial = (
  material: THREE.Material | null
): material is OpacityMaterial => {
  return !!material && "opacity" in material;
};

const isEmissiveMaterial = (
  material: THREE.Material | null
): material is EmissiveMaterial => {
  return !!material && "opacity" in material && "emissive" in material;
};

export function setCharTimeline(
  character: THREE.Object3D<THREE.Object3DEventMap> | null,
  camera: THREE.PerspectiveCamera
) {
  let screenLightPulse: gsap.core.Tween | null = null;
  const context = gsap.context(() => {
    let screenLightMaterial: EmissiveMaterial | null = null;
    let monitorMaterial: OpacityMaterial | null = null;

    character?.children.forEach((object) => {
      if (object.name === "Plane004") {
        object.children.forEach((child) => {
          if (!(child as THREE.Mesh).isMesh) return;

          const mesh = child as THREE.Mesh;
          const material = getSingleMaterial(mesh.material);

          if (isOpacityMaterial(material)) {
            material.transparent = true;
            material.opacity = 0;
          }

          if (material?.name === "Material.018") {
            monitorMaterial = isOpacityMaterial(material) ? material : null;
            if (
              monitorMaterial &&
              "color" in monitorMaterial &&
              monitorMaterial.color instanceof THREE.Color
            ) {
              monitorMaterial.color.set("#FFFFFF");
            }
          }
        });
      }
      if (object.name === "screenlight") {
        if (!(object as THREE.Mesh).isMesh) return;
        const mesh = object as THREE.Mesh;
        const material = getSingleMaterial(mesh.material);

        if (isEmissiveMaterial(material)) {
          material.transparent = true;
          material.opacity = 0;
          material.emissive.set("#B0F5EA");
          screenLightPulse = gsap.to(material, {
            emissiveIntensity: () => Math.random() * 5,
            duration: () => .25 + Math.random() * .35,
            repeat: -1,
            repeatRefresh: true,
            ease: "sine.inOut",
          });
          screenLightMaterial = material;
        }
      }
    });

    const neckBone = character?.getObjectByName("spine.005");
    if (window.innerWidth > 1024 && character) {
      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".landing-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      const aboutTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".about-section",
          start: "center 55%",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      const whatTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".whatIDO",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      heroTimeline
        .fromTo(character.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
        .to(camera.position, { z: 22 }, 0)
        .fromTo(".character-model", { x: 0 }, { x: "-25%", duration: 1 }, 0)
        .to(".landing-container", { opacity: 0, duration: 0.45 }, 0.45)
        .to(".landing-container", { y: "-10%", duration: 0.8 }, 0.15);

      aboutTimeline
        .to(camera.position, { z: 28, y: 12.4, duration: 1, ease: "power2.inOut" }, 0)
        .to(character.rotation, { y: 0.92, x: 0.12, duration: 1 }, 0)
        .to(neckBone?.rotation ?? {}, { x: 0.18, duration: 1 }, 0);

      if (monitorMaterial) {
        aboutTimeline.to(monitorMaterial, { opacity: 1, duration: 0.3 }, 0.2);
      }

      if (screenLightMaterial) {
        aboutTimeline.to(screenLightMaterial, { opacity: 1, duration: 0.3 }, 0.4);
      }

      whatTimeline
        .fromTo(
          ".character-model",
          { x: "-25%", y: "0%" },
          { x: "0%", y: "0%", duration: 0.2, ease: "power2.out" },
          0
        )
        .to(camera.position, { z: 60, y: 10.5, duration: 0.2, ease: "power2.out" }, 0)
        .to(character.rotation, { x: -0.04, duration: 4, ease: "none" }, 0)
        .to(".character-model", { y: "-100%", duration: 0.8, ease: "power1.in" }, 3.2);
    } else if (character) {
      const compactWhatTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".whatIDO",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      compactWhatTimeline
        // A narrower canvas needs more camera distance to keep the full desk and character in frame.
        .to(camera.position, { z: 60, y: 10.5, duration: 0.2, ease: "power2.out" }, 0)
        .to(character.rotation, { x: -0.04, duration: 4, ease: "none" }, 0);
    }
  });

  return () => {
    context.revert();
    screenLightPulse?.kill();
  };
}
