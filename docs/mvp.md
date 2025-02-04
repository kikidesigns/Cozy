# Cozy MVP Specification

## Core Features

### 1. Agent Authentication (Simple Version)
- Login with nsec only
- Basic agent customization (name, color)
- Simple task/conversation history stored in Nostr events

### 2. Lightning Wallet (Breez SDK)
- Full send/receive functionality
- Push notifications for payment verification
- Balance display in home screen
- Transaction history
- Basic wallet screen UI

### 3. Marketplace Search & Transactions
- Search NIP-15 marketplace listings
- Display results from existing Nostr network
- No additional seller verification
- Direct Lightning payments
- Transaction status tracking

## File Structure

```
app/
├── auth/
│   └── login.tsx           # nsec login screen
├── home/
│   └── index.tsx           # main screen with agent
├── marketplace/
│   ├── index.tsx           # marketplace search
│   └── transaction.tsx     # transaction flow
├── wallet/
│   └── index.tsx           # wallet screen
└── journal/
    └── index.tsx           # simple task/history view

components/
├── agent/
│   ├── AgentDisplay.tsx    # 3D agent rendering
│   └── AgentCustomize.tsx  # name/color customization
├── wallet/
│   ├── Balance.tsx         # balance display
│   └── TransactionList.tsx # transaction history
└── marketplace/
    ├── SearchResults.tsx   # search results display
    └── TransactionStatus.tsx # transaction status

lib/
├── nostr/
│   ├── auth.ts            # authentication
│   ├── events.ts          # event handling
│   └── market.ts          # NIP-15 implementation
├── lightning/
│   ├── breez.ts          # Breez SDK wrapper
│   └── notifications.ts   # payment notifications
└── agent/
    └── memory.ts         # simple event-based memory

hooks/
├── useNostrAuth.ts       # authentication hook
├── useWallet.ts          # wallet management
├── useMarketplace.ts     # marketplace operations
└── useAgentMemory.ts     # memory management

types/
├── agent.ts              # agent types
├── wallet.ts             # wallet types
└── marketplace.ts        # marketplace types

constants/
├── nostr.ts             # Nostr constants
└── ui.ts                # UI constants
```

## Key Workflows

### 1. Authentication Flow
1. User inputs nsec
2. Agent created/loaded
3. Basic customization available
4. Redirect to home screen

### 2. Marketplace Transaction Flow
1. User requests item search via chat
2. Agent searches NIP-15 events
3. Display results
4. User selects item
5. Payment initiated via Breez SDK
6. User receives push notification
7. User verifies payment
8. Transaction status tracked in journal

### 3. Wallet Operations
1. Display balance in home screen
2. Send/receive functionality
3. Push notifications for verification
4. Transaction history in wallet screen

## MVP Limitations

### Not Included in MVP
- View-only mode
- Social search
- Seller verification
- Complex memory management
- Conscious/subconscious memory
- Multiple agents per user
- External API integrations

### Simplified for MVP
- Memory system (just recent events)
- Agent customization (basic options only)
- Marketplace search (NIP-15 only)
- Transaction flow (direct payments only)

## Development Priorities

1. Basic Authentication
   - nsec login
   - Agent creation

2. Wallet Integration
   - Breez SDK setup
   - Send/receive
   - Push notifications

3. Marketplace
   - NIP-15 search
   - Transaction flow
   - Payment integration

4. Simple Memory
   - Recent events
   - Basic journal

## Technical Stack

- React Native with Expo
- Nostr (NIP-15 for marketplace)
- Breez SDK for Lightning
- Push notifications
- Three.js for agent rendering