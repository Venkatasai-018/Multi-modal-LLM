import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:8000';

function App() {
  const [stats, setStats] = useState({ total_documents: 0, total_queries: 0 });
  const [history, setHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/history`)
      ]);
      const statsData = await statsRes.json();
      const historyData = await historyRes.json();
      setStats(statsData);
      setHistory(historyData.history || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      if (res.ok) {
        setFile(null);
        e.target.reset();
        fetchData();
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer(null);

    try {
      const res = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, top_k: 4 })
      });
      const data = await res.json();
      if (res.ok) {
        setAnswer(data);
        setQuestion('');
        fetchData();
      }
    } catch (error) {
      console.error('Query error:', error);
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
          <h2>📤 Upload Document</h2>
          <form onSubmit={handleUpload}>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.png,.jpg,.jpeg,.mp3,.wav"
              disabled={uploading}
            />
            <button type="submit" disabled={!file || uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
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
