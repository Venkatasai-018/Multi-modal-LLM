import React, { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import QueryInterface from './components/QueryInterface';
import Statistics from './components/Statistics';
import History from './components/History';

const API_URL = 'http://localhost:8000';

function App() {
  const [stats, setStats] = useState({ total_documents: 0, total_queries: 0 });
  const [history, setHistory] = useState([]);

  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/history`)
      ]);
      
      const statsData = await statsRes.json();
      const historyData = await historyRes.json();
      
      setStats(statsData);
      setHistory(historyData.history || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="header">
        <h1>📚 AI Document Search</h1>
        <p>Upload documents and get instant answers</p>
      </header>

      <div className="container">
        <Statistics stats={stats} />
        <div className="main-content">
          <FileUpload apiUrl={API_URL} onSuccess={fetchData} />
          <QueryInterface apiUrl={API_URL} onSuccess={fetchData} />
        </div>
        <History history={history} />
      </div>
    </div>
  );
}

export default App;
