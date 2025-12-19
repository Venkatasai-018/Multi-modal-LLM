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

      <div className="history-list" style={{maxHeight: '500px', overflowY: 'auto'}}>
        {filteredHistory.length === 0 ? (
          <div className="empty-state" style={{textAlign: 'center', padding: '48px', color: '#718096', fontSize: '0.875rem'}}>
            No queries yet - Upload documents and ask questions to see history here
          </div>
        ) : (
          filteredHistory.map((item, idx) => (
            <div key={idx} className="history-item" style={{
              padding: '16px',
              background: '#f7fafc',
              borderRadius: '8px',
              marginBottom: '12px',
              borderLeft: '3px solid #4299e1',
              cursor: 'pointer'
            }}>
              <div className="history-header" onClick={() => toggleExpand(idx)} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px'
              }}>
                <div className="history-question" style={{
                  flex: 1,
                  fontSize: '0.875rem',
                  color: '#2d3748',
                  lineHeight: '1.5'
                }}>
                  <strong style={{color: '#4299e1', marginRight: '4px'}}>Q:</strong> {item.question}
                </div>
                <div className="history-controls" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexShrink: 0
                }}>
                  <span className="history-time" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: '#718096'
                  }}>
                    <FiClock size={14} />
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  {expandedIndex === idx ? <FiChevronUp color="#718096" /> : <FiChevronDown color="#718096" />}
                </div>
              </div>
              
              {expandedIndex === idx && (
                <div className="history-answer" style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: '0.875rem',
                  color: '#4a5568',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  <strong style={{color: '#48bb78', marginRight: '4px'}}>A:</strong> {item.answer}
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
