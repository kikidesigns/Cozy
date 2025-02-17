import * as THREE from "three"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
import fontJson from "../../assets/fonts/helvetiker_regular.typeface.json"

// Cache the loaded font so we load it only once.
let cachedFont: any = null;  // Changed to any to fix type error temporarily

export async function loadFontAsync(): Promise<any> {  // Changed to any to fix type error temporarily
  if (cachedFont) return cachedFont;
  const loader = new FontLoader();
  cachedFont = loader.parse(fontJson);
  return cachedFont;
}

export async function createTextMesh(
  text: string,
  options?: {
    size?: number;
    height?: number;
    color?: number;
    position?: THREE.Vector3;
  }
): Promise<THREE.Object3D> {
  const font = await loadFontAsync();
  const size = options?.size ?? 0.5;
  const height = options?.height ?? 0.05;
  const geometry = new TextGeometry(text, {
    font,
    size,
    height,
    curveSegments: 12,
  });

  // Center the geometry
  geometry.computeBoundingBox();
  if (geometry.boundingBox) {
    const centerOffset =
      -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    geometry.translate(centerOffset, 0, 0);
  }

  const material = new THREE.MeshBasicMaterial({
    color: options?.color ?? 0xffffff,
  });

  const textMesh = new THREE.Mesh(geometry, material);

  // Create a billboard group to hold the text
  const billboardGroup = new THREE.Group();
  billboardGroup.add(textMesh);

  if (options?.position) {
    billboardGroup.position.copy(options.position);
  }

  // Add onBeforeRender callback to make the label always face the camera
  billboardGroup.onBeforeRender = function (_renderer, _scene, camera) {
    billboardGroup.quaternion.copy(camera.quaternion);
  };

  // (Optional) Also attach a manual update method if needed elsewhere
  (billboardGroup as any).updateBillboard = (camera: THREE.Camera) => {
    billboardGroup.quaternion.copy(camera.quaternion);
  };

  return billboardGroup;
}
