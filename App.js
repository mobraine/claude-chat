import { StyleSheet, View } from 'react-native';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';

export default function App() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  // Add test log on component mount
  useEffect(() => {
    console.warn('🔍 App mounted');
  }, []);

  const createNewChat = () => {
    console.warn('📝 Creating new chat');
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: []
    };
    setChats(prevChats => [...prevChats, newChat]);
    setCurrentChatId(newChat.id);
  };

  const updateChat = (updatedChat) => {
    console.warn('📝 Updating chat:', updatedChat);
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === updatedChat.id ? updatedChat : chat
      )
    );
  };

  return (
    <View style={styles.container}>
      <Sidebar 
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={createNewChat}
      />
      <ChatView 
        chat={chats.find(chat => chat.id === currentChatId)}
        onUpdateChat={updateChat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#343541',
  },
}); 