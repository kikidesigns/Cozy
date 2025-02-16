import { AmbientLight, Color, DirectionalLight, Object3D } from "three"
import { Colors } from "../../constants/Colors"

const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export class Lighting extends Object3D {
  private ambientLight: AmbientLight;
  private directionalLight: DirectionalLight;

  constructor() {
    super();
    // Ambient light remains at full strength.
    const ambientColor = new Color(colorToHex(Colors.orangeBrown));
    this.ambientLight = new AmbientLight(ambientColor, 0.5);

    // Set up a directional (sun) light.
    const sunColor = new Color(colorToHex(Colors.lightBeige));
    // Lower intensity for fainter shadows.
    this.directionalLight = new DirectionalLight(sunColor, 0.8);
    this.directionalLight.position.set(10, 10, 10);
    // Ensure the light points toward the scene center.
    this.directionalLight.target.position.set(0, 0, 0);
    this.add(this.directionalLight.target);

    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;

    // Tighten the shadow camera frustum for improved depth precision.
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -20;
    this.directionalLight.shadow.camera.right = 20;
    this.directionalLight.shadow.camera.top = 20;
    this.directionalLight.shadow.camera.bottom = -20;

    // Adjust the shadow bias to reduce any unwanted gap.
    this.directionalLight.shadow.bias = 0.0001;

    this.add(this.ambientLight);
    this.add(this.directionalLight);
  }

  dispose() {
    // No resources to dispose.
  }
}
