import { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import './ChatRoom.css';

const ChatRoom = () => {
  const { currentConversation, messages, sendMessage, markAsSeen } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as seen when viewing
    if (currentConversation && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg) => !msg.seenBy?.some((u) => u._id === user?._id) && msg.sender._id !== user?._id
      );
      unreadMessages.forEach((msg) => {
        markAsSeen(msg._id);
      });
    }
  }, [messages, currentConversation, user, markAsSeen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content, images) => {
    if (currentConversation) {
      sendMessage(currentConversation._id, content, images);
    }
  };

  const getConversationName = () => {
    if (!currentConversation) return '';
    if (currentConversation.type === 'group') {
      return currentConversation.name;
    }
    const otherMember = currentConversation.members?.find(m => m._id !== user?._id);
    return otherMember?.username || 'Unknown User';
  };

  const getConversationAvatar = () => {
    if (!currentConversation) return null;
    if (currentConversation.avatar) {
      return currentConversation.avatar;
    }
    if (currentConversation.type === 'group') {
      return null;
    }
    const otherMember = currentConversation.members?.find(m => m._id !== user?._id);
    return otherMember?.avatar || null;
  };

  if (!currentConversation) {
    return null;
  }

  return (
    <div className="chat-room">
      <div className="chat-room-header">
        <div className="chat-room-info">
          {getConversationAvatar() ? (
            <img
              src={getConversationAvatar()}
              alt={getConversationName()}
              className="chat-room-avatar"
            />
          ) : (
            <div className="chat-room-avatar-placeholder">
              {getConversationName().charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2>{getConversationName()}</h2>
            {currentConversation.type === 'group' && (
              <p className="chat-room-members">
                {currentConversation.members?.length || 0} members
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="chat-room-messages" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.sender._id === user?._id}
              conversation={currentConversation}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
