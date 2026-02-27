import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONTS } from '../constants';

const { width, height } = Dimensions.get('window');

interface LandingScreenProps {
  onGetStarted: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onGetStarted }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Animated circles in background */}
      <Animated.View 
        style={[
          styles.circle1,
          { opacity: fadeAnim }
        ]} 
      />
      <Animated.View 
        style={[
          styles.circle2,
          { opacity: fadeAnim }
        ]} 
      />

      {/* Main Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Logo Icon */}
        <Animated.View 
          style={[
            styles.iconContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.iconCircle}>
              <Icon name="lightning-bolt" size={80} color={COLORS.primary} />
            </View>
          </Animated.View>
        </Animated.View>

        {/* App Name */}
        <Text style={styles.appName}>MoneyMind</Text>
        <Text style={styles.tagline}>UPI</Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: COLORS.success + '20' }]}>
              <Icon name="shield-check" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.featureText}>Secure Payments</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <Icon name="flash" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.featureText}>Instant Transfer</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: COLORS.warning + '20' }]}>
              <Icon name="cash-multiple" size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.featureText}>Multiple Banks</Text>
          </View>
        </View>
      </Animated.View>

      {/* Bottom Section */}
      <Animated.View 
        style={[
          styles.bottomSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, -1) }],
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.getStartedButton}
          onPress={onGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Icon name="arrow-right" size={20} color="#fff" style={styles.arrowIcon} />
        </TouchableOpacity>

        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
    top: height * 0.1,
    right: -100,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.secondary,
    opacity: 0.08,
    bottom: height * 0.2,
    left: -50,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xs,
    letterSpacing: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    marginTop: SPACING.xxl,
    gap: SPACING.lg,
  },
  featureItem: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  bottomSection: {
    position: 'absolute',
    bottom: SPACING.xxl,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 30,
    width: '100%',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  getStartedText: {
    color: '#fff',
    fontSize: FONTS.h3,
    fontWeight: '600',
  },
  arrowIcon: {
    marginLeft: SPACING.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
});
