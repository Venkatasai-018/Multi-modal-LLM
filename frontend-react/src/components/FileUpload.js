import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheck, FiX } from 'react-icons/fi';
import './FileUpload.css';

const FileUpload = ({ apiUrl, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      await uploadFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg']
    }
  });

  const uploadFile = async (file) => {
    setUploading(true);
    setStatus({ type: 'info', message: `Uploading ${file.name}...` });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: `✅ ${file.name} uploaded successfully!` });
        setUploadedFiles(prev => [...prev, { name: file.name, type: result.type, chunks: result.chunks_created }]);
        onSuccess();
      } else {
        setStatus({ type: 'error', message: `❌ Error: ${result.detail}` });
      }
    } catch (error) {
      setStatus({ type: 'error', message: `❌ Error uploading ${file.name}: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card file-upload-card">
      <h2>📁 Upload Files</h2>
      
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <FiUpload size={48} />
        <p className="dropzone-title">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="dropzone-subtitle">or click to browse</p>
        <p className="dropzone-info">
          Supports: PDF, DOCX, Images, Audio
        </p>
      </div>

      {status && (
        <div className={`status ${status.type}`}>
          {status.type === 'success' && <FiCheck />}
          {status.type === 'error' && <FiX />}
          <span>{status.message}</span>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h3>Recent Uploads</h3>
          {uploadedFiles.slice(-5).reverse().map((file, idx) => (
            <div key={idx} className="uploaded-file">
              <FiFile />
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-meta">{file.type} • {file.chunks} chunks</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
