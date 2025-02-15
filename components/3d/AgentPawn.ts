import {
  BoxGeometry, Mesh, MeshStandardMaterial, Object3D, Vector3
} from "three"

export class AgentPawn extends Object3D {
  private mesh: Mesh;
  private material: MeshStandardMaterial;
  targetPosition: Vector3;

  constructor() {
    super();

    // Simple box for the pawn
    const geometry = new BoxGeometry(3, 3, 3); // Even bigger box
    this.material = new MeshStandardMaterial({ color: 0xff0000 }); // Bright red
    this.mesh = new Mesh(geometry, this.material);
    this.mesh.position.y = 2;
    this.add(this.mesh);

    // Initialize position and target
    this.position.set(0, 0, 40);
    this.targetPosition = new Vector3(0, 0, 40);
    console.log('🎯 Pawn created at', this.position);
  }

  setColor(color: number) {
    this.material.color.setHex(color);
  }

  moveTo(target: Vector3) {
    console.log('🎯 MoveTo called', {
      from: this.position.clone(),
      to: target.clone()
    });
    this.targetPosition.copy(target);
  }

  update(delta: number) {
    // Move directly to target
    this.position.lerp(this.targetPosition, 0.1);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
