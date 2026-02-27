import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { COLORS, SPACING, FONTS } from '../constants';

const MenuItem = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
  danger = false
}: { 
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  danger?: boolean;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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
        style={[styles.menuItem, danger && styles.menuItemDanger]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={isSwitch ? 1 : 0.7}
        disabled={isSwitch}
      >
        <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
          <Icon name={icon} size={22} color={danger ? COLORS.danger : COLORS.primary} />
        </View>
        <View style={styles.menuContent}>
          <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        {isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
            thumbColor={switchValue ? COLORS.primary : COLORS.textMuted}
          />
        ) : (
          <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { accounts } = useSelector((state: RootState) => state.bankAccounts);

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(user?.name || 'Nikhil Kumar')}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user?.name || 'Nikhil Kumar'}</Text>
          <Text style={styles.profilePhone}>{user?.mobileNumber || '+91 98765 43210'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'nikhil@example.com'}</Text>
          
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Icon name="shield-check" size={12} color={COLORS.success} />
              <Text style={styles.badgeText}>Verified</Text>
            </View>
            <View style={[styles.badge, styles.premiumBadge]}>
              <Icon name="crown" size={12} color={COLORS.warning} />
              <Text style={[styles.badgeText, styles.premiumText]}>Premium</Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{accounts.length || 2}</Text>
            <Text style={styles.statLabel}>Linked Banks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>₹1L</Text>
            <Text style={styles.statLabel}>Daily Limit</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>

        {/* Linked Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked Accounts</Text>
          {(accounts.length > 0 ? accounts : [
            { id: '1', bankName: 'Axis Bank', accountNumber: 'XXXX1234', upiId: 'nikhil@okaxis', isPrimary: true },
            { id: '2', bankName: 'Paytm Bank', accountNumber: 'XXXX5678', upiId: 'nikhil@paytm', isPrimary: false },
          ]).map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountIcon}>
                <Icon name="bank" size={24} color="#fff" />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountBank}>{account.bankName}</Text>
                <Text style={styles.accountNumber}>Account: {account.accountNumber}</Text>
                <Text style={styles.accountUpi}>{account.upiId}</Text>
              </View>
              {account.isPrimary && (
                <View style={styles.primaryTag}>
                  <Text style={styles.primaryTagText}>Primary</Text>
                </View>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addAccountBtn}>
            <Icon name="plus" size={20} color={COLORS.primary} />
            <Text style={styles.addAccountText}>Link New Account</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <MenuItem
            icon="fingerprint"
            title="Biometric Login"
            subtitle="Use fingerprint or face ID"
            isSwitch={true}
            switchValue={biometricEnabled}
            onSwitchChange={setBiometricEnabled}
          />
          <MenuItem
            icon="bell-outline"
            title="Notifications"
            subtitle="Payment alerts & offers"
            isSwitch={true}
            switchValue={notificationsEnabled}
            onSwitchChange={setNotificationsEnabled}
          />
          <MenuItem
            icon="theme-light-dark"
            title="Dark Mode"
            subtitle="Toggle app theme"
            isSwitch={true}
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="FAQs and contact us"
            onPress={() => {}}
          />
          <MenuItem
            icon="file-document-outline"
            title="Transaction History"
            subtitle="View all your transactions"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield-outline"
            title="Security"
            subtitle="Change PIN & passwords"
            onPress={() => {}}
          />
          <MenuItem
            icon="information-outline"
            title="About"
            subtitle="App version 1.0.0"
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <MenuItem
            icon="logout"
            title="Logout"
            onPress={handleLogout}
            danger={true}
          />
        </View>

        <View style={{ height: SPACING.xl }} />
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
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.h1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  profileName: {
    fontSize: FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: FONTS.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '500',
  },
  premiumBadge: {
    backgroundColor: COLORS.warning + '15',
  },
  premiumText: {
    color: COLORS.warning,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statNumber: {
    fontSize: FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.h3,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  accountBank: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  accountNumber: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  accountUpi: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  primaryTag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryTagText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  addAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: SPACING.sm,
  },
  addAccountText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItemDanger: {
    borderColor: COLORS.danger + '30',
    backgroundColor: COLORS.danger + '08',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconDanger: {
    backgroundColor: COLORS.danger + '15',
  },
  menuContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  menuTitle: {
    fontSize: FONTS.body,
    fontWeight: '500',
    color: COLORS.text,
  },
  menuTitleDanger: {
    color: COLORS.danger,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
