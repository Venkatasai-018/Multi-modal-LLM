import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiCheck, FiX } from 'react-icons/fi';
import './FileUpload.css';

const FileUpload = ({ apiUrl, onSuccess }) => {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);

  const onDrop = async (acceptedFiles) => {
    setUploadStatus({ type: 'uploading', message: 'Uploading files...' });

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${apiUrl}/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (res.ok) {
          setRecentFiles(prev => [
            { name: file.name, status: 'success', message: data.message },
            ...prev.slice(0, 4)
          ]);
        } else {
          setRecentFiles(prev => [
            { name: file.name, status: 'error', message: data.detail },
            ...prev.slice(0, 4)
          ]);
        }
      }

      setUploadStatus({ type: 'success', message: `Successfully uploaded ${acceptedFiles.length} file(s)` });
      onSuccess();
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      setUploadStatus({ type: 'error', message: error.message });
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'audio/*': ['.mp3', '.wav', '.m4a']
    }
  });

  return (
    <div className="card upload-card">
      <h2>📤 Upload Files</h2>
      
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <FiUpload size={48} />
        {isDragActive ? (
          <p>Drop files here...</p>
        ) : (
          <>
            <p>Drag & drop files here, or click to select</p>
            <span className="file-types">PDF, DOCX, Images, Audio</span>
          </>
        )}
      </div>

      {uploadStatus && (
        <div className={`status-message ${uploadStatus.type}`}>
          {uploadStatus.type === 'success' && <FiCheck />}
          {uploadStatus.type === 'error' && <FiX />}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {recentFiles.length > 0 && (
        <div className="recent-files">
          <h3>Recent Uploads</h3>
          {recentFiles.map((file, idx) => (
            <div key={idx} className={`file-item ${file.status}`}>
              <span className="file-name">{file.name}</span>
              {file.status === 'success' ? <FiCheck /> : <FiX />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
