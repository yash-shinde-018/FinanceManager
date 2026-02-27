import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONTS } from '../constants';
import { validateUPIId, validateAmount } from '../utils/validation';

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

const RecentContact = ({ 
  icon, 
  name, 
  upiId, 
  onPress 
}: { 
  icon: string; 
  name: string; 
  upiId: string; 
  onPress: () => void;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.recentContact}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={styles.recentAvatar}>
          <Icon name={icon} size={28} color={COLORS.primary} />
        </View>
        <Text style={styles.recentName} numberOfLines={1}>{name}</Text>
        <Text style={styles.recentUpi} numberOfLines={1}>{upiId}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const SendScreen: React.FC = () => {
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ upiId?: string; amount?: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const successAnim = React.useRef(new Animated.Value(0)).current;

  const validateForm = useCallback(() => {
    const newErrors: { upiId?: string; amount?: string } = {};

    const upiValidation = validateUPIId(upiId);
    if (!upiValidation.success) {
      newErrors.upiId = 'Enter valid UPI ID (e.g., name@bank)';
    }

    const amountValidation = validateAmount(amount);
    if (!amountValidation.success) {
      newErrors.amount = 'Enter amount between ₹1 and ₹1,00,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [upiId, amount]);

  const handleSend = useCallback(() => {
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);

      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Reset after showing success
      setTimeout(() => {
        setShowSuccess(false);
        setUpiId('');
        setAmount('');
        setNote('');
        successAnim.setValue(0);
      }, 2000);
    }, 1500);
  }, [validateForm, successAnim]);

  const selectQuickAmount = (amt: number) => {
    setAmount(amt.toString());
    setErrors(prev => ({ ...prev, amount: undefined }));
  };

  const selectRecentContact = (id: string) => {
    setUpiId(id);
    setErrors(prev => ({ ...prev, upiId: undefined }));
  };

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <Animated.View style={[styles.successContent, { opacity: successAnim }]}>
          <View style={styles.successIcon}>
            <Icon name="check-circle" size={100} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successAmount}>₹{amount}</Text>
          <Text style={styles.successSubtitle}>Sent to {upiId}</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Send Money</Text>
            <Text style={styles.headerSubtitle}>Quick & Secure Transfers</Text>
          </View>

          {/* Recent Contacts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Contacts</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
              <RecentContact
                icon="account"
                name="Rahul"
                upiId="rahul@okaxis"
                onPress={() => selectRecentContact('rahul@okaxis')}
              />
              <RecentContact
                icon="account"
                name="Priya"
                upiId="priya@oksbi"
                onPress={() => selectRecentContact('priya@oksbi')}
              />
              <RecentContact
                icon="store"
                name="Grocery"
                upiId="grocerystore@upi"
                onPress={() => selectRecentContact('grocerystore@upi')}
              />
              <RecentContact
                icon="file-document"
                name="Electricity"
                upiId="electricity@bills"
                onPress={() => selectRecentContact('electricity@bills')}
              />
            </ScrollView>
          </View>

          {/* Input Form */}
          <View style={styles.formSection}>
            {/* UPI ID Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.upiId && styles.inputError]}>
                <Icon name="account" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter UPI ID or Mobile"
                  placeholderTextColor={COLORS.textMuted}
                  value={upiId}
                  onChangeText={(text) => {
                    setUpiId(text);
                    if (errors.upiId) setErrors(prev => ({ ...prev, upiId: undefined }));
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {upiId.length > 0 && (
                  <TouchableOpacity onPress={() => setUpiId('')}>
                    <Icon name="close-circle" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              {errors.upiId && (
                <Text style={styles.errorText}>{errors.upiId}</Text>
              )}
            </View>

            {/* Amount Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.amount && styles.inputError]}>
                <Icon name="currency-inr" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Amount"
                  placeholderTextColor={COLORS.textMuted}
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
                  }}
                  keyboardType="numeric"
                />
              </View>
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
            </View>

            {/* Quick Amounts */}
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickAmountBtn, amount === amt.toString() && styles.quickAmountBtnActive]}
                  onPress={() => selectQuickAmount(amt)}
                >
                  <Text style={[styles.quickAmountText, amount === amt.toString() && styles.quickAmountTextActive]}>
                    ₹{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Note Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Icon name="note-text" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Add a note (optional)"
                  placeholderTextColor={COLORS.textMuted}
                  value={note}
                  onChangeText={setNote}
                  maxLength={50}
                />
              </View>
            </View>
          </View>

          {/* Payment Summary */}
          {amount && upiId && (
            <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
              <Text style={styles.summaryTitle}>Payment Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>₹{amount}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>To</Text>
                <Text style={styles.summaryValue}>{upiId}</Text>
              </View>
              {note && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Note</Text>
                  <Text style={styles.summaryValue}>{note}</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Spacer for bottom button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Pay Button */}
        <View style={styles.bottomButton}>
          <TouchableOpacity
            style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
            onPress={handleSend}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <Icon name="loading" size={24} color="#fff" style={{ transform: [{ rotate: '45deg' }] }} />
                <Text style={styles.payButtonText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.payButtonText}>
                {amount ? `Pay ₹${amount}` : 'Enter Amount'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.h1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.h3,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.lg,
    marginBottom: SPACING.md,
  },
  recentScroll: {
    paddingLeft: SPACING.lg,
  },
  recentContact: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    width: 72,
  },
  recentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recentName: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  recentUpi: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.body,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
    marginLeft: SPACING.sm,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickAmountBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAmountBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickAmountText: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    fontWeight: '500',
  },
  quickAmountTextActive: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: FONTS.h3,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#fff',
    fontSize: FONTS.h3,
    fontWeight: '600',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  successAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
  },
});
