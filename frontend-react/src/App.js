import React, { useState, useEffect } from 'react';
import './App.css';

// Hardcoded backend URL - Backend runs on port 8000
const API_URL = 'http://localhost:8000';

function App() {
  const [stats, setStats] = useState({ total_documents: 0, total_queries: 0 });
  const [history, setHistory] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState(null);

  useEffect(() => {
    testConnection();
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const testConnection = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`, { 
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        console.log('✅ Backend connected successfully');
      } else {
        console.error('❌ Backend returned error:', res.status);
      }
    } catch (error) {
      console.error('❌ Cannot connect to backend at', API_URL);
      console.error('Error:', error.message);
      alert(`Cannot connect to backend!\n\nMake sure backend is running:\ncd backend\npython main.py\n\nBackend should be at: ${API_URL}`);
    }
  };

  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/stats`, { 
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch(`${API_URL}/history`, { 
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' }
        })
      ]);
      
      if (!statsRes.ok || !historyRes.ok) {
        console.error('Backend error - Stats:', statsRes.status, 'History:', historyRes.status);
        return;
      }
      
      const statsData = await statsRes.json();
      const historyData = await historyRes.json();
      
      console.log('📊 Stats:', statsData);
      console.log('📜 History:', historyData.history?.length, 'items');
      
      setStats(statsData);
      setHistory(historyData.history || []);
    } catch (error) {
      console.error('❌ Fetch error:', error.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    setUploadStatus([]);
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        setUploadStatus(prev => [...prev, { name: file.name, status: 'uploading', message: 'Uploading...' }]);
        
        const res = await fetch(`${API_URL}/upload`, { 
          method: 'POST', 
          mode: 'cors',
          body: formData 
        });
        const data = await res.json();
        
        if (res.ok) {
          console.log('✅ Upload success:', file.name);
          results.push({ name: file.name, status: 'success', message: data.message || 'Success' });
          setUploadStatus(prev => prev.map(item => 
            item.name === file.name 
              ? { ...item, status: 'success', message: `✅ ${data.chunks_created || 0} chunks` }
              : item
          ));
        } else {
          console.error('❌ Upload failed:', file.name);
          results.push({ name: file.name, status: 'error', message: data.detail || 'Failed' });
          setUploadStatus(prev => prev.map(item => 
            item.name === file.name 
              ? { ...item, status: 'error', message: `❌ ${data.detail}` }
              : item
          ));
        }
      } catch (error) {
        console.error('❌ Upload error:', file.name, error);
        results.push({ name: file.name, status: 'error', message: error.message });
        setUploadStatus(prev => prev.map(item => 
          item.name === file.name 
            ? { ...item, status: 'error', message: `❌ ${error.message}` }
            : item
        ));
      }
    }

    setUploading(false);
    setFiles([]);
    e.target.reset();
    fetchData();
    
    const successCount = results.filter(r => r.status === 'success').length;
    const failCount = results.filter(r => r.status === 'error').length;
    alert(`Upload complete!\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`);
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer(null);

    try {
      const res = await fetch(`${API_URL}/query`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, top_k: 4 })
      });
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ Query success:', data);
        setAnswer(data);
        setQuestion('');
        fetchData();
      } else {
        console.error('❌ Query failed:', data);
        alert(`❌ Query failed: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Query error:', error);
      alert(`❌ Query failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📚 AI Document Search</h1>
        <p>Upload documents and get intelligent answers</p>
      </header>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-value">{stats?.total_documents ?? 0}</div>
          <div className="stat-label">DOCUMENTS</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.total_queries ?? 0}</div>
          <div className="stat-label">QUERIES</div>
        </div>
      </div>

      <div className="main-grid">
        <div className="card">
          <h2>📤 Upload Documents</h2>
          <form onSubmit={handleUpload} encType="multipart/form-data">
            <div 
              className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <p className="upload-icon">📤</p>
              <p className="upload-text">Drag & drop files here</p>
              <p className="upload-hint">or</p>
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                accept=".pdf,.docx,.png,.jpg,.jpeg,.mp3,.wav"
                multiple
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <label htmlFor="fileInput" className="file-label">
                Browse Files
              </label>
              <p className="file-types">PDF, DOCX, Images, Audio</p>
            </div>
            
            {files.length > 0 && (
              <div className="selected-files">
                <strong>{files.length} file(s) selected:</strong>
                {files.map((file, i) => (
                  <div key={i} className="file-name">{file.name}</div>
                ))}
              </div>
            )}
            
            {uploadStatus.length > 0 && (
              <div className="upload-progress">
                {uploadStatus.map((item, i) => (
                  <div key={i} className={`upload-item ${item.status}`}>
                    <span>{item.name}</span>
                    <span className="status-badge">{item.message}</span>
                  </div>
                ))}
              </div>
            )}
            
            <button type="submit" disabled={files.length === 0 || uploading}>
              {uploading ? `Uploading... (${uploadStatus.filter(s => s.status === 'success').length}/${files.length})` : `Upload ${files.length} File(s)`}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>💬 Ask Question</h2>
          <form onSubmit={handleQuery}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know?"
              rows={4}
              disabled={loading}
            />
            <button type="submit" disabled={!question.trim() || loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {answer && (
        <div className="card answer-card">
          <h3>Answer</h3>
          <div className="answer-text">{answer.answer}</div>
          {answer.sources && answer.sources.length > 0 && (
            <div className="sources">
              <h4>Sources</h4>
              {answer.sources.map((source, i) => (
                <div key={i} className="source">
                  <div className="source-header">
                    <span>📄 {source.file}</span>
                    <span className="score">{(source.similarity * 100).toFixed(0)}%</span>
                  </div>
                  <div className="source-text">{source.excerpt}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="card history-card">
          <h3>Recent Queries</h3>
          <div className="history-list">
            {history.slice(0, 10).map((item, i) => (
              <div key={i} className="history-item" onClick={() => setExpandedHistory(expandedHistory === i ? null : i)}>
                <div className="history-question">
                  <span className="label">Q:</span>
                  <span className="text">{item.question || 'No question text'}</span>
                </div>
                {expandedHistory === i && (
                  <div className="history-answer">
                    <span className="label">A:</span>
                    <span className="text">{item.answer || 'No answer text'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
