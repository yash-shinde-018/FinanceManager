import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius, typography, shadows } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase, Investment } from '../../lib/supabase';
import Toast from 'react-native-toast-message';

const ASSET_TYPES = [
  { value: 'stocks', label: 'Stocks', icon: 'trending-up' },
  { value: 'etfs', label: 'ETFs', icon: 'briefcase' },
  { value: 'mutual_funds', label: 'Mutual Funds', icon: 'business' },
  { value: 'crypto', label: 'Crypto', icon: 'logo-bitcoin' },
  { value: 'fixed_deposits', label: 'Fixed Deposits', icon: 'cash' },
  { value: 'gold', label: 'Gold', icon: 'diamond' },
  { value: 'manual_assets', label: 'Manual Assets', icon: 'cube' },
];

const POPULAR_INDIAN_STOCKS = [
  { symbol: 'RELIANCE.BSE', name: 'Reliance Industries', price: 2456.80, change: 1.13 },
  { symbol: 'TCS.BSE', name: 'Tata Consultancy Services', price: 3476.58, change: 2.96 },
  { symbol: 'HDFCBANK.BSE', name: 'HDFC Bank', price: 1529.82, change: 0.21 },
  { symbol: 'INFY.BSE', name: 'Infosys', price: 1529.89, change: -4.00 },
  { symbol: 'ICICIBANK.BSE', name: 'ICICI Bank', price: 1045.32, change: -4.85 },
  { symbol: 'HINDUNILVR.BSE', name: 'Hindustan Unilever', price: 2456.78, change: 0.75 },
];

const POPULAR_US_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.52, change: 1.25 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 0.85 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: -0.45 },
  { symbol: 'AMZN', name: 'Amazon.com', price: 155.32, change: 2.10 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 202.64, change: -3.20 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 4.50 },
];

