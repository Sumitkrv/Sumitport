import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);
  let disposed = false;
  let loadedCharacter: GLTF | null = null;

  const disposeGLTF = (gltf: GLTF) => {
    gltf.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) value.dispose();
        });
        material.dispose();
      });
    });
  };

  const loadCharacter = async (): Promise<GLTF | null> => {
    const encryptedBlob = await decryptFile(
      "/models/character.enc?v=2",
      "MyCharacter12"
    );
    const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

    try {
      const gltf = await loader.loadAsync(blobUrl);
      if (disposed) {
        disposeGLTF(gltf);
        return null;
      }
      const character = gltf.scene;
      await renderer.compileAsync(character, camera, scene);
      if (disposed) {
        disposeGLTF(gltf);
        return null;
      }

      character.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return;

        const mesh = child as THREE.Mesh;
        const baseMaterial = Array.isArray(mesh.material)
          ? mesh.material[0]
          : mesh.material;

        if (baseMaterial) {
          if (mesh.name === "BODY.SHIRT") {
            const newMat = baseMaterial.clone() as THREE.MeshStandardMaterial;
            newMat.color = new THREE.Color("#8B4513");
            mesh.material = newMat;
          } else if (mesh.name === "Pant") {
            const newMat = baseMaterial.clone() as THREE.MeshStandardMaterial;
            newMat.color = new THREE.Color("#000000");
            mesh.material = newMat;
          }
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = true;
      });

      loadedCharacter = gltf;

      const footR = character.getObjectByName("foot.R");
      const footL = character.getObjectByName("foot.L");
      if (footR) footR.position.y = 3.36;
      if (footL) footL.position.y = 3.36;

      return gltf;
    } catch (error) {
      console.error("Error loading GLTF model:", error);
      throw error;
    } finally {
      URL.revokeObjectURL(blobUrl);
      dracoLoader.dispose();
    }
  };

  const dispose = () => {
    disposed = true;
    if (loadedCharacter) {
      scene.remove(loadedCharacter.scene);
      disposeGLTF(loadedCharacter);
      loadedCharacter = null;
    }
    dracoLoader.dispose();
  };

  return { loadCharacter, dispose };
};

export default setCharacter;
