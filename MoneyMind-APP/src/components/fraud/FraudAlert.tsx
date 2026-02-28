import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { FraudCheckResult, getRiskIcon, getRiskColor, getRiskLevelText } from '@/lib/fraud-detection';

interface FraudAlertProps {
  visible: boolean;
  result: FraudCheckResult | null;
  onProceed: () => void;
  onCancel: () => void;
}

export default function FraudAlert({
  visible,
  result,
  onProceed,
  onCancel,
}: FraudAlertProps) {
  if (!result) return null;

  const isHighRisk = result.status === 'Fraud';
  const isMediumRisk = result.status === 'Suspicious';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: getRiskColor(result.status) + '20' },
            ]}
          >
            <Text style={styles.headerIcon}>{getRiskIcon(result.status)}</Text>
            <Text
              style={[
                styles.headerTitle,
                { color: getRiskColor(result.status) },
              ]}
            >
              {result.status} Transaction Detected
            </Text>
          </View>

          <ScrollView style={styles.content}>
            {/* Risk Score */}
            <View style={styles.riskScoreContainer}>
              <Text style={styles.riskScoreLabel}>Risk Score</Text>
              <View style={styles.riskScoreBar}>
                <View
                  style={[
                    styles.riskScoreFill,
                    {
                      width: `${result.risk_score}%`,
                      backgroundColor: getRiskColor(result.status),
                    },
                  ]}
                />
              </View>
              <Text style={styles.riskScoreValue}>
                {result.risk_score}/100 - {getRiskLevelText(result.risk_score)}
              </Text>
            </View>

            {/* Transaction Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transaction Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>₹{result.amount.toLocaleString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Risk Level:</Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: getRiskColor(result.status), fontWeight: 'bold' },
                  ]}
                >
                  {result.risk_level.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Risk Factors */}
            {result.reasons && result.reasons.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Risk Factors</Text>
                {result.reasons.map((reason, index) => (
                  <View key={index} style={styles.reasonItem}>
                    <Text style={styles.reasonBullet}>•</Text>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Check Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security Checks</Text>
              <View style={styles.checkItem}>
                <Text style={styles.checkLabel}>Location:</Text>
                <Text style={styles.checkValue}>{result.location_check}</Text>
              </View>
              <View style={styles.checkItem}>
                <Text style={styles.checkLabel}>Velocity:</Text>
                <Text style={styles.checkValue}>{result.velocity_check}</Text>
              </View>
              <View style={styles.checkItem}>
                <Text style={styles.checkLabel}>Device:</Text>
                <Text style={styles.checkValue}>{result.device_check}</Text>
              </View>
              <View style={styles.checkItem}>
                <Text style={styles.checkLabel}>Merchant:</Text>
                <Text style={styles.checkValue}>{result.merchant_check}</Text>
              </View>
              <View style={styles.checkItem}>
                <Text style={styles.checkLabel}>Time:</Text>
                <Text style={styles.checkValue}>{result.time_check}</Text>
              </View>
            </View>

            {/* Warning for High Risk */}
            {isHighRisk && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ This transaction shows strong fraud indicators. We strongly
                  recommend canceling this transaction.
                </Text>
              </View>
            )}

            {isMediumRisk && (
              <View style={styles.cautionBox}>
                <Text style={styles.cautionText}>
                  🔍 This transaction shows some unusual patterns. Please verify
                  before proceeding.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel Transaction</Text>
            </TouchableOpacity>

            {!isHighRisk && (
              <TouchableOpacity
                style={[styles.button, styles.proceedButton]}
                onPress={onProceed}
              >
                <Text style={styles.proceedButtonText}>
                  Proceed Anyway
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    maxHeight: 400,
  },
  riskScoreContainer: {
    marginBottom: 20,
  },
  riskScoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  riskScoreBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  riskScoreFill: {
    height: '100%',
    borderRadius: 6,
  },
  riskScoreValue: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  reasonItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reasonBullet: {
    marginRight: 8,
    color: '#ef4444',
    fontSize: 16,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  checkLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  checkValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
  },
  warningBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  warningText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  cautionBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  cautionText: {
    color: '#d97706',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  proceedButton: {
    backgroundColor: '#3b82f6',
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
