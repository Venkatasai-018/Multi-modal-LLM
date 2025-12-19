import React, { useState } from 'react';
import { FiSend, FiLoader } from 'react-icons/fi';
import './QueryInterface.css';

const QueryInterface = ({ apiUrl, onSuccess }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const startTime = Date.now();
      
      const res = await fetch(`${apiUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, top_k: 4 })
      });

      const data = await res.json();
      console.log('Query response:', data);

      if (res.ok) {
        const duration = (Date.now() - startTime) / 1000;
        data.processing_time = duration;
        console.log('Setting response:', data);
        setResponse(data);
        onSuccess();
      } else {
        setResponse({ error: data.detail });
      }
    } catch (error) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card query-card">
      <h2>💬 Ask Questions</h2>
      
      <form onSubmit={handleSubmit} className="query-form">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about your uploaded documents..."
          rows={4}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !query.trim()} className="submit-btn">
          {loading ? <FiLoader className="spin" /> : <FiSend />}
          <span>{loading ? 'Processing...' : 'Search'}</span>
        </button>
      </form>

      {loading && (
        <div className="loading-info" style={{
          padding: '12px', 
          background: '#fff3cd', 
          borderRadius: '8px', 
          marginTop: '12px',
          fontSize: '0.875rem',
          color: '#856404'
        }}>
          ⏳ First query may take 1-2 minutes (AI model loading)
        </div>
      )}

      {response && !response.error && response.answer && (
        <div className="response-container">
          <div className="answer">
            <h3>Answer</h3>
            <div className="answer-text">{response.answer}</div>
            <div className="meta">
              <span>⏱️ {response.processing_time?.toFixed(2)}s</span>
            </div>
          </div>

          {response.sources && response.sources.length > 0 && (
            <div className="sources">
              <h3>📚 Sources ({response.sources.length})</h3>
              {response.sources.map((source, idx) => (
                <div key={idx} className="source-item">
                  <div className="source-header">
                    <span className="source-file">📄 {source.file}</span>
                    <span className="source-score">{(source.similarity * 100).toFixed(0)}%</span>
                  </div>
                  <div className="source-type">{source.type}</div>
                  <div className="source-excerpt">{source.excerpt}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {response && response.error && (
        <div className="error-message">
          <strong>Error:</strong> {response.error}
        </div>
      )}
    </div>
  );
};

export default QueryInterface;
