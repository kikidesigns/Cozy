import { useEffect, useReducer, useCallback } from 'react';
import { breezWallet } from '../lib/lightning/breez';
import { WalletState, WalletAction, Transaction } from '../types/wallet';

const initialState: WalletState = {
  balanceSats: 0,
  btcPrice: 0,
  lastUpdate: Date.now(),
  transactions: [],
  status: 'syncing',
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'UPDATE_BALANCE':
      return {
        ...state,
        balanceSats: action.payload,
        lastUpdate: Date.now(),
      };
    case 'UPDATE_PRICE':
      return {
        ...state,
        btcPrice: action.payload,
        lastUpdate: Date.now(),
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        lastUpdate: Date.now(),
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(tx =>
          tx.id === action.payload.id
            ? { ...tx, status: action.payload.status }
            : tx
        ),
        lastUpdate: Date.now(),
      };
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
        lastUpdate: Date.now(),
      };
    default:
      return state;
  }
}

export function useWallet() {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  useEffect(() => {
    const initWallet = async () => {
      try {
        dispatch({ type: 'SET_STATUS', payload: 'syncing' });
        await breezWallet.init();
        const balance = await breezWallet.getBalance();
        dispatch({ type: 'UPDATE_BALANCE', payload: balance });
        dispatch({ type: 'SET_STATUS', payload: 'active' });
      } catch (error) {
        dispatch({ type: 'SET_STATUS', payload: 'error' });
        console.error('Wallet initialization failed:', error);
      }
    };

    initWallet();
  }, []);

  const sendPayment = useCallback(async (paymentRequest: string, amountSats?: number) => {
    try {
      dispatch({ type: 'SET_STATUS', payload: 'syncing' });
      const txId = await breezWallet.sendPayment(paymentRequest, amountSats);
      
      const newTx: Transaction = {
        id: txId,
        type: 'send',
        amountSats: amountSats || 0, // TODO: Parse from payment request if not provided
        status: 'pending',
        timestamp: Date.now(),
        paymentRequest,
      };
      
      dispatch({ type: 'ADD_TRANSACTION', payload: newTx });
      
      // Update balance after payment
      const newBalance = await breezWallet.getBalance();
      dispatch({ type: 'UPDATE_BALANCE', payload: newBalance });
      dispatch({ type: 'SET_STATUS', payload: 'active' });
      
      return txId;
    } catch (error) {
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      throw error;
    }
  }, []);

  const createInvoice = useCallback(async (amountSats: number, description?: string) => {
    try {
      dispatch({ type: 'SET_STATUS', payload: 'syncing' });
      const invoice = await breezWallet.createInvoice(amountSats, description);
      dispatch({ type: 'SET_STATUS', payload: 'active' });
      return invoice;
    } catch (error) {
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      throw error;
    }
  }, []);

  return {
    ...state,
    sendPayment,
    createInvoice,
  };
}