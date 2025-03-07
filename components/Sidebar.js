import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function Sidebar({ chats, currentChatId, onSelectChat, onNewChat }) {
  return (
    <View style={styles.sidebar}>
      <TouchableOpacity style={styles.newChatButton} onPress={onNewChat}>
        <Text style={styles.newChatButtonText}>+ New Chat</Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.chatList}>
        {chats.map(chat => (
          <TouchableOpacity
            key={chat.id}
            style={[
              styles.chatItem,
              chat.id === currentChatId && styles.selectedChat
            ]}
            onPress={() => onSelectChat(chat.id)}
          >
            <Text style={styles.chatTitle}>{chat.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: '#202123',
    padding: 10,
  },
  newChatButton: {
    backgroundColor: '#343541',
    padding: 12,
    borderRadius: 5,
    marginBottom: 20,
  },
  newChatButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedChat: {
    backgroundColor: '#343541',
  },
  chatTitle: {
    color: 'white',
  },
}); 