import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { COLORS } from '../constants';

// Import screens
import { HomeScreen } from '../screens/HomeScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { TransferScreen } from '../screens/TransferScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Tab Bar - Simplified with only 2 tabs
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = getIconName(route.name, isFocused);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                <Icon name={iconName} size={24} color={isFocused ? COLORS.primary : COLORS.textMuted} />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const getIconName = (routeName: string, isFocused: boolean): string => {
  switch (routeName) {
    case 'Home':
      return isFocused ? 'home' : 'home-outline';
    case 'Transactions':
      return isFocused ? 'history' : 'history';
    default:
      return 'home';
  }
};

// Main Tab Navigator - Only Dashboard and Transactions
const MainTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ tabBarLabel: 'Dashboard' }}
    />
    <Tab.Screen 
      name="Transactions" 
      component={TransactionsScreen}
      options={{ tabBarLabel: 'Transactions' }}
    />
  </Tab.Navigator>
);

// Root Navigator with Auth protection
export const Navigation = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Transfer" component={TransferScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'relative',
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  iconContainerActive: {
    backgroundColor: COLORS.primary + '15',
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
