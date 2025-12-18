import React, { useState } from 'react';
import './History.css';

const History = ({ history }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!history || history.length === 0) {
    return (
      <div className="card history-card">
        <h2>📜 Query History</h2>
        <p className="empty-state">No queries yet. Start by asking a question!</p>
      </div>
    );
  }

  // Filter history based on active tab
  const filteredHistory = history.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'today') {
      const today = new Date().toDateString();
      return new Date(item.timestamp).toDateString() === today;
    }
    if (activeTab === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(item.timestamp) > weekAgo;
    }
    return true;
  });

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="card history-card">
      <div className="history-header">
        <h2>📜 Query History ({filteredHistory.length})</h2>
        <div className="tabs">
          <button 
            className={activeTab === 'all' ? 'active' : ''} 
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={activeTab === 'today' ? 'active' : ''} 
            onClick={() => setActiveTab('today')}
          >
            Today
          </button>
          <button 
            className={activeTab === 'week' ? 'active' : ''} 
            onClick={() => setActiveTab('week')}
          >
            This Week
          </button>
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.slice().reverse().map((item, idx) => (
          <div key={idx} className="history-item">
            <div className="history-question">
              <strong>Q:</strong> {item.query}
            </div>
            <div className="history-answer">
              <strong>A:</strong> 
              {expandedIndex === idx ? (
                <span className="full-answer">{item.response}</span>
              ) : (
                <>
                  {item.response.substring(0, 150)}
                  {item.response.length > 150 && '...'}
                </>
              )}
            </div>
            {item.response.length > 150 && (
              <button className="toggle-btn" onClick={() => toggleExpand(idx)}>
                {expandedIndex === idx ? 'Show Less ▲' : 'Show More ▼'}
              </button>
            )}
            <div className="history-meta">
              <span>🕒 {new Date(item.timestamp).toLocaleString()}</span>
              <span>📚 {item.retrieved_documents} sources</span>
              <span>⏱️ {item.processing_time_seconds.toFixed(2)}s</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
