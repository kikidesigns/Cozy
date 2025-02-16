// engine/entities/Ground.ts
import {
  CircleGeometry, DoubleSide, Mesh, MeshStandardMaterial, Object3D
} from "three"
import { Colors } from "../constants/Colors"

export class Ground extends Object3D {
  constructor() {
    super();
    const radius = 30;
    const segments = 32;
    const geometry = new CircleGeometry(radius, segments);

    // Use MeshStandardMaterial with a preset color.
    // MeshStandardMaterial reacts to lights and shows shadows.
    const material = new MeshStandardMaterial({
      color: Colors.grassGreen || "#228B22",
      metalness: 0,
      roughness: 1,
      side: DoubleSide,
    });

    const mesh = new Mesh(geometry, material);
    // Rotate the circle so it lies flat.
    mesh.rotation.x = -Math.PI / 2;
    // Ensure the ground receives shadows.
    mesh.receiveShadow = true;

    this.add(mesh);
  }
}
