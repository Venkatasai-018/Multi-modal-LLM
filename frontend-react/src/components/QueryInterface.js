import React, { useState } from 'react';
import { FiSend, FiLoader } from 'react-icons/fi';
import './QueryInterface.css';

const QueryInterface = ({ apiUrl, onSuccess }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Debug: Log response changes
  React.useEffect(() => {
    console.log('Response state updated:', response);
  }, [response]);

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
        console.log('Answer exists?', !!data.answer);
        console.log('Answer content:', data.answer);
        setResponse(data);
        setQuery(''); // Clear query after successful response
        onSuccess();
      } else {
        console.error('Response not OK:', res.status, data);
        setResponse({ error: data.detail || 'Unknown error' });
      }
    } catch (error) {
      console.error('Query failed:', error);
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

      {/* Debug: Show response state */}
      {response && (
        <div style={{background: '#e6f2ff', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', marginTop: '12px', border: '2px solid #4299e1'}}>
          <strong>🔍 Response Debug:</strong><br/>
          Has response: <strong>{response ? '✅ YES' : '❌ NO'}</strong> | 
          Has error: <strong>{response?.error ? '❌ YES' : '✅ NO'}</strong> | 
          Has answer: <strong>{response?.answer ? '✅ YES' : '❌ NO'}</strong> | 
          Answer length: <strong>{response?.answer?.length || 0} chars</strong>
          <br/>
          <span style={{fontSize: '0.75rem'}}>If "Has answer" is YES but you don't see it below, there's a rendering issue.</span>
        </div>
      )}

      {response && !response.error && (
        <div className="response-container" style={{marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0'}}>
          {response.answer ? (
            <>
              <div className="answer" style={{marginBottom: '24px'}}>
                <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#2d3748', marginBottom: '12px'}}>Answer</h3>
                <div className="answer-text" style={{
                  padding: '16px',
                  background: '#f7fafc',
                  borderRadius: '8px',
                  lineHeight: '1.6',
                  color: '#2d3748',
                  fontSize: '1rem',
                  whiteSpace: 'pre-wrap',
                  display: 'block',
                  visibility: 'visible'
                }}>
                  {response.answer}
                </div>
                <div className="meta" style={{marginTop: '12px', fontSize: '0.875rem', color: '#718096'}}>
                  <span>⏱️ {response.processing_time?.toFixed(2)}s</span>
                </div>
              </div>

              {response.sources && response.sources.length > 0 && (
                <div className="sources" style={{marginTop: '24px'}}>
                  <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#2d3748', marginBottom: '12px'}}>📚 Sources ({response.sources.length})</h3>
                  {response.sources.map((source, idx) => (
                    <div key={idx} className="source-item" style={{
                      background: '#f7fafc',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      borderLeft: '3px solid #4299e1'
                    }}>
                      <div className="source-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                        <span className="source-file" style={{fontWeight: '600', color: '#2d3748', fontSize: '0.875rem'}}>📄 {source.file}</span>
                        <span className="source-score" style={{background: '#4299e1', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600'}}>{(source.similarity * 100).toFixed(0)}%</span>
                      </div>
                      <div className="source-type" style={{fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', marginBottom: '8px'}}>{source.type}</div>
                      <div className="source-excerpt" style={{fontSize: '0.875rem', color: '#4a5568', lineHeight: '1.5'}}>{source.excerpt}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{padding: '20px', background: '#fed7d7', borderRadius: '8px', marginTop: '10px'}}>
              <strong>⚠️ Response received but no answer field found!</strong>
              <pre style={{fontSize: '0.75rem', marginTop: '10px'}}>{JSON.stringify(response, null, 2)}</pre>
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
