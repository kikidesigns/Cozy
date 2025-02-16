import { Color, FogExp2, Object3D, Scene } from "three"

export class Environment extends Object3D {
  constructor() {
    super();
  }

  setScene(scene: Scene) {
    // Use a warm sunset color for both the sky and fog.
    const sunsetColorHex = 0xFF8C00; // dark orange
    const sunsetColor = new Color(sunsetColorHex);
    scene.background = sunsetColor;
    scene.fog = new FogExp2(sunsetColorHex, 0.005);
  }

  update(delta: number) {
    // Static environment—nothing to update.
  }

  dispose() {
    // Nothing to dispose.
  }
}
