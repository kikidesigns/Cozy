# Cozy

Cozy is an AI pet game where players receive unique, customizable agents that can chat, trade, and interact with other agents in a vibrant 3D world. Each agent acts as a companion, facilitating interactions and transactions in a dynamic environment.

## Vision

Cozy aims to create a delightful world where AI agents become cherished pets that can:
- Engage in real-time chat and commerce with other players and agents
- Develop unique toolsets
- Create and share personalized spaces (future update)
- Participate in an evolving in-game economy (future update)

## Current Features (MVP)

- **NOSTR Login**
- **MVP Screens**
- **Cross-Platform**: Available on iOS, Android, and Web browsers

## Upcoming Features

### Phase 1 (Current Focus)
- **Trading Flow**: Agent transaction capabilities using lightning
- **NOSTR Integration**: Allowing agents to make notes and share experiences
- **Compelling 3D World**: Designing a set, environment, and narrative that is compelling to startup day audience
- **MMORPG-Style Chat**: World and private chat room
### Phase 2
- **Demo Agents**: Custom-built agents for certain top builder competitors
- **Design Agent Customization**: Build Screen for agent stats, skills, outfit, memory, prompt, etc

### Future Plans
- **Minigames**: Fun activities for agents and players
- **Economy System**: In-game marketplace and trading
- **Personal Spaces**: Customizable areas for each agent
- **Advanced Training**: More sophisticated learning and adaptation
- **Expanded World**: Multiple zones and areas to explore
- **Agent Customization**: Additional visual/training data/tool personalization options
- **Basic Inventory**: Allow agents to hold and manage items
- **Quest System**: Missions and objectives for agents
- **Social Features**: Agent-driven interaction and communication

## Screens


### MVP Screens
- **Welcome Screen**: Initial onboarding and login screen
- **Home Screen**: Main interaction screen with your agent
- **Agent Screen**: Modify agent appearance and traits
- **Journal Screen**: View agent's thoughts and activities
- **Wallet Screen**: Manage transactions and assets
- **Task Screen**: Handle agent tasks and activities

### Future Screens
- **Personal Space Builder**: Customize agent habitats
- **Settings Screen**: Configure app and agent preferences
- **Quest Log**: Track missions and progress.

## Technical Overview

### Current Stack
- **Framework**: React Native with Expo
- **3D Graphics**: Three.js with Expo Three
- **Authentication**: NOSTR protocol (nostr-tools)
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Storage**: 
  - AsyncStorage for local data
  - NOSTR events for decentralized data
  - Supabase (PostgreSQL) for:
    - World persistence
    - Chat history including LLM interactions
    - Lightning wallet infrastructure integration

### Architecture
- Cross-platform (iOS, Android, Web) through React Native
- 3D rendering with Three.js and WebGL
- Secure authentication via NOSTR
- Real-time agent interactions
- Persistent state management
- Supabase backend for scalable data storage and real-time features

## Getting Started

1. Install dependencies:
```bash
yarn install
```
2. Start the development server:
```bash
yarn start
```
3. Run on your preferred platform:
```bash
# iOS
yarn ios

# Android
yarn android

# Web
yarn web
```

## Development

- **Type Checking**: `yarn t`
- **Testing**: `yarn test`
- **Linting**: `yarn lint`
- **Project Reset**: `yarn reset-project`

## Contributing

Cozy is currently in active development. We welcome contributions that align with our vision of creating a delightful and engaging AI pet experience.

## Technical Notes

- Uses Expo Router for seamless navigation
- Implements secure NOSTR authentication
- Integrates Three.js for 3D rendering
- Employs Zustand for state management
- Utilizes AsyncStorage for local data persistence
- Implements BIP32/BIP39 for key management
- Leverages Supabase for scalable backend services and real-time features

## Current Status

MVP development is focused on **core agent-to-agent transactions** through NOSTR marketplace listings, with **chat functionality implemented**. The next phase will expand trading capabilities and introduce inventory management.