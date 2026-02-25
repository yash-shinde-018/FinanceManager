import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { AuthProvider, useAuth } from './hooks/useAuth';

import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';
import DashboardScreen from './screens/dashboard/DashboardScreen';
import TransactionsScreen from './screens/transactions/TransactionsScreen';
import AddTransactionScreen from './screens/transactions/AddTransactionScreen';
import GoalsScreen from './screens/goals/GoalsScreen';
import InvestmentsScreen from './screens/investments/InvestmentsScreen';
import AnalyticsScreen from './screens/analytics/AnalyticsScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import InsightsScreen from './screens/insights/InsightsScreen';
import AccountsScreen from './screens/accounts/AccountsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Insights') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Goals') {
            iconName = focused ? 'flag' : 'flag-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { user, loading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    // In a real app, you'd check AsyncStorage
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
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="AddTransaction" 
              component={AddTransactionScreen}
              options={{
                presentation: 'modal',
                animationEnabled: true,
              }}
            />
            <Stack.Screen name="Accounts" component={AccountsScreen} />
            <Stack.Screen name="Investments" component={InvestmentsScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
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

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Navigation />
      <Toast />
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
