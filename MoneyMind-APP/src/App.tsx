import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';

import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { AuthProvider, useAuth } from './hooks/useAuth';

import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';
import DashboardScreen from './screens/dashboard/DashboardScreen';
import TransactionsScreen from './screens/transactions/TransactionsScreen';
import AddTransactionScreen from './screens/transactions/AddTransactionScreen';
import UncategorizedTransactionsScreen from './screens/transactions/UncategorizedTransactionsScreen';
import GoalsScreen from './screens/goals/GoalsScreen';
import InvestmentsScreen from './screens/investments/InvestmentsScreen';
import AnalyticsScreen from './screens/analytics/AnalyticsScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import InsightsScreen from './screens/insights/InsightsScreen';
import AccountsScreen from './screens/accounts/AccountsScreen';
import NotificationsScreen from './screens/notifications/NotificationsScreen';
import BudgetScreen from './screens/budget/BudgetScreen';
import FinanceChatbot from './components/FinanceChatbot';
import SidebarNavigator from './components/SidebarNavigator';

const Stack = createStackNavigator();

function Navigation() {
  const { user, loading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    setHasCompletedOnboarding(false);
  };

  if (loading || hasCompletedOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={SidebarNavigator} />
            <Stack.Screen 
              name="AddTransaction" 
              component={AddTransactionScreen}
              options={{
                presentation: 'modal',
                animationEnabled: true,
              }}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Accounts" component={AccountsScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
            <Stack.Screen name="Insights" component={InsightsScreen} />
            <Stack.Screen name="Uncategorized" component={UncategorizedTransactionsScreen} />
          </>
        ) : !hasCompletedOnboarding ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const { isDark } = useTheme();
  const { user } = useAuth();

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Navigation />
      <Toast />
      {user && <FinanceChatbot />}
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
