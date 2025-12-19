import React, { useState } from 'react';
import { FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './History.css';

const History = ({ history }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filterHistory = () => {
    if (!history || !Array.isArray(history)) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);

    switch (activeTab) {
      case 'today': return history.filter(h => new Date(h.timestamp) >= today);
      case 'week': return history.filter(h => new Date(h.timestamp) >= weekAgo);
      default: return history;
    }
  };

  return (
    <div className="card">
      <h2>🕐 Query History</h2>

      <div className="tabs">
        {['all', 'today', 'week'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' ? 'All' : tab === 'today' ? 'Today' : 'This Week'}
          </button>
        ))}
      </div>

      <div className="history-list">
        {filterHistory().length === 0 ? (
          <div className="empty">No queries yet</div>
        ) : (
          filterHistory().map((item, i) => (
            <div key={i} className="history-item" onClick={() => setExpanded(expanded === i ? null : i)}>
              <div className="header">
                <div className="question">
                  <strong>Q:</strong> {item.question}
                </div>
                <div className="controls">
                  <FiClock size={14} />
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  {expanded === i ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>
              {expanded === i && (
                <div className="answer">
                  <strong>A:</strong> {item.answer}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
