import { BoxGeometry, Mesh, MeshStandardMaterial, Object3D } from 'three';

export class AgentPawn extends Object3D {
  private mesh: Mesh;
  private material: MeshStandardMaterial;

  constructor() {
    super();
    
    // Create basic geometry for now (will be replaced with proper model)
    const geometry = new BoxGeometry(1, 1, 1);
    this.material = new MeshStandardMaterial({ color: 0x00ff00 });
    this.mesh = new Mesh(geometry, this.material);
    
    this.add(this.mesh);
  }

  setColor(color: number) {
    this.material.color.setHex(color);
  }

  update(delta: number) {
    // Add basic rotation animation
    this.mesh.rotation.y += delta * 0.5;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}