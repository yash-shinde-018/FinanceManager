'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Send,
    X,
    Bot,
    User,
    Loader2,
    Sparkles,
    TrendingUp,
    Target,
    Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const QUICK_QUESTIONS = [
    { icon: Wallet, text: 'How much did I spend last month?' },
    { icon: TrendingUp, text: 'Analyze my spending patterns' },
    { icon: Target, text: 'Am I on track with my goals?' },
    { icon: Sparkles, text: 'Give me savings tips' },
];

export default function FinanceChatbot() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isChatbotReady, setIsChatbotReady] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if chatbot is configured
        checkChatbotHealth();
    }, []);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const checkChatbotHealth = async () => {
        try {
            const response = await fetch('http://localhost:8000/chat/health');
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

        // Add user message
        const userMessage: Message = {
            role: 'user',
            content: textToSend,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare conversation history
            const history = messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));

            // Call chatbot API
            const response = await fetch('http://localhost:8000/chat', {
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

            // Add assistant message
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

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={cn(
                    'fixed bottom-6 right-6 z-50',
                    'w-14 h-14 rounded-full',
                    'bg-gradient-to-r from-indigo-500 to-purple-600',
                    'text-white shadow-lg',
                    'flex items-center justify-center',
                    'hover:shadow-xl transition-shadow',
                    isOpen && 'hidden'
                )}
            >
                <MessageSquare className="w-6 h-6" />
                {!isChatbotReady && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">MoneyMind AI</h3>
                                    <p className="text-xs opacity-90">
                                        {isChatbotReady ? 'Your Financial Assistant' : 'Configuring...'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <h4 className="font-semibold mb-2">Welcome to MoneyMind AI!</h4>
                                    <p className="text-sm text-[var(--muted-text)] mb-4">
                                        I can help you with financial advice and analyze your spending patterns.
                                    </p>

                                    {/* Quick Questions */}
                                    <div className="space-y-2">
                                        <p className="text-xs text-[var(--muted-text)] mb-2">Try asking:</p>
                                        {QUICK_QUESTIONS.map((q, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleQuickQuestion(q.text)}
                                                className="w-full p-3 rounded-lg bg-[var(--glass-bg)] hover:bg-indigo-500/10 transition-colors text-left flex items-center gap-2 text-sm"
                                            >
                                                <q.icon className="w-4 h-4 text-indigo-400" />
                                                {q.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        'flex gap-3',
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                            <Bot className="w-5 h-5 text-indigo-400" />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            'max-w-[80%] p-3 rounded-2xl',
                                            message.role === 'user'
                                                ? 'bg-gray-800 text-white rounded-br-none'
                                                : 'bg-gray-700 text-gray-100 rounded-bl-none'
                                        )}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <p className="text-xs opacity-60 mt-1">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    {message.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div className="bg-gray-700 p-3 rounded-2xl rounded-bl-none">
                                        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-[var(--glass-border)]">
                            {!isChatbotReady && (
                                <div className="mb-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                                    ⚠️ Chatbot not configured. Set GROQ_API_KEY in ML API .env file. Get free key from https://console.groq.com
                                </div>
                            )}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendMessage();
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything about your finances..."
                                    disabled={isLoading || !isChatbotReady}
                                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading || !isChatbotReady}
                                    className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
