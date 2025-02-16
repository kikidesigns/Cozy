import { Renderer } from "expo-three"
import { PCFSoftShadowMap, PerspectiveCamera, Scene } from "three"
import { System } from "../core/System"

export class RendererSystem extends System {
  public renderer: Renderer;
  public scene: Scene;
  public camera: PerspectiveCamera;
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, scene: Scene, camera: PerspectiveCamera) {
    super();
    this.gl = gl;
    this.renderer = new Renderer({ gl, alpha: true });
    // Set the clear color (you can adjust this as needed)
    this.renderer.setClearColor(0x87ceeb, 1);
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    this.renderer.setSize(width, height);

    // Enable shadow mapping
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    this.scene = scene;
    this.camera = camera;
  }

  update(delta: number): void {
    // Render the scene each frame
    this.renderer.render(this.scene, this.camera);
    if ((this.gl as any).endFrameEXP) {
      (this.gl as any).endFrameEXP();
    }
  }
}
