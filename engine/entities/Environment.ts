import { Color, FogExp2, Object3D, Scene } from "three"
import { Colors } from "../../constants/Colors"

const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export class Environment extends Object3D {
  constructor() {
    super();
  }

  setScene(scene: Scene) {
    const skyColor = new Color(colorToHex(Colors.skyBlue));
    scene.background = skyColor;
    scene.fog = new FogExp2(colorToHex(Colors.skyBlue), 0.005);
  }

  update(delta: number) {
    // Static environment—nothing to update.
  }

  dispose() {
    // Nothing to dispose.
  }
}
