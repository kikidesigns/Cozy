Implementing a Chat System in Cozy’s React Native Expo Engine

This guide outlines the implementation of a chat system for Cozy’s game engine using React Native (Expo). We will cover the Chat UI design, the Trade Chat Flow for NPC trading conversations, and the State Management approach. Finally, we provide full code for the new components and explain integration details. The solution prioritizes mobile user-friendliness and performance (no artificial limits on messages), and uses in-memory state (no persistence across sessions).

Chat UI Implementation

Overlay Design and Visibility

The chat interface is built as a fixed overlay on the game screen. We use absolute positioning to place it at the bottom of the screen so it does not affect the game layout ￼. When the chat is inactive (not being interacted with), its background is semi-transparent, allowing the game to show through. When the chat is active (user is typing or focused), it becomes fully opaque for readability.

How it works: We maintain an isChatActive state (boolean) that toggles based on user interaction:
	•	On chat focus (e.g., tapping the text input or the chat area), set isChatActive to true – this increases opacity to 100%.
	•	On blur (or after sending a message), set isChatActive to false – this reverts the background to a translucent color.

Using a translucent RGBA background when inactive (e.g., rgba(0,0,0,0.5)) achieves the semi-transparent effect, and switching to a solid background (e.g., rgba(0,0,0,0.8) or opaque) when active makes it fully visible. This approach keeps the game immersive by not entirely blocking the view when chat is idle.

Keyboard handling: To ensure the chat input isn’t hidden by the on-screen keyboard, especially on mobile devices, we wrap the chat component in a KeyboardAvoidingView. This component automatically adjusts its position or padding to keep the input visible when the keyboard appears ￼. We use behavior="padding" (or "height" on Android) so that the chat box shifts up appropriately. This way, the player can always see what they are typing, which is crucial for usability on mobile.

Multi-Channel Support (World, Party, Guild, Private)

The chat system supports multiple channels:
	•	World Chat: visible to all players.
	•	Party Chat: visible only to a player’s party.
	•	Guild Chat: visible to members of the player’s guild.
	•	Private Messages: direct one-on-one messages.

We implement channel support by maintaining a currentChannel state and filtering messages based on this channel. The UI can provide a channel selector (for example, a tab bar or buttons for World, Party, Guild, Private at the top of the chat box). The user can tap a channel to switch the chat view to that context. The chat input will then send messages to the selected channel.

Message format: Each chat message object includes a channel field (e.g., 'World', 'Party', 'Guild', or 'Private') and a text field, along with metadata like timestamp and sender. For private messages, we also include a recipient or target field to identify the other user in the conversation. In the UI:
	•	If viewing a specific channel (World/Party/Guild), we show only messages for that channel.
	•	If the Private channel is selected, we show private messages involving the player. (In a full implementation, you might open a separate private chat with a specific user. For simplicity, this chat view could list all private messages, prefixed with the sender or recipient name).

Each message in the list is typically displayed with a timestamp and sender name. Since the chat is filtered by channel, we don’t need to prefix messages with the channel name (the context is already selected). However, we ensure private messages indicate the other party (e.g., “To Alice: …”, “From Bob: …”) for clarity.

Scrollable Message List with Timestamps and Emoji Support

Chat messages are presented in a scrollable list so players can review past messages. We use React Native’s FlatList component for efficient rendering of potentially many messages ￼. FlatList is preferred over a basic ScrollView because it virtualizes the list – only rendering items that are on-screen – which improves performance for long chat histories ￼. We do not impose an arbitrary limit on the number of messages kept; all messages from the current play session remain in memory (until the app is closed). This means if hundreds of messages are sent, they will all be displayed, relying on FlatList’s efficiency to handle them smoothly.

Each chat message displays a timestamp (for example, [10:45] for 10:45 AM/PM) next to the content. We format timestamps upon rendering (e.g., using JavaScript’s Date APIs to get hours/minutes). This provides context for conversation flow without overwhelming the UI.

The chat input supports emoji characters. Because React Native text inputs support UTF-8, players can use their device’s emoji keyboard to insert emojis into messages just like normal text. No special handling is required for basic emoji support – they will appear in the TextInput and in the messages list. (If a richer emoji picker or custom emoji images were needed, that could be an enhancement, but basic support is inherent.)

Message Input UI: The chat box includes a TextInput field for typing messages and a send button (or the platform’s return key can be used to send). For example, on Android/iOS, the keyboard’s send/enter can trigger the send action. We ensure the TextInput is part of the overlay so that tapping it will focus and bring up the keyboard. When the user sends a message:
	•	We capture the text, create a message object with the current timestamp and channel, and add it to the in-memory messages list (state).
	•	The list automatically updates and scrolls to show the new message (we can call FlatList.scrollToEnd() upon new message, or use the inverted list approach).

