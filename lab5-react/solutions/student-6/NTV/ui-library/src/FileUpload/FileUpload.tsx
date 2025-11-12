import React, { useRef } from 'react'
import './FileUpload.css'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  label?: string
  disabled?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '*/*',
  label = 'Upload File',
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div className="file-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={accept}
        disabled={disabled}
        className="file-input"
        hidden
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="file-upload-btn"
      >
        {label}
      </button>
    </div>
  )
}

export default FileUpload
