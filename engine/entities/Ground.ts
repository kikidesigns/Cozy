// engine/entities/Ground.ts
import {
  CircleGeometry, DoubleSide, Mesh, MeshBasicMaterial, Object3D
} from "three"
import { Colors } from "../../constants/Colors"

export class Ground extends Object3D {
  constructor() {
    super();
    const radius = 30;
    const segments = 32;
    const geometry = new CircleGeometry(radius, segments);
    const material = new MeshBasicMaterial({
      color: Colors.grassGreen || "#228B22",
      side: DoubleSide,
    });
    const mesh = new Mesh(geometry, material);
    // Rotate so the circle lies flat
    mesh.rotation.x = -Math.PI / 2;
    // Force this ground to render first (behind other objects)
    mesh.renderOrder = -1;
    this.add(mesh);
  }
}
