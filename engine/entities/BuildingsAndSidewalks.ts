import { BoxGeometry, Mesh, MeshStandardMaterial, Object3D } from "three"

const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));
export class BuildingsAndSidewalks extends Object3D {
  constructor() {
    super();
    const buildingData = [
      { position: [-10, 3, 0], size: [4, 6, 4], color: "#ffa500" },
      { position: [0, 4, 0], size: [5, 8, 5], color: "#0000ff" },
      { position: [10, 3, 0], size: [4, 6, 4], color: "#ff0000" },
    ];
    buildingData.forEach((data) => {
      const [width, height, depth] = data.size;
      const geometry = new BoxGeometry(width, height, depth);
      const material = new MeshStandardMaterial({ color: colorToHex(data.color) });
      const building = new Mesh(geometry, material);
      building.position.set(data.position[0], data.position[1], data.position[2]);
      building.castShadow = true;
      this.add(building);
    });
  }
}
