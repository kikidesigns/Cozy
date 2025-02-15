import { Dimensions, Platform, StyleSheet } from "react-native"
import { Colors } from "../constants/Colors"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CHAT_HEIGHT = SCREEN_HEIGHT / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.skyBlue,
  },
  canvasContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 1,
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: `${Colors.warmBeige}CC`,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softGray,
    zIndex: 3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orangeBrown,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarText: {
    fontSize: 20,
  },
  npubBadge: {
    position: 'absolute',
    bottom: -12,
    left: -4,
    right: -4,
    backgroundColor: Colors.darkOrangeBrown,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  npubText: {
    color: Colors.white,
    fontSize: 8,
    textAlign: 'center',
  },
  healthBar: {
    width: 100,
    height: 10,
    backgroundColor: Colors.softGray,
    borderRadius: 5,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  healthFill: {
    width: '80%',
    height: '100%',
    backgroundColor: Colors.sageGreen,
    borderRadius: 5,
  },
  journalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orangeBrown,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  journalButtonText: {
    fontSize: 20,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletButton: {
    backgroundColor: Colors.orangeBrown,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  walletText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orangeBrown,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  logoutText: {
    fontSize: 20,
  },
  spacer: {
    flex: 1,
  },
  chatWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CHAT_HEIGHT,
    zIndex: 3,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: `${Colors.warmBeige}F2`,
  },
  messageScroll: {
    flex: 1,
  },
  messageScrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  agentMessage: {
    backgroundColor: `${Colors.warmBeige}F2`,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.softGray,
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    backgroundColor: `${Colors.orangeBrown}F2`,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  agentMessageText: {
    color: Colors.darkOrangeBrown,
  },
  userMessageText: {
    color: Colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: `${Colors.warmBeige}F2`,
    borderTopWidth: 1,
    borderTopColor: Colors.softGray,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.softGray,
    borderColor: Colors.softGray,
  },
});

export default styles;
