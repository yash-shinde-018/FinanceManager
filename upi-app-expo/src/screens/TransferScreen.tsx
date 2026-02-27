import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { COLORS } from '../constants';
import { supabase } from '../lib/supabase';
import { transactionSupabase } from '../lib/transactionSupabase';

export const TransferScreen: React.FC = ({ navigation }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    if (!upiId || !amount) {
      Alert.alert('Error', 'Please enter UPI ID and amount');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (transferAmount > 100000) {
      Alert.alert('Error', 'Maximum transfer amount is ₹1,00,000');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Get user's accounts from Supabase
      const { data: accounts, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('balance', { ascending: false })
        .limit(1);

      if (accountError || !accounts || accounts.length === 0) {
        Alert.alert('Error', 'No account found');
        setIsLoading(false);
        return;
      }

      const account = accounts[0];

      // 2. Check sufficient balance
      if (account.balance < transferAmount) {
        Alert.alert('Error', 'Insufficient balance');
        setIsLoading(false);
        return;
      }

      // 3. Deduct balance from account
      const newBalance = account.balance - transferAmount;
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', account.id);

      if (updateError) {
        Alert.alert('Error', 'Failed to process transfer');
        setIsLoading(false);
        return;
      }

      // 4. Store transaction in TRANSACTION database (second Supabase)
      const { error: txError } = await transactionSupabase
        .from('upi_transactions')
        .insert({
          user_id: user?.id,
          upi_id: upiId,
          amount: transferAmount,
          type: 'debit',
          status: 'completed',
          description: `Money sent to ${upiId}`,
          note: note || null,
        });

      if (txError) {
        console.error('Transaction storage error:', txError);
        // Continue anyway since balance was deducted
      }
      
      Alert.alert(
        'Transfer Successful',
        `₹${transferAmount.toLocaleString('en-IN')} sent to ${upiId}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert('Error', 'Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMoney = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return '₹ ' + num.toLocaleString('en-IN');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* UPI ID Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>To UPI ID</Text>
          <View style={styles.inputContainer}>
            <Icon name="at" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="name@upi"
              placeholderTextColor={COLORS.textMuted}
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
            />
          </View>
          <Text style={styles.hint}>Enter the UPI ID of the recipient</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currency}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Quick Amount Buttons */}
      <View style={styles.quickAmounts}>
          {[100, 500, 1000, 2000].map((amt) => (
            <TouchableOpacity
              key={amt}
              style={styles.quickAmountBtn}
              onPress={() => setAmount(amt.toString())}
            >
              <Text style={styles.quickAmountText}>₹{amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Note (Optional)</Text>
          <View style={styles.inputContainer}>
            <Icon name="note-text" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Add a note"
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
              maxLength={50}
            />
          </View>
        </View>

        {/* Transfer Button */}
        <TouchableOpacity
          style={[styles.transferBtn, (!upiId || !amount) && styles.transferBtnDisabled]}
          onPress={handleTransfer}
          disabled={!upiId || !amount || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="send" size={20} color="#fff" style={styles.btnIcon} />
              <Text style={styles.transferBtnText}>
                {amount ? `Send ${formatMoney(amount)}` : 'Send Money'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            This is a demo transfer. No real money will be transferred. The transaction will be recorded in the app only.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currency: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.text,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickAmountBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  transferBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  transferBtnDisabled: {
    opacity: 0.5,
  },
  btnIcon: {
    marginRight: 8,
  },
  transferBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});
