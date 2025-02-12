import { Config } from '@breeztech/react-native-breez-sdk';

export const SATS_PER_BTC = 100000000;

export const DEFAULT_BREEZ_CONFIG: Config = {
  apiKey: process.env.EXPO_PUBLIC_BREEZ_API_KEY || '',
  nodeConfig: {
    type: 'greenlight',
    config: {
      partnerCredentials: process.env.EXPO_PUBLIC_GREENLIGHT_PARTNER_CREDENTIALS || '',
    },
  },
  workingDir: '.breez',
  network: process.env.EXPO_PUBLIC_NETWORK === 'mainnet' ? 'bitcoin' : 'testnet',
  paymentTimeoutSec: 60,
  maxfeePercent: 0.5,
  defaultLspId: process.env.EXPO_PUBLIC_DEFAULT_LSP_ID,
};

export const MINIMUM_SATS_PAYMENT = 1;
export const MAXIMUM_SATS_PAYMENT = 100000000; // 1 BTC

export const TRANSACTION_TYPES = {
  SEND: 'send',
  RECEIVE: 'receive',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETE: 'complete',
  FAILED: 'failed',
} as const;

export const ERROR_CODES = {
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_PAYMENT_REQUEST: 'INVALID_PAYMENT_REQUEST',
  PAYMENT_TIMEOUT: 'PAYMENT_TIMEOUT',
  NODE_NOT_SYNCED: 'NODE_NOT_SYNCED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.INSUFFICIENT_FUNDS]: 'Insufficient funds for this payment',
  [ERROR_CODES.INVALID_PAYMENT_REQUEST]: 'Invalid Lightning payment request',
  [ERROR_CODES.PAYMENT_TIMEOUT]: 'Payment timed out',
  [ERROR_CODES.NODE_NOT_SYNCED]: 'Lightning node not synced',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error',
} as const;