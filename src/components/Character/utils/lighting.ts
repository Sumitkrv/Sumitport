import * as THREE from "three";
import { RGBELoader } from "three-stdlib";
import { gsap } from "gsap";

type EmissiveOpacityMaterial = THREE.Material & {
  opacity: number;
  emissiveIntensity: number;
};

const isEmissiveOpacityMaterial = (
  material: THREE.Material
): material is EmissiveOpacityMaterial => {
  return "opacity" in material && "emissiveIntensity" in material;
};

const setLighting = (scene: THREE.Scene) => {
  const ambientLight = new THREE.HemisphereLight(0xdce8ff, 0x13141f, 0.66);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xf1f5fa, 0);
  keyLight.position.set(-5, 8, 9);
  scene.add(keyLight);

  const directionalLight = new THREE.DirectionalLight(0x51e3d1, 0);
  directionalLight.position.set(-5, 4, -6);
  scene.add(directionalLight);

  const lavenderLight = new THREE.DirectionalLight(0xc9a7f5, 0.28);
  lavenderLight.position.set(6, 3, -4);
  scene.add(lavenderLight);

  const pointLight = new THREE.PointLight(0x22d3ee, 0, 100, 3);
  pointLight.position.set(3, 12, 4);
  pointLight.castShadow = true;
  scene.add(pointLight);

  let environment: THREE.DataTexture | null = null;
  let disposed = false;
  let lightsEnabled = false;
  new RGBELoader()
    .setPath("/models/")
    .load("char_enviorment.hdr?v=2", function (texture) {
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.mapping = THREE.EquirectangularReflectionMapping;
      environment = texture;
      scene.environment = texture;
      scene.environmentIntensity = lightsEnabled ? 0.64 : 0;
      scene.environmentRotation.set(5.76, 85.85, 1);
    }, undefined, () => undefined);

  function setPointLight(screenLight: THREE.Object3D | null) {
    if (!(screenLight instanceof THREE.Mesh)) {
      pointLight.intensity = 0;
      return;
    }

    const material = Array.isArray(screenLight.material)
      ? screenLight.material[0]
      : screenLight.material;

    if (!material || !isEmissiveOpacityMaterial(material)) {
      pointLight.intensity = 0;
      return;
    }

    if (material.opacity > 0.9) {
      pointLight.intensity = Math.min(material.emissiveIntensity * 2.5, 3);
      return;
    }

    pointLight.intensity = 0;
  }
  const duration = 2;
  const ease = "power2.inOut";
  function turnOnLights(reducedMotion = false) {
    lightsEnabled = true;
    if (reducedMotion) {
      scene.environmentIntensity = environment ? 0.64 : 0;
      directionalLight.intensity = 0.82;
      keyLight.intensity = 1.05;
      const rim = document.querySelector<HTMLElement>(".character-rim");
      if (rim) rim.style.opacity = ".65";
      return;
    }
    gsap.to(scene, {
      environmentIntensity: 0.64,
      duration: duration,
      ease: ease,
    });
    gsap.to(directionalLight, {
      intensity: 0.82,
      duration,
      ease,
    });
    gsap.to(keyLight, {
      intensity: 1.05,
      duration: duration,
      ease: ease,
    });
    gsap.to(".character-rim", {
      y: "55%",
      opacity: 1,
      delay: 0.2,
      duration: 2,
    });
  }

  function dispose() {
    disposed = true;
    gsap.killTweensOf([scene, keyLight, directionalLight]);
    const rim = document.querySelector(".character-rim");
    if (rim) gsap.killTweensOf(rim);
    if (scene.environment === environment) scene.environment = null;
    environment?.dispose();
    [ambientLight, keyLight, directionalLight, lavenderLight, pointLight].forEach((light) => scene.remove(light));
  }

  return { setPointLight, turnOnLights, dispose };
};

export default setLighting;
