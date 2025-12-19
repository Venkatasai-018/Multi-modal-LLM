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
      const res = await fetch(`${API_URL}/stats`);
      const data = await res.json();
      console.log('Stats fetched:', data);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
    fetchStats();
    fetchHistory();
    const interval = setInterval(() => {
      fetchStats();
      fetchHistory();
    }, 30000); // Refresh every 30 seconds

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
        <div style={{background: '#fff3cd', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem'}}>
          <strong>🐛 Debug Info:</strong> Stats loaded: {stats.total_documents} docs, {stats.total_queries} queries | 
          History loaded: {history.length} items | 
          API: {API_URL}
        </div>

        {/* React Test Component - Remove this after testing */}
        <ReactTest />

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
