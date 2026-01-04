import { useState, useRef } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSend }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
          newImages.push(base64);
          newPreviews.push(reader.result); // Full data URL for preview

          if (newImages.length === files.length) {
            setImages((prev) => [...prev, ...newImages]);
            setImagePreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (content.trim() || images.length > 0) {
      onSend(content.trim(), images);
      setContent('');
      setImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input-container">
      {imagePreviews.length > 0 && (
        <div className="image-previews">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="image-preview-item">
              <img src={preview} alt={`Preview ${index + 1}`} />
              <button
                className="remove-image-btn"
                onClick={() => removeImage(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="message-input-wrapper">
        <button
          className="image-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Upload images"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        <textarea
          className="message-input"
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!content.trim() && images.length === 0}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;

