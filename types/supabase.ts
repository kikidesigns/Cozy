export type Profile = {
  id: string
  updated_at: string
  username: string | null
  avatar_url: string | null
  website: string | null
  bitcoin_balance: number
  lnbits_wallet_id: string | null
  lnbits_admin_key: string | null
  lnbits_invoice_key: string | null
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
    }
    Functions: {
      transfer_sats: {
        Args: {
          sender_id: string
          recipient_id: string
          amount: number
        }
        Returns: void
      }
    }
  }
}
