// engine/entities/Ground.ts
import {
  CircleGeometry, DoubleSide, Mesh, MeshStandardMaterial, Object3D
} from "three"
import { Colors } from "../constants/Colors"

export class Ground extends Object3D {
  constructor() {
    super();
    const radius = 60;
    const segments = 32;
    const geometry = new CircleGeometry(radius, segments);

    const material = new MeshStandardMaterial({
      color: 0x4F7942, // A softer, more natural sage green
      metalness: 0,
      roughness: 1,
      side: DoubleSide,
    });

    const mesh = new Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;

    // Mark the ground so the raycaster ignores it.
    mesh.userData.ignoreRaycast = true;

    this.add(mesh);
  }
}
