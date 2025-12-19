import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiCheck, FiX } from 'react-icons/fi';
import './FileUpload.css';

const FileUpload = ({ apiUrl, onSuccess }) => {
  const [status, setStatus] = useState('');
  const [files, setFiles] = useState([]);

  const onDrop = async (acceptedFiles) => {
    setStatus('Uploading...');
    const newFiles = [];

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(`${apiUrl}/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        newFiles.push({ name: file.name, success: res.ok });
      } catch {
        newFiles.push({ name: file.name, success: false });
      }
    }

    setFiles(prev => [...newFiles, ...prev].slice(0, 5));
    setStatus(newFiles.every(f => f.success) ? 'Success!' : 'Some files failed');
    setTimeout(() => setStatus(''), 3000);
    onSuccess();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'audio/*': ['.mp3', '.wav']
    }
  });

  return (
    <div className="card">
      <h2>📤 Upload Documents</h2>
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <FiUpload size={40} />
        <p>{isDragActive ? 'Drop files here' : 'Drop files or click to browse'}</p>
        <span className="file-hint">PDF, DOCX, Images, Audio</span>
      </div>
      
      {status && <div className="upload-status">{status}</div>}
      
      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, i) => (
            <div key={i} className="file-item">
              <span>{file.name}</span>
              {file.success ? <FiCheck color="#48bb78" /> : <FiX color="#f56565" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
