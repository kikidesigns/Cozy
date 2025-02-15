import {
  CylinderGeometry, Mesh, MeshStandardMaterial, Object3D, PointLight,
  SphereGeometry
} from "three"

export class GlowingMushroom extends Object3D {
  private stem: Mesh;
  private cap: Mesh;
  private light: PointLight;

  constructor() {
    super();

    // Create stem
    const stemGeometry = new CylinderGeometry(0.2, 0.3, 1, 8);
    const stemMaterial = new MeshStandardMaterial({
      color: 0xf0f0f0,
      emissive: 0x404040
    });
    this.stem = new Mesh(stemGeometry, stemMaterial);
    this.stem.position.y = 0.5;
    this.add(this.stem);

    // Create cap
    const capGeometry = new SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const capMaterial = new MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00aaaa,
      emissiveIntensity: 0.5
    });
    this.cap = new Mesh(capGeometry, capMaterial);
    this.cap.position.y = 1;
    this.add(this.cap);

    // Add point light
    this.light = new PointLight(0x00ffff, 1, 3);
    this.light.position.y = 1;
    this.add(this.light);
  }

  dispose() {
    this.stem.geometry.dispose();
    (this.stem.material as MeshStandardMaterial).dispose();
    this.cap.geometry.dispose();
    (this.cap.material as MeshStandardMaterial).dispose();
  }
}
