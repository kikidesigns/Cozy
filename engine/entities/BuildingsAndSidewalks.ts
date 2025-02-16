import {
  BoxGeometry, CatmullRomCurve3, CircleGeometry, Mesh, MeshStandardMaterial,
  Object3D, TubeGeometry, Vector3
} from "three"
import { Colors } from "../../constants/Colors"

const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export class BuildingsAndSidewalks extends Object3D {
  constructor() {
    super();

    // Create a circular grass area
    const radius = 30;
    const segments = 32;
    const circleGeometry = new CircleGeometry(radius, segments);
    const grassMaterial = new MeshStandardMaterial({
      color: colorToHex(Colors.grassGreen),
      side: 2, // render both sides
    });
    const grass = new Mesh(circleGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    this.add(grass);

    // Building placeholders
    const buildingData = [
      { name: 'noob area', position: new Vector3(-12, 0, 0), color: 0xffa500 },
      { name: 'main office', position: new Vector3(0, 0, 0), color: 0x0000ff },
      { name: 'arena', position: new Vector3(12, 0, 0), color: 0xff0000 },
    ];

    buildingData.forEach(data => {
      const width = 4, height = 6, depth = 4;
      const geometry = new BoxGeometry(width, height, depth);
      const material = new MeshStandardMaterial({ color: data.color });
      const building = new Mesh(geometry, material);
      building.position.copy(data.position);
      building.position.y = height / 2;
      this.add(building);
    });

    // Curved sidewalks
    const sidewalkMaterial = new MeshStandardMaterial({ color: 0x808080 });
    // Sidewalk 1
    const sidewalk1Points = [
      new Vector3(-12, 0.05, 0),
      new Vector3(-6, 0.05, 5),
      new Vector3(0, 0.05, 0),
    ];
    const curve1 = new CatmullRomCurve3(sidewalk1Points);
    const sidewalk1Geometry = new TubeGeometry(curve1, 20, 0.3, 8, false);
    const sidewalk1 = new Mesh(sidewalk1Geometry, sidewalkMaterial);
    this.add(sidewalk1);

    // Sidewalk 2
    const sidewalk2Points = [
      new Vector3(0, 0.05, 0),
      new Vector3(6, 0.05, -5),
      new Vector3(12, 0.05, 0),
    ];
    const curve2 = new CatmullRomCurve3(sidewalk2Points);
    const sidewalk2Geometry = new TubeGeometry(curve2, 20, 0.3, 8, false);
    const sidewalk2 = new Mesh(sidewalk2Geometry, sidewalkMaterial);
    this.add(sidewalk2);

    // Sidewalk 3
    const sidewalk3Points = [
      new Vector3(-12, 0.05, 0),
      new Vector3(0, 0.05, 10),
      new Vector3(12, 0.05, 0),
    ];
    const curve3 = new CatmullRomCurve3(sidewalk3Points);
    const sidewalk3Geometry = new TubeGeometry(curve3, 30, 0.3, 8, false);
    const sidewalk3 = new Mesh(sidewalk3Geometry, sidewalkMaterial);
    this.add(sidewalk3);
  }
}
