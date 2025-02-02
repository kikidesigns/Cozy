import { Object3D, AmbientLight, DirectionalLight, HemisphereLight } from 'three';

export class Lighting extends Object3D {
  private ambientLight: AmbientLight;
  private hemisphereLight: HemisphereLight;
  private directionalLight: DirectionalLight;

  constructor() {
    super();

    // Add ambient light for base illumination
    this.ambientLight = new AmbientLight(0x404040, 0.3);
    
    // Add hemisphere light for better sky/ground interaction
    this.hemisphereLight = new HemisphereLight(0x6688cc, 0x997755, 0.6);
    
    // Add directional light (sun)
    this.directionalLight = new DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(5, 10, 5);
    this.directionalLight.castShadow = true;
    
    // Configure shadow properties
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -10;
    this.directionalLight.shadow.camera.right = 10;
    this.directionalLight.shadow.camera.top = 10;
    this.directionalLight.shadow.camera.bottom = -10;
    this.directionalLight.shadow.bias = -0.0001;

    this.add(this.ambientLight);
    this.add(this.hemisphereLight);
    this.add(this.directionalLight);
  }

  dispose() {
    // Cleanup if needed
    this.directionalLight.shadow.map?.dispose();
  }
}