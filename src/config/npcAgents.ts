// NPC agent configuration with fixed UUIDs
export const npcAgents = {
  Agent1: {
    id: "d1c71c6c-1c6c-4c1c-8c1c-1c6c1c6c1c6c",
    name: "Agent1",
    initialBalance: 500
  },
  Agent2: {
    id: "d2c72c6c-2c6c-4c2c-8c2c-2c6c2c6c2c6c",
    name: "Agent2",
    initialBalance: 750
  }
} as const;

// Helper function to get all NPC configs
export function getNpcConfigs() {
  return Object.values(npcAgents);
}
