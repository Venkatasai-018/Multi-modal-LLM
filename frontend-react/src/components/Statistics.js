import React from 'react';
import { FiFileText, FiMessageSquare } from 'react-icons/fi';
import './Statistics.css';

const Statistics = ({ stats }) => {
  return (
    <div className="statistics">
      <div className="stat-card">
        <FiFileText className="stat-icon" />
        <div className="stat-content">
          <div className="stat-value">{stats?.total_documents ?? 0}</div>
          <div className="stat-label">Documents</div>
        </div>
      </div>
      <div className="stat-card">
        <FiMessageSquare className="stat-icon" />
        <div className="stat-content">
          <div className="stat-value">{stats?.total_queries ?? 0}</div>
          <div className="stat-label">Queries</div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
