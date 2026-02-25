import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, spacing, borderRadius, typography, shadows } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileScreen({ navigation }: any) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const menuItems = [
    {
      title: 'Account Settings',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
        { icon: 'notifications-outline', label: 'Notifications', toggle: true, value: notifications, onToggle: () => setNotifications(!notifications) },
        { icon: 'lock-closed-outline', label: 'Security', onPress: () => {} },
        { icon: 'finger-print-outline', label: 'Biometric Login', toggle: true, value: biometric, onToggle: () => setBiometric(!biometric) },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: isDark ? 'sunny-outline' : 'moon-outline', label: isDark ? 'Light Mode' : 'Dark Mode', onPress: toggleTheme },
        { icon: 'card-outline', label: 'Payment Methods', onPress: () => {} },
        { icon: 'language-outline', label: 'Language', value: 'English', onPress: () => {} },
        { icon: 'cash-outline', label: 'Currency', value: 'INR', onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help Center', onPress: () => {} },
        { icon: 'chatbubble-outline', label: 'Contact Support', onPress: () => {} },
        { icon: 'document-text-outline', label: 'Privacy Policy', onPress: () => {} },
        { icon: 'shield-checkmark-outline', label: 'Terms of Service', onPress: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileImage}
            >
              <Text style={styles.profileInitial}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.email || 'user@example.com'}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.small }]}>
            <Ionicons name="wallet-outline" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Transactions</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.small }]}>
            <Ionicons name="flag-outline" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>3</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Goals</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.small }]}>
            <Ionicons name="trending-up-outline" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>85</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Health Score</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              {section.title}
            </Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card, ...shadows.small }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon as any} size={22} color={colors.textSecondary} />
                    <Text style={[styles.menuItemLabel, { color: colors.text }]}>
                      {item.label}
                    </Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.value && (
                      <Text style={[styles.menuItemValue, { color: colors.textMuted }]}>
                        {item.value}
                      </Text>
                    )}
                    {item.toggle ? (
                      <View
                        style={[
                          styles.toggle,
                          {
                            backgroundColor: item.value ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.toggleDot,
                            {
                              backgroundColor: '#FFFFFF',
                              transform: [{ translateX: item.value ? 16 : 0 }],
                            },
                          ]}
                        />
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.card }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={[styles.version, { color: colors.textMuted }]}>
          MoneyMind AI v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginLeft: 20,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  menuCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemValue: {
    fontSize: 14,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 32,
  },
});
