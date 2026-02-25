import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme, spacing, borderRadius, typography, shadows } from '../../theme/ThemeContext';
import { supabase, Account } from '../../lib/supabase';

const accountTypes = [
  { value: 'bank', label: 'Bank Account', icon: 'business' },
  { value: 'credit_card', label: 'Credit Card', icon: 'card' },
  { value: 'wallet', label: 'Digital Wallet', icon: 'phone-portrait' },
  { value: 'cash', label: 'Cash', icon: 'cash' },
];

export default function AccountsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'bank',
    institution: '',
    balance: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAccounts().finally(() => setRefreshing(false));
  };

  const createAccount = async () => {
    if (!newAccount.name || !newAccount.balance) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    try {
      const { error } = await supabase.from('accounts').insert({
        name: newAccount.name,
        type: newAccount.type,
        institution: newAccount.institution || null,
        balance: parseFloat(newAccount.balance),
        currency: 'INR',
        status: 'active',
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Account Added',
        text2: 'Your account has been created successfully',
      });

      setModalVisible(false);
      setNewAccount({ name: '', type: 'bank', institution: '', balance: '' });
      loadAccounts();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create account',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIconForType = (type: string) => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      bank: 'business',
      credit_card: 'card',
      wallet: 'phone-portrait',
      cash: 'cash',
    };
    return icons[type] || 'wallet';
  };

  const renderAccount = ({ item }: { item: Account }) => (
    <View style={[styles.accountCard, { backgroundColor: colors.card, ...shadows.small }]}>
      <View style={styles.accountHeader}>
        <View
          style={[styles.accountIcon, { backgroundColor: colors.primary + '20' }]}
        >
          <Ionicons name={getIconForType(item.type)} size={24} color={colors.primary} />
        </View>
        <View style={styles.accountInfo}>
          <Text style={[styles.accountName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.accountType, { color: colors.textMuted }]}>
            {accountTypes.find((t) => t.value === item.type)?.label || item.type}
          </Text>
          {item.institution && (
            <Text style={[styles.institution, { color: colors.textMuted }]}>
              {item.institution}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.balanceContainer}>
        <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>Balance</Text>
        <Text style={[styles.balance, { color: colors.text }]}>
          {formatCurrency(item.balance)}
        </Text>
      </View>
    </View>
  );

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Accounts</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Total Balance */}
      <View style={[styles.totalCard, { backgroundColor: colors.card, ...shadows.medium }]}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Balance</Text>
        <Text style={[styles.totalAmount, { color: colors.text }]}>
          {formatCurrency(totalBalance)}
        </Text>
        <Text style={[styles.accountCount, { color: colors.textMuted }]}>
          {accounts.length} account{accounts.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Accounts List */}
      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No accounts yet
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>Add First Account</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add Account Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Account</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Account name"
              placeholderTextColor={colors.textMuted}
              value={newAccount.name}
              onChangeText={(text) => setNewAccount({ ...newAccount, name: text })}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Institution (optional)"
              placeholderTextColor={colors.textMuted}
              value={newAccount.institution}
              onChangeText={(text) => setNewAccount({ ...newAccount, institution: text })}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Initial balance"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={newAccount.balance}
              onChangeText={(text) => setNewAccount({ ...newAccount, balance: text })}
            />

            <Text style={[styles.sectionLabel, { color: colors.text }]}>Account Type</Text>
            <View style={styles.typeGrid}>
              {accountTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeItem,
                    {
                      backgroundColor: newAccount.type === type.value ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setNewAccount({ ...newAccount, type: type.value })}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={newAccount.type === type.value ? '#FFFFFF' : colors.text}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      { color: newAccount.type === type.value ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={createAccount}
            >
              <Text style={styles.createButtonText}>Add Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  accountCount: {
    fontSize: 14,
  },
  list: {
    padding: 20,
    gap: 12,
  },
  accountCard: {
    padding: 20,
    borderRadius: 20,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: {
    marginLeft: 16,
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
  },
  accountType: {
    fontSize: 14,
    marginTop: 2,
  },
  institution: {
    fontSize: 12,
    marginTop: 2,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  balanceLabel: {
    fontSize: 12,
  },
  balance: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalInput: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  createButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
