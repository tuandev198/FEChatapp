import { useAuth } from '../context/AuthContext';
import './MessageBubble.css';

const MessageBubble = ({ message, isOwn, conversation }) => {
  const { user } = useAuth();

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeenStatus = () => {
    if (!isOwn || !message.seenBy || !conversation) return null;
    const otherMembers = conversation.members?.filter(
      m => m._id !== user?._id
    ) || [];
    const seenByOthers = message.seenBy.filter(
      u => u._id !== user?._id
    );
    return seenByOthers.length === otherMembers.length;
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'} ${message.isSystemMessage ? 'system' : ''}`}>
      {!isOwn && !message.isSystemMessage && (
        <div className="message-avatar">
          {message.sender?.avatar ? (
            <img src={message.sender.avatar} alt={message.sender.username} />
          ) : (
            <div className="message-avatar-placeholder">
              {message.sender?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
      )}
      <div className="message-content">
        {!isOwn && !message.isSystemMessage && (
          <div className="message-sender">{message.sender?.username}</div>
        )}
        <div className="message-body">
          {message.images && message.images.length > 0 && (
            <div className="message-images">
              {message.images.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  className="message-image"
                />
              ))}
            </div>
          )}
          {message.content && (
            <div className="message-text">{message.content}</div>
          )}
        </div>
        <div className="message-footer">
          <span className="message-time">{formatTime(message.createdAt)}</span>
          {isOwn && !message.isSystemMessage && (
            <span className="message-seen">
              {getSeenStatus() ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
