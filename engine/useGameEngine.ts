import { useEffect, useState } from "react"
import { GameEngine } from "./core/GameEngine"

export const useGameEngine = () => {
  const [engine, setEngine] = useState<GameEngine | null>(null);

  useEffect(() => {
    const engineInstance = new GameEngine();
    setEngine(engineInstance);
    engineInstance.start();

    return () => {
      engineInstance.stop();
    };
  }, []);

  return engine;
};
