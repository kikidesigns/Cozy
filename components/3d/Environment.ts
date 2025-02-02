import { Object3D, PlaneGeometry, MeshStandardMaterial, Mesh, SphereGeometry } from 'three';

export class Environment extends Object3D {
  private platform: Mesh;
  private sun: Mesh;

  constructor() {
    super();

    // Create platform
    const platformGeometry = new PlaneGeometry(10, 10);
    const platformMaterial = new MeshStandardMaterial({ color: 0x808080 });
    this.platform = new Mesh(platformGeometry, platformMaterial);
    this.platform.rotation.x = -Math.PI / 2;
    this.platform.receiveShadow = true;
    
    // Create sun
    const sunGeometry = new SphereGeometry(1, 32, 32);
    const sunMaterial = new MeshStandardMaterial({ 
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1
    });
    this.sun = new Mesh(sunGeometry, sunMaterial);
    this.sun.position.set(0, 10, -20);

    this.add(this.platform);
    this.add(this.sun);
  }

  update(delta: number) {
    // Add subtle platform animation if needed
  }

  dispose() {
    this.platform.geometry.dispose();
    (this.platform.material as MeshStandardMaterial).dispose();
    this.sun.geometry.dispose();
    (this.sun.material as MeshStandardMaterial).dispose();
  }
}