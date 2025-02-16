import {
  BoxGeometry, Mesh, MeshStandardMaterial, Object3D, Vector3
} from "three"

export class AgentPawn extends Object3D {
  private mesh: Mesh;
  private material: MeshStandardMaterial;
  private targetPosition: Vector3;
  public speed: number = 5; // units per second

  constructor() {
    super();
    const geometry = new BoxGeometry(1, 1, 1);
    this.material = new MeshStandardMaterial({ color: 0x00ff00 });
    this.mesh = new Mesh(geometry, this.material);
    this.add(this.mesh);
    this.targetPosition = this.position.clone();
  }

  setColor(color: number) {
    this.material.color.setHex(color);
  }

  moveTo(target: Vector3) {
    this.targetPosition.copy(target);
  }

  update(delta: number) {
    const direction = targetDirection(this.position, this.targetPosition);
    const distance = direction.length();
    if (distance > 0.1) {
      direction.normalize();
      const moveDistance = Math.min(this.speed * delta, distance);
      this.position.add(direction.multiplyScalar(moveDistance));
    }
    // Simple rotation for visual effect
    this.mesh.rotation.y += delta * 0.5;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

function targetDirection(from: Vector3, to: Vector3): Vector3 {
  return new Vector3().subVectors(to, from);
}
