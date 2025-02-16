import { System } from "./System"

export class GameEngine {
  private systems: System[] = [];
  private lastTime: number = 0;
  private running: boolean = false;

  registerSystem(system: System) {
    this.systems.push(system);
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    this.running = false;
  }

  private loop(currentTime: number) {
    if (!this.running) return;
    const delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    for (const system of this.systems) {
      system.update(delta);
    }
    requestAnimationFrame(this.loop.bind(this));
  }
}
