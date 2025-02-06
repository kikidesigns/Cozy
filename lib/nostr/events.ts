import { getEventHash, signEvent } from 'nostr-tools';
import { useNostrStore } from './store';

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

export const COZY_PREFIXES = {
  AGENT_PROFILE: 'cozy:agent:profile',
  TASK: 'cozy:agent:task'
};

export const createProfileEvent = async (profile: AgentProfile) => {
  const { keys } = useNostrStore.getState();
  if (!keys?.privateKey) throw new Error('No private key available');

  const event = {
    kind: 30078,
    pubkey: keys.publicKey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['d', COZY_PREFIXES.AGENT_PROFILE]],
    content: JSON.stringify(profile)
  };

  event.id = getEventHash(event);
  event.sig = signEvent(event, keys.privateKey);

  return event;
};

export const createTaskEvent = async (task: AgentTask) => {
  const { keys } = useNostrStore.getState();
  if (!keys?.privateKey) throw new Error('No private key available');

  const event = {
    kind: 30080,
    pubkey: keys.publicKey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['d', `${COZY_PREFIXES.TASK}:${task.id}`]],
    content: JSON.stringify(task)
  };

  event.id = getEventHash(event);
  event.sig = signEvent(event, keys.privateKey);

  return event;
};