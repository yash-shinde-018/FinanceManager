import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONTS } from '../constants';

const { width } = Dimensions.get('window');

export const ScannerScreen: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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

      // Rotate animation for corners
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [isScanning]);

  useEffect(() => {
    if (scanComplete) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [scanComplete]);

  const handleScan = () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setScanComplete(false);
    setScannedData(null);

    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      setScannedData('rahul@okaxis');
      
      Alert.alert(
        'QR Code Scanned!',
        'Pay to: rahul@okaxis',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Pay Now', 
            onPress: () => {
              // Navigate to send screen with scanned data
              Alert.alert('Navigating to Payment...', 'Amount: ₹500');
            }
          },
        ]
      );
    }, 3000);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan & Pay</Text>
        <Text style={styles.headerSubtitle}>Scan any QR code to pay</Text>
      </View>

      {/* Scanner Frame */}
      <View style={styles.scannerContainer}>
        <View style={styles.cameraFrame}>
          {/* Animated Corners */}
          {isScanning && (
            <Animated.View style={[styles.cornerContainer, { transform: [{ rotate: spin }] }]}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </Animated.View>
          )}

          {/* Scanner Target */}
          <Animated.View 
            style={[
              styles.scanTarget,
              { 
                transform: [{ scale: pulseAnim }],
                opacity: isScanning ? 1 : 0.5,
              }
            ]} 
          >
            <View style={styles.scanCrosshair}>
              <View style={styles.crosshairHorizontal} />
              <View style={styles.crosshairVertical} />
            </View>
          </Animated.View>

          {/* Grid Overlay */}
          <View style={styles.gridOverlay}>
            <View style={styles.gridLineHorizontal} />
            <View style={styles.gridLineVertical} />
          </View>

          {/* Scanning Text */}
          {isScanning && (
            <View style={styles.scanningTextContainer}>
              <Text style={styles.scanningText}>Scanning...</Text>
              <View style={styles.scanningDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          )}
        </View>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Position QR code within the frame
        </Text>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        {/* Quick Amount Buttons */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Quick Pay</Text>
          <View style={styles.amountButtons}>
            {['₹100', '₹500', '₹1000'].map((amount) => (
              <TouchableOpacity key={amount} style={styles.amountBtn}>
                <Text style={styles.amountBtnText}>{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonActive]}
          onPress={handleScan}
          activeOpacity={0.8}
        >
          <View style={styles.scanButtonInner}>
            <Icon name={isScanning ? 'qrcode-scan' : 'camera'} size={32} color="#fff" />
          </View>
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Tap to Scan'}
          </Text>
        </TouchableOpacity>

        {/* Other Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionBtn}>
            <View style={[styles.optionIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <Icon name="image" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.optionText}>Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionBtn}>
            <View style={[styles.optionIcon, { backgroundColor: COLORS.warning + '20' }]}>
              <Icon name="flashlight" size={20} color={COLORS.warning} />
            </View>
            <Text style={styles.optionText}>Flash</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionBtn}>
            <View style={[styles.optionIcon, { backgroundColor: COLORS.success + '20' }]}>
              <Icon name="history" size={20} color={COLORS.success} />
            </View>
            <Text style={styles.optionText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Scans */}
      {scanComplete && (
        <Animated.View style={[styles.recentScans, { opacity: fadeAnim }]}>
          <Text style={styles.recentTitle}>Recently Scanned</Text>
          <View style={styles.recentItem}>
            <View style={styles.recentIcon}>
              <Icon name="qrcode" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentName}>rahul@okaxis</Text>
              <Text style={styles.recentTime}>Just now</Text>
            </View>
            <TouchableOpacity style={styles.payBtn}>
              <Text style={styles.payBtnText}>Pay</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.h1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  scannerContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  cameraFrame: {
    width: width - SPACING.lg * 4,
    height: width - SPACING.lg * 4,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
    position: 'relative',
  },
  cornerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 20,
    left: 20,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: 20,
    right: 20,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: 20,
    left: 20,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    bottom: 20,
    right: 20,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
  },
  scanTarget: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCrosshair: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  crosshairHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    marginTop: -1,
  },
  crosshairVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.primary,
    marginLeft: -1,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border + '50',
  },
  gridLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: COLORS.border + '50',
  },
  scanningTextContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background + '80',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  scanningText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: '500',
    marginRight: 8,
  },
  scanningDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  instructions: {
    fontSize: FONTS.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING.lg,
  },
  amountContainer: {
    marginBottom: SPACING.lg,
  },
  amountLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  amountButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  amountBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amountBtnText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  scanButton: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  scanButtonActive: {
    opacity: 0.8,
  },
  scanButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  scanButtonText: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  optionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  recentScans: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  recentTitle: {
    fontSize: FONTS.h3,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
  },
  recentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: FONTS.body,
    fontWeight: '500',
    color: COLORS.text,
  },
  recentTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  payBtnText: {
    color: '#fff',
    fontSize: FONTS.caption,
    fontWeight: '600',
  },
});
