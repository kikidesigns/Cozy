import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { QRScanner } from './QRScanner';
import { MINIMUM_SATS_PAYMENT, MAXIMUM_SATS_PAYMENT } from '../../constants/wallet';

interface PaymentModalProps {
  visible: boolean;
  type: 'send' | 'receive';
  onClose: () => void;
  onSubmit: (amount: number, paymentRequest?: string) => Promise<void>;
}

export function PaymentModal({ visible, type, onClose, onSubmit }: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentRequest, setPaymentRequest] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    const amountNum = parseInt(amount, 10);
    
    if (isNaN(amountNum) || amountNum < MINIMUM_SATS_PAYMENT || amountNum > MAXIMUM_SATS_PAYMENT) {
      Alert.alert('Invalid Amount', `Please enter an amount between ${MINIMUM_SATS_PAYMENT} and ${MAXIMUM_SATS_PAYMENT} sats`);
      return;
    }

    if (type === 'send' && !paymentRequest) {
      Alert.alert('Missing Payment Request', 'Please scan or paste a Lightning payment request');
      return;
    }

    setIsProcessing(true);
    try {
      await onSubmit(amountNum, paymentRequest);
      handleClose();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setPaymentRequest('');
    setShowScanner(false);
    onClose();
  };

  const handleScan = (data: string) => {
    setPaymentRequest(data);
    setShowScanner(false);
  };

  if (showScanner) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            {type === 'send' ? 'Send Payment' : 'Receive Payment'}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount (sats)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount in sats"
              placeholderTextColor="#666"
            />
          </View>

          {type === 'send' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Payment Request</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={paymentRequest}
                onChangeText={setPaymentRequest}
                placeholder="Paste Lightning payment request"
                placeholderTextColor="#666"
                multiline
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => setShowScanner(true)}
              >
                <Text style={styles.scanButtonText}>Scan QR Code</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {type === 'send' ? 'Send' : 'Create Invoice'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  scanButton: {
    backgroundColor: '#3a3a3a',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#3a3a3a',
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});