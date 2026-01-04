import { useState, useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ 
  onImageSelect, 
  currentImage, 
  label = 'Upload Image',
  size = 'medium',
  shape = 'circle',
  showPreview = true
}) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64 = reader.result; // Full data URL
      setPreview(base64);
      setUploading(false);
      if (onImageSelect) {
        onImageSelect(base64);
      }
    };

    reader.onerror = () => {
      setUploading(false);
      alert('Failed to read image file');
    };

    reader.readAsDataURL(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageSelect) {
      onImageSelect(null);
    }
  };

  const sizeClasses = {
    small: 'image-upload-small',
    medium: 'image-upload-medium',
    large: 'image-upload-large'
  };

  const shapeClasses = {
    circle: 'image-upload-circle',
    square: 'image-upload-square',
    rounded: 'image-upload-rounded'
  };

  return (
    <div className={`image-upload ${sizeClasses[size]} ${shapeClasses[shape]}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <div
        className="image-upload-area"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="image-upload-loading">
            <div className="spinner"></div>
            <span>Uploading...</span>
          </div>
        ) : preview ? (
          <div className="image-upload-preview">
            <img src={preview} alt="Preview" />
            {showPreview && (
              <button
                className="image-upload-remove"
                onClick={handleRemove}
                type="button"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <div className="image-upload-placeholder">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>{label}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;

