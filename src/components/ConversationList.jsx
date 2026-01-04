import { useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import './ConversationList.css';

const ConversationList = () => {
  const { conversations, currentConversation, setCurrentConversation, loadConversations, loadMessages } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
    loadMessages(conversation._id);
  };

  const getConversationName = (conversation) => {
    if (conversation.type === 'group') {
      return conversation.name;
    }
    // For private conversations, show the other user's name
    const otherMember = conversation.members?.find(m => m._id !== user?._id);
    return otherMember?.username || 'Unknown User';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.avatar) {
      return conversation.avatar;
    }
    if (conversation.type === 'group') {
      return null;
    }
    const otherMember = conversation.members?.find(m => m._id !== user?._id);
    return otherMember?.avatar || null;
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) {
      return 'No messages yet';
    }
    const msg = conversation.lastMessage;
    if (msg.images && msg.images.length > 0) {
      return `📷 ${msg.images.length} image(s)`;
    }
    return msg.content || 'Media';
  };

  return (
    <div className="conversation-list">
      {conversations.length === 0 ? (
        <div className="empty-conversations">
          <p>No conversations yet</p>
        </div>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation._id}
            className={`conversation-item ${
              currentConversation?._id === conversation._id ? 'active' : ''
            }`}
            onClick={() => handleSelectConversation(conversation)}
          >
            <div className="conversation-avatar">
              {getConversationAvatar(conversation) ? (
                <img
                  src={getConversationAvatar(conversation)}
                  alt={getConversationName(conversation)}
                />
              ) : (
                <div className="avatar-placeholder">
                  {getConversationName(conversation).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="conversation-info">
              <div className="conversation-header">
                <h3>{getConversationName(conversation)}</h3>
                {conversation.lastMessage && (
                  <span className="conversation-time">
                    {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
              <p className="conversation-preview">
                {getLastMessagePreview(conversation)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ConversationList;
