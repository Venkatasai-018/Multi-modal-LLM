import React, { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import QueryInterface from './components/QueryInterface';
import Statistics from './components/Statistics';
import History from './components/History';
import ReactTest from './components/ReactTest';

const API_URL = 'http://localhost:8000';

function App() {
  const [stats, setStats] = useState({ total_documents: 0, total_queries: 0 });
  const [history, setHistory] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debug: Log state changes
  useEffect(() => {
    console.log('Stats state updated:', stats);
  }, [stats]);

  useEffect(() => {
    console.log('History state updated:', history);
  }, [history]);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from:', `${API_URL}/stats`);
      const res = await fetch(`${API_URL}/stats`);
      console.log('Stats response status:', res.status);
      const data = await res.json();
      console.log('Stats raw data received:', data);
      console.log('total_documents:', data.total_documents);
      console.log('total_queries:', data.total_queries);
      
      // Ensure we have the right structure
      const statsData = {
        total_documents: data.total_documents ?? 0,
        total_queries: data.total_queries ?? 0,
        index_size: data.index_size ?? 0
      };
      console.log('Setting stats to:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ total_documents: 0, total_queries: 0 });
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/history`);
      const data = await res.json();
      console.log('History fetched:', data);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    console.log('=== App mounted or refreshKey changed ===');
    fetchStats();
    fetchHistory();
    
    // Refresh every 5 seconds for testing (change to 30000 later)
    const interval = setInterval(() => {
      console.log('Auto-refreshing data...');
      fetchStats();
      fetchHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>📚 Multi-modal RAG System</h1>
        <p>Upload documents and ask questions with AI-powered search</p>
      </header>

      <div className="container">
        {/* Debug Panel */}
        <div style={{background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '20px', fontSize: '1rem', border: '3px solid #ed8936'}}>
          <div style={{marginBottom: '15px', fontSize: '1.2rem'}}><strong>🐛 Debug Info - Can you see these numbers?</strong></div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', fontSize: '1.1rem'}}>
            <div style={{background: '#4299e1', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '3px solid #2b6cb0'}}>
              <div style={{fontSize: '3rem', fontWeight: 'bold', lineHeight: '1', marginBottom: '10px'}}>{stats.total_documents ?? 'NULL'}</div>
              <div style={{fontSize: '1rem', fontWeight: '600'}}>📄 Documents</div>
            </div>
            <div style={{background: '#48bb78', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '3px solid #2f855a'}}>
              <div style={{fontSize: '3rem', fontWeight: 'bold', lineHeight: '1', marginBottom: '10px'}}>{stats.total_queries ?? 'NULL'}</div>
              <div style={{fontSize: '1rem', fontWeight: '600'}}>💬 Queries</div>
            </div>
            <div style={{background: '#ed8936', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '3px solid #c05621'}}>
              <div style={{fontSize: '3rem', fontWeight: 'bold', lineHeight: '1', marginBottom: '10px'}}>{history.length ?? 'NULL'}</div>
              <div style={{fontSize: '1rem', fontWeight: '600'}}>🕐 History Items</div>
            </div>
          </div>
          <div style={{marginTop: '15px', fontSize: '0.875rem', padding: '10px', background: 'white', borderRadius: '4px'}}>
            <strong>Raw values:</strong> Documents={JSON.stringify(stats.total_documents)} | Queries={JSON.stringify(stats.total_queries)} | History={history.length} | API: {API_URL}
          </div>
        </div>

        {/* React Test Component - Remove this after testing */}
        <ReactTest />

        {/* Manual refresh button */}
        <div style={{marginBottom: '20px', textAlign: 'center', padding: '15px', background: '#e6f2ff', borderRadius: '8px'}}>
          <button 
            onClick={() => {
              console.log('Manual refresh clicked');
              fetchStats();
              fetchHistory();
            }}
            style={{
              padding: '12px 24px',
              background: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            🔄 Manually Refresh Stats
          </button>
          <button 
            onClick={async () => {
              console.log('Testing direct fetch...');
              try {
                const response = await fetch('http://localhost:8000/stats');
                const data = await response.json();
                console.log('Direct fetch result:', data);
                alert('Check console! Data: ' + JSON.stringify(data));
              } catch (error) {
                console.error('Direct fetch error:', error);
                alert('Error: ' + error.message);
              }
            }}
            style={{
              padding: '12px 24px',
              background: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🧪 Test Direct Fetch (Will show alert)
          </button>
        </div>

        <Statistics stats={stats} />
        
        <div className="main-content">
          <FileUpload apiUrl={API_URL} onSuccess={handleSuccess} />
          <QueryInterface apiUrl={API_URL} onSuccess={handleSuccess} />
        </div>

        <History history={history} />
      </div>
    </div>
  );
}

export default App;
