import * as THREE from "three";

// Capture the asset's bind rotations BEFORE the intro establishes its seated
// pose. All four arm joints extend along local +Y in this rig. Positions,
// scales, skinning, shoulders, spine and the face remain owned by the asset.
export function createHeroArmPose(character: THREE.Object3D) {
  const findBone = (name: string) => {
    const object = character.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(name));
    return object instanceof THREE.Bone ? object : undefined;
  };
  const upperLeft = findBone("upper_arm.L");
  const upperRight = findBone("upper_arm.R");
  const foreLeft = findBone("forearm.L");
  const foreRight = findBone("forearm.R");
  const joints = [
    { bone: upperLeft, direction: new THREE.Vector3(.14, -1, .04).normalize() },
    { bone: upperRight, direction: new THREE.Vector3(-.18, -1, .07).normalize() },
    { bone: foreLeft, direction: new THREE.Vector3(.015, -1, .10).normalize() },
    { bone: foreRight, direction: new THREE.Vector3(-.03, -1, .14).normalize() },
  ];
  const bones: Array<{
    bone: THREE.Bone;
    bind: THREE.Quaternion;
    animated: THREE.Quaternion;
    target: THREE.Quaternion;
  }> = [];
  [upperLeft, upperRight].forEach((root) => root?.traverse((object) => {
    if (object instanceof THREE.Bone) bones.push({
      bone: object,
      bind: object.quaternion.clone(),
      animated: new THREE.Quaternion(),
      target: new THREE.Quaternion(),
    });
  }));
  const supported = joints.every(({ bone }) => !!bone);
  const rootWorld = new THREE.Quaternion();
  const parentWorld = new THREE.Quaternion();
  const world = new THREE.Quaternion();
  const swing = new THREE.Quaternion();
  const currentDirection = new THREE.Vector3();
  const targetDirection = new THREE.Vector3();
  let applied = false;

  // Exact restoration also runs when the mixer is paused or motion is reduced.
  // It prevents this presentation pose from becoming the next animation base.
  const restore = () => {
    if (!applied) return;
    bones.forEach(({ bone, animated }) => bone.quaternion.copy(animated));
    applied = false;
  };
  const apply = (weight: number) => {
    restore();
    if (!supported || weight <= 0) return;
    bones.forEach(({ bone, bind, animated }) => {
      animated.copy(bone.quaternion);
      bone.quaternion.copy(bind);
    });
    character.updateMatrixWorld(true);
    character.getWorldQuaternion(rootWorld);
    joints.forEach(({ bone, direction }) => {
      if (!bone?.parent) return;
      bone.getWorldQuaternion(world);
      currentDirection.set(0, 1, 0).applyQuaternion(world).normalize();
      targetDirection.copy(direction).applyQuaternion(rootWorld);
      swing.setFromUnitVectors(currentDirection, targetDirection);
      world.premultiply(swing);
      bone.parent.getWorldQuaternion(parentWorld);
      bone.quaternion.copy(parentWorld.invert().multiply(world));
      character.updateMatrixWorld(true);
    });
    bones.forEach(({ bone, animated, target }) => {
      target.copy(bone.quaternion);
      bone.quaternion.slerpQuaternions(animated, target, THREE.MathUtils.clamp(weight, 0, 1));
    });
    applied = true;
  };
  return { restore, apply };
}
