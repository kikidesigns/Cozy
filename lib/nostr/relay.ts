import { relayInit, Event } from 'nostr-tools';

export class NostrRelay {
  private relay: any = null;
  private subscriptions: Map<string, any> = new Map();
  private connected: boolean = false;

  async connect() {
    try {
      this.relay = relayInit('wss://nostr-pub.wellorder.net');
      await this.relay.connect();
      
      this.relay.on('connect', () => {
        console.log('Connected to relay');
        this.connected = true;
      });
      
      this.relay.on('error', () => {
        console.log('Failed to connect to relay');
        this.connected = false;
      });

      console.log('Connected to relay:', this.relay.url);
    } catch (error) {
      console.error('Failed to connect to relay:', error);
      this.connected = false;
    }
  }

  async ensureConnection() {
    if (!this.connected || !this.relay) {
      await this.connect();
    }
    if (!this.relay) throw new Error('Failed to connect to relay');
  }

  // Subscribe to profile events (kind 30078 - replaceable)
  async subscribeToProfile(pubkey: string, onEvent: (event: Event) => void) {
    await this.ensureConnection();
    
    const sub = this.relay.sub([
      {
        kinds: [30078],
        authors: [pubkey],
        limit: 1
      }
    ]);

    sub.on('event', (event: Event) => {
      try {
        onEvent(event);
      } catch (error) {
        console.error('Error handling profile event:', error);
      }
    });

    sub.on('eose', () => {
      console.log('End of stored profile events');
    });

    this.subscriptions.set(`profile:${pubkey}`, sub);
    return sub;
  }

  // Subscribe to task events (kind 30080 - addressable)
  async subscribeToTasks(pubkey: string, onEvent: (event: Event) => void) {
    await this.ensureConnection();
    
    const sub = this.relay.sub([
      {
        kinds: [30080],
        authors: [pubkey],
        since: Math.floor(Date.now() / 1000) - 86400 * 7 // Last 7 days
      }
    ]);

    sub.on('event', (event: Event) => {
      try {
        onEvent(event);
      } catch (error) {
        console.error('Error handling task event:', error);
      }
    });

    sub.on('eose', () => {
      console.log('End of stored task events');
    });

    this.subscriptions.set(`tasks:${pubkey}`, sub);
    return sub;
  }

  // Publish an event
  async publish(event: Event): Promise<boolean> {
    await this.ensureConnection();
    
    try {
      const pub = await this.relay.publish(event);
      return true;
    } catch (error) {
      console.error('Failed to publish event:', error);
      return false;
    }
  }

  // Close specific subscription
  closeSubscription(id: string) {
    const sub = this.subscriptions.get(id);
    if (sub) {
      sub.unsub();
      this.subscriptions.delete(id);
    }
  }

  // Cleanup all subscriptions and close connection
  cleanup() {
    this.subscriptions.forEach(sub => sub.unsub());
    this.subscriptions.clear();
    if (this.relay) {
      this.relay.close();
      this.relay = null;
    }
    this.connected = false;
  }
}