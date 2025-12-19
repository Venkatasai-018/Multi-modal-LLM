import React, { useState } from 'react';
import { FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './History.css';

const History = ({ history }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedIndex, setExpandedIndex] = useState(null);

  console.log('History received:', history);

  const filterHistory = () => {
    if (!history || !Array.isArray(history)) {
      console.log('History is not an array:', history);
      return [];
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (activeTab) {
      case 'today':
        return history.filter(item => new Date(item.timestamp) >= today);
      case 'week':
        return history.filter(item => new Date(item.timestamp) >= weekAgo);
      default:
        return history;
    }
  };

  const filteredHistory = filterHistory();

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="card history-card">
      <h2>🕐 Query History</h2>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`tab ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          Today
        </button>
        <button
          className={`tab ${activeTab === 'week' ? 'active' : ''}`}
          onClick={() => setActiveTab('week')}
        >
          This Week
        </button>
      </div>

      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty-state">No queries yet</div>
        ) : (
          filteredHistory.map((item, idx) => (
            <div key={idx} className="history-item">
              <div className="history-header" onClick={() => toggleExpand(idx)}>
                <div className="history-question">
                  <strong>Q:</strong> {item.question}
                </div>
                <div className="history-controls">
                  <span className="history-time">
                    <FiClock size={14} />
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  {expandedIndex === idx ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>
              
              {expandedIndex === idx && (
                <div className="history-answer">
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
