import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';

export default function ChatView({ chat, onUpdateChat }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'https://hello-k8s-pr-1068.dev.dialoguecorp.com/members';

  const generateChatTitle = async (messages) => {
    try {
      const url = new URL(`${API_BASE_URL}/1/chat`);
      url.searchParams.append('num_conversation', '0');
      url.searchParams.append('user_input', `Based on this conversation, generate a very brief, concise title (4-6 words max):${messages}`);
      console.warn('🏷️ Generating chat title...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const title = data.response;
      console.warn('🏷️ Generated title:', title);
      return title;
    } catch (error) {
      console.warn('❌ Error generating title:', error);
      return 'New Chat';
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !chat || isLoading) return;
    
    try {
      setIsLoading(true);
      console.warn('📤 SENDING MESSAGE:', message);
      
      const userMessage = { role: 'user', content: message };
      const updatedMessages = [...chat.messages, userMessage];
      
      console.warn('🤖 SENDING TO CLAUDE:', JSON.stringify(updatedMessages, null, 2));
      
      let updatedChat = {
        ...chat,
        messages: updatedMessages
      };
      onUpdateChat(updatedChat);
      
      const url = new URL(`${API_BASE_URL}/1/chat`);
      url.searchParams.append('num_conversation', '0');
      url.searchParams.append('user_input', message);
      
      console.warn('⏳ Calling Claude API...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.warn('📥 CLAUDE RESPONSE:', JSON.stringify(data, null, 2));

      const assistantMessage = { 
        role: 'assistant', 
        content: data.response 
      };
      updatedMessages.push(assistantMessage);
      
      // Generate title if this is the first message
      let chatTitle = chat.title;
      if (chat.messages.length === 0) {
        chatTitle = await generateChatTitle(updatedMessages);
      }

      updatedChat = {
        ...chat,
        messages: updatedMessages,
        title: chatTitle
      };
      onUpdateChat(updatedChat);
      console.warn('✅ Chat updated successfully');
      
      setMessage('');
    } catch (error) {
      console.warn('❌ ERROR in sendMessage:', error);
      console.warn('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!chat) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Select or create a new chat</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messages}>
        {chat.messages.map((msg, index) => (
          <View 
            key={index} 
            style={[
              styles.message,
              msg.role === 'user' ? styles.userMessage : styles.assistantMessage
            ]}
          >
            <Text style={styles.messageRole}>{msg.role === 'user' ? 'You' : 'Dialogue Genius'}</Text>
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingMessage}>
            <Text style={styles.loadingText}>Claude is thinking...</Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#343541',
  },
  welcomeText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  messages: {
    flex: 1,
    padding: 20,
  },
  message: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: '#2A2B32',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#444654',
    alignSelf: 'flex-start',
  },
  messageRole: {
    color: '#19C37D',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageText: {
    color: 'white',
    lineHeight: 20,
  },
  loadingMessage: {
    padding: 10,
    alignItems: 'center',
  },
  loadingText: {
    color: '#19C37D',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2B32',
  },
  input: {
    flex: 1,
    backgroundColor: '#40414F',
    borderRadius: 5,
    padding: 10,
    color: 'white',
    marginRight: 10,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: '#19C37D',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2A2B32',
  },
  sendButtonText: {
    color: 'white',
  },
}); 