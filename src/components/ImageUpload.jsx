import { useState, useRef } from 'react'

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  placeholder = "Upload Image",
  disabled = false 
}) {
  const [preview, setPreview] = useState(currentImage)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setError('')
    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
      
      onImageChange?.(file)
    } catch (err) {
      setError('Failed to process image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    onImageChange?.(null)
  }

  return (
    <div className="image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {preview ? (
        <div className="preview-container">
          <img src={preview} alt="Preview" className="preview-image" />
          <div className="preview-actions">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="action-btn change-btn"
            >
              📷
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || uploading}
              className="action-btn remove-btn"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div 
          className={`upload-area ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="upload-content">
            {uploading ? '⏳' : '📁'}
            <span>{uploading ? 'Uploading...' : placeholder}</span>
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <style jsx>{`
        .image-upload {
          width: 100%;
        }

        .upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .upload-area:hover:not(.disabled) {
          border-color: #3b82f6;
          background-color: #f8fafc;
        }

        .upload-area.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .preview-container {
          position: relative;
          display: inline-block;
        }

        .preview-image {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
        }

        .preview-actions {
          position: absolute;
          top: 4px;
          right: 4px;
          display: flex;
          gap: 4px;
        }

        .action-btn {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .change-btn {
          background: #3b82f6;
          color: white;
        }

        .remove-btn {
          background: #ef4444;
          color: white;
        }

        .error {
          margin-top: 8px;
          padding: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 4px;
          color: #dc2626;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}