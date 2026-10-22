import * as THREE from "three";

type Owner = "hero" | "about" | "inactive";
const clamp = THREE.MathUtils.clamp;

// One writer owns the Hero/About portrait, camera and furniture. Every frame is
// derived from section geometry, so refresh/reverse/resize cannot retain a later pose.
export function createHeroFraming(
  character: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  host: HTMLElement,
  staticHero = false
) {
  const hero = document.getElementById("landingDiv");
  const about = document.getElementById("about");
  const expertise = document.getElementById("expertise");
  const slot = document.querySelector<HTMLElement>(".landing-stage");
  const restRotation = character.rotation.clone();
  const furniture = character.children.filter((root) =>
    !root.getObjectByProperty("isSkinnedMesh", true));
  const visibility = furniture.map((root) => root.visible);
  furniture.forEach((root) => { root.visible = false; });

  character.updateMatrixWorld(true);
  const headBounds = new THREE.Box3();
  ["CAP001", "CAP002", "Face002", "Ear001"].forEach((name) => {
    const part = character.getObjectByName(name);
    if (part) headBounds.union(new THREE.Box3().setFromObject(part, true));
  });
  const headSize = headBounds.getSize(new THREE.Vector3());
  const center = headBounds.getCenter(new THREE.Vector3());
  const portraitWidth = Math.max(headSize.x * 1.65, 4.8);
  const portraitHeight = Math.max(headSize.y * 1.85, 5.8);
  const portraitY = headBounds.max.y - portraitHeight / 2 + .15;
  const tanFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

  let owner: Owner = "inactive";

  const update = (pointerX = 0) => {
    const heroRect = hero?.getBoundingClientRect();
    const aboutRect = about?.getBoundingClientRect();
    const whatRect = expertise?.getBoundingClientRect();
    const height = window.innerHeight;
    const nextOwner: Owner = staticHero || (heroRect && heroRect.bottom > height * .15)
      ? "hero"
      : whatRect && whatRect.top < height * .6 && whatRect.bottom > height * .1
        ? "inactive"
        : aboutRect && aboutRect.bottom > 0 && aboutRect.top < height
          ? "about" : "inactive";
    if (owner !== nextOwner) {
      owner = nextOwner;
      document.documentElement.dataset.characterOwner = owner;
      host.dataset.sceneOwner = owner;
      // What I Do has its own local scene. This portrait never shows furniture.
      furniture.forEach((root) => { root.visible = false; });
    }
    character.visible = owner !== "inactive";
    const amount = staticHero ? 1 : heroRect ? clamp(heroRect.bottom / heroRect.height, 0, 1) : 0;
    const blend = THREE.MathUtils.smoothstep(amount, 0, 1);
    const desktop = window.innerWidth > 1024;
    host.style.setProperty("--character-pan", "0%");
    const frame = host.getBoundingClientRect();
    const target = slot?.getBoundingClientRect();
    if (!frame.width || !frame.height) return { owner, heroAmount: blend };
    camera.aspect = frame.width / frame.height;
    camera.zoom = 1;
    camera.quaternion.identity();
    camera.clearViewOffset();

    {
      character.rotation.set(restRotation.x + .12 * (1 - blend), restRotation.y + .7 * (1 - blend), restRotation.z);
      const slotWidth = target?.width ?? frame.width;
      const slotHeight = target?.height ?? frame.height;
      const distance = Math.max(
        portraitHeight / (2 * tanFov) * frame.height / slotHeight,
        portraitWidth / (2 * tanFov * camera.aspect) * frame.width / slotWidth
      );
      const portraitZ = headBounds.max.z + distance;
      const copy = about?.querySelector<HTMLElement>(".about-me")?.getBoundingClientRect();
      const aboutWidth = Math.max(200, (copy?.left ?? frame.width / 2) - (aboutRect?.left ?? 0) - 48);
      const aboutTop = Math.max(100, (aboutRect?.top ?? 0) + 80);
      const aboutBottom = Math.max(aboutTop + 200, Math.min(height - 40, (aboutRect?.bottom ?? height) - 80));
      const aboutHeight = aboutBottom - aboutTop;
      const aboutPortraitHeight = Math.max(headSize.y * 2.5, 7.5);
      const aboutDistance = Math.max(aboutPortraitHeight / (2 * tanFov) * frame.height / aboutHeight,
        portraitWidth * 1.7 / (2 * tanFov * camera.aspect) * frame.width / aboutWidth);
      camera.position.set(center.x + pointerX * .12 * blend,
        THREE.MathUtils.lerp(headBounds.max.y - aboutPortraitHeight / 2 + .15, portraitY, blend),
        THREE.MathUtils.lerp(headBounds.max.z + aboutDistance, portraitZ, blend));
      if (desktop && target && blend > 0) {
        camera.setViewOffset(frame.width, frame.height,
          THREE.MathUtils.lerp(frame.width / 2 - ((aboutRect?.left ?? 0) + aboutWidth / 2 - frame.left),
            frame.width / 2 - (target.left - frame.left + target.width / 2), blend),
          THREE.MathUtils.lerp(frame.height / 2 - (aboutTop + aboutHeight / 2 - frame.top),
            frame.height / 2 - (target.top - frame.top + target.height / 2), blend),
          frame.width, frame.height);
      } else if (desktop && owner === "about") {
        camera.setViewOffset(frame.width, frame.height,
          frame.width / 2 - ((aboutRect?.left ?? 0) + aboutWidth / 2 - frame.left),
          frame.height / 2 - (aboutTop + aboutHeight / 2 - frame.top), frame.width, frame.height);
      }
    }
    camera.updateProjectionMatrix();
    return { owner, heroAmount: blend };
  };

  // Read-only, development-only inspection used by the browser recovery checks.
  const diagnosticHost = host as HTMLElement & { getSceneSnapshot?: () => unknown };
  if (import.meta.env.DEV) diagnosticHost.getSceneSnapshot = () => ({
    owner, asset: "/models/character.enc?v=2", headBounds: [headBounds.min.toArray(), headBounds.max.toArray()],
    camera: { position: camera.position.toArray(), zoom: camera.zoom, aspect: camera.aspect },
    root: { rotation: character.rotation.toArray(), scale: character.scale.toArray() },
    arms: ["upper_arm.L", "upper_arm.R", "forearm.L", "forearm.R", "hand.L", "hand.R"].map((name) => {
      const bone = character.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(name));
      return { name, quaternion: bone?.quaternion.toArray(), position: bone?.getWorldPosition(new THREE.Vector3()).toArray() };
    }),
    furniture: furniture.map((root) => ({ name: root.name, visible: root.visible })),
  });
  const dispose = () => {
    furniture.forEach((root, i) => { root.visible = visibility[i]; });
    character.rotation.copy(restRotation);
    host.style.removeProperty("--character-pan");
    delete document.documentElement.dataset.characterOwner;
    delete diagnosticHost.getSceneSnapshot;
  };
  return { update, dispose };
}
