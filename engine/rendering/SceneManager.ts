import { Color, FogExp2, PerspectiveCamera, Scene } from "three"

export class SceneManager {
  public scene: Scene;
  public camera: PerspectiveCamera;

  constructor(width: number, height: number) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);

    // Set default background and fog
    const skyColorHex = 0x87ceeb; // sky blue
    this.scene.background = new Color(skyColorHex);
    this.scene.fog = new FogExp2(skyColorHex, 0.002);
  }
}
