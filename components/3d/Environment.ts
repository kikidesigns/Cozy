import { Color, FogExp2, Object3D, Scene } from "three"
import { Colors } from "../../constants/Colors"

const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export class Environment extends Object3D {
  constructor() {
    super();
    // This Environment now only handles sky and fog settings.
  }

  setScene(scene: Scene) {
    // Set a warm sunset sky color
    const sunsetSkyColor = new Color(0xff7f50); // Coral sunset color
    scene.background = sunsetSkyColor;
    scene.fog = new FogExp2(0xff7f50, 0.003); // Lighter fog for sunset
  }

  update(delta: number) {
    // No update needed for static environment.
  }

  dispose() {
    // No resources to dispose.
  }
}
