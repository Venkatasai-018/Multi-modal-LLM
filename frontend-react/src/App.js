import React, { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import QueryInterface from './components/QueryInterface';
import Statistics from './components/Statistics';
import History from './components/History';
import { FiDatabase, FiCpu } from 'react-icons/fi';

const API_URL = 'http://localhost:8000';

function App() {
  const [stats, setStats] = useState({ documents: 0, files: 0, queries: 0 });
  const [history, setHistory] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      setStats({
        documents: data.vector_store.total_documents,
        files: data.processed_files,
        queries: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history?limit=10`);
      const data = await response.json();
      setHistory(data.history || []);
      setStats(prev => ({ ...prev, queries: data.history?.length || 0 }));
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  useEffect(() => {
    loadStats();
    loadHistory();
    const interval = setInterval(() => {
      loadStats();
      loadHistory();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleQuerySuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <FiCpu size={40} />
            <div>
              <h1>Multi-modal RAG System</h1>
              <p>Query your documents with AI-powered semantic search</p>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Statistics stats={stats} />
        
        <div className="grid-layout">
          <FileUpload apiUrl={API_URL} onSuccess={handleUploadSuccess} />
          <QueryInterface apiUrl={API_URL} onSuccess={handleQuerySuccess} />
        </div>

        <History history={history} />
      </main>

      <footer className="footer">
        <p>Multi-modal RAG System • Offline AI • Privacy First</p>
      </footer>
    </div>
  );
}

export default App;