export default function InvestmentsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStocksModal, setShowStocksModal] = useState(false);
  const [activeStockTab, setActiveStockTab] = useState<'indian' | 'us'>('indian');
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [newInvestment, setNewInvestment] = useState({
    asset_type: 'stocks',
    asset_name: '',
    symbol: '',
    quantity: '1',
    buy_price: '',
    current_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    platform: '',
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error loading investments:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load investments',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInvestments().finally(() => setRefreshing(false));
  };

  const calculateMetrics = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.quantity * inv.buy_price, 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + inv.quantity * (inv.current_price || inv.buy_price), 0);
    const profitLoss = totalCurrent - totalInvested;
    const returnPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
    return { totalInvested, totalCurrent, profitLoss, returnPercentage };
  };

  const handleAddInvestment = async () => {
    if (!newInvestment.asset_name || !newInvestment.buy_price) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    try {
      const { error } = await supabase.from('investments').insert({
        user_id: user?.id,
        asset_type: newInvestment.asset_type,
        asset_name: newInvestment.asset_name,
        symbol: newInvestment.symbol || null,
        quantity: parseFloat(newInvestment.quantity) || 1,
        buy_price: parseFloat(newInvestment.buy_price),
        current_price: newInvestment.current_price ? parseFloat(newInvestment.current_price) : null,
        purchase_date: newInvestment.purchase_date,
        platform: newInvestment.platform || null,
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Investment added successfully',
      });

      setShowAddModal(false);
      resetForm();
      loadInvestments();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to add investment',
      });
    }
  };

  const handleEditInvestment = async () => {
    if (!editingInvestment) return;

    try {
      const { error } = await supabase
        .from('investments')
        .update({
          asset_type: editingInvestment.asset_type,
          asset_name: editingInvestment.asset_name,
          symbol: editingInvestment.symbol,
          quantity: editingInvestment.quantity,
          buy_price: editingInvestment.buy_price,
          current_price: editingInvestment.current_price,
          purchase_date: editingInvestment.purchase_date,
          platform: editingInvestment.platform,
        })
        .eq('id', editingInvestment.id);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Investment updated successfully',
      });

      setShowEditModal(false);
      setEditingInvestment(null);
      loadInvestments();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update investment',
      });
    }
  };

  const handleDeleteInvestment = (id: string) => {
    Alert.alert(
      'Delete Investment',
      'Are you sure you want to delete this investment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('investments').delete().eq('id', id);
              if (error) throw error;
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Investment removed successfully',
              });
              loadInvestments();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete investment',
              });
            }
          },
        },
      ]
    );
  };

  const handleQuickBuyStock = (stock: typeof POPULAR_INDIAN_STOCKS[0]) => {
    setNewInvestment({
      asset_type: 'stocks',
      asset_name: stock.name,
      symbol: stock.symbol,
      quantity: '1',
      buy_price: stock.price.toString(),
      current_price: stock.price.toString(),
      purchase_date: new Date().toISOString().split('T')[0],
      platform: '',
    });
    setShowStocksModal(false);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setNewInvestment({
      asset_type: 'stocks',
      asset_name: '',
      symbol: '',
      quantity: '1',
      buy_price: '',
      current_price: '',
      purchase_date: new Date().toISOString().split('T')[0],
      platform: '',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = calculateMetrics();

  const renderInvestment = ({ item }: { item: Investment }) => {
    const currentPrice = item.current_price || item.buy_price;
    const invested = item.quantity * item.buy_price;
    const current = item.quantity * currentPrice;
    const profit = current - invested;
    const returnPct = invested > 0 ? (profit / invested) * 100 : 0;
    const isProfitable = profit >= 0;

    return (
      <TouchableOpacity
        style={[styles.investmentCard, { backgroundColor: colors.card, ...shadows.small }]}
        onPress={() => {
          setEditingInvestment(item);
          setShowEditModal(true);
        }}
      >
        <View style={styles.investmentHeader}>
          <View style={styles.assetInfo}>
            <Text style={[styles.assetName, { color: colors.text }]}>{item.asset_name}</Text>
            <Text style={[styles.assetType, { color: colors.textMuted }]}>
              {ASSET_TYPES.find((t) => t.value === item.asset_type)?.label || item.asset_type}
              {item.symbol && ` • ${item.symbol}`}
            </Text>
          </View>
          <View style={[styles.profitBadge, { backgroundColor: isProfitable ? colors.success + '20' : colors.error + '20' }]}>
            <Text style={[styles.profitText, { color: isProfitable ? colors.success : colors.error }]}>
              {isProfitable ? '+' : ''}{returnPct.toFixed(2)}%
            </Text>
          </View>
        </View>

        <View style={styles.investmentDetails}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Invested</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{formatCurrency(invested)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Current</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{formatCurrency(current)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Profit/Loss</Text>
            <Text style={[styles.detailValue, { color: isProfitable ? colors.success : colors.error }]}>
              {isProfitable ? '+' : ''}{formatCurrency(profit)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.error + '15' }]}
          onPress={() => handleDeleteInvestment(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.deleteText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderStockItem = ({ item }: { item: typeof POPULAR_INDIAN_STOCKS[0] }) => {
    const isPositive = item.change >= 0;
    return (
      <TouchableOpacity
        style={[styles.stockItem, { backgroundColor: colors.card }]}
        onPress={() => handleQuickBuyStock(item)}
      >
        <View style={styles.stockLeft}>
          <Text style={[styles.stockSymbol, { color: colors.text }]}>{item.symbol}</Text>
          <Text style={[styles.stockName, { color: colors.textMuted }]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <View style={styles.stockRight}>
          <Text style={[styles.stockPrice, { color: colors.text }]}>₹{item.price.toFixed(2)}</Text>
          <View style={[styles.changeBadge, { backgroundColor: isPositive ? colors.success + '20' : colors.error + '20' }]}>
            <Text style={[styles.changeText, { color: isPositive ? colors.success : colors.error }]}>
              {isPositive ? '+' : ''}{item.change}%
            </Text>
          </View>
        </View>
        <Ionicons name="add-circle" size={24} color={colors.primary} style={styles.addIcon} />
      </TouchableOpacity>
    );
  };

  // Empty State
  if (!loading && investments.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Investment Portfolio</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Start building your investment portfolio
            </Text>
          </View>
        </View>

        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.emptyContent}
        >
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="trending-up" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Start Investing Today</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Build your wealth by investing in top Indian and US stocks. Track your portfolio performance in real-time.
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.buyStocksButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowStocksModal(true)}
              >
                <Ionicons name="cart" size={20} color="#FFFFFF" />
                <Text style={styles.buyStocksText}>Buy Stocks</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addManualButton, { borderColor: colors.border }]}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
                <Text style={[styles.addManualText, { color: colors.primary }]}>Add Manually</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: colors.background }]}>
                <Ionicons name="trending-up" size={24} color={colors.success} />
                <Text style={[styles.statValue, { color: colors.text }]}>₹0</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Invested</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.background }]}>
                <Ionicons name="wallet" size={24} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>₹0</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Current Value</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.background }]}>
                <Ionicons name="cash" size={24} color={colors.warning} />
                <Text style={[styles.statValue, { color: colors.text }]}>₹0</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Profit/Loss</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Modals */}
        <Modal visible={showStocksModal} transparent animationType="slide" onRequestClose={() => setShowStocksModal(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
            <View style={[styles.stocksModalContent, { backgroundColor: colors.background }]}>
              <View style={styles.stocksModalHeader}>
                <Text style={[styles.stocksModalTitle, { color: colors.text }]}>Popular Stocks</Text>
                <TouchableOpacity onPress={() => setShowStocksModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeStockTab === 'indian' && { backgroundColor: colors.primary }]}
                  onPress={() => setActiveStockTab('indian')}
                >
                  <Text style={[styles.tabText, { color: activeStockTab === 'indian' ? '#FFFFFF' : colors.text }]}>
                    Indian (BSE)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeStockTab === 'us' && { backgroundColor: colors.primary }]}
                  onPress={() => setActiveStockTab('us')}
                >
                  <Text style={[styles.tabText, { color: activeStockTab === 'us' ? '#FFFFFF' : colors.text }]}>
                    US Stocks
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={activeStockTab === 'indian' ? POPULAR_INDIAN_STOCKS : POPULAR_US_STOCKS}
                renderItem={renderStockItem}
                keyExtractor={(item) => item.symbol}
                contentContainerStyle={styles.stocksList}
              />

              <TouchableOpacity
                style={[styles.manualAddLink, { borderColor: colors.border }]}
                onPress={() => { setShowStocksModal(false); setShowAddModal(true); }}
              >
                <Text style={[styles.manualAddText, { color: colors.primary }]}>Add Manually Instead</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
            <View style={[styles.addModalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add Investment</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Asset Type</Text>
                <View style={styles.assetTypeGrid}>
                  {ASSET_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[styles.assetTypeItem, {
                        backgroundColor: newInvestment.asset_type === type.value ? colors.primary : colors.card,
                        borderColor: newInvestment.asset_type === type.value ? colors.primary : colors.border,
                      }]}
                      onPress={() => setNewInvestment({ ...newInvestment, asset_type: type.value })}
                    >
                      <Ionicons name={type.icon as any} size={20} color={newInvestment.asset_type === type.value ? '#FFFFFF' : colors.text} />
                      <Text style={[styles.assetTypeText, { color: newInvestment.asset_type === type.value ? '#FFFFFF' : colors.text }]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.label, { color: colors.text }]}>Asset Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={newInvestment.asset_name}
                  onChangeText={(text) => setNewInvestment({ ...newInvestment, asset_name: text })}
                  placeholder="e.g., Reliance Industries"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.label, { color: colors.text }]}>Symbol (optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={newInvestment.symbol}
                  onChangeText={(text) => setNewInvestment({ ...newInvestment, symbol: text })}
                  placeholder="e.g., RELIANCE.BSE"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                />

                <View style={styles.rowInputs}>
                  <View style={styles.halfInput}>
                    <Text style={[styles.label, { color: colors.text }]}>Quantity *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                      value={newInvestment.quantity}
                      onChangeText={(text) => setNewInvestment({ ...newInvestment, quantity: text })}
                      keyboardType="numeric"
                      placeholder="1"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={[styles.label, { color: colors.text }]}>Buy Price *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                      value={newInvestment.buy_price}
                      onChangeText={(text) => setNewInvestment({ ...newInvestment, buy_price: text })}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                <Text style={[styles.label, { color: colors.text }]}>Current Price (optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={newInvestment.current_price}
                  onChangeText={(text) => setNewInvestment({ ...newInvestment, current_price: text })}
                  keyboardType="numeric"
                  placeholder="Leave empty to use buy price"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.label, { color: colors.text }]}>Purchase Date</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={newInvestment.purchase_date}
                  onChangeText={(text) => setNewInvestment({ ...newInvestment, purchase_date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.label, { color: colors.text }]}>Platform (optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={newInvestment.platform}
                  onChangeText={(text) => setNewInvestment({ ...newInvestment, platform: text })}
                  placeholder="e.g., Zerodha, Groww"
                  placeholderTextColor={colors.textMuted}
                />

                <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleAddInvestment}>
                  <Text style={styles.submitButtonText}>Add Investment</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Normal View with Investments
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Investment Portfolio</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primary }]} onPress={() => setShowStocksModal(true)}>
            <Ionicons name="cart" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primary }]} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, ...shadows.medium }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="wallet" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Invested</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(metrics.totalInvested)}</Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, ...shadows.medium }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="cash" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Current Value</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(metrics.totalCurrent)}</Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, ...shadows.medium }]}>
            <View style={[styles.summaryIcon, { backgroundColor: metrics.profitLoss >= 0 ? colors.success + '20' : colors.error + '20' }]}>
              <Ionicons name={metrics.profitLoss >= 0 ? 'trending-up' : 'trending-down'} size={20} color={metrics.profitLoss >= 0 ? colors.success : colors.error} />
            </View>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Profit/Loss</Text>
              <Text style={[styles.summaryValue, { color: metrics.profitLoss >= 0 ? colors.success : colors.error }]}>
                {metrics.profitLoss >= 0 ? '+' : ''}{formatCurrency(metrics.profitLoss)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.returnCard, { backgroundColor: metrics.returnPercentage >= 0 ? colors.success + '15' : colors.error + '15' }]}>
          <Text style={[styles.returnLabel, { color: colors.textMuted }]}>Total Return</Text>
          <Text style={[styles.returnValue, { color: metrics.returnPercentage >= 0 ? colors.success : colors.error }]}>
            {metrics.returnPercentage >= 0 ? '+' : ''}{metrics.returnPercentage.toFixed(2)}%
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Investments</Text>
          <FlatList
            data={investments}
            renderItem={renderInvestment}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.investmentsList}
          />
        </View>
      </ScrollView>

      {/* Stocks Modal */}
      <Modal visible={showStocksModal} transparent animationType="slide" onRequestClose={() => setShowStocksModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.stocksModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.stocksModalHeader}>
              <Text style={[styles.stocksModalTitle, { color: colors.text }]}>Popular Stocks</Text>
              <TouchableOpacity onPress={() => setShowStocksModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeStockTab === 'indian' && { backgroundColor: colors.primary }]}
                onPress={() => setActiveStockTab('indian')}
              >
                <Text style={[styles.tabText, { color: activeStockTab === 'indian' ? '#FFFFFF' : colors.text }]}>Indian (BSE)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeStockTab === 'us' && { backgroundColor: colors.primary }]}
                onPress={() => setActiveStockTab('us')}
              >
                <Text style={[styles.tabText, { color: activeStockTab === 'us' ? '#FFFFFF' : colors.text }]}>US Stocks</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={activeStockTab === 'indian' ? POPULAR_INDIAN_STOCKS : POPULAR_US_STOCKS}
              renderItem={renderStockItem}
              keyExtractor={(item) => item.symbol}
              contentContainerStyle={styles.stocksList}
            />

            <TouchableOpacity
              style={[styles.manualAddLink, { borderColor: colors.border }]}
              onPress={() => { setShowStocksModal(false); setShowAddModal(true); }}
            >
              <Text style={[styles.manualAddText, { color: colors.primary }]}>Add Manually Instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.addModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Investment</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Asset Type</Text>
              <View style={styles.assetTypeGrid}>
                {ASSET_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.assetTypeItem, {
                      backgroundColor: newInvestment.asset_type === type.value ? colors.primary : colors.card,
                      borderColor: newInvestment.asset_type === type.value ? colors.primary : colors.border,
                    }]}
                    onPress={() => setNewInvestment({ ...newInvestment, asset_type: type.value })}
                  >
                    <Ionicons name={type.icon as any} size={20} color={newInvestment.asset_type === type.value ? '#FFFFFF' : colors.text} />
                    <Text style={[styles.assetTypeText, { color: newInvestment.asset_type === type.value ? '#FFFFFF' : colors.text }]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Asset Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={newInvestment.asset_name}
                onChangeText={(text) => setNewInvestment({ ...newInvestment, asset_name: text })}
                placeholder="e.g., Reliance Industries"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.text }]}>Symbol (optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={newInvestment.symbol}
                onChangeText={(text) => setNewInvestment({ ...newInvestment, symbol: text })}
                placeholder="e.g., RELIANCE.BSE"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
              />

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, { color: colors.text }]}>Quantity *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    value={newInvestment.quantity}
                    onChangeText={(text) => setNewInvestment({ ...newInvestment, quantity: text })}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, { color: colors.text }]}>Buy Price *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    value={newInvestment.buy_price}
                    onChangeText={(text) => setNewInvestment({ ...newInvestment, buy_price: text })}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Current Price (optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={newInvestment.current_price}
                onChangeText={(text) => setNewInvestment({ ...newInvestment, current_price: text })}
                keyboardType="numeric"
                placeholder="Leave empty to use buy price"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.text }]}>Purchase Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={newInvestment.purchase_date}
                onChangeText={(text) => setNewInvestment({ ...newInvestment, purchase_date: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.text }]}>Platform (optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={newInvestment.platform}
                onChangeText={(text) => setNewInvestment({ ...newInvestment, platform: text })}
                placeholder="e.g., Zerodha, Groww"
                placeholderTextColor={colors.textMuted}
              />

              <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleAddInvestment}>
                <Text style={styles.submitButtonText}>Add Investment</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.addModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Investment</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {editingInvestment && (
                <>
                  <Text style={[styles.label, { color: colors.text }]}>Asset Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    value={editingInvestment.asset_name}
                    onChangeText={(text) => setEditingInvestment({ ...editingInvestment, asset_name: text })}
                    placeholder="Asset Name"
                    placeholderTextColor={colors.textMuted}
                  />

                  <Text style={[styles.label, { color: colors.text }]}>Symbol</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    value={editingInvestment.symbol || ''}
                    onChangeText={(text) => setEditingInvestment({ ...editingInvestment, symbol: text })}
                    placeholder="Symbol"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                  />

                  <View style={styles.rowInputs}>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { color: colors.text }]}>Quantity</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                        value={editingInvestment.quantity.toString()}
                        onChangeText={(text) => setEditingInvestment({ ...editingInvestment, quantity: parseFloat(text) || 0 })}
                        keyboardType="numeric"
                        placeholder="1"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { color: colors.text }]}>Buy Price</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                        value={editingInvestment.buy_price.toString()}
                        onChangeText={(text) => setEditingInvestment({ ...editingInvestment, buy_price: parseFloat(text) || 0 })}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                  </View>

                  <Text style={[styles.label, { color: colors.text }]}>Current Price</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    value={editingInvestment.current_price?.toString() || ''}
                    onChangeText={(text) => setEditingInvestment({ ...editingInvestment, current_price: text ? parseFloat(text) : null })}
                    keyboardType="numeric"
                    placeholder="Current price"
                    placeholderTextColor={colors.textMuted}
                  />

                  <Text style={[styles.label, { color: colors.text }]}>Platform</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    value={editingInvestment.platform || ''}
                    onChangeText={(text) => setEditingInvestment({ ...editingInvestment, platform: text })}
                    placeholder="Platform"
                    placeholderTextColor={colors.textMuted}
                  />

                  <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleEditInvestment}>
                    <Text style={styles.submitButtonText}>Update Investment</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 4 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emptyContent: { padding: 20 },
  emptyCard: { borderRadius: 24, padding: 24, alignItems: 'center' },
  emptyIconContainer: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  buyStocksButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  buyStocksText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  addManualButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  addManualText: { fontSize: 16, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 16 },
  statValue: { fontSize: 18, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  statLabel: { fontSize: 12 },
  summaryContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  returnCard: { marginHorizontal: 20, marginBottom: 24, padding: 20, borderRadius: 16, alignItems: 'center' },
  returnLabel: { fontSize: 14, marginBottom: 8 },
  returnValue: { fontSize: 32, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginLeft: 20, marginBottom: 16 },
  investmentsList: { paddingHorizontal: 20, gap: 12 },
  investmentCard: { padding: 20, borderRadius: 16 },
  investmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  assetInfo: { flex: 1 },
  assetName: { fontSize: 18, fontWeight: '600' },
  assetType: { fontSize: 12, marginTop: 2 },
  profitBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  profitText: { fontSize: 14, fontWeight: '600' },
  investmentDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailItem: { alignItems: 'center' },
  detailLabel: { fontSize: 12, marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: '600' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8 },
  deleteText: { fontSize: 14, fontWeight: '500' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  stocksModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '70%' },
  stocksModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  stocksModalTitle: { fontSize: 20, fontWeight: '700' },
  tabContainer: { flexDirection: 'row', padding: 16, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)' },
  tabText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  stocksList: { padding: 16, gap: 8 },
  stockItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12 },
  stockLeft: { flex: 1 },
  stockSymbol: { fontSize: 16, fontWeight: '600' },
  stockName: { fontSize: 13, marginTop: 2 },
  stockRight: { alignItems: 'flex-end', marginRight: 12 },
  stockPrice: { fontSize: 16, fontWeight: '600' },
  changeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 4 },
  changeText: { fontSize: 12, fontWeight: '500' },
  addIcon: {},
  manualAddLink: { margin: 16, padding: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  manualAddText: { fontSize: 14, fontWeight: '600' },
  addModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  formContainer: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1 },
  assetTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  assetTypeItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  assetTypeText: { fontSize: 12, fontWeight: '500' },
  rowInputs: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  submitButton: { marginTop: 24, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
