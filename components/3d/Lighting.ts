import { Object3D, AmbientLight, DirectionalLight, Color } from 'three';
import { Colors } from '../../constants/Colors';

// Convert hex colors to Three.js colors
const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export class Lighting extends Object3D {
  private ambientLight: AmbientLight;
  private directionalLight: DirectionalLight;

  constructor() {
    super();

    // Add warm ambient light using orangeBrown color
    const ambientColor = new Color(colorToHex(Colors.orangeBrown));
    this.ambientLight = new AmbientLight(ambientColor, 0.4);
    
    // Add directional light (sun) with warm beige color
    const sunColor = new Color(colorToHex(Colors.lightBeige));
    this.directionalLight = new DirectionalLight(sunColor, 1.2);
    this.directionalLight.position.set(20, 25, -120); // Match sun position
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