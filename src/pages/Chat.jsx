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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Close sidebar on mobile when conversation is selected
  useEffect(() => {
    if (currentConversation && window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [currentConversation]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Switch to conversations tab when a conversation is selected
  useEffect(() => {
    if (currentConversation && activeView !== 'conversations') {
      setActiveView('conversations');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversation]);

  return (
    <div className="chat-container">
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
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

