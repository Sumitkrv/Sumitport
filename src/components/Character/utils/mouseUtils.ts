import * as THREE from "three";

export const handleMouseMove = (
  event: MouseEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  setMousePosition(mouseX, mouseY);
};

export const handleTouchMove = (
  event: TouchEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  const mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  setMousePosition(mouseX, mouseY);
};

export const handleTouchEnd = (
  setMousePosition: (
    x: number,
    y: number,
    interpolationX: number,
    interpolationY: number
  ) => void
) => {
  let settleTimeout = 0;
  let resetTimeout = 0;
  settleTimeout = window.setTimeout(() => {
    setMousePosition(0, 0, 0.03, 0.03);
    resetTimeout = window.setTimeout(() => {
      setMousePosition(0, 0, 0.1, 0.2);
    }, 1000);
  }, 2000);
  return () => {
    window.clearTimeout(settleTimeout);
    window.clearTimeout(resetTimeout);
  };
};

export const handleHeadRotation = (
  headBone: THREE.Object3D,
  mouseX: number,
  mouseY: number,
  interpolationX: number,
  interpolationY: number,
  lerp: (x: number, y: number, t: number) => number,
  scrollTop = window.scrollY
) => {
  if (!headBone) return;
  if (scrollTop < 200) {
    const maxRotation = 0.18;
    headBone.rotation.y = lerp(
      headBone.rotation.y,
      mouseX * maxRotation,
      interpolationY
    );
    headBone.rotation.x = lerp(headBone.rotation.x, -mouseY * 0.12, interpolationX);
  } else {
    if (window.innerWidth > 1024) {
      headBone.rotation.x = lerp(headBone.rotation.x, -0.4, 0.03);
      headBone.rotation.y = lerp(headBone.rotation.y, -0.3, 0.03);
    }
  }
};
