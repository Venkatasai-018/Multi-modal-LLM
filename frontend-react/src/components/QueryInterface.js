import React, { useState } from 'react';
import { FiSend, FiLoader } from 'react-icons/fi';
import './QueryInterface.css';

const QueryInterface = ({ apiUrl, onSuccess }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${apiUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, top_k: 4 })
      });

      const data = await res.json();
      setResponse(res.ok ? data : { error: data.detail });
      if (res.ok) { 
        setQuery('');
        onSuccess();
      }
    } catch (error) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>💬 Ask a Question</h2>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about your documents..."
          rows={4}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? <><FiLoader className="spin" /> Processing...</> : <><FiSend /> Search</>}
        </button>
      </form>

      {response && !response.error && (
        <div className="response">
          <h3>Answer</h3>
          <div className="answer">{response.answer}</div>
          {response.processing_time && <div className="time">⏱️ {response.processing_time.toFixed(2)}s</div>}
          
          {response.sources?.length > 0 && (
            <div className="sources">
              <h4>📚 Sources</h4>
              {response.sources.map((s, i) => (
                <div key={i} className="source">
                  <div className="source-header">
                    <span>📄 {s.file}</span>
                    <span className="similarity">{(s.similarity * 100).toFixed(0)}%</span>
                  </div>
                  <div className="excerpt">{s.excerpt}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {response?.error && <div className="error">❌ {response.error}</div>}
    </div>
  );
};

export default QueryInterface;
