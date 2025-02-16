// engine/entities/Lighting.ts
import { AmbientLight, Color, DirectionalLight, Object3D } from "three"
import { Colors } from "../../constants/Colors"

const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export class Lighting extends Object3D {
  private ambientLight: AmbientLight;
  private directionalLight: DirectionalLight;

  constructor() {
    super();
    // Increase ambient light intensity for better overall illumination.
    const ambientColor = new Color(colorToHex(Colors.orangeBrown));
    this.ambientLight = new AmbientLight(ambientColor, 1.0);

    // Reposition the directional light to better illuminate the scene.
    const sunColor = new Color(colorToHex(Colors.lightBeige));
    this.directionalLight = new DirectionalLight(sunColor, 1.2);
    this.directionalLight.position.set(10, 10, 10);
    // Ensure the light points toward the scene center.
    this.directionalLight.target.position.set(0, 0, 0);
    this.add(this.directionalLight.target);

    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.left = -50;
    this.directionalLight.shadow.camera.right = 50;
    this.directionalLight.shadow.camera.top = 50;
    this.directionalLight.shadow.camera.bottom = -50;
    this.directionalLight.shadow.bias = -0.001;

    this.add(this.ambientLight);
    this.add(this.directionalLight);
  }

  dispose() {
    // No resources to dispose.
  }
}
