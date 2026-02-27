import React, { useState, useMemo } from 'react';
import {
    View,
      Text,
        StyleSheet,
          ScrollView,
            TouchableOpacity,
              TextInput,
                Modal,
                  SafeAreaView,
                    StatusBar,
                      Dimensions,
                      } from 'react-native';
                      import { NavigationContainer } from '@react-navigation/native';
                      import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
                      import { createNativeStackNavigator } from '@react-navigation/native-stack';
                      import QRCode from 'react-native-qrcode-svg';
                      import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

                      const { width } = Dimensions.get('window');
                      const Tab = createBottomTabNavigator();
                      const Stack = createNativeStackNavigator();

                      // Mock Data
                      const mockUPIAccounts = [
                        {
}
    id: '1',
    upiId: 'nikhil@okaxis',
    bankName: 'Axis Bank',
    accountNumber: 'XXXX1234',
    isPrimary: true,
    status: 'active',
    dailyLimit: 100000,
    usedToday: 25000,
  },
  {
    id: '2',
    upiId: 'nikhil@paytm',
    bankName: 'Paytm Bank',
    accountNumber: 'XXXX5678',
    isPrimary: false,
    status: 'active',
    dailyLimit: 100000,
    usedToday: 5000,
  },
];

const mockTransactions = [
  {
    id: '1',
    amount: 500,
    type: 'received',
    status: 'completed',
    fromUpiId: 'rahul@okhdfcbank',
    toUpiId: 'nikhil@okaxis',
    fromName: 'Rahul Sharma',
    toName: 'Nikhil',
    description: 'Dinner split',
    date: new Date(Date.now() - 1000 * 60 * 30),
    category: 'Food',
    referenceId: 'REF123456',
  },
  {
    id: '2',
    amount: 1500,
    type: 'sent',
    status: 'completed',
    fromUpiId: 'nikhil@okaxis',
    toUpiId: 'electricity@bills',
    fromName: 'Nikhil',
    toName: 'Electricity Board',
    description: 'Electricity Bill',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    category: 'Utilities',
    referenceId: 'REF987654',
  },
  {
    id: '3',
    amount: 2500,
    type: 'sent',
    status: 'completed',
    fromUpiId: 'nikhil@paytm',
    toUpiId: 'flipkart@upi',
    fromName: 'Nikhil',
    toName: 'Flipkart',
    description: 'Shopping',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    category: 'Shopping',
    referenceId: 'REF456789',
  },
  {
    id: '4',
    amount: 1000,
    type: 'received',
    status: 'completed',
    fromUpiId: 'priya@oksbi',
    toUpiId: 'nikhil@okaxis',
    fromName: 'Priya Patel',
    toName: 'Nikhil',
    description: 'Rent share',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    category: 'Housing',
    referenceId: 'REF789123',
  },
  {
    id: '5',
    amount: 3000,
    type: 'received',
    status: 'completed',
    fromUpiId: 'client@work',
    toUpiId: 'nikhil@okaxis',
    fromName: 'Freelance Client',
    toName: 'Nikhil',
    description: 'Project payment',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    category: 'Income',
    referenceId: 'REF654321',
  },
];

// Utility Functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// Colors
const colors = {
  background: '#0f172a',
  card: '#1e293b',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  border: '#334155',
};

