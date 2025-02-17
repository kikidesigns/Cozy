import * as THREE from "three"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
import fontJson from "../../assets/fonts/helvetiker_regular.typeface.json"

// Cache the loaded font so we load it only once.
let cachedFont: THREE.Font | null = null;

export async function loadFontAsync(): Promise<THREE.Font> {
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
): Promise<THREE.Mesh> {
  const font = await loadFontAsync();
  const size = options?.size ?? 0.5;
  const height = options?.height ?? 0.05;
  const geometry = new TextGeometry(text, {
    font,
    size,
    height,
    curveSegments: 12,
  });
  // Center the geometry (so the text is centered)
  geometry.computeBoundingBox();
  if (geometry.boundingBox) {
    const centerOffset =
      -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    geometry.translate(centerOffset, 0, 0);
  }
  const material = new THREE.MeshBasicMaterial({
    color: options?.color ?? 0xffffff,
  });
  const mesh = new THREE.Mesh(geometry, material);
  if (options?.position) {
    mesh.position.copy(options.position);
  }
  return mesh;
}
