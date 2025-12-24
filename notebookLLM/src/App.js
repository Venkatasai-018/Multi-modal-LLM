import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = 'http://localhost:8000';

function App() {
  const [stats, setStats] = useState({ total_documents: 0, total_queries: 0 });
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [sortBy, setSortBy] = useState('recent'); // recent, name, type
  
  const chatAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const questionInputRef = useRef(null);

  useEffect(() => {
    testConnection();
    fetchData();
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.className = savedTheme;
    
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
    
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          questionInputRef.current?.focus();
        } else if (e.key === '/') {
          e.preventDefault();
          setShowShortcuts(true);
        } else if (e.key === 'u') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false);
        setShowSettings(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const testConnection = async () => {
    try {
      const res = await fetch(`${API_URL}/`, { mode: 'cors' });
      if (res.ok) {
        console.log('✅ Backend connected');
        showToast('Connected to backend', 'success');
      } else {
        showToast('Backend not responding properly', 'warning');
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      showToast('Cannot connect to backend on port 8000', 'error');
    }
  };

  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/stats`, { mode: 'cors' }),
        fetch(`${API_URL}/history`, { mode: 'cors' })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.history || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files) => {
    if (files.length === 0) return;

    for (const file of files) {
      const docItem = {
        name: file.name,
        status: 'uploading',
        message: 'Uploading...',
        id: Date.now() + Math.random()
      };
      
      setDocuments(prev => [...prev, docItem]);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          mode: 'cors',
          body: formData
        });

        const data = await res.json();

        if (res.ok) {
          setDocuments(prev => prev.map(doc => 
            doc.id === docItem.id 
              ? { ...doc, status: 'success', message: `${data.chunks_created || 0} chunks`, chunks: data.chunks_created }
              : doc
          ));
          showToast(`${file.name} uploaded successfully`, 'success');
        } else {
          setDocuments(prev => prev.map(doc => 
            doc.id === docItem.id 
              ? { ...doc, status: 'error', message: data.detail || 'Failed' }
              : doc
          ));
          showToast(`Failed to upload ${file.name}`, 'error');
        }
      } catch (error) {
        setDocuments(prev => prev.map(doc => 
          doc.id === docItem.id 
            ? { ...doc, status: 'error', message: error.message }
            : doc
        ));
        showToast(`Error uploading ${file.name}`, 'error');
      }
    }

    fetchData();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearDocuments = () => {
    if (window.confirm('Clear all documents from the list? (This won\'t delete files from the server)')) {
      setDocuments([]);
      showToast('Documents list cleared', 'info');
    }
  };

  const deleteDocument = (docId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    showToast('Document removed from list', 'info');
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages from chat?')) {
      setMessages([]);
      showToast('Chat cleared', 'info');
    }
  };

  const exportChat = () => {
    const chatData = messages.map(msg => ({
      question: msg.question,
      answer: msg.answer,
      sources: msg.sources?.map(s => s.metadata?.file_path)
    }));
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chat exported successfully', 'success');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
    showToast(`Switched to ${newTheme} mode`, 'info');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📕',
      docx: '📘',
      doc: '📘',
      png: '🖼️',
      jpg: '🖼️',
      jpeg: '🖼️',
      mp3: '🎵',
      wav: '🎵',
      txt: '📄',
      default: '📄'
    };
    return icons[ext] || icons.default;
  };

  const toggleFavorite = (msgId) => {
    const newFavorites = favorites.includes(msgId)
      ? favorites.filter(id => id !== msgId)
      : [...favorites, msgId];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    showToast(favorites.includes(msgId) ? 'Removed from favorites' : 'Added to favorites', 'info');
  };

  const getSortedDocuments = () => {
    const sorted = [...documents];
    if (sortBy === 'name') {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'type') {
      return sorted.sort((a, b) => {
        const extA = a.name.split('.').pop();
        const extB = b.name.split('.').pop();
        return extA.localeCompare(extB);
      });
    }
    return sorted; // recent by default
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!question.trim() || isProcessing) return;

    const currentQuestion = question.trim();
    setQuestion('');
    setIsProcessing(true);

    const newMessage = {
      id: Date.now(),
      question: currentQuestion,
      answer: null,
      sources: [],
      loading: true
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      const res = await fetch(`${API_URL}/query`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion, top_k: 4 })
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, answer: data.answer, sources: data.sources || [], loading: false }
            : msg
        ));
        fetchData();
      } else {
        throw new Error(data.detail || 'Query failed');
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, answer: `❌ Error: ${error.message}`, loading: false, error: true }
          : msg
      ));
      showToast('Query failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadHistoryItem = (item) => {
    const existingMessage = messages.find(m => m.question === item.question);
    if (existingMessage) return;

    const historyMessage = {
      id: Date.now(),
      question: item.question,
      answer: item.answer,
      sources: [],
      loading: false
    };

    setMessages(prev => [...prev, historyMessage]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery(e);
    }
  };

  const filteredHistory = history.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`app-container ${theme}`}>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' && '✓ '}
          {toast.type === 'error' && '✕ '}
          {toast.type === 'warning' && '⚠ '}
          {toast.message}
        </div>
      )}

      <div className="sidebar">
        <div className="sidebar-header">
          <div className="header-top">
            <h1>📚 Document Library</h1>
            <button 
              className="icon-btn" 
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              ⚙️
            </button>
          </div>
          <div className="stats">
            <div className="stat-item">
              <div className="stat-value">{stats.total_documents || 0}</div>
              <div className="stat-label">Docs</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.total_queries || 0}</div>
              <div className="stat-label">Queries</div>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="settings-panel">
            <div className="settings-item">
              <span>Theme</span>
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
            <div className="settings-item">
              <span>Backend</span>
              <button className="btn-small" onClick={testConnection}>
                Test Connection
              </button>
            </div>
            <div className="settings-item">
              <span>Shortcuts</span>
              <button className="btn-small" onClick={() => setShowShortcuts(true)}>
                ⌨️ View All
              </button>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Modal */}
        {showShortcuts && (
          <div className="modal-overlay" onClick={() => setShowShortcuts(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <button className="modal-close" onClick={() => setShowShortcuts(false)}>✕</button>
              </div>
              <div className="shortcuts-list">
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>K</kbd>
                  <span>Focus search</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>U</kbd>
                  <span>Upload files</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>/</kbd>
                  <span>Show shortcuts</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Enter</kbd>
                  <span>Send message</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Shift</kbd> + <kbd>Enter</kbd>
                  <span>New line</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Esc</kbd>
                  <span>Close dialogs</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="sidebar-content">
          <div className="section-header">
            <div className="section-title">📤 Upload Documents</div>
            <div className="header-controls">
              {documents.length > 0 && (
                <select 
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  title="Sort by"
                >
                  <option value="recent">Recent</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                </select>
              )}
              {documents.length > 0 && (
                <button className="clear-btn" onClick={clearDocuments} title="Clear all">
                  🗑️
                </button>
              )}
            </div>
          </div>
          <div 
            className={`upload-area ${dragActive ? 'drag-over' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-icon">📄</div>
            <div className="upload-text">Drag & drop files here</div>
            <input 
              type="file" 
              ref={fileInputRef}
              className="file-input" 
              multiple 
              accept=".pdf,.docx,.png,.jpg,.jpeg,.mp3,.wav"
              onChange={handleFileChange}
            />
            <button className="browse-btn" onClick={() => fileInputRef.current?.click()}>
              Or click to browse
            </button>
          </div>

          <div className="documents-list">
            {documents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <div>No documents uploaded yet</div>
                <div className="empty-hint">Drag & drop or click to upload</div>
              </div>
            ) : (
              getSortedDocuments().map(doc => (
                <div 
                  key={doc.id} 
                  className={`document-item ${selectedDoc?.id === doc.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="doc-icon">{getFileIcon(doc.name)}</div>
                  <div className="doc-info">
                    <div className="doc-name" title={doc.name}>{doc.name}</div>
                    <div className="doc-meta">
                      {doc.status === 'uploading' && uploadProgress[doc.id] && (
                        <div className="mini-progress">
                          <div className="mini-progress-bar" style={{ width: `${uploadProgress[doc.id]}%` }}></div>
                        </div>
                      )}
                      {doc.message}
                    </div>
                  </div>
                  <div className={`doc-status ${doc.status}`}>
                    {doc.status === 'success' && '✓'}
                    {doc.status === 'error' && '✕'}
                    {doc.status === 'uploading' && '⟳'}
                  </div>
                  <button 
                    className="doc-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(doc.id);
                    }}
                    title="Remove from list"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="section-header" style={{ marginTop: '24px' }}>
            <div className="section-title">🕒 Recent Queries</div>
          </div>
          
          {history.length > 0 && (
            <div className="search-box">
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
            </div>
          )}

          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-state">No queries yet</div>
            ) : filteredHistory.length === 0 ? (
              <div className="empty-state">No matching queries</div>
            ) : (
              filteredHistory.slice(-10).reverse().map((item, index) => (
                <div 
                  key={index} 
                  className="history-item"
                  onClick={() => loadHistoryItem(item)}
                >
                  <div className="history-question">{item.question}</div>
                  <div className="history-time">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="main-header">
          <h2>💬 Ask questions about your documents</h2>
          <div className="header-actions">
            {messages.length > 0 && (
              <>
                <button className="export-btn" onClick={exportChat}>
                  📥 Export Chat
                </button>
                <button className="clear-chat-btn" onClick={clearChat}>
                  🗑️ Clear Chat
                </button>
              </>
            )}
          </div>
        </div>

        <div className="chat-area" ref={chatAreaRef}>
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h3>Welcome to your AI Research Assistant</h3>
              <p>
                Upload documents and ask questions. The AI will search through your documents
                and provide answers with relevant sources.
              </p>
              <div className="welcome-tips">
                <div className="tip">💡 Tip: Upload PDFs, DOCX, or text files</div>
                <div className="tip">🔍 Ask specific questions for better results</div>
                <div className="tip">⌨️ Press Ctrl+K to focus the input</div>
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="message">
                <div className="message-question">
                  <div className="message-header">
                    <span className="user-badge">👤 You</span>
                    <div className="message-actions">
                      <button 
                        className={`action-btn ${favorites.includes(msg.id) ? 'active' : ''}`}
                        onClick={() => toggleFavorite(msg.id)}
                        title={favorites.includes(msg.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favorites.includes(msg.id) ? '⭐' : '☆'}
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => copyToClipboard(msg.question)}
                        title="Copy question"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  <div className="message-text">{msg.question}</div>
                </div>
                
                <div className="message-answer">
                  <div className="message-header">
                    <span className="ai-badge">🤖 AI Assistant</span>
                    {!msg.loading && !msg.error && (
                      <div className="message-actions">
                        <button 
                          className="action-btn"
                          onClick={() => copyToClipboard(msg.answer)}
                          title="Copy answer"
                        >
                          📋
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.loading ? (
                    <div className="answer-text">
                      <span className="loading"></span> Searching...
                    </div>
                  ) : (
                    <>
                      <div className={`answer-text ${msg.error ? 'error' : ''}`}>
                        {msg.answer}
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="sources-section">
                          <div className="sources-title">
                            📚 Sources ({msg.sources.length})
                          </div>
                          {msg.sources.map((source, idx) => (
                            <span key={idx} className="source-chip">
                              {source.metadata?.file_path || 'Unknown'}
                              <span className="source-score">
                                {(source.score * 100).toFixed(0)}%
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="input-area">
          <form onSubmit={handleQuery} className="input-container">
            <div className="input-wrapper">
              <textarea
                ref={questionInputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your documents..."
                rows={1}
                disabled={isProcessing}
              />
            </div>
            <button 
              type="submit" 
              className="send-btn" 
              disabled={!question.trim() || isProcessing}
            >
              {isProcessing ? <span className="loading"></span> : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
