import { useEffect, useRef } from "react"
import { GameEngine } from "./core/GameEngine"

export const useGameEngine = () => {
  const engineRef = useRef<GameEngine>();

  useEffect(() => {
    engineRef.current = new GameEngine();
    engineRef.current.start();

    return () => {
      engineRef.current?.stop();
    };
  }, []);

  return engineRef;
};
