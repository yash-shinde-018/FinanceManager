import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius, typography, shadows } from '../theme/ThemeContext';

interface AnomalyReviewModalProps {
  visible: boolean;
  transaction: {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    occurred_at: string;
    is_anomaly: boolean;
  } | null;
  confidence: number;
  onClose: () => void;
  onConfirm: (isActuallyAnomaly: boolean, notes?: string) => void;
}

export default function AnomalyReviewModal({
  visible,
  transaction,
  confidence,
  onClose,
  onConfirm,
}: AnomalyReviewModalProps) {
  const { colors, isDark } = useTheme();
  const [selectedOption, setSelectedOption] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(selectedOption, notes);
    } finally {
      setIsSubmitting(false);
      setSelectedOption(null);
      setNotes('');
      onClose();
    }
  };

  const formatCurrency = (amount: number, type: string) => {
    const sign = type === 'expense' ? '-' : '+';
    return `${sign}₹${amount.toLocaleString('en-IN')}`;
  };

  if (!transaction) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.container, { backgroundColor: colors.card }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="warning" size={28} color={colors.warning} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>
                Unusual Transaction Detected
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                AI flagged this transaction as potentially unusual
              </Text>
            </View>
          </View>

          {/* Transaction Details */}
          <View style={[styles.detailsCard, { backgroundColor: colors.background }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Description</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{transaction.description}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Amount</Text>
              <Text style={[
                styles.detailValue, 
                { color: transaction.type === 'expense' ? colors.error : colors.success }
              ]}>
                {formatCurrency(transaction.amount, transaction.type)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Category</Text>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>{transaction.category}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Date</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {new Date(transaction.occurred_at).toLocaleDateString('en-IN')}
              </Text>
            </View>
          </View>

          {/* AI Confidence */}
          <View style={styles.confidenceRow}>
            <Ionicons name="information-circle" size={16} color={colors.primary} />
            <Text style={[styles.confidenceText, { color: colors.textMuted }]}>
              AI Confidence: <Text style={{ color: colors.primary, fontWeight: '600' }}>{Math.round(confidence * 100)}%</Text>
            </Text>
          </View>

          {/* Question */}
          <Text style={[styles.question, { color: colors.text }]}>
            Is this transaction actually unusual?
          </Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.option,
                { 
                  borderColor: selectedOption === false ? colors.success : colors.border,
                  backgroundColor: selectedOption === false ? colors.success + '10' : 'transparent',
                },
              ]}
              onPress={() => setSelectedOption(false)}
            >
              <Ionicons 
                name={selectedOption === false ? 'checkmark-circle' : 'checkmark-circle-outline'} 
                size={24} 
                color={selectedOption === false ? colors.success : colors.textMuted} 
              />
              <View style={styles.optionText}>
                <Text style={[
                  styles.optionTitle, 
                  { color: selectedOption === false ? colors.success : colors.text }
                ]}>
                  No, it's normal
                </Text>
                <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                  This is a regular transaction for me
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                { 
                  borderColor: selectedOption === true ? colors.warning : colors.border,
                  backgroundColor: selectedOption === true ? colors.warning + '10' : 'transparent',
                },
              ]}
              onPress={() => setSelectedOption(true)}
            >
              <Ionicons 
                name={selectedOption === true ? 'alert-circle' : 'alert-circle-outline'} 
                size={24} 
                color={selectedOption === true ? colors.warning : colors.textMuted} 
              />
              <View style={styles.optionText}>
                <Text style={[
                  styles.optionTitle, 
                  { color: selectedOption === true ? colors.warning : colors.text }
                ]}>
                  Yes, it's unusual
                </Text>
                <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                  This transaction looks suspicious
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Notes Input */}
          <View style={styles.notesContainer}>
            <Text style={[styles.notesLabel, { color: colors.text }]}>
              Additional Notes (Optional)
            </Text>
            <TextInput
              style={[
                styles.notesInput, 
                { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Why is this normal or unusual? This helps improve our AI..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton, 
                { 
                  backgroundColor: selectedOption !== null ? colors.primary : colors.border,
                  opacity: selectedOption !== null ? 1 : 0.5,
                },
              ]}
              onPress={handleSubmit}
              disabled={selectedOption === null || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceText: {
    fontSize: 14,
    marginLeft: 8,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionText: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  notesInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
