import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { loginWithEmail } from '../store/slices/authSlice';
import { COLORS, SPACING, FONTS } from '../constants';

export const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = () => {
    if (!email || !password) {
      return;
    }
    dispatch(loginWithEmail({ email, password }));
  };

  const isValidEmail = email.includes('@') && email.includes('.');
  const canLogin = isValidEmail && password.length >= 6;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Icon name="lightning-bolt" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>MoneyMind UPI</Text>
          <Text style={styles.tagline}>Fast & Secure Payments</Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Login with your email to access your account
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, !canLogin && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={!canLogin || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <>
                <Icon name="login" size={24} color="#fff" style={styles.loginIcon} />
                <Text style={styles.loginButtonText}>Login</Text>
              </>
            )}
          </TouchableOpacity>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>

        <View style={styles.demoBanner}>
          <Icon name="information" size={16} color={COLORS.info} />
          <Text style={styles.demoText}>Use your MoneyMind account credentials</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Icon name="shield-check" size={28} color={COLORS.success} />
            <Text style={styles.featureText}>Secure</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="flash" size={28} color={COLORS.primary} />
            <Text style={styles.featureText}>Instant</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="bank" size={28} color={COLORS.warning} />
            <Text style={styles.featureText}>Multi-Bank</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          By continuing, you agree to our{' '}
          <Text style={styles.footerLink}>Terms of Service</Text>
          {' '}&{' '}
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  welcomeTitle: {
    fontSize: FONTS.h1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  welcomeSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.info + '15',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.xl,
    gap: 8,
    width: '100%',
  },
  demoText: {
    fontSize: 14,
    color: COLORS.info,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: SPACING.sm,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginIcon: {
    marginRight: SPACING.sm,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: FONTS.h2,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: FONTS.body,
    color: COLORS.danger,
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xxl,
    marginTop: SPACING.xl,
  },
  feature: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  footer: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xxl,
    lineHeight: 20,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
