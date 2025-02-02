import { Object3D, AmbientLight, DirectionalLight } from 'three';

export class Lighting extends Object3D {
  private ambientLight: AmbientLight;
  private directionalLight: DirectionalLight;

  constructor() {
    super();

    // Add ambient light
    this.ambientLight = new AmbientLight(0x404040, 0.5);
    
    // Add directional light (sun)
    this.directionalLight = new DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(5, 5, 5);
    this.directionalLight.castShadow = true;
    
    // Configure shadow properties
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;

    this.add(this.ambientLight);
    this.add(this.directionalLight);
  }

  dispose() {
    // Cleanup if needed
  }
}