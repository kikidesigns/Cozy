// engine/entities/BuildingsAndSidewalks.ts
import {
  CircleGeometry, DoubleSide, Mesh, MeshBasicMaterial, Object3D
} from "three"
import { Colors } from "../../constants/Colors"

const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export class BuildingsAndSidewalks extends Object3D {
  constructor() {
    super();

    // Create a large circular grass area using MeshBasicMaterial so it’s always visible.
    const radius = 30;
    const segments = 32;
    const circleGeometry = new CircleGeometry(radius, segments);
    const grassMaterial = new MeshBasicMaterial({
      color: colorToHex(Colors.grassGreen),
      side: DoubleSide, // Render both sides
    });
    const grass = new Mesh(circleGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.renderOrder = -1; // Render this first, so it doesn't overdraw other objects.
    this.add(grass);

    // (For now, comment out the rest so we can confirm that adding the ground doesn't hide everything.)
    // Once confirmed, you can reintroduce the building and sidewalk geometry gradually.
  }
}
