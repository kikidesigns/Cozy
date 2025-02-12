export interface WalletState {
  balanceSats: number;
  btcPrice: number;
  lastUpdate: number;
  transactions: Transaction[];
  status: 'active' | 'syncing' | 'error';
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amountSats: number;
  status: 'pending' | 'complete' | 'failed';
  timestamp: number;
  description?: string;
  paymentRequest?: string;
}

export interface WalletError {
  code: string;
  message: string;
  details?: any;
}

export type WalletAction = 
  | { type: 'UPDATE_BALANCE'; payload: number }
  | { type: 'UPDATE_PRICE'; payload: number }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; status: Transaction['status'] } }
  | { type: 'SET_STATUS'; payload: WalletState['status'] }
  | { type: 'SET_ERROR'; payload: WalletError };