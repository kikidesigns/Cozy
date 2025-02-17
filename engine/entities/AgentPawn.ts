import {
    BoxGeometry, Mesh, MeshStandardMaterial, Object3D, Vector3
} from "three"
import { createTextMesh } from "../utils/createTextMesh"

export class AgentPawn extends Object3D {
  private mesh: Mesh;
  private material: MeshStandardMaterial;
  private targetPosition: Vector3;
  public speed: number = 5; // units per second

  // For bobbing and positioning.
  private floatTime: number = 0;
  private baseHeight: number;

  // Balance label properties.
  public balanceLabel: THREE.Mesh | null = null;
  public currentBalance: number = 0; // in sats

  constructor() {
    super();
    const geometry = new BoxGeometry(1, 1, 1);
    this.material = new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.1,
      aoMapIntensity: 1.0,
      emissive: 0x000000,
      flatShading: true,
    });
    this.mesh = new Mesh(geometry, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.scale.set(1.1, 1.1, 1.1);
    this.add(this.mesh);

    this.baseHeight = 3;
    this.position.y = this.baseHeight;
    this.targetPosition = this.position.clone();

    // Initialize balance label (async—but fire-and-forget)
    this.initBalanceLabel("0 sats");
  }

  private async initBalanceLabel(text: string) {
    try {
      const label = await createTextMesh(text, {
        size: 0.5,
        height: 0.05,
        color: 0xffff00,
      });
      // Position the label above the pawn.
      label.position.set(0, 3.5, 0);
      this.balanceLabel = label;
      this.add(label);
    } catch (e) {
      console.error("Error creating balance label:", e);
    }
  }

  // Call this method to update the balance label.
  public async updateBalance(newBalance: number) {
    this.currentBalance = newBalance;
    if (this.balanceLabel) {
      this.remove(this.balanceLabel);
      this.balanceLabel.geometry.dispose();
      (this.balanceLabel.material as THREE.Material).dispose();
      this.balanceLabel = null;
    }
    try {
      const label = await createTextMesh(`Balance: ${newBalance} sats`, {
        size: 0.5,
        height: 0.05,
        color: 0xffff00,
      });
      label.position.set(0, 3.5, 0);
      this.balanceLabel = label;
      this.add(label);
    } catch (e) {
      console.error("Error updating balance label:", e);
    }
  }

  setColor(color: number) {
    this.material.color.setHex(color);
  }

  moveTo(target: Vector3) {
    this.targetPosition.set(target.x, this.baseHeight, target.z);
  }

  update(delta: number) {
    const currentHorizontal = new Vector3(this.position.x, 0, this.position.z);
    const targetHorizontal = new Vector3(this.targetPosition.x, 0, this.targetPosition.z);
    const direction = new Vector3().subVectors(targetHorizontal, currentHorizontal);
    const distance = direction.length();
    if (distance > 0.1) {
      direction.normalize();
      const moveDistance = Math.min(this.speed * delta, distance);
      this.position.x += direction.x * moveDistance;
      this.position.z += direction.z * moveDistance;
    }
    this.floatTime += delta;
    const amplitude = 0.5;
    const frequency = 1;
    this.mesh.position.y = amplitude * Math.sin(frequency * this.floatTime);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
