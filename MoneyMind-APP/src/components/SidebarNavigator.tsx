import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import Toast from 'react-native-toast-message';

// Import all screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import GoalsScreen from '../screens/goals/GoalsScreen';
import InvestmentsScreen from '../screens/investments/InvestmentsScreen';
import BudgetScreen from '../screens/budget/BudgetScreen';
import AccountsScreen from '../screens/accounts/AccountsScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import InsightsScreen from '../screens/insights/InsightsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

const { width } = Dimensions.get('window');

const menuItems = [
  { id: 'Dashboard', icon: 'grid-outline', label: 'Dashboard', component: DashboardScreen },
  { id: 'Transactions', icon: 'wallet-outline', label: 'Transactions', component: TransactionsScreen },
  { id: 'Insights', icon: 'sparkles-outline', label: 'Insights', component: InsightsScreen },
  { id: 'Goals', icon: 'flag-outline', label: 'Goals', component: GoalsScreen },
  { id: 'Budget', icon: 'cash-outline', label: 'Budgets', component: BudgetScreen },
  { id: 'Investments', icon: 'trending-up-outline', label: 'Investments', component: InvestmentsScreen },
  { id: 'Accounts', icon: 'card-outline', label: 'Accounts', component: AccountsScreen },
  { id: 'Analytics', icon: 'bar-chart-outline', label: 'Analytics', component: AnalyticsScreen },
];

export default function SidebarNavigator() {
  const { colors, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-width * 0.75))[0];

  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.75,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setSidebarVisible(false));
  };

  const navigateTo = (screenId: string) => {
    setCurrentScreen(screenId);
    closeSidebar();
  };

  const CurrentComponent = menuItems.find(item => item.id === currentScreen)?.component || DashboardScreen;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header with Hamburger */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={openSidebar} style={styles.hamburgerButton}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {menuItems.find(item => item.id === currentScreen)?.label || 'MoneyMind'}
        </Text>
        <TouchableOpacity onPress={() => setSettingsModalVisible(true)} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <CurrentComponent navigation={{ navigate: (screen: string) => setCurrentScreen(screen) }} />
      </View>

      {/* Sidebar Overlay */}
      {sidebarVisible && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={closeSidebar}
        >
          <View style={styles.overlayBackground} />
        </TouchableOpacity>
      )}

      {/* Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar,
          { 
            backgroundColor: colors.background,
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        {/* Sidebar Header */}
        <View style={styles.sidebarHeader}>
          <View style={styles.logoContainer}>
            <Ionicons name="logo-react" size={32} color={colors.primary} />
            <Text style={[styles.appName, { color: colors.text }]}>MoneyMind AI</Text>
          </View>
        </View>

        <ScrollView style={styles.sidebarScroll} showsVerticalScrollIndicator={false}>
          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  currentScreen === item.id && { backgroundColor: colors.primary + '20' },
                ]}
                onPress={() => navigateTo(item.id)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={currentScreen === item.id ? colors.primary : colors.text}
                />
                <Text
                  style={[
                    styles.menuLabel,
                    { color: currentScreen === item.id ? colors.primary : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
                {currentScreen === item.id && (
                  <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Bottom Items */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeSidebar();
                setSettingsModalVisible(true);
              }}
            >
              <Ionicons name="settings-outline" size={22} color={colors.text} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={signOut}>
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text style={[styles.menuLabel, { color: colors.error }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* User Footer */}
        <View style={[styles.userFooter, { borderTopColor: colors.border }]}>
          <Ionicons name="person-circle" size={40} color={colors.textMuted} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.email?.split('@')[0] || 'User'}</Text>
            <Text style={[styles.userEmail, { color: colors.textMuted }]} numberOfLines={1}>
              {user?.email || ''}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background + 'CC' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Profile Section */}
              <View style={[styles.settingsSection, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ACCOUNT</Text>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => {
                    setSettingsModalVisible(false);
                    setCurrentScreen('Dashboard');
                  }}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name="person-outline" size={22} color={colors.primary} />
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Profile</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => {
                    setSettingsModalVisible(false);
                    // Navigate to notifications screen
                  }}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name="notifications-outline" size={22} color={colors.primary} />
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* About Section */}
              <View style={[styles.settingsSection, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ABOUT</Text>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => Toast.show({ type: 'info', text1: 'MoneyMind AI v1.0.0' })}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Version</Text>
                  </View>
                  <Text style={[styles.settingValue, { color: colors.textMuted }]}>1.0.0</Text>
                </TouchableOpacity>
              </View>

              {/* Logout */}
              <TouchableOpacity 
                style={[styles.logoutButton, { backgroundColor: colors.error + '15' }]} 
                onPress={() => {
                  setSettingsModalVisible(false);
                  signOut();
                  Toast.show({ type: 'success', text1: 'Logged out successfully' });
                }}
              >
                <Ionicons name="log-out-outline" size={22} color={colors.error} />
                <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
              </TouchableOpacity>
            </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginTop: RNStatusBar.currentHeight || 0,
  },
  hamburgerButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    padding: 4,
    width: 40,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
    maxWidth: 300,
    zIndex: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  sidebarHeader: {
    padding: 20,
    paddingTop: (RNStatusBar.currentHeight || 0) + 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
  },
  sidebarScroll: {
    flex: 1,
  },
  menuContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 2,
    borderRadius: 10,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 14,
    flex: 1,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  bottomContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  settingsSection: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
