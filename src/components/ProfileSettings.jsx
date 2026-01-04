import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ImageUpload from './ImageUpload';
import './ProfileSettings.css';

const ProfileSettings = ({ onClose }) => {
  const { user, login } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatar(user.avatar || null);
    }
  }, [user]);

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await api.put('/users/me', {
        username: username.trim(),
        avatar: avatar
      });

      // Update local storage
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update auth context
      if (login) {
        // Force re-login to update context
        window.location.reload();
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings-overlay" onClick={onClose}>
      <div className="profile-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-settings-header">
          <h2>Cài đặt hồ sơ</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="profile-settings-content">
          <div className="form-group">
            <label>Ảnh đại diện</label>
            <ImageUpload
              onImageSelect={setAvatar}
              currentImage={avatar}
              label="Chọn ảnh đại diện"
              size="large"
              shape="circle"
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              maxLength={30}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="disabled-input"
            />
            <small>Email cannot be changed</small>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="profile-settings-actions">
            <button
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={loading || !username.trim()}
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;

