import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  processMessage,
  getSuggestedReplies,
  getOfflineNotification,
  getOnlineNotification,
} from '../services/chatService';
import { selectAllTasks, selectTaskCounts } from '../store/slices/tasksSlice';
import { selectHistory } from '../store/slices/pomodoroSlice';

/**
 * ChatScreen - Conversational Assistant for ADHD Support with LLM
 * Implements RF37-RF41: Pattern recognition and contextualized responses
 * Now uses Hugging Face Flan-T5 for natural language responses
 */
export default function ChatScreen() {
  const tasks = useSelector(selectAllTasks);
  const taskCounts = useSelector(selectTaskCounts);
  const pomodoroHistory = useSelector(selectHistory);
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente para TDAH. Puedo ayudarte cuando te sientas bloqueado, distraído o sin saber qué hacer.\n\n¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  // Get context for assistant
  const getContext = () => ({
    tasks,
    pomodoroSessions: pomodoroHistory.length,
    hasPendingTasks: taskCounts.pending > 0,
  });

  // Suggested quick replies
  const suggestions = getSuggestedReplies(getContext());

  const handleSend = async (customMessage = null) => {
    const messageText = customMessage || inputText.trim();

    if (!messageText || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Process message and get response (async with LLM)
      const response = await processMessage(messageText, getContext());

      // Check if connection status changed
      const messagesToAdd = [];

      // Connection lost - show offline notification
      if (response.connectionLost) {
        const offlineNotification = getOfflineNotification();
        const offlineMsg = {
          id: (Date.now()).toString(),
          text: offlineNotification.text,
          isUser: false,
          timestamp: new Date().toISOString(),
          isSystemMessage: true,
          messageType: 'offline',
          source: 'system',
        };
        messagesToAdd.push(offlineMsg);
      }

      // Connection restored - show online notification
      if (response.connectionRestored) {
        const onlineNotification = getOnlineNotification();
        const onlineMsg = {
          id: (Date.now()).toString(),
          text: onlineNotification.text,
          isUser: false,
          timestamp: new Date().toISOString(),
          isSystemMessage: true,
          messageType: 'online',
          source: 'system',
        };
        messagesToAdd.push(onlineMsg);
      }

      // Add actual assistant response
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date().toISOString(),
        pattern: response.pattern,
        source: response.source, // 'llm', 'cache', 'offline', or 'fallback'
      };
      messagesToAdd.push(assistantMessage);

      setMessages(prev => [...prev, ...messagesToAdd]);
    } catch (error) {
      // Only log to console - don't show technical errors to user
      console.error('[ChatScreen] Unexpected error:', error);

      // Generic error message (no technical details)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    handleSend(suggestion);
  };

  useEffect(() => {
    // Scroll to bottom on new messages
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const renderMessage = ({ item }) => {
    // System messages (connection status)
    if (item.isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <View
            style={[
              styles.systemMessageBubble,
              item.messageType === 'offline' && styles.offlineMessageBubble,
              item.messageType === 'online' && styles.onlineMessageBubble,
            ]}
          >
            <Ionicons
              name={item.messageType === 'offline' ? 'cloud-offline' : 'cloud-done'}
              size={18}
              color={item.messageType === 'offline' ? '#F39C12' : '#27AE60'}
            />
            <Text style={styles.systemMessageText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    // Regular messages
    return (
      <View
        style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.assistantBubble,
          item.isError && styles.errorBubble,
        ]}
      >
        {!item.isUser && (
          <View style={styles.assistantHeader}>
            <Ionicons
              name={item.isError ? 'alert-circle' : 'chatbubble-ellipses'}
              size={16}
              color={item.isError ? '#E74C3C' : '#3498DB'}
            />
            <Text style={[styles.assistantLabel, item.isError && styles.errorLabel]}>
              {item.isError ? 'Error' : 'Asistente TDAH'}
            </Text>
            {item.source && item.source === 'llm' && (
              <View style={styles.llmBadge}>
                <Text style={styles.llmBadgeText}>✨ LLM</Text>
              </View>
            )}
            {item.source && item.source === 'offline' && (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineBadgeText}>🔌 Offline</Text>
              </View>
            )}
          </View>
        )}
        <Text
          style={[
            styles.messageText,
            item.isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {item.text}
        </Text>
        {item.pattern && !item.isError && (
          <View style={styles.patternBadge}>
            <Text style={styles.patternText}>
              {item.pattern === 'PARALYSIS' && '🔓 Parálisis ejecutiva'}
              {item.pattern === 'FOCUS_LOSS' && '🎯 Pérdida de foco'}
              {item.pattern === 'INDECISION' && '🤔 Indecisión'}
              {item.pattern === 'MOTIVATION' && '💪 Motivación'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Calculate the keyboard offset based on header + tab bar height
  const headerHeight = 60; // Approximate header height
  const tabBarHeight = 60 + Math.max(insets.bottom + 10, 18); // Tab bar with safe area
  const keyboardVerticalOffset = Platform.OS === 'ios' ? headerHeight : headerHeight + tabBarHeight;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: keyboardHeight > 0 ? 20 : 80 }
        ]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        keyboardShouldPersistTaps="handled"
      />

      {/* Quick Suggestions */}
      {messages.length <= 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
          contentContainerStyle={styles.suggestionsContent}
        >
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => handleSuggestionPress(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3498DB" />
          <Text style={styles.loadingText}>Pensando...</Text>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escribe tu pregunta..."
          placeholderTextColor="#95A5A6"
          multiline
          maxLength={500}
          editable={!isLoading}
          onFocus={() => {
            // Scroll to bottom when input is focused
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 200);
          }}
          returnKeyType="default"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#BDC3C7" />
          ) : (
            <Ionicons
              name="send"
              size={24}
              color={inputText.trim() ? '#fff' : '#BDC3C7'}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#E74C3C',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  assistantLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3498DB',
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#2C3E50',
  },
  patternBadge: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#EBF5FB',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  patternText: {
    fontSize: 11,
    color: '#3498DB',
    fontWeight: '600',
  },
  suggestionsContainer: {
    maxHeight: 50,
    marginBottom: 8,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3498DB',
  },
  suggestionText: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2C3E50',
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ECF0F1',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  errorBubble: {
    backgroundColor: '#FADBD8',
    borderColor: '#E74C3C',
  },
  errorLabel: {
    color: '#E74C3C',
  },
  llmBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#E8F8F5',
    borderRadius: 4,
    marginLeft: 6,
  },
  llmBadgeText: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: '600',
  },
  offlineBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FEF5E7',
    borderRadius: 4,
    marginLeft: 6,
  },
  offlineBadgeText: {
    fontSize: 10,
    color: '#F39C12',
    fontWeight: '600',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    maxWidth: '90%',
  },
  offlineMessageBubble: {
    backgroundColor: '#FEF5E7',
    borderWidth: 1,
    borderColor: '#F39C12',
  },
  onlineMessageBubble: {
    backgroundColor: '#E8F8F5',
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  systemMessageText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
    flex: 1,
  },
});
