import React from 'react';
import { FiDatabase, FiFile, FiMessageSquare } from 'react-icons/fi';
import './Statistics.css';

const Statistics = ({ stats }) => {
  return (
    <div className="statistics">
      <div className="stat-card">
        <div className="stat-icon documents">
          <FiDatabase size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{stats.documents}</div>
          <div className="stat-label">Documents</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon files">
          <FiFile size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{stats.files}</div>
          <div className="stat-label">Files Processed</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon queries">
          <FiMessageSquare size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{stats.queries}</div>
          <div className="stat-label">Queries</div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
