import { Object3D, PlaneGeometry, MeshStandardMaterial, Mesh, SphereGeometry, Color, FogExp2, Scene, BoxGeometry } from 'three';
import { Colors } from '../../constants/Colors';

// Convert hex colors to Three.js colors
const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export class Environment extends Object3D {
  private platform: Mesh;
  private sun: Mesh;
  private box: Mesh;
  private scene: Scene | null = null;

  constructor() {
    super();

    // Create platform (sage green)
    const platformGeometry = new PlaneGeometry(20, 20);
    const platformMaterial = new MeshStandardMaterial({ 
      color: colorToHex(Colors.sageGreen),
      roughness: 0.8,
    });
    this.platform = new Mesh(platformGeometry, platformMaterial);
    this.platform.rotation.x = -Math.PI / 2;
    this.platform.receiveShadow = true;
    
    // Create sun (cream colored)
    const sunGeometry = new SphereGeometry(3, 32, 32);
    const sunMaterial = new MeshStandardMaterial({ 
      color: colorToHex(Colors.warmBeige),
      emissive: colorToHex(Colors.warmBeige),
      emissiveIntensity: 0.5,
      roughness: 0.1,
    });
    this.sun = new Mesh(sunGeometry, sunMaterial);
    this.sun.position.set(0, 5, -30); // Positioned on horizon
    
    // Create box (orange-brown)
    const boxGeometry = new BoxGeometry(2, 2, 2);
    const boxMaterial = new MeshStandardMaterial({
      color: colorToHex(Colors.orangeBrown),
      roughness: 0.7,
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
    // Add sky blue fog for atmosphere
    scene.fog = new FogExp2(colorToHex(Colors.skyBlue), 0.015);
    scene.background = new Color(colorToHex(Colors.skyBlue));
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
    (this.sun.material as MeshStandardMaterial).dispose();
    this.box.geometry.dispose();
    (this.box.material as MeshStandardMaterial).dispose();
  }
}