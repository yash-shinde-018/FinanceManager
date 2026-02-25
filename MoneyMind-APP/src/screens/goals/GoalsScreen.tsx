import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useTheme, spacing, borderRadius, typography, shadows } from '../../theme/ThemeContext';
import { supabase, Goal } from '../../lib/supabase';

const goalIcons = [
  { name: 'home', label: 'Home' },
  { name: 'car', label: 'Car' },
  { name: 'airplane', label: 'Travel' },
  { name: 'school', label: 'Education' },
  { name: 'heart', label: 'Health' },
  { name: 'briefcase', label: 'Career' },
  { name: 'gift', label: 'Gift' },
  { name: 'shield', label: 'Emergency' },
];

const goalColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function GoalsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    selectedIcon: 'shield',
    selectedColor: goalColors[0],
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGoals().finally(() => setRefreshing(false));
  };

  const createGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    try {
      const { error } = await supabase.from('goals').insert({
        name: newGoal.name,
        target_amount: parseFloat(newGoal.targetAmount),
        current_amount: 0,
        icon: newGoal.selectedIcon,
        color: newGoal.selectedColor,
        status: 'active',
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Goal Created',
        text2: 'Your savings goal has been created',
      });

      setModalVisible(false);
      setNewGoal({
        name: '',
        targetAmount: '',
        selectedIcon: 'shield',
        selectedColor: goalColors[0],
      });
      loadGoals();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create goal',
      });
    }
  };

  const addFunds = async (goalId: string, amount: number) => {
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const newAmount = goal.current_amount + amount;
      const { error } = await supabase
        .from('goals')
        .update({
          current_amount: newAmount,
          status: newAmount >= goal.target_amount ? 'completed' : 'active',
        })
        .eq('id', goalId);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Funds Added',
        text2: `Added ₹${amount} to your goal`,
      });

      loadGoals();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to add funds',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderGoal = ({ item }: { item: Goal }) => {
    const progress = (item.current_amount / item.target_amount) * 100;
    const isCompleted = item.current_amount >= item.target_amount;

    return (
      <View style={[styles.goalCard, { backgroundColor: colors.card, ...shadows.small }]}>
        <View style={styles.goalHeader}>
          <View
            style={[
              styles.goalIcon,
              { backgroundColor: item.color || colors.primary },
            ]}
          >
            <Ionicons name={item.icon as any || 'flag'} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.goalInfo}>
            <Text style={[styles.goalName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.goalStatus, { color: isCompleted ? colors.success : colors.textMuted }]}>
              {isCompleted ? 'Completed' : 'In Progress'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => addFunds(item.id, 1000)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Text style={[styles.amountText, { color: colors.text }]}>
              {formatCurrency(item.current_amount)}
            </Text>
            <Text style={[styles.targetText, { color: colors.textMuted }]}>
              of {formatCurrency(item.target_amount)}
            </Text>
          </View>

          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: item.color || colors.primary,
                },
              ]}
            />
          </View>

          <Text style={[styles.progressText, { color: colors.textMuted }]}>
            {progress.toFixed(1)}% complete
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Financial Goals</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Goals List */}
      <FlatList
        data={goals}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="flag-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No goals yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              Create a goal to start saving
            </Text>
          </View>
        )}
      />

      {/* Create Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Create New Goal
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Goal name"
              placeholderTextColor={colors.textMuted}
              value={newGoal.name}
              onChangeText={(text) => setNewGoal({ ...newGoal, name: text })}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Target amount"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={newGoal.targetAmount}
              onChangeText={(text) => setNewGoal({ ...newGoal, targetAmount: text })}
            />

            <Text style={[styles.sectionLabel, { color: colors.text }]}>Choose Icon</Text>
            <View style={styles.iconGrid}>
              {goalIcons.map((icon) => (
                <TouchableOpacity
                  key={icon.name}
                  style={[
                    styles.iconItem,
                    {
                      backgroundColor:
                        newGoal.selectedIcon === icon.name
                          ? newGoal.selectedColor
                          : colors.card,
                    },
                  ]}
                  onPress={() => setNewGoal({ ...newGoal, selectedIcon: icon.name })}
                >
                  <Ionicons
                    name={icon.name as any}
                    size={24}
                    color={newGoal.selectedIcon === icon.name ? '#FFFFFF' : colors.text}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.text }]}>Choose Color</Text>
            <View style={styles.colorGrid}>
              {goalColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorItem,
                    { backgroundColor: color },
                    newGoal.selectedColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setNewGoal({ ...newGoal, selectedColor: color })}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.createGoalButton, { backgroundColor: colors.primary }]}
              onPress={createGoal}
            >
              <Text style={styles.createGoalButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 20,
    gap: 16,
  },
  goalCard: {
    padding: 20,
    borderRadius: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
    marginLeft: 16,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
  },
  goalStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700',
  },
  targetText: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalInput: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconItem: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  createGoalButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  createGoalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
