import React from 'react';
import { FiFileText, FiMessageSquare } from 'react-icons/fi';
import './Statistics.css';

const Statistics = ({ stats }) => {
  console.log('Statistics component rendering with:', stats);
  
  const totalDocs = stats?.total_documents ?? 0;
  const totalQueries = stats?.total_queries ?? 0;
  
  console.log('totalDocs:', totalDocs, 'totalQueries:', totalQueries);
  
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px'}}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        borderLeft: '4px solid #4299e1'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          background: '#e6f2ff',
          color: '#4299e1'
        }}>
          <FiFileText size={32} />
        </div>
        <div style={{flex: 1}}>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#2d3748',
            lineHeight: '1',
            marginBottom: '4px'
          }}>
            {totalDocs}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: '#718096',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600'
          }}>
            Documents
          </div>
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        borderLeft: '4px solid #48bb78'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          background: '#e6f9f0',
          color: '#48bb78'
        }}>
          <FiMessageSquare size={32} />
        </div>
        <div style={{flex: 1}}>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#2d3748',
            lineHeight: '1',
            marginBottom: '4px'
          }}>
            {totalQueries}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: '#718096',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600'
          }}>
            Queries
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
