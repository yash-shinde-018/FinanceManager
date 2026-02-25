import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius, typography, shadows } from '../theme/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { ML_API_URL } from '@env';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  { icon: 'wallet', text: 'How much did I spend last month?' },
  { icon: 'trending-up', text: 'Analyze my spending patterns' },
  { icon: 'flag', text: 'Am I on track with my goals?' },
  { icon: 'sparkles', text: 'Give me savings tips' },
];

export default function FinanceChatbot() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatbotReady, setIsChatbotReady] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    checkChatbotHealth();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const checkChatbotHealth = async () => {
    try {
      const response = await fetch(`${ML_API_URL}/chat/health`);
      const data = await response.json();
      setIsChatbotReady(data.chatbot_ready);
    } catch (error) {
      console.error('Chatbot health check failed:', error);
      setIsChatbotReady(false);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || !user) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(`${ML_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          message: textToSend,
          conversation_history: history,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the ML API is running and OpenAI API key is configured.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      {item.role === 'assistant' && (
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: item.role === 'user' ? colors.primary : colors.card,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: item.role === 'user' ? '#FFFFFF' : colors.text },
          ]}
        >
          {item.content}
        </Text>
        <Text
          style={[
            styles.timestamp,
            { color: item.role === 'user' ? 'rgba(255,255,255,0.7)' : colors.textMuted },
          ]}
        >
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {item.role === 'user' && (
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="person" size={20} color="#FFFFFF" />
        </View>
      )}
    </View>
  );

  return (
    <>
      {/* Floating Chat Button */}
      <TouchableOpacity
        style={[styles.chatButton, { backgroundColor: colors.primary }]}
        onPress={() => setIsOpen(true)}
      >
        <Ionicons name="chatbubble" size={28} color="#FFFFFF" />
        {!isChatbotReady && (
          <View style={[styles.indicator, { backgroundColor: colors.warning }]} />
        )}
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.modalContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)' }]}>
            <View style={[styles.chatContainer, { backgroundColor: colors.background }]}>
              {/* Header */}
              <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <View style={styles.headerLeft}>
                  <View style={styles.headerIcon}>
                    <Ionicons name="hardware-chip-outline" size={24} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>MoneyMind AI</Text>
                    <Text style={styles.headerSubtitle}>
                      {isChatbotReady ? 'Your Financial Assistant' : 'Configuring...'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Messages */}
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.messagesList}
                ListEmptyComponent={
                  <View style={styles.welcomeContainer}>
                    <View style={[styles.welcomeIcon, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="sparkles" size={32} color={colors.primary} />
                    </View>
                    <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                      Welcome to MoneyMind AI!
                    </Text>
                    <Text style={[styles.welcomeText, { color: colors.textMuted }]}>
                      I can help you with financial advice and analyze your spending patterns.
                    </Text>

                    {/* Quick Questions */}
                    <View style={styles.quickQuestions}>
                      <Text style={[styles.quickTitle, { color: colors.textMuted }]}>
                        Try asking:
                      </Text>
                      {QUICK_QUESTIONS.map((q, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[styles.quickButton, { backgroundColor: colors.card }]}
                          onPress={() => handleQuickQuestion(q.text)}
                        >
                          <Ionicons name={q.icon as any} size={18} color={colors.primary} />
                          <Text style={[styles.quickText, { color: colors.text }]}>
                            {q.text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                }
              />

              {/* Not Ready Warning */}
              {!isChatbotReady && (
                <View style={[styles.warning, { backgroundColor: colors.warning + '20' }]}>
                  <Text style={[styles.warningText, { color: colors.warning }]}>
                    ⚠️ Chatbot not configured. Set GROQ_API_KEY in ML API .env file.
                  </Text>
                </View>
              )}

              {/* Input */}
              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask me anything about your finances..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  editable={!isLoading && isChatbotReady}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    {
                      backgroundColor: input.trim() && !isLoading && isChatbotReady
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() => sendMessage()}
                  disabled={!input.trim() || isLoading || !isChatbotReady}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chatButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  indicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  keyboardView: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatContainer: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  quickQuestions: {
    width: '100%',
    gap: 8,
  },
  quickTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  quickText: {
    fontSize: 14,
    flex: 1,
  },
  warning: {
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
