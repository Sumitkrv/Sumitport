import * as THREE from "three";

export default function handleResize(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  canvasDiv: React.RefObject<HTMLDivElement>
) {
  if (!canvasDiv.current) return;
  const canvas3d = canvasDiv.current.getBoundingClientRect();
  const width = canvas3d.width;
  const height = canvas3d.height;
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.15 : 1.5));
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