// Components
const StatCard = ({ title, value, icon, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
    <View style={styles.statIconContainer}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  </View>
);

const QuickActionButton = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={[styles.quickAction, { backgroundColor: color + '20' }]} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
      <Icon name={icon} size={24} color="#fff" />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const TransactionItem = ({ transaction }) => (
  <View style={styles.transactionItem}>
    <View style={[styles.transactionIcon, { backgroundColor: transaction.type === 'sent' ? colors.danger + '20' : colors.success + '20' }]}>
      <Icon 
        name={transaction.type === 'sent' ? 'arrow-up' : 'arrow-down'} 
        size={20} 
        color={transaction.type === 'sent' ? colors.danger : colors.success} 
      />
    </View>
    <View style={styles.transactionInfo}>
      <Text style={styles.transactionDescription}>{transaction.description}</Text>
      <Text style={styles.transactionMeta}>
        {formatDate(transaction.date)} • {transaction.referenceId}
      </Text>
      <Text style={styles.transactionUpi}>
        {transaction.type === 'sent' ? `To: ${transaction.toUpiId}` : `From: ${transaction.fromUpiId}`}
      </Text>
    </View>
    <View style={styles.transactionAmount}>
      <Text style={[styles.amountText, { color: transaction.type === 'sent' ? colors.danger : colors.success }]}>
        {transaction.type === 'sent' ? '-' : '+'}{formatCurrency(transaction.amount)}
      </Text>
      <View style={[styles.statusBadge, { backgroundColor: transaction.status === 'completed' ? colors.success + '30' : colors.warning + '30' }]}>
        <Text style={[styles.statusText, { color: transaction.status === 'completed' ? colors.success : colors.warning }]}>
          {transaction.status}
        </Text>
      </View>
    </View>
  </View>
);

// Home Screen
const HomeScreen = ({ navigation }) => {
  const [selectedUPI, setSelectedUPI] = useState(mockUPIAccounts[0]);
  const [sendModalVisible, setSendModalVisible] = useState(false);

  const stats = useMemo(() => {
    const totalSent = mockTransactions
      .filter((t) => t.type === 'sent' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalReceived = mockTransactions
      .filter((t) => t.type === 'received' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalSent, totalReceived, transactionCount: mockTransactions.length };
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>UPI App</Text>
          <Text style={styles.headerSubtitle}>Powered by MoneyMind</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Icon name="account-circle" size={40} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <StatCard 
          title="Total Sent" 
          value={formatCurrency(stats.totalSent)} 
          icon="arrow-up-circle" 
          color={colors.danger} 
        />
        <StatCard 
          title="Total Received" 
          value={formatCurrency(stats.totalReceived)} 
          icon="arrow-down-circle" 
          color={colors.success} 
        />
        <StatCard 
          title="Transactions" 
          value={stats.transactionCount.toString()} 
          icon="history" 
          color={colors.primary} 
        />
      </View>

      {/* QR Code Section */}
      <View style={styles.qrSection}>
        <Text style={styles.sectionTitle}>Receive Money</Text>
        <Text style={styles.sectionSubtitle}>Scan QR code to pay</Text>
        <View style={styles.qrContainer}>
          <QRCode
            value={`upi://pay?pa=${selectedUPI.upiId}&pn=Nikhil&cu=INR`}
            size={200}
            backgroundColor="#fff"
            color="#000"
          />
        </View>
        <View style={styles.upiIdContainer}>
          <Text style={styles.upiIdText}>{selectedUPI.upiId}</Text>
          <TouchableOpacity>
            <Icon name="content-copy" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <QuickActionButton 
          icon="send" 
          label="Send" 
          color={colors.primary} 
          onPress={() => setSendModalVisible(true)} 
        />
        <QuickActionButton 
          icon="qrcode-scan" 
          label="Scan" 
          color={colors.success} 
          onPress={() => {}} 
        />
        <QuickActionButton 
          icon="file-document" 
          label="Bills" 
          color={colors.warning} 
          onPress={() => {}} 
        />
        <QuickActionButton 
          icon="dots-horizontal" 
          label="More" 
          color={colors.secondary} 
          onPress={() => {}} 
        />
      </View>

      {/* UPI Accounts */}
      <View style={styles.accountsSection}>
        <Text style={styles.sectionTitle}>UPI Accounts</Text>
        {mockUPIAccounts.map((account) => (
          <TouchableOpacity
            key={account.id}
            style={[
              styles.accountCard,
              selectedUPI.id === account.id && styles.accountCardSelected,
            ]}
            onPress={() => setSelectedUPI(account)}
          >
            <View style={styles.accountHeader}>
              <View style={styles.accountIcon}>
                <Icon name="bank" size={20} color="#fff" />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountUpiId}>{account.upiId}</Text>
                <Text style={styles.accountBank}>{account.bankName}</Text>
              </View>
              {account.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}
            </View>
            <View style={styles.limitContainer}>
              <Text style={styles.limitText}>Daily Used: {formatCurrency(account.usedToday)} / {formatCurrency(account.dailyLimit)}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(account.usedToday / account.dailyLimit) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addAccountButton}>
          <Icon name="plus" size={20} color={colors.textMuted} />
          <Text style={styles.addAccountText}>Link New Account</Text>
        </TouchableOpacity>
      </View>

      {/* MoneyMind Sync Banner */}
      <View style={styles.syncBanner}>
        <View style={styles.syncIcon}>
          <Icon name="lightning-bolt" size={24} color={colors.primary} />
        </View>
        <View style={styles.syncInfo}>
          <Text style={styles.syncTitle}>MoneyMind Sync Active</Text>
          <Text style={styles.syncSubtitle}>Transactions auto-sync with dashboard</Text>
        </View>
      </View>

      {/* Send Money Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sendModalVisible}
        onRequestClose={() => setSendModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Money</Text>
              <TouchableOpacity onPress={() => setSendModalVisible(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter UPI ID or Mobile Number"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Amount"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Note (optional)"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.payButton}>
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// History Screen
const HistoryScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = mockTransactions.filter(
    (t) =>
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fromUpiId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.referenceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.historyHeader}>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredTransactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </ScrollView>
    </View>
  );
};

// Main Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        borderTopWidth: 1,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name="history" size={24} color={color} />,
      }}
    />
  </Tab.Navigator>
);

// Main App
export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.appContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <MainTabs />
      </SafeAreaView>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  profileButton: {
    padding: 4,
  },
  statsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  qrSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 16,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  upiIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upiIdText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'monospace',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAction: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    width: width / 4 - 20,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  accountsSection: {
    marginBottom: 20,
  },
  accountCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountUpiId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  accountBank: {
    fontSize: 12,
    color: colors.textMuted,
  },
  primaryBadge: {
    backgroundColor: colors.success + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
  },
  limitContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  limitText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addAccountText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  syncBanner: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  syncIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncInfo: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  syncSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    color: colors.text,
    fontSize: 16,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyHeader: {
    padding: 16,
    paddingTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  transactionUpi: {
    fontSize: 11,
    color: colors.textMuted,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
