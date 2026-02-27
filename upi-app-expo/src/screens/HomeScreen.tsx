import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { COLORS } from '../constants';
import { logout } from '../store/slices/authSlice';
import { supabase, Account } from '../lib/supabase';

export const HomeScreen: React.FC = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch accounts from Supabase
  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching accounts:', error);
        return;
      }

      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const formatMoney = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  // Calculate total balance from all accounts
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const displayName = user?.name || 'User';
  const upiId = user?.email?.replace('@', '@upi-') + '@moneymind';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Icon name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceText}>
              {showBalance ? formatMoney(totalBalance) : '₹ ****'}
            </Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Icon name={showBalance ? 'eye-off' : 'eye'} size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.upiId}>{upiId}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Send Money Button */}
        <TouchableOpacity 
          style={styles.sendMoneyBtn}
          onPress={() => navigation.navigate('Transfer')}
        >
          <Icon name="send" size={24} color="#fff" />
          <Text style={styles.sendMoneyText}>Send Money</Text>
        </TouchableOpacity>

        {/* View Transactions Button */}
        <TouchableOpacity 
          style={styles.viewTransactionsBtn}
          onPress={() => navigation.navigate('Transactions')}
        >
          <Icon name="history" size={24} color={COLORS.primary} />
          <Text style={styles.viewTransactionsText}>View Transactions</Text>
        </TouchableOpacity>
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
    padding: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: 8,
  },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
  },
  balanceLabel: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  upiId: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sendMoneyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 12,
  },
  sendMoneyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  viewTransactionsBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  viewTransactionsText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});