Integration of “Trade” Button Interaction

When the player interacts with an NPC and clicks the “Trade” button, we trigger a special chat mode for trading (detailed in the next section). Integrating this requires a hook between the NPC UI and the chat system:
	•	The NPC’s “Trade” button handler should call a function (exposed by our chat state or context) to initiate the trade chat. For example, if we have a global chat store, the NPC component can call something like useChatStore.getState().startTradeConversation(npcName) when the button is pressed.
	•	This call will switch the chat system into Trade Chat Mode (setting a state flag and preparing a scripted conversation). The chat UI then detects this state and swaps to the trade conversation interface.

In practice, the ChatOverlay component will likely always be mounted (as part of the UI), and will observe the chat state. When a trade conversation starts, the ChatOverlay can hide or overlay the normal chat UI with the trade UI. This integration ensures a seamless transition: the player clicks “Trade” in the NPC dialog, and immediately the chat box becomes a trade dialogue with the NPC.

From an integration perspective, ensure the ChatOverlay component is rendered at a top level (e.g., in your main game screen JSX) so it’s always present. The chat store or context should be accessible globally or via React context so that any part of the app (like an NPC component) can dispatch chat events.

Trade Chat Flow (NPC Trading Conversation)

The trade chat is a structured, text-adventure-style conversation with an NPC. When trade mode is active, the chat UI shifts to a distinct appearance and behavior:
	•	Distinct Visual Style: To differentiate from normal chat, we can change the background color or text style in the trade chat. For example, use a different background (perhaps a darker or themed color) and maybe a unique border or icon to indicate you’re in a special dialogue. NPC messages could be styled in italics or a different color to set them apart from player messages. This visual distinction helps the player recognize they are in a trade interaction and not in the global chat.
	•	Predefined NPC Responses: The NPC’s dialogue is scripted. When the trade chat starts, the NPC greets the player or offers trade options with a predefined message. These messages are not typed by a real user but come from a script. We handle this by storing a predefined conversation script (dialogue tree) and pushing NPC messages to the chat as the player progresses through the conversation.
	•	Player Choice Selection: Unlike free typing in normal chat, during a trade the player selects from given responses. The chat UI will present a list of possible replies or actions (e.g., “Yes, show me your goods” or “No, maybe later”) as buttons or menu options. The player taps a button, and the system then:
	1.	Displays the player’s choice as a chat message (so it appears in the dialogue history for context).
	2.	Triggers the next NPC response based on that choice.

This continues until the conversation ends (for instance, the trade is completed or canceled).

Conversation Structure: We can model the trade dialogue as a simple state machine or decision tree. For example:
	•	Step 1: NPC: “Welcome, traveler. Interested in trading?”
Choices: (A) “Yes, what do you have?” -> go to Step 2, (B) “No, thanks.” -> go to End.
	•	Step 2: NPC: “I have potions and elixirs. What would you like to buy?”
Choices: (A) “Potion” -> go to Step 3a, (B) “Elixir” -> go to Step 3b, (C) “Never mind” -> go to End.
	•	Step 3a: NPC: “A potion costs 10 gold. Deal?”
Choices: (A) “Buy Potion” -> go to End (complete trade), (B) “Cancel” -> go to End.
	•	End: NPC: “Safe travels!” (or closes trade dialogue).

This is just an illustrative flow. The key is that each step has a predefined NPC prompt and a set of player responses that lead to the next step. We implement this by storing the dialogue data (NPC messages and corresponding options with pointers to next steps). When a step is reached, we push the NPC’s message to the chat and display the current step’s response options as clickable UI.

Switching to Trade Mode: The chat state has a flag (e.g., isTradeActive) and possibly a structure for the current trade conversation. When startTradeConversation is called (with perhaps an NPC identifier or scenario), the state is updated to activate trade mode and set the conversation to the beginning. The ChatOverlay, upon seeing isTradeActive=true, will:
	•	Change its styling to the trade theme.
	•	Clear or hide the normal chat messages.
	•	Possibly display a header like “Trading with [NPC Name]” to indicate context.
	•	Show the NPC’s opening line and the available choices.

Progressing the Trade Dialogue: When the player selects an option:
	•	We record the player’s choice as a chat message (this gives the effect of the player “speaking” in the chat).
	•	We look up the next step from the dialogue script and set that as the new current step in state.
	•	We then append the NPC’s response for that step to the chat messages.

