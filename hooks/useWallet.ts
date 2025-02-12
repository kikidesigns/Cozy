import { useEffect, useState } from "react"
import { breezService } from "@/lib/breez"
import { BalanceInfo, Transaction } from "@/lib/breez/types"
import { useNostrAuth } from "./useNostrAuth"

export function useWallet() {
  const { getMnemonic } = useNostrAuth()
  const [isInitialized, setIsInitialized] = useState(false)
  const [balance, setBalance] = useState<BalanceInfo>({
    balanceSat: 0,
    pendingSendSat: 0,
    pendingReceiveSat: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize Breez SDK
  useEffect(() => {
    const initializeBreez = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get mnemonic
        const mnemonic = await getMnemonic()
        if (!mnemonic) {
          setError('No mnemonic available')
          setIsLoading(false)
          return
        }

        // Initialize if not already initialized
        if (!breezService.isInitialized()) {
          console.log('Initializing Breez SDK...')
          await breezService.initialize({
            workingDir: '', // Will be set by breezService
            apiKey: process.env.EXPO_PUBLIC_BREEZ_API_KEY || '',
            network: 'MAINNET',
            mnemonic
          })
          console.log('Breez SDK initialized')
        }

        setIsInitialized(true)

        // Fetch initial data
        await refreshData()
      } catch (err) {
        console.error('Failed to initialize wallet:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize wallet')
      } finally {
        setIsLoading(false)
      }
    }

    initializeBreez()

    // Cleanup on unmount
    return () => {
      breezService.disconnect().catch(console.error)
    }
  }, [getMnemonic])

  // Refresh balance and transactions
  const refreshData = async () => {
    if (!breezService.isInitialized()) return

    try {
      setIsLoading(true)
      setError(null)

      // Fetch balance and transactions in parallel
      const [newBalance, newTransactions] = await Promise.all([
        breezService.getBalance(),
        breezService.getTransactions()
      ])

      setBalance(newBalance)
      setTransactions(newTransactions)
    } catch (err) {
      console.error('Failed to refresh wallet data:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh wallet data')
    } finally {
      setIsLoading(false)
    }
  }

  // Send a payment
  const sendPayment = async (bolt11: string, amount: number) => {
    if (!breezService.isInitialized()) throw new Error('Wallet not initialized')

    try {
      setError(null)
      const tx = await breezService.sendPayment(bolt11, amount)
      await refreshData() // Refresh data after sending
      return tx
    } catch (err) {
      console.error('Failed to send payment:', err)
      setError(err instanceof Error ? err.message : 'Failed to send payment')
      throw err
    }
  }

  // Generate a receive invoice
  const receivePayment = async (amount: number, description?: string) => {
    if (!breezService.isInitialized()) throw new Error('Wallet not initialized')

    try {
      setError(null)
      const invoice = await breezService.receivePayment(amount, description)
      await refreshData() // Refresh data after generating invoice
      return invoice
    } catch (err) {
      console.error('Failed to generate invoice:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate invoice')
      throw err
    }
  }

  return {
    isInitialized,
    balance,
    transactions,
    error,
    isLoading,
    refreshData,
    sendPayment,
    receivePayment
  }
}
