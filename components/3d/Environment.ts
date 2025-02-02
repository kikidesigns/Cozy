import { Object3D, PlaneGeometry, MeshStandardMaterial, Mesh, SphereGeometry } from 'three';

export class Environment extends Object3D {
  private platform: Mesh;
  private sun: Mesh;

  constructor() {
    super();

    // Create platform
    const platformGeometry = new PlaneGeometry(20, 20);
    const platformMaterial = new MeshStandardMaterial({ 
      color: 0x808080,
      roughness: 0.8,
      metalness: 0.2
    });
    this.platform = new Mesh(platformGeometry, platformMaterial);
    this.platform.rotation.x = -Math.PI / 2;
    this.platform.position.y = 0;
    this.platform.receiveShadow = true;
    
    // Create sun
    const sunGeometry = new SphereGeometry(2, 32, 32);
    const sunMaterial = new MeshStandardMaterial({ 
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1,
      roughness: 1,
      metalness: 0
    });
    this.sun = new Mesh(sunGeometry, sunMaterial);
    this.sun.position.set(0, 15, -30);

    this.add(this.platform);
    this.add(this.sun);
  }

  update(delta: number) {
    // Add subtle sun glow animation
    if (this.sun.material instanceof MeshStandardMaterial) {
      this.sun.material.emissiveIntensity = 0.8 + Math.sin(Date.now() * 0.001) * 0.2;
    }
  }

  dispose() {
    this.platform.geometry.dispose();
    (this.platform.material as MeshStandardMaterial).dispose();
    this.sun.geometry.dispose();
    (this.sun.material as MeshStandardMaterial).dispose();
  }
}