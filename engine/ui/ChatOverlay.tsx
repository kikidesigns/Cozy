// engine/ui/ChatOverlay.tsx
import React, { useEffect, useRef, useState } from "react"
import {
  FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity,
  View
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context" // Ensure SafeArea padding
import { FontAwesome } from "@expo/vector-icons" // Import icons
import { useChatStore } from "../chat/ChatStore"
import chatStyles from "./ChatOverlayStyles"

const ChatOverlay: React.FC = () => {
  const {
    messages,
    currentChannel,
    isTradeActive,
    tradeMessages,
    sendChatMessage,
    setCurrentChannel,
    chooseTradeOption,
    setChatActive,
    loadMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const flatListRef = useRef<FlatList<any>>(null);
  const [draftMessage, setDraftMessage] = useState<string>("");
  const insets = useSafeAreaInsets(); // SafeArea insets

  // Setup message subscription and load initial messages
  useEffect(() => {
    console.log("ChatOverlay: Loading initial messages and setting up subscription");
    loadMessages();
    subscribeToMessages();
    return () => {
      console.log("ChatOverlay: Cleaning up subscription");
      unsubscribeFromMessages();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    console.log("ChatOverlay: Messages updated, scrolling to bottom");
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100); // Small delay to ensure render is complete
    }
  }, [messages]);

  const onSendPress = () => {
    if (draftMessage.trim() !== "") {
      console.log("ChatOverlay: Sending message in channel:", currentChannel);

      // For World channel, just send the message
      if (currentChannel === "World") {
        sendChatMessage("World", draftMessage.trim());
      }
      // For Private channel, try to get recipient
      else if (currentChannel === "Private") {
        const lastMessage = [...messages].reverse().find(msg => msg.channel === "Private");
        if (lastMessage) {
          const recipientId = lastMessage.sender === "Player" ? lastMessage.recipient : lastMessage.sender;
          console.log("ChatOverlay: Sending private message to recipient:", recipientId);
          sendChatMessage("Private", draftMessage.trim(), "Player", recipientId);
        } else {
          console.error("ChatOverlay: No recipient found for private message");
        }
      }
      setDraftMessage("");
    }
  };

  // Vertical Chat Selection Buttons (World, Private)
  const renderChatButtons = () => (
    <View style={chatStyles.sidebar}>
      {[
        { type: "World", icon: "globe" }, // Globe icon for World chat
        { type: "Private", icon: "envelope" }, // Envelope icon for Private chat
      ].map((chatType) => (
        <TouchableOpacity
          key={chatType.type}
          style={[
            chatStyles.chatButton,
            currentChannel === chatType.type ? chatStyles.chatButtonActive : {},
          ]}
          onPress={() => setCurrentChannel(chatType.type as "World" | "Private")}
        >
          <FontAwesome name={chatType.icon as any} size={24} color="white" />
        </TouchableOpacity>
      ))}
    </View>
  );

  // Normal Chat Messages (World, Private)
  const renderNormalChat = () => {
    const filteredMessages = messages.filter((msg) => msg.channel === currentChannel);
    console.log("ChatOverlay: Rendering messages for channel", currentChannel, filteredMessages);

    return (
      <View style={chatStyles.chatContentWrapper}>
        <FlatList
          ref={flatListRef}
          data={filteredMessages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            console.log("ChatOverlay: Rendering message item:", item);
            return (
              <View
                style={[
                  chatStyles.message,
                  item.sender === "Player"
                    ? chatStyles.userMessage
                    : chatStyles.agentMessage,
                ]}
              >
                <Text
                  style={[
                    chatStyles.messageText,
                    item.sender === "Player"
                      ? chatStyles.userMessageText
                      : chatStyles.agentMessageText,
                  ]}
                >
                  [{item.timestamp}] {item.sender}: {item.text}
                </Text>
              </View>
            );
          }}
          style={chatStyles.messageScroll}
          contentContainerStyle={chatStyles.messageScrollContent}
        />
      </View>
    );
  };

  return (
    <View style={chatStyles.chatWrapper}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={chatStyles.chatContainer}
      >
        {!isTradeActive && renderChatButtons()}
        {renderNormalChat()}
      </KeyboardAvoidingView>
      {/* CHAT INPUT BAR FIXED ABOVE SAFE AREA */}
      <View
        style={[
          chatStyles.inputContainer,
          { paddingBottom: insets.bottom }, // SafeArea padding
        ]}
      >
        <TextInput
          style={chatStyles.input}
          value={draftMessage}
          onChangeText={setDraftMessage}
          placeholder={`Type a message... (${currentChannel})`}
          placeholderTextColor="#aaa"
          returnKeyType="send"
          onSubmitEditing={onSendPress}
        />
        <TouchableOpacity style={chatStyles.sendButton} onPress={onSendPress}>
          <Text style={{ color: "#fff", fontSize: 16 }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatOverlay;
