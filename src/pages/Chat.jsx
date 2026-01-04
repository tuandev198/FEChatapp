import { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import ConversationList from '../components/ConversationList';
import FriendList from '../components/FriendList';
import CreateGroup from '../components/CreateGroup';
import ChatRoom from '../components/ChatRoom';
import ProfileSettings from '../components/ProfileSettings';
import './Chat.css';

const Chat = () => {
  const { currentConversation } = useChat();
  const { logout, user } = useAuth();
  const [activeView, setActiveView] = useState('conversations');
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  // Switch to conversations tab when a conversation is selected
  useEffect(() => {
    if (currentConversation && activeView !== 'conversations') {
      setActiveView('conversations');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversation]);

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>Chat</h2>
          <div className="user-info">
            <div 
              className="user-avatar-clickable"
              onClick={() => setShowProfileSettings(true)}
              title="Cài đặt hồ sơ"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <div className="user-avatar-placeholder">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span>{user?.username}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
        <div className="sidebar-tabs">
          <button
            className={activeView === 'conversations' ? 'active' : ''}
            onClick={() => setActiveView('conversations')}
          >
            💬 Cuộc trò chuyện
          </button>
          <button
            className={activeView === 'friends' ? 'active' : ''}
            onClick={() => setActiveView('friends')}
          >
            👥 Bạn bè
          </button>
          <button
            className={activeView === 'create-group' ? 'active' : ''}
            onClick={() => setActiveView('create-group')}
          >
            ➕ Tạo nhóm
          </button>
        </div>
        <div className="sidebar-content">
          {activeView === 'conversations' && <ConversationList />}
          {activeView === 'friends' && <FriendList />}
          {activeView === 'create-group' && <CreateGroup />}
        </div>
      </div>
      <div className="chat-main">
        {currentConversation ? (
          <ChatRoom />
        ) : (
          <div className="chat-placeholder">
            <p>Chọn cuộc trò chuyện để bắt đầu chat</p>
          </div>
        )}
      </div>
      {showProfileSettings && (
        <ProfileSettings onClose={() => setShowProfileSettings(false)} />
      )}
    </div>
  );
};

export default Chat;

