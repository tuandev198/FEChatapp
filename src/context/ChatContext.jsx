import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { initSocket, getSocket, disconnectSocket } from '../utils/socket';
import api from '../utils/api';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      socketRef.current = initSocket(token);

      socketRef.current.on('new_message', (message) => {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
      });

      socketRef.current.on('conversation_updated', (conversation) => {
        setConversations((prev) => {
          const index = prev.findIndex(c => c._id === conversation._id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = conversation;
            // Move to top
            updated.unshift(updated.splice(index, 1)[0]);
            return updated;
          }
          return [conversation, ...prev];
        });
      });

      socketRef.current.on('message_seen', ({ messageId, seenBy }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, seenBy } : msg
          )
        );
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
      });

      loadConversations();

      return () => {
        disconnectSocket();
      };
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/${conversationId}`);
      setMessages(response.data);
      
      // Join conversation room
      if (socketRef.current) {
        socketRef.current.emit('join_conversation', conversationId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (conversationId, content, images = []) => {
    if (!socketRef.current) return;

    socketRef.current.emit('send_message', {
      conversationId,
      content,
      images
    });
  };

  const markAsSeen = (messageId) => {
    if (socketRef.current) {
      socketRef.current.emit('mark_seen', { messageId });
    }
  };

  const createPrivateConversation = async (memberId) => {
    try {
      const response = await api.post('/conversations/private', { memberId });
      await loadConversations();
      return response.data;
    } catch (error) {
      console.error('Error creating private conversation:', error);
      throw error;
    }
  };

  const createGroupConversation = async (name, memberIds, avatar) => {
    try {
      const response = await api.post('/conversations/group', {
        name,
        memberIds,
        avatar
      });
      await loadConversations();
      return response.data;
    } catch (error) {
      console.error('Error creating group conversation:', error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        setCurrentConversation,
        loadConversations,
        loadMessages,
        sendMessage,
        markAsSeen,
        createPrivateConversation,
        createGroupConversation
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

