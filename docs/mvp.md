# Cozy MVP Specification

## Core Features

### 1. Agent Per User
- Login with nsec only
- Basic agent customization (name, color)
- Simple task/conversation history stored in Nostr events
- One agent per Nostr identity
- Basic journal for tracking agent activities

### 2. Wallet Per Agent
- Each agent has dedicated Lightning wallet
- Full send/receive functionality via Breez SDK
- Push notifications for payment verification
- Balance display in home screen (pill-shaped UI)
- Transaction history in wallet screen

### 3. Agent to Agent Transactions
- Direct Lightning payments between agents
- Search marketplace listings (NIP-15)
- Agent handles transaction messaging
- Payment verification via push notifications
- Transaction status tracking in journal

### 4. Nostr Search by Agent
- Agent searches NIP-15 marketplace listings
- Display results from existing Nostr network
- No additional seller verification needed
- Search animation while agent is working
- Results displayed in chat with core details

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

### Agent Per User Flow
1. User inputs nsec
2. Agent created/loaded
3. Basic customization available
4. Redirect to home screen

### Agent to Agent Transaction Flow
1. User requests item search via chat
2. Agent searches NIP-15 events
3. Display results
4. User selects item
5. Agent initiates transaction with seller's agent
6. User receives push notification
7. User verifies payment
8. Transaction status tracked in journal

### Wallet Per Agent Operations
1. Display balance in home screen pill
2. Send/receive functionality
3. Push notifications for verification
4. Transaction history in wallet screen

### Nostr Search by Agent Flow
1. User requests search via chat
2. Agent queries NIP-15 marketplace
3. Loading animation shown
4. Results displayed in chat
5. Option to initiate transaction

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

1. Agent Per User
   - nsec login
   - Agent creation
   - Basic journal

2. Wallet Per Agent
   - Breez SDK setup
   - Send/receive
   - Push notifications

3. Agent to Agent Transactions
   - NIP-15 integration
   - Transaction flow
   - Payment handling

4. Nostr Search by Agent
   - Marketplace query
   - Result display
   - Search animation

## Technical Stack

- React Native with Expo
- Nostr (NIP-15 for marketplace)
- Breez SDK for Lightning
- Push notifications
- Three.js for agent rendering