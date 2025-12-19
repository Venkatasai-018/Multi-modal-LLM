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
          <div className="stat-value">{totalDocs}</div>
          <div className="stat-label">Documents</div>
        </div>
      </div>

      <div className="stat-card queries">
        <div className="stat-icon">
          <FiMessageSquare size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{totalQueries}</div>
          <div className="stat-label">Queries</div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
