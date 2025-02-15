import { AmbientLight, Color, DirectionalLight, Object3D } from "three"
import { Colors } from "../../constants/Colors"

const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export class Lighting extends Object3D {
  private ambientLight: AmbientLight;
  private directionalLight: DirectionalLight;

  constructor() {
    super();

    // Add warm ambient light for sunset
    const ambientColor = new Color(0xff8c69); // Warm salmon color
    this.ambientLight = new AmbientLight(ambientColor, 0.6);

    // Add directional light (sun) with sunset orange color
    const sunColor = new Color(0xff4500); // Orange-red sunset color
    this.directionalLight = new DirectionalLight(sunColor, 1.0);
    this.directionalLight.position.set(-20, 15, 20); // Lower angle for sunset
    this.directionalLight.castShadow = true;

    // Configure shadow properties for better quality
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
    // No geometries or materials to dispose in lights
  }
}