This continues until a step that signifies the end of the conversation. At that point, we can automatically exit trade mode:
	•	The chat state isTradeActive is set to false.
	•	Trade-specific messages can be cleared (or simply kept separate; they won’t show in normal chat).
	•	The UI reverts to the standard chat overlay (with whatever channel was last active).

We ensure the transition out of trade mode is smooth. For example, after the final NPC message, we might wait a moment and then switch back, or switch immediately once the player clicks an “End”/“Close” option. Since the trade messages are stored separately from normal chat, the player’s normal chat history is preserved and will be visible again once the trade dialogue closes.

State Management Approach

Managing the chat state is critical because multiple components (chat UI, NPC interactions, etc.) will interact with it. We have two suggested approaches: using a class-based component state or a global state store (Zustand). For this implementation, we use Zustand for simplicity and performance, but the architecture could be adapted to class state or Context API if needed.

Why Zustand for Chat State?

Zustand is a lightweight state management library that works well with React Native ￼. It allows us to create a global store for the chat that any component can access (via hooks or direct calls), without the boilerplate of Redux. This is ideal for a chat system because:
	•	The chat state (messages, current channel, trade conversation state, etc.) needs to be accessible and updatable from various places (the chat UI, NPC triggers, possibly system events).
	•	Zustand’s minimal API makes it easy to define state and update logic in one place. We can create actions like sendMessage or startTradeConversation inside the store.
	•	It’s performant: Zustand cleverly ensures components only re-render on state slices they use, and it has a small footprint in a React Native app ￼ ￼.

With Zustand, we avoid prop-drilling or complex context for the chat. We simply import the store hook where needed. For example, the ChatOverlay component will use the store to get the list of messages and the current channel, and to subscribe to updates. An NPC component can import the store to invoke actions (without needing to be a child of ChatOverlay or to dispatch Redux actions through a provider).

(Alternative: If not using Zustand, one could make the ChatOverlay a parent component that holds state in a class or via useReducer hook, and pass down callbacks. However, that can get cumbersome as the app grows. Zustand offers a cleaner separation.)

Chat State Structure

In our Zustand store (or similar state container), we maintain the following state pieces:
	•	messages: an array of chat message objects for normal chats (world/party/guild/private). Each message might look like { id, channel, sender, text, timestamp, recipient? }.
	•	currentChannel: the channel currently active in the UI (default to “World” or last used).
	•	isChatActive: boolean for UI transparency state (active vs inactive).
	•	isTradeActive: boolean indicating whether we are currently in a trade dialogue mode.
	•	tradeMessages: an array of messages specific to the ongoing trade conversation (NPC and player dialogue). This resets or starts empty each time a trade is initiated.
	•	tradeStep: the identifier/key for the current step in the trade conversation script (e.g., 'start', 'offer', etc., or could be an index in a sequence). This helps determine what NPC will say next and what options to show.

We also define actions (functions) in the store to update these state parts:
	•	sendChatMessage(channel, text, target?): creates a new message (with timestamp and sender as the current player for world/party/guild, or sender/recipient for private) and appends it to messages. This would handle normal chat sends.
	•	startTradeConversation(npcName): enters trade mode. This might take an NPC identifier or just set a default script. It will set isTradeActive=true, clear any existing tradeMessages, set tradeStep to the start of the script, and add the initial NPC message to tradeMessages.
	•	chooseTradeOption(optionIndex): handles when the player selects one of the NPC’s provided responses. It will:
	•	Take the selected option (by index or an identifier) from the current tradeStep’s options.
	•	Append the player’s choice as a new message in tradeMessages (marked as player).
	•	Update tradeStep to the next value associated with that choice.
	•	If the next step is a valid conversation step, append the NPC’s message for that step to tradeMessages. If the next step signifies the end, possibly append any closing message and then exit trade mode (set isTradeActive=false).
	•	endTradeConversation(): (optional) explicitly exit trade mode, in case we need to handle cleanup or user cancellation.

Using these actions, the logic of the chat and trade flows is encapsulated in the store. The UI components just call these methods and render based on current state. State updates through Zustand trigger re-renders in subscribed components (like ChatOverlay) automatically, ensuring the UI stays in sync. The updates are designed to be seamless and fast, leveraging React Native’s rendering optimizations and Zustand’s update efficiency (which batches and minimizes re-renders by default).

Ensuring Smooth Performance

