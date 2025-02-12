import * as Crypto from "expo-crypto"

// Define the types for the crypto polyfill
interface CryptoPolyfill {
  getRandomValues: <T extends ArrayBufferView | null>(array: T) => T;
  subtle?: SubtleCrypto;
  randomUUID: () => `${string}-${string}-${string}-${string}-${string}`;
}

console.log('crypto-polyfill initializing...')

// Always create our implementation
const cryptoPolyfill = {
  getRandomValues: <T extends ArrayBufferView | null>(array: T): T => {
    console.log('Our getRandomValues implementation called')
    if (array === null) return array;
    const randomBytes = Crypto.getRandomValues(array as Uint8Array);
    if (randomBytes) {
      (array as Uint8Array).set(new Uint8Array(randomBytes));
    }
    return array;
  },
  randomUUID: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }) as `${string}-${string}-${string}-${string}-${string}`;
  }
};

// Create a proxy to intercept all crypto access
const cryptoProxy = new Proxy({}, {
  get: (target, prop) => {
    console.log('Accessing crypto property:', prop);
    // Always return our implementation for getRandomValues
    if (prop === 'getRandomValues') {
      console.log('Returning our getRandomValues implementation');
      return cryptoPolyfill.getRandomValues;
    }
    // Return other properties from our polyfill if they exist
    if (prop in cryptoPolyfill) {
      return (cryptoPolyfill as any)[prop];
    }
    return undefined;
  },
  set: (target, prop, value) => {
    console.log('Attempt to set crypto property:', prop);
    // Prevent overwriting our getRandomValues
    if (prop === 'getRandomValues') {
      console.log('Blocked attempt to override getRandomValues');
      return true;
    }
    (target as any)[prop] = value;
    return true;
  },
  has: (target, prop) => {
    if (prop === 'getRandomValues') return true;
    return prop in target;
  }
});

// Set up the crypto object
delete (global as any).crypto;
Object.defineProperty(global, 'crypto', {
  enumerable: true,
  configurable: false,  // Make it non-configurable
  value: cryptoProxy   // Use our proxy
});

// Verify setup
console.log('Crypto polyfill setup complete');
console.log('crypto exists:', !!global.crypto);
console.log('getRandomValues exists:', typeof global.crypto.getRandomValues === 'function');

// Test the implementation
try {
  const testArray = new Uint8Array(8);
  global.crypto.getRandomValues(testArray);
  console.log('Test getRandomValues succeeded');
} catch (e) {
  console.error('Test getRandomValues failed:', e);
}

// Export debug helper
export const debugCrypto = () => {
  console.log('=== Crypto Debug ===');
  console.log('crypto exists:', !!global.crypto);
  console.log('getRandomValues exists:', typeof global.crypto.getRandomValues === 'function');
  console.log('getRandomValues === our implementation:', global.crypto.getRandomValues === cryptoPolyfill.getRandomValues);
};
