import React from 'react';
import './History.css';

const History = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="card history-card">
        <h2>📜 Recent Queries</h2>
        <p className="empty-state">No queries yet. Start by asking a question!</p>
      </div>
    );
  }

  return (
    <div className="card history-card">
      <h2>📜 Recent Queries ({history.length})</h2>
      <div className="history-list">
        {history.slice().reverse().map((item, idx) => (
          <div key={idx} className="history-item">
            <div className="history-question">
              <strong>Q:</strong> {item.query}
            </div>
            <div className="history-answer">
              <strong>A:</strong> {item.response.substring(0, 200)}
              {item.response.length > 200 && '...'}
            </div>
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
