import { Object3D, PlaneGeometry, MeshStandardMaterial, Mesh, SphereGeometry, Color, FogExp2, Scene, BoxGeometry, MeshBasicMaterial, PerspectiveCamera } from 'three';
import { Colors } from '../../constants/Colors';

// Convert hex colors to Three.js colors
const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export class Environment extends Object3D {
  private platform: Mesh;
  private sun: Mesh;
  private box: Mesh;
  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;

  constructor() {
    super();

    // Create platform (sage green)
    const platformGeometry = new PlaneGeometry(50, 50);
    const platformMaterial = new MeshStandardMaterial({ 
      color: colorToHex(Colors.sageGreen),
      roughness: 0.8,
    });
    this.platform = new Mesh(platformGeometry, platformMaterial);
    this.platform.rotation.x = -Math.PI / 2;
    this.platform.position.y = -3; // Lower the platform more
    this.platform.receiveShadow = true;
    
    // Create sun (warm beige, no shading)
    const sunGeometry = new SphereGeometry(8, 32, 32);
    const sunMaterial = new MeshBasicMaterial({ 
      color: colorToHex(Colors.lightBeige),
    });
    this.sun = new Mesh(sunGeometry, sunMaterial);
    // Position sun off-center
    this.sun.position.set(20, 25, -120);
    
    // Create box (cozy orange)
    const boxGeometry = new BoxGeometry(2, 2, 2);
    const boxMaterial = new MeshStandardMaterial({
      color: colorToHex(Colors.orangeBrown),
      roughness: 0.3,
      metalness: 0.2,
    });
    this.box = new Mesh(boxGeometry, boxMaterial);
    this.box.position.set(0, 1, 0);
    this.box.castShadow = true;

    this.add(this.platform);
    this.add(this.sun);
    this.add(this.box);
  }

  setScene(scene: Scene) {
    this.scene = scene;
    // Set sky blue background and lighter fog
    const skyBlueColor = new Color(colorToHex(Colors.skyBlue));
    scene.background = skyBlueColor;
    scene.fog = new FogExp2(colorToHex(Colors.skyBlue), 0.005); // Even lighter fog
  }

  setCamera(camera: PerspectiveCamera) {
    this.camera = camera;
    // Adjust camera position to see platform edges
    camera.position.set(0, 8, 15); // Move camera back and up more
    camera.lookAt(0, 0, 0);
  }

  update(delta: number) {
    // Add subtle box rotation
    if (this.box) {
      this.box.rotation.y += delta * 0.5;
    }
  }

  dispose() {
    this.platform.geometry.dispose();
    (this.platform.material as MeshStandardMaterial).dispose();
    this.sun.geometry.dispose();
    (this.sun.material as MeshBasicMaterial).dispose();
    this.box.geometry.dispose();
    (this.box.material as MeshStandardMaterial).dispose();
  }
}