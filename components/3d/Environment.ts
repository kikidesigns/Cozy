import { Color, FogExp2, Object3D, Scene } from "three"
import { Colors } from "../../constants/Colors"

const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export class Environment extends Object3D {
  constructor() {
    super();
    // This Environment now only handles sky and fog settings.
  }

  setScene(scene: Scene) {
    const skyBlueColor = new Color(colorToHex(Colors.skyBlue));
    scene.background = skyBlueColor;
    scene.fog = new FogExp2(colorToHex(Colors.skyBlue), 0.005);
  }

  update(delta: number) {
    // No update needed for static environment.
  }

  dispose() {
    // No resources to dispose.
  }
}
