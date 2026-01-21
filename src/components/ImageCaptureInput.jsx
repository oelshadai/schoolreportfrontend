import { useRef, useState } from 'react'

const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

export default function ImageCaptureInput({ 
  label = 'Photo', 
  onChange, 
  enableCamera = true,
  disabled = false,
  maxSize = 5 * 1024 * 1024
}) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file) => {
    if (!file) return
    
    setError('')
    setProcessing(true)
    
    try {
      if (file.size > maxSize) {
        throw new Error(`File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`)
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }
      
      const compressedFile = await compressImage(file)
      const reader = new FileReader()
      
      reader.onload = (e) => {
        setPreview(e.target.result)
        onChange?.({ 
          file: compressedFile, 
          preview: e.target.result, 
          name: file.name,
          originalSize: file.size,
          compressedSize: compressedFile.size
        })
      }
      
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      setError(error.message)
      console.error('Image processing failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="image-capture">
      {label && <label className="label">{label}</label>}
      
      <div className="controls">
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()} 
          disabled={disabled || processing}
          className="btn upload-btn"
        >
          📁 {processing ? 'Processing...' : 'Upload'}
        </button>
        
        {enableCamera && (
          <button 
            type="button" 
            onClick={() => cameraInputRef.current?.click()} 
            disabled={disabled || processing}
            className="btn camera-btn"
          >
            📷 {processing ? 'Processing...' : 'Camera'}
          </button>
        )}
      </div>
        
      {error && (
        <div className="error">
          ⚠️ {error}
        </div>
      )}
      
      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" className="preview-img" />
          <div className="status">✓ Ready</div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
        style={{ display: 'none' }}
      />
      
      {enableCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFile(e.target.files?.[0])}
          style={{ display: 'none' }}
        />
      )}

      <style jsx>{`
        .image-capture {
          width: 100%;
        }

        .label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .controls {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-btn {
          background: #3b82f6;
        }

        .upload-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .camera-btn {
          background: #22c55e;
        }

        .camera-btn:hover:not(:disabled) {
          background: #16a34a;
        }

        .preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .preview-img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          border: 2px solid #e5e7eb;
        }

        .status {
          font-size: 12px;
          color: #059669;
          font-weight: 600;
        }

        .error {
          padding: 8px 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          font-size: 12px;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  )
}
