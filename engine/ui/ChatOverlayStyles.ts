// engine/ui/ChatOverlayStyles.ts
import { Dimensions, Platform, StyleSheet } from "react-native"
import { Colors } from "../constants/Colors"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CHAT_HEIGHT = SCREEN_HEIGHT / 3;
const SIDEBAR_WIDTH = 50;

const styles = StyleSheet.create({
  chatWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: CHAT_HEIGHT,
    zIndex: 1,
  },
  chatContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(245, 230, 211, 0.5)", // Semi-transparent beige
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: "rgba(245, 230, 211, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: Colors.softGray,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orangeBrown,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  chatButtonActive: {
    backgroundColor: Colors.darkOrangeBrown,
  },
  chatContentWrapper: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.warmBeige, // Ensures input bar is inside SafeArea
    borderTopWidth: 1,
    borderTopColor: Colors.softGray,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    color: Colors.darkOrangeBrown,
    borderWidth: 1,
    borderColor: Colors.softGray,
    fontSize: 16,
    minHeight: 44,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.orangeBrown,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.white,
    marginLeft: 8,
  },
  messageScroll: {
    flex: 1,
  },
  messageScrollContent: {
    padding: 10,
  },
  message: {
    marginVertical: 4,
    maxWidth: "80%",
    padding: 8,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.orangeBrown,
  },
  agentMessage: {
    alignSelf: "flex-start",
    backgroundColor: Colors.warmBeige,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  userMessageText: {
    color: Colors.white,
  },
  agentMessageText: {
    color: Colors.darkOrangeBrown,
  },
});

export default styles;
