import { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './FriendList.css';

const FriendList = () => {
  const { createPrivateConversation, setCurrentConversation, loadMessages } = useChat();
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
    loadSentRequests();
    if (activeTab === 'add') {
      loadUsers();
    }
  }, [activeTab]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await api.get('/friends');
      setFriends(response.data);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const response = await api.get('/friends/pending');
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const loadSentRequests = async () => {
    try {
      const response = await api.get('/friends/sent');
      setSentRequests(response.data);
    } catch (error) {
      console.error('Error loading sent requests:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const sendFriendRequest = async (recipientId) => {
    try {
      console.log('Sending friend request to:', recipientId);
      console.log('API base URL:', api.defaults.baseURL);
      console.log('Full URL will be:', `${api.defaults.baseURL}/friends`);
      const response = await api.post('/friends', { recipientId });
      console.log('Friend request sent successfully:', response.data);
      await loadSentRequests();
      await loadUsers();
      // Show success message
      alert('Đã gửi yêu cầu kết bạn!');
    } catch (error) {
      console.error('Send friend request error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error URL:', error.config?.url);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send friend request';
      alert(`Lỗi: ${errorMessage} (Status: ${error.response?.status || 'N/A'})`);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await api.post(`/friends/${requestId}/accept`);
      await loadPendingRequests();
      await loadFriends();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to accept request');
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await api.post(`/friends/${requestId}/reject`);
      await loadPendingRequests();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleStartChat = async (friendId) => {
    try {
      const conversation = await createPrivateConversation(friendId);
      setCurrentConversation(conversation);
      loadMessages(conversation._id);
      // Note: The parent Chat component will switch to conversations tab automatically
    } catch (error) {
      console.error('Error starting chat:', error);
      alert(error.response?.data?.error || 'Không thể bắt đầu chat');
    }
  };

  const filteredUsers = users.filter(u => {
    if (!u || !u._id) return false;
    
    const isFriend = friends.some(f => f && f._id === u._id);
    const hasSentRequest = sentRequests.some(r => r && r.recipient && r.recipient._id === u._id);
    const isCurrentUser = u._id === user?._id;
    
    const username = u.username || '';
    const email = u.email || '';
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = username.toLowerCase().includes(searchLower) ||
                         email.toLowerCase().includes(searchLower);
    
    return !isFriend && !hasSentRequest && !isCurrentUser && matchesSearch;
  });

  return (
    <div className="friend-list">
      <div className="friend-list-tabs">
        <button
          className={activeTab === 'friends' ? 'active' : ''}
          onClick={() => setActiveTab('friends')}
        >
          Bạn bè ({friends.length})
        </button>
        <button
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Yêu cầu ({pendingRequests.length})
        </button>
        <button
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => setActiveTab('add')}
        >
          Thêm bạn
        </button>
      </div>

      <div className="friend-list-content">
        {activeTab === 'friends' && (
          <div className="friends-tab">
            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : friends.length === 0 ? (
              <div className="empty-state">Chưa có bạn bè</div>
            ) : (
              friends.map((friend) => {
                if (!friend || !friend._id) return null;
                return (
                  <div key={friend._id} className="friend-item">
                    <div className="friend-avatar">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.username || 'Friend'} />
                      ) : (
                        <div className="avatar-placeholder">
                          {(friend.username || 'F').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="friend-info">
                      <div className="friend-name">{friend.username || 'Unknown'}</div>
                      <div className="friend-email">{friend.email || ''}</div>
                    </div>
                    <button
                      className="chat-btn"
                      onClick={() => handleStartChat(friend._id)}
                    >
                      💬 Chat
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="pending-tab">
            {pendingRequests.length === 0 ? (
              <div className="empty-state">Không có yêu cầu nào</div>
            ) : (
              pendingRequests.map((request) => {
                if (!request || !request._id || !request.requester) return null;
                return (
                  <div key={request._id} className="friend-item">
                    <div className="friend-avatar">
                      {request.requester.avatar ? (
                        <img src={request.requester.avatar} alt={request.requester.username || 'User'} />
                      ) : (
                        <div className="avatar-placeholder">
                          {(request.requester.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="friend-info">
                      <div className="friend-name">{request.requester.username || 'Unknown'}</div>
                      <div className="friend-email">{request.requester.email || ''}</div>
                    </div>
                    <div className="friend-actions">
                      <button
                        className="accept-btn"
                        onClick={() => acceptRequest(request._id)}
                      >
                        ✓ Chấp nhận
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => rejectRequest(request._id)}
                      >
                        ✕ Từ chối
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="add-tab">
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredUsers.length === 0 ? (
              <div className="empty-state">Không tìm thấy người dùng</div>
            ) : (
              filteredUsers.map((userItem) => {
                if (!userItem || !userItem._id) return null;
                return (
                  <div key={userItem._id} className="friend-item">
                    <div className="friend-avatar">
                      {userItem.avatar ? (
                        <img src={userItem.avatar} alt={userItem.username || 'User'} />
                      ) : (
                        <div className="avatar-placeholder">
                          {(userItem.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="friend-info">
                      <div className="friend-name">{userItem.username || 'Unknown'}</div>
                      <div className="friend-email">{userItem.email || ''}</div>
                    </div>
                    <button
                      className="add-btn"
                      onClick={() => sendFriendRequest(userItem._id)}
                    >
                      + Kết bạn
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendList;

