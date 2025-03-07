import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_API_KEY } from '../config/keys';

export default function ChatView({ chat, onUpdateChat }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateChatTitle = async (messages) => {
    try {
      console.warn('🏷️ Generating chat title...');
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 50,
          messages: [{
            role: 'user',
            content: `Based on this conversation, generate a very brief, concise title (4-6 words max):
            ${messages[0].content}`
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const title = data.content[0].text.trim();
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
      
      console.warn('⏳ Calling Claude API...');
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.warn('📥 CLAUDE RESPONSE:', JSON.stringify(data, null, 2));

      const assistantMessage = { 
        role: 'assistant', 
        content: data.content[0].text 
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
            <Text style={styles.messageRole}>{msg.role === 'user' ? 'You' : 'Claude'}</Text>
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