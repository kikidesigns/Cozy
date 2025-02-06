import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const welcomeStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.warmBeige,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.darkOrangeBrown,
    textAlign: 'center',
    marginBottom: 30,
  },
  agentEmoji: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 4,
    borderColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emojiText: {
    fontSize: 50,
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.white,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.softGray,
    color: Colors.darkOrangeBrown,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  colorContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  colorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkOrangeBrown,
    marginBottom: 10,
    textAlign: 'center',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  colorOptionWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 4,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedWrapper: {
    backgroundColor: Colors.orangeBrown,
    transform: [{ scale: 1.1 }],
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    gap: 16,
  },
  button: {
    height: 48,
    borderRadius: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  createButton: {
    backgroundColor: Colors.sageGreen,
  },
  createButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.orangeBrown,
  },
  loginButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: Colors.orangeBrown,
    marginTop: 16,
    textAlign: 'center',
  },
  // Backup screen styles
  nsecContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginVertical: 20,
  },
  warningText: {
    color: Colors.orangeBrown,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  nsecBox: {
    backgroundColor: Colors.lightBeige,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nsecText: {
    color: Colors.darkOrangeBrown,
    fontSize: 14,
    fontFamily: 'SpaceMono',
    flex: 1,
  },
  showButton: {
    backgroundColor: Colors.orangeBrown,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 10,
  },
  showButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: Colors.skyBlue,
    marginTop: 10,
  },
  copyButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: Colors.sageGreen,
    marginTop: 10,
  },
  confirmButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});