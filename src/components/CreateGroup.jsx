import { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ImageUpload from './ImageUpload';
import './CreateGroup.css';

const CreateGroup = () => {
  const { createGroupConversation, setCurrentConversation, loadMessages } = useChat();
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const response = await api.get('/friends');
      setFriends(response.data);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const toggleMember = (friendId) => {
    setSelectedMembers(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Vui lòng nhập tên nhóm');
      return;
    }

    if (selectedMembers.length === 0) {
      setError('Vui lòng chọn ít nhất một thành viên');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const conversation = await createGroupConversation(
        groupName.trim(),
        selectedMembers,
        groupAvatar
      );
      setCurrentConversation(conversation);
      loadMessages(conversation._id);
      // Reset form
      setGroupName('');
      setSelectedMembers([]);
      setGroupAvatar(null);
      // Note: The parent Chat component will switch to conversations tab automatically
    } catch (error) {
      setError(error.response?.data?.error || 'Không thể tạo nhóm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group">
      <div className="create-group-header">
        <h2>Tạo nhóm chat</h2>
      </div>
      <div className="create-group-content">
        <div className="form-group">
          <label>Ảnh đại diện nhóm (tùy chọn)</label>
          <ImageUpload
            onImageSelect={setGroupAvatar}
            currentImage={groupAvatar}
            label="Chọn ảnh đại diện"
            size="medium"
            shape="circle"
          />
        </div>

        <div className="form-group">
          <label>Tên nhóm</label>
          <input
            type="text"
            placeholder="Nhập tên nhóm..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label>Chọn thành viên ({selectedMembers.length} đã chọn)</label>
          {friends.length === 0 ? (
            <div className="empty-friends">
              Bạn chưa có bạn bè. Hãy thêm bạn bè trước!
            </div>
          ) : (
            <div className="friends-selection">
              {friends.map((friend) => {
                const isSelected = selectedMembers.includes(friend._id);
                return (
                  <div
                    key={friend._id}
                    className={`friend-select-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleMember(friend._id)}
                  >
                    <div className="friend-select-avatar">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {friend.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="friend-select-info">
                      <div className="friend-select-name">{friend.username}</div>
                      <div className="friend-select-email">{friend.email}</div>
                    </div>
                    {isSelected && (
                      <div className="selected-check">✓</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="create-group-btn"
          onClick={handleCreateGroup}
          disabled={loading || !groupName.trim() || selectedMembers.length === 0}
        >
          {loading ? 'Đang tạo...' : 'Tạo nhóm'}
        </button>
      </div>
    </div>
  );
};

export default CreateGroup;

