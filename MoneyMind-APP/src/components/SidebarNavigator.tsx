import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../hooks/useAuth';

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
import SettingsScreen from '../screens/settings/SettingsScreen';

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
  { id: 'Notifications', icon: 'notifications-outline', label: 'Notifications', component: NotificationsScreen },
  { id: 'Settings', icon: 'settings-outline', label: 'Settings', component: SettingsScreen },
];

export default function SidebarNavigator() {
  const { colors, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [sidebarVisible, setSidebarVisible] = useState(false);
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
        <View style={styles.hamburgerButton} />
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
        />
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
    paddingTop: 50,
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
});
