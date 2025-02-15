import {
  BoxGeometry, CircleGeometry, Mesh, MeshStandardMaterial, Object3D, Vector3
} from "three"
import { Colors } from "../../constants/Colors"
import { GlowingMushroom } from "./GlowingMushroom"

const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export class BuildingsAndSidewalks extends Object3D {
  constructor() {
    super();

    // Create a large circular grass area
    const radius = 180;
    const segments = 32;
    const circleGeometry = new CircleGeometry(radius, segments);
    const grassMaterial = new MeshStandardMaterial({
      color: 0x2ecc40, // Bright grass green color
      side: 2,
    });
    const grass = new Mesh(circleGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    this.add(grass);

    // Create three tiny buildings
    const buildingHeight = 12;

    // Left building (orange plateau)
    const plateau = new Mesh(
      new BoxGeometry(10, buildingHeight, 10),
      new MeshStandardMaterial({ color: 0xffa500 })
    );
    plateau.position.set(-80, buildingHeight / 2, -80);
    this.add(plateau);

    // Middle building (blue hall)
    const hall = new Mesh(
      new BoxGeometry(12, buildingHeight, 15),
      new MeshStandardMaterial({ color: 0x0000ff })
    );
    hall.position.set(0, buildingHeight / 2, -80);
    this.add(hall);

    // Right building (red arena)
    const arena = new Mesh(
      new BoxGeometry(15, buildingHeight, 15),
      new MeshStandardMaterial({ color: 0xff0000 })
    );
    arena.position.set(80, buildingHeight / 2, -80);
    this.add(arena);

    // Add glowing mushrooms in a scattered pattern
    const mushroomCount = 30;
    const minRadius = 20; // Keep away from center
    const maxRadius = 150; // Keep inside grass

    for (let i = 0; i < mushroomCount; i++) {
      const mushroom = new GlowingMushroom();

      // Random position in polar coordinates
      const angle = Math.random() * Math.PI * 2;
      const distance = minRadius + Math.random() * (maxRadius - minRadius);

      // Convert to Cartesian coordinates
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;

      // Random rotation
      mushroom.rotation.y = Math.random() * Math.PI * 2;

      // Random scale variation
      const scale = 0.5 + Math.random() * 1;
      mushroom.scale.set(scale, scale, scale);

      mushroom.position.set(x, 0, z);
      this.add(mushroom);
    }
  }
}
