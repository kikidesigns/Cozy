import {
  BoxGeometry, Mesh, MeshStandardMaterial, Object3D, Vector3
} from "three"

export class AgentPawn extends Object3D {
  private mesh: Mesh;
  private material: MeshStandardMaterial;
  targetPosition: Vector3;
  speed: number = 5; // Units per second

  constructor() {
    super();

    // Create a simple box placeholder.
    const geometry = new BoxGeometry(1, 1, 1);
    this.material = new MeshStandardMaterial({ color: 0x00ff00 });
    this.mesh = new Mesh(geometry, this.material);

    this.add(this.mesh);

    // Start with the current position as the target.
    this.targetPosition = this.position.clone();
  }

  setColor(color: number) {
    this.material.color.setHex(color);
  }

  moveTo(target: Vector3) {
    this.targetPosition.copy(target);
  }

  update(delta: number) {
    // Move smoothly toward the target position.
    const direction = new Vector3().subVectors(this.targetPosition, this.position);
    const distance = direction.length();
    if (distance > 0.1) {
      direction.normalize();
      const moveDistance = Math.min(this.speed * delta, distance);
      this.position.add(direction.multiplyScalar(moveDistance));
    }
    // Optional: continue a simple rotation.
    this.mesh.rotation.y += delta * 0.5;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