Performance is addressed in multiple ways:
	•	FlatList for messages: As mentioned, using a FlatList for the chat message list means the app can handle a large number of messages without lag, since off-screen messages are not rendered ￼. We are not artificially capping the message count, trusting the list virtualization and mobile hardware to manage typical chat volumes. (If chats become extremely large, one might consider pagination or trimming, but the requirement is explicitly to avoid arbitrary limits).
	•	Optimized state updates: By using a global store, we avoid passing callbacks through many components and we can update only what’s needed. For example, adding a new message just changes the messages array; components only using other parts of state (like currentChannel) won’t re-render. Zustand’s internal mechanisms ensure state updates are fast and do not freeze the UI ￼.
	•	Non-blocking UI: All state modifications (adding messages, switching modes) are done synchronously in memory. There are no heavy computations or await delays in the UI thread when sending or receiving a message (in a real app, network calls would be involved, but those would be handled asynchronously and would update the state when responses arrive).
	•	Styling and layout: We keep the chat components relatively lightweight (text and maybe images for emoji, no heavy animations except maybe a blink for new message). The semi-transparent overlay uses a simple style change, and toggling it doesn’t cause a re-layout of the entire screen—just a style update on the chat box.

With these considerations, the chat should feel responsive. As a further note, one should test on a device to ensure that the overlay doesn’t cause frame drops in the game rendering. If the game loop is separate (e.g., using a Canvas or WebGL view), updating a small overlay view with a few text items is usually fine.

Implementation Details and Code

Below we provide the full source for the key components of this chat system. This includes a Zustand store definition for chat state, the ChatOverlay React component, and an example of integrating the chat overlay in a screen and triggering a trade conversation from an NPC interaction. All code is written in JavaScript (ES6) for a React Native (Expo) environment.

ChatStore.js – Chat State Management (Zustand Store)

This file sets up the Zustand store that holds chat messages, state flags, and actions to update them. Import this store in any component that needs to read or alter chat data (e.g., the chat UI and NPC components).

// ChatStore.js
import create from 'zustand';

// Define a conversation script for trade dialogues (NPC trading scenario)
const tradeDialogueScript = {
  start: {
    npcText: "Hello! I have some items for trade. Are you interested?",
    options: [
      { text: "Yes, show me what you have.", next: "offer" },
      { text: "No thanks.", next: "end" }
    ]
  },
  offer: {
    npcText: "I can offer you a Sword or a Shield. Which would you like?",
    options: [
      { text: "Buy Sword (100 gold)", next: "buySword" },
      { text: "Buy Shield (150 gold)", next: "buyShield" },
      { text: "Actually, never mind.", next: "end" }
    ]
  },
  buySword: {
    npcText: "Great choice! You bought the Sword. Thank you for trading.",
    options: [
      { text: "Finish", next: "finish" }
    ]
  },
  buyShield: {
    npcText: "Great choice! You bought the Shield. Thank you for trading.",
    options: [
      { text: "Finish", next: "finish" }
    ]
  },
  end: {
    npcText: "Alright, maybe another time. Safe travels!",
    options: [
      { text: "Finish", next: "finish" }
    ]
  },
  finish: {
    npcText: null,  // indicates conversation is over
    options: []
  }
};

