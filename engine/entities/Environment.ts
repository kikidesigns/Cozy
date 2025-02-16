import { Color, FogExp2, Object3D, Scene } from "three"

export class Environment extends Object3D {
  constructor() {
    super();
  }

  setScene(scene: Scene) {
    // Use a light blue color for both the sky and fog.
    const skyColorHex = 0x87CEEB; // light blue
    const skyColor = new Color(skyColorHex);
    scene.background = skyColor;
    scene.fog = new FogExp2(skyColorHex, 0.005);
  }

  update(delta: number) {
    // Static environment—nothing to update.
  }

  dispose() {
    // Nothing to dispose.
  }
}
