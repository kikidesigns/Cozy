import * as Crypto from "expo-crypto"
import { Event, getEventHash, signEvent, UnsignedEvent } from "nostr-tools"
import { useNostrStore } from "./store"

export interface AgentProfile {
  name: string;
  color: string;
  health: number;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  date: string;
}

export interface NostrMetadata {
  name?: string;
  about?: string;
  picture?: string;
  [key: string]: any; // For additional fields
}

export const COZY_PREFIXES = {
  AGENT_PROFILE: 'cozy:agent:profile',
  TASK: 'cozy:agent:task'
};

// Create kind 0 metadata event (NIP-01)
export const createMetadataEvent = async (metadata: NostrMetadata): Promise<Event> => {
  const { keys } = useNostrStore.getState();
  if (!keys?.privateKey) throw new Error('No private key available');

  // Ensure crypto is available for nostr-tools
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    (global as any).crypto = {
      getRandomValues: (array: Uint8Array): Uint8Array => {
        const randomBytes = Crypto.getRandomValues(array);
        if (randomBytes) {
          array.set(new Uint8Array(randomBytes));
        }
        return array;
      }
    };
  }

  const event: UnsignedEvent = {
    kind: 0,
    pubkey: keys.publicKey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: JSON.stringify(metadata)
  };

  const id = getEventHash(event);
  const sig = signEvent(event, keys.privateKey);

  return { ...event, id, sig };
};

// Create kind 30078 profile event (Cozy-specific)
export const createProfileEvent = async (profile: AgentProfile): Promise<Event> => {
  const { keys } = useNostrStore.getState();
  if (!keys?.privateKey) throw new Error('No private key available');

  // Ensure crypto is available for nostr-tools
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    (global as any).crypto = {
      getRandomValues: (array: Uint8Array): Uint8Array => {
        const randomBytes = Crypto.getRandomValues(array);
        if (randomBytes) {
          array.set(new Uint8Array(randomBytes));
        }
        return array;
      }
    };
  }

  const event: UnsignedEvent = {
    kind: 30078 as number,
    pubkey: keys.publicKey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['d', COZY_PREFIXES.AGENT_PROFILE]],
    content: JSON.stringify(profile)
  };

  const id = getEventHash(event);
  const sig = signEvent(event, keys.privateKey);

  return { ...event, id, sig };
};

export const createTaskEvent = async (task: AgentTask): Promise<Event> => {
  const { keys } = useNostrStore.getState();
  if (!keys?.privateKey) throw new Error('No private key available');

  // Ensure crypto is available for nostr-tools
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    (global as any).crypto = {
      getRandomValues: (array: Uint8Array): Uint8Array => {
        const randomBytes = Crypto.getRandomValues(array);
        if (randomBytes) {
          array.set(new Uint8Array(randomBytes));
        }
        return array;
      }
    };
  }

  const event: UnsignedEvent = {
    kind: 30080 as number,
    pubkey: keys.publicKey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['d', `${COZY_PREFIXES.TASK}:${task.id}`]],
    content: JSON.stringify(task)
  };

  const id = getEventHash(event);
  const sig = signEvent(event, keys.privateKey);

  return { ...event, id, sig };
};
