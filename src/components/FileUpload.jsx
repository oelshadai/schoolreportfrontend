import { useState } from 'react'
import { FaUpload, FaFile, FaTimes, FaCheck } from 'react-icons/fa'

export default function FileUpload({ onFileSelect, acceptedTypes = '.pdf,.doc,.docx,.jpg,.png,.txt', maxSize = 5 }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    // Check file size (in MB)
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      alert(`File type not supported. Accepted types: ${acceptedTypes}`)
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const removeFile = () => {
    setSelectedFile(null)
    onFileSelect(null)
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          border: `2px dashed ${dragActive ? '#10b981' : 'rgba(71, 85, 105, 0.5)'}`,
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          background: dragActive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(30, 41, 59, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input
          id="fileInput"
          type="file"
          accept={acceptedTypes}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        {selectedFile ? (
          <div style={{ color: 'white' }}>
            <FaFile size={32} style={{ color: '#10b981', marginBottom: '12px' }} />
            <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
              {selectedFile.name}
            </p>
            <p style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '14px' }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeFile()
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              <FaTimes style={{ marginRight: '4px' }} />
              Remove
            </button>
          </div>
        ) : (
          <div style={{ color: 'white' }}>
            <FaUpload size={32} style={{ color: '#94a3b8', marginBottom: '12px' }} />
            <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
              Drop files here or click to browse
            </p>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
              Supported formats: {acceptedTypes} (Max {maxSize}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}