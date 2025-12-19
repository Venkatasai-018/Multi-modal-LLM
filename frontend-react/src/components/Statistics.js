import React from 'react';
import { FiFileText, FiMessageSquare } from 'react-icons/fi';
import './Statistics.css';

const Statistics = ({ stats }) => {
  console.log('Statistics received:', stats);
  
  const totalDocs = stats?.total_documents ?? 0;
  const totalQueries = stats?.total_queries ?? 0;
  
  return (
    <div className="statistics">
      <div className="stat-card documents">
        <div className="stat-icon">
          <FiFileText size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-value" style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#2d3748',
            lineHeight: '1',
            marginBottom: '4px',
            display: 'block',
            visibility: 'visible'
          }}>
            {totalDocs}
          </div>
          <div className="stat-label" style={{display: 'block', visibility: 'visible'}}>Documents</div>
        </div>
      </div>

      <div className="stat-card queries">
        <div className="stat-icon">
          <FiMessageSquare size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-value" style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#2d3748',
            lineHeight: '1',
            marginBottom: '4px',
            display: 'block',
            visibility: 'visible'
          }}>
            {totalQueries}
          </div>
          <div className="stat-label" style={{display: 'block', visibility: 'visible'}}>Queries</div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