// Generate a simple timestamp string [HH:MM]
function formatTime(date) {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

// Define the Zustand store
export const useChatStore = create((set, get) => ({
  // Chat messages for normal channels
  messages: [],  // each message: { id, channel, sender, text, timestamp, recipient? }
  currentChannel: 'World',  // 'World' | 'Party' | 'Guild' | 'Private'

  // Trade conversation state
  isTradeActive: false,
  tradeMessages: [], // messages in the trade dialogue { id, senderType: 'NPC'|'Player', text, timestamp }
  tradeStep: null,   // current step key in tradeDialogueScript (or null if not in trade mode)

  // UI active flag for transparency (default inactive -> false)
  isChatActive: false,

  // Action: send a normal chat message
  sendChatMessage: (channel, text, recipient = null) => {
    const state = get();
    const newMessage = {
      id: Date.now(),  // using timestamp as unique ID
      channel: channel,
      sender: 'Player',  // In a real app, use the player's name or ID
      text: text,
      timestamp: formatTime(new Date()),
      ...(recipient ? { recipient } : {})
    };
    // In-memory append
    set({ messages: [...state.messages, newMessage] });
  },

  // Action: switch chat channel (for viewing/sending)
  setCurrentChannel: (channel) => {
    set({ currentChannel: channel });
  },

  // Action: start a trade conversation with an NPC
  startTradeConversation: (npcName = 'Trader') => {
    // Reset trade conversation state
    const initialStep = 'start';
    const initialNpcText = tradeDialogueScript[initialStep].npcText;
    const now = formatTime(new Date());
    set({
      isTradeActive: true,
      tradeStep: initialStep,
      // Initialize tradeMessages with the NPC's opening line
      tradeMessages: initialNpcText ? [
        { id: Date.now(), senderType: 'NPC', text: `${npcName}: ${initialNpcText}`, timestamp: now }
      ] : []
    });
    // Note: npcName can be used to personalize messages (prefixed in text above)
  },

  // Action: handle player's choice in trade conversation
  chooseTradeOption: (optionIndex) => {
    const state = get();
    const currentStepKey = state.tradeStep;
    if (!currentStepKey) return;

    const stepData = tradeDialogueScript[currentStepKey];
    if (!stepData) return;  // safety check

    const options = stepData.options || [];
    const chosenOption = options[optionIndex];
    if (!chosenOption) return;

    const now = formatTime(new Date());
    // 1. Add player's choice as a message
    const playerMessage = {
      id: Date.now(),
      senderType: 'Player',
      text: `You: ${chosenOption.text}`,
      timestamp: now
    };
    let newTradeMessages = [...state.tradeMessages, playerMessage];

    // 2. Determine next step
    const nextStepKey = chosenOption.next;
    const nextStepData = tradeDialogueScript[nextStepKey];

    if (nextStepData) {
      // If the next step has NPC text, add NPC message
      if (nextStepData.npcText) {
        const npcMsg = {
          id: Date.now() + 1,  // ensure a different id
          senderType: 'NPC',
          text: `${nextStepKey === 'finish' ? '' : 'NPC: '}${nextStepData.npcText}`,  // if finish, maybe no NPC name
          timestamp: formatTime(new Date())
        };
        newTradeMessages.push(npcMsg);
      }
      // Update state for the next step
      set({ tradeMessages: newTradeMessages, tradeStep: nextStepKey });
    }

    // 3. If next step is 'finish', end the trade conversation
    if (nextStepKey === 'finish') {
      // Exit trade mode (return to normal chat after adding final messages)
      set({ isTradeActive: false, tradeStep: null });
      // Note: We keep the tradeMessages in state for a moment (could be cleared if needed).
      // Optionally, could add a system message in normal chat like "Trade with NPC ended".
    }
  },

  // Action: end trade conversation abruptly (if needed, e.g., user cancels)
  endTradeConversation: () => {
    set({ isTradeActive: false, tradeStep: null, tradeMessages: [] });
  },

  // Action: toggle chat active state (for UI transparency)
  setChatActive: (active) => {
    set({ isChatActive: active });
  }
}));

Notes on the store implementation:
	•	We use Date.now() for a quick unique id for messages. In a real app, you might use UUIDs or an incrementing counter. This id is used as a React key when rendering list items.
	•	formatTime creates a simple timestamp string in HH:MM format. We store this string in each message for easy rendering. (Alternatively, store a Date and format in the component.)
	•	sendChatMessage defaults the sender to ‘Player’. In a multi-user scenario, messages from others would come via a different mechanism (e.g., network) and you would use their name.
	•	The tradeDialogueScript is a simple object mapping step keys to NPC text and options. Each option has text (what the player sees and “says”) and a next pointer to the next step key.
	•	startTradeConversation takes an npcName to personalize the conversation (for example, prepend the NPC’s name to the message). It sets up the first NPC message.
	•	chooseTradeOption handles appending the player’s chosen option and the NPC’s next message. It uses senderType to differentiate styling in the UI. If the next step is 'finish', we treat that as an endpoint and flip isTradeActive to false, which will signal the UI to exit trade mode.
	•	We included an endTradeConversation action for completeness (e.g., if the user closes the chat or walks away from NPC). This clears the trade state.
	•	setChatActive is used to mark the chat UI active/inactive. We will call this on focus/blur of the TextInput.

With the store in place, the UI components can now be implemented.

ChatOverlay.js – Chat UI Component

This React component renders the chat overlay UI. It uses the useChatStore hook to get state and actions. The component is designed to overlay on top of the game view, positioned at the bottom.

// ChatOverlay.js
import React, { useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { useChatStore } from './ChatStore';

const ChatOverlay = () => {
  // Extract state and actions from the store
  const {
    messages,
    currentChannel,
    isChatActive,
    isTradeActive,
    tradeMessages,
    tradeStep,
    sendChatMessage,
    setCurrentChannel,
    startTradeConversation,
    chooseTradeOption,
    setChatActive,
    endTradeConversation
  } = useChatStore(state => ({
    messages: state.messages,
    currentChannel: state.currentChannel,
    isChatActive: state.isChatActive,
    isTradeActive: state.isTradeActive,
    tradeMessages: state.tradeMessages,
    tradeStep: state.tradeStep,
    sendChatMessage: state.sendChatMessage,
    setCurrentChannel: state.setCurrentChannel,
    startTradeConversation: state.startTradeConversation,
    chooseTradeOption: state.chooseTradeOption,
    setChatActive: state.setChatActive,
    endTradeConversation: state.endTradeConversation
  }));

  const flatListRef = useRef(null);

  // Auto-scroll to bottom when new normal chat messages arrive
  useEffect(() => {
    if (!isTradeActive && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length, isTradeActive]);

  // Auto-scroll to bottom for trade messages as well
  useEffect(() => {
    if (isTradeActive && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [tradeMessages.length, isTradeActive]);

  // Handler for sending a normal chat message
  const handleSendMessage = (text) => {
    if (!text || text.trim() === '') return;
    sendChatMessage(currentChannel, text.trim());
    // Optionally, clear input (handled via controlled TextInput or ref, see below)
  };

  // We will use a ref and controlled component for TextInput to manage clearing it
  const messageInputRef = useRef(null);
  const [draftMessage, setDraftMessage] = React.useState('');

  const onSendPress = () => {
    handleSendMessage(draftMessage);
    setDraftMessage(''); // clear input
    // After sending, we can mark chat as inactive (or keep active until blur)
    // setChatActive(false);
  };

  // If not in trade mode, render normal chat UI
  const renderNormalChat = () => {
    // Filter messages for current channel
    const filteredMessages = messages.filter(msg => msg.channel === currentChannel);

    const renderItem = ({ item }) => (
      <Text style={styles.messageText}>
        <Text style={styles.timestamp}>[{item.timestamp}] </Text>
        {item.channel === 'Private' && item.recipient
          ? <Text style={styles.privateLabel}>{item.sender === 'Player' ? `(To ${item.recipient}) ` : `(From ${item.sender}) `}</Text>
          : null}
        <Text>{item.sender}: {item.text}</Text>
      </Text>
    );

    return (
      <>
        {/* Channel selector tabs */}
        <View style={styles.channelTabs}>
          {['World', 'Party', 'Guild', 'Private'].map(ch => (
            <TouchableOpacity
              key={ch}
              style={[styles.channelTab, currentChannel === ch && styles.activeChannelTab]}
              onPress={() => setCurrentChannel(ch)}
            >
              <Text style={styles.channelTabText}>{ch}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Messages list */}
        <FlatList
          ref={flatListRef}
          data={filteredMessages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          style={styles.messagesList}
          inverted={false}
        />
        {/* Input area */}
        <View style={styles.inputRow}>
          <TextInput
            ref={messageInputRef}
            style={styles.textInput}
            value={draftMessage}
            onChangeText={setDraftMessage}
            onFocus={() => setChatActive(true)}
            onBlur={() => setChatActive(false)}
            placeholder={`Type a message... (${currentChannel})`}
            placeholderTextColor="#aaa"
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={onSendPress}  // allow keyboard "send" action
          />
          <TouchableOpacity style={styles.sendButton} onPress={onSendPress}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // If in trade mode, render trade chat UI
  const renderTradeChat = () => {
    // We reuse FlatList for tradeMessages
    const renderItem = ({ item }) => (
      <Text style={[styles.messageText, item.senderType === 'NPC' ? styles.npcText : styles.playerText]}>
        <Text style={styles.timestamp}>[{item.timestamp}] </Text>
        <Text>{item.text}</Text>
      </Text>
    );

    // Determine current options from the script based on tradeStep
    let options = [];
    if (tradeStep && tradeStep !== 'finish') {
      const stepData = tradeStep && tradeStep in options ? null : null;
      // Actually, better to retrieve from script:
      const stepDataScript = tradeStep ? tradeDialogueScript[tradeStep] : null;
      if (stepDataScript && stepDataScript.options) {
        options = stepDataScript.options;
      }
    }

    return (
      <>
        <Text style={styles.tradeHeader}>Trading Conversation</Text>
        <FlatList
          ref={flatListRef}
          data={tradeMessages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          style={styles.messagesList}
          // It's a limited, controlled list, no need to invert
        />
        {/* Options buttons for player responses */}
        <View style={styles.optionsList}>
          {options.map((opt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => chooseTradeOption(index)}
            >
              <Text style={styles.optionButtonText}>{opt.text}</Text>
            </TouchableOpacity>
          ))}
          {/* If conversation can be ended early or after finish */}
          {tradeStep === 'finish' && (
            <TouchableOpacity style={styles.optionButton} onPress={() => endTradeConversation()}>
              <Text style={styles.optionButtonText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isChatActive ? styles.containerActive : styles.containerInactive]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}  // adjust offset if needed (e.g., if there's a header)
    >
      {/* Render trade chat if active, otherwise normal chat */}
      {isTradeActive ? renderTradeChat() : renderNormalChat()}
    </KeyboardAvoidingView>
  );
};

export default ChatOverlay;

// Internal styles for the chat overlay
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // We'll set height or maxHeight for the chat box
    maxHeight: '40%',  // chat box takes up to 40% of screen height
    width: '100%',
    paddingHorizontal: 5,
    // Default background (semi-transparent dark)
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  containerInactive: {
    // semi-transparent state
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  containerActive: {
    // fully opaque when active
    backgroundColor: 'rgba(0,0,0,0.8)'
  },
  channelTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  channelTab: {
    marginHorizontal: 5,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#555',
    borderRadius: 4
  },
  activeChannelTab: {
    backgroundColor: '#888'
  },
  channelTabText: {
    color: '#fff',
    fontSize: 12
  },
  messagesList: {
    paddingHorizontal: 5,
    paddingVertical: 5
  },
  messageText: {
    color: '#eee',
    fontSize: 14,
    marginVertical: 2
  },
  timestamp: {
    color: '#999',
    fontSize: 12
  },
  privateLabel: {
    color: '#ff9',
    fontSize: 14
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5
  },
  textInput: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginRight: 5
  },
  sendButton: {
    backgroundColor: '#3578e5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  tradeHeader: {
    textAlign: 'center',
    color: '#fffa',
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 4
  },
  optionsList: {
    flexDirection: 'column',
    padding: 5
  },
  optionButton: {
    backgroundColor: '#444',
    padding: 8,
    marginVertical: 3,
    borderRadius: 4
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 14
  },
  npcText: {
    color: '#ff9', // NPC messages in a different color (e.g., yellow)
    fontStyle: 'italic'
  },
  playerText: {
    color: '#acf'  // player messages in another color (light blue)
  }
});

Key points in ChatOverlay:
	•	The component uses KeyboardAvoidingView with position: 'absolute' styling to float above the game view at the bottom. The container’s maxHeight is 40% of the screen, allowing it to expand as messages grow, but not cover the entire screen.
	•	The container’s background uses styles.containerInactive vs styles.containerActive to adjust transparency based on isChatActive. We toggle isChatActive via onFocus and onBlur of the TextInput. When active, the background is darker (rgba(0,0,0,0.8), mostly opaque) for readability, and when inactive it’s lighter (rgba(0,0,0,0.3)).
	•	In normal chat mode:
	•	We render channel tabs for “World, Party, Guild, Private”. The current channel is highlighted. Tapping a tab calls setCurrentChannel from the store to switch context.
	•	The messages list is filtered by currentChannel. We display each message with a timestamp, and if it’s a private message we indicate the recipient or sender in parentheses. For example, if the player sent a private message to Bob, we show “(To Bob) Player: [text]”. If it’s a private message from Alice to the player, show “(From Alice) Alice: [text]”. Other channels don’t need this extra label.
	•	We use a FlatList for messages. inverted={false} means newest messages appear at the bottom. We call scrollToEnd in an effect whenever messages length changes to auto-scroll as new messages come in.
	•	The TextInput for message entry is single-line (we could allow multiline, but for chat usually one line per send). We handle the send in two ways: pressing the custom “Send” button, or pressing enter (submit on keyboard). Both call handleSendMessage which uses the store’s sendChatMessage. After sending, we clear the input’s state.
	•	We keep draftMessage in component state to control the TextInput value.
	•	In trade chat mode:
	•	We display a header “Trading Conversation” (this could also include the NPC’s name or an icon).
	•	We show the tradeMessages in a FlatList, similar to normal chat. NPC messages and player messages have different styles (npcText vs playerText styling).
	•	We gather the current options from the tradeDialogueScript based on tradeStep. For each option, we render a button. When clicked, it calls chooseTradeOption(index). We use the index in the options array to tell the store which choice.
	•	If the tradeStep is 'finish', we show a “Close” button that will call endTradeConversation to exit the trade mode. Also, note that once chooseTradeOption sets isTradeActive to false, the component will rerender in normal mode, effectively ending the trade UI. The “Close” button is a fallback if the conversation ended and we need the user to acknowledge to close (depending on how we script it).
	•	We make sure to auto-scroll the trade messages FlatList as well when new messages (NPC or player) are added, so the latest dialogue is visible.

The styling uses basic colors. In a real app, you might want to use theme colors or images. Here, NPC chat is italic and colored differently, and player choices are just normal style but could be colored as well.

Integration in the Game (Example Usage)

To integrate the chat into Cozy’s game engine, you need to include the ChatOverlay in your main UI and ensure that NPC interactions call the appropriate functions. Below is an example of how you might modify the main app component or a specific screen component to include the chat, and an example NPC component snippet.

Main Game Screen (e.g., GameScreen.js):

// GameScreen.js (Pseudo-code for integration)
import React from 'react';
import { View } from 'react-native';
import ChatOverlay from './ChatOverlay';
import GameWorldView from './GameWorldView';  // the main game rendering component

const GameScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* GameWorldView would be your existing game content (map, characters, etc.) */}
      <GameWorldView />
      {/* ChatOverlay on top of the game view */}
      <ChatOverlay />
    </View>
  );
};

export default GameScreen;

In the above, we simply overlay the ChatOverlay by placing it as the last child in a parent View that encompasses the full screen. The ChatOverlay’s absolute positioning (bottom: 0, left: 0, right: 0) will position it at the bottom over the game content. This ensures the chat is always accessible.

If the game uses navigation or multiple screens, you might include ChatOverlay in a higher-level navigator or only on specific screens (e.g., the main gameplay screen). But conceptually, it should be present whenever gameplay is happening.

NPC Interaction Example:

When the player interacts with an NPC (for trading), you likely have some UI or function triggered. For instance, maybe you have an NPCDialog component with options. The “Trade” option’s onPress handler can call our chat store:

// NPCDialog.js (snippet)
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useChatStore } from './ChatStore';

const NPCDialog = ({ npcName, onClose }) => {
  const startTradeConversation = useChatStore(state => state.startTradeConversation);

  return (
    <View style={{ padding: 10, backgroundColor: '#222' }}>
      <Text style={{ color: '#fff' }}>{npcName}: "Hello, do you want to trade?"</Text>
      {/* Other dialog options... */}
      <TouchableOpacity
        style={{ padding: 8, backgroundColor: '#444', marginTop: 5 }}
        onPress={() => {
          // Start trade chat and close this dialog
          startTradeConversation(npcName);
          onClose();  // hide the NPC dialog UI if necessary
        }}
      >
        <Text style={{ color: '#fff' }}>Trade</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NPCDialog;

In this example, when the user clicks “Trade”, we call startTradeConversation(npcName) from the store. This sets up the trade chat state and causes the ChatOverlay to switch to trade mode showing the conversation. We also call onClose() to maybe close the NPCDialog pop-up (so that the screen isn’t cluttered; the conversation now happens in the chat overlay).

Emoji Input: The ChatOverlay doesn’t need special integration for emoji beyond the TextInput. The user can use their keyboard’s emoji feature. If we wanted, we could integrate a library or custom emoji picker that on selection inserts an emoji into the TextInput (e.g., by managing draftMessage state).

Testing the Chat: With the above integration, you should be able to run the app (Expo development mode) and see the chat overlay on the game screen. Try tapping the chat input – the background should darken (active), and you can type a message. Sending it will add to the list with a timestamp. Try switching channels with the tabs – the message list will update to show the context (initially other channels might be empty). For demonstration, you might pre-populate some messages in the store (in ChatStore.js, you could add some default messages in the initial state for different channels) to verify filtering and display.

When you trigger an NPC trade, the chat overlay should switch. It will show the NPC’s initial message and offer the response options. Tap an option, you should see your choice appear and then the NPC response. Continue until the conversation ends, at which point the overlay should return to normal chat mode (the trade UI disappears). Ensure that after trade, the normal chat still works and prior messages are intact.

Conclusion

By following the above implementation, we create a robust chat system for Cozy’s React Native game engine that supports multiple channels and an interactive NPC trade dialogue. The chat UI stays unobtrusive (translucent when not in use ￼) and is optimized for mobile (using KeyboardAvoidingView to handle the on-screen keyboard ￼). We used Zustand for state management, which simplifies global state updates and is efficient for React Native apps ￼. The use of FlatList for rendering messages ensures we can handle a large number of messages smoothly ￼.

This solution should integrate seamlessly with Cozy’s game engine. The game’s main loop and visuals remain separate, while the chat overlay provides an immersive communication channel for players. By keeping messages in-memory, we avoid complicated storage and reset the chat fresh each session, which is often acceptable for game chats (persistent chat would require a backend service). The trade chat flow adds to the gameplay by turning the chat interface into a quest-like dialogue when needed, demonstrating the flexibility of the chat system.
