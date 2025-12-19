import React, { useState, useEffect } from 'react';

/**
 * Simple test component to verify React state and rendering
 * Add this to App.js temporarily to test if React is working
 */
const ReactTest = () => {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);

  useEffect(() => {
    console.log('ReactTest mounted');
    console.log('Count is:', count);
  }, [count]);

  const testFetch = async () => {
    try {
      const response = await fetch('http://localhost:8000/stats');
      const result = await response.json();
      console.log('Test fetch result:', result);
      setData(result);
    } catch (error) {
      console.error('Test fetch error:', error);
    }
  };

  return (
    <div style={{
      background: '#e6f2ff',
      padding: '20px',
      margin: '20px',
      borderRadius: '8px',
      border: '2px solid #4299e1'
    }}>
      <h3>🧪 React Test Component</h3>
      
      <div style={{marginBottom: '15px'}}>
        <strong>Counter Test:</strong>
        <div>Count: {count}</div>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '8px 16px',
            background: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          Increment (Click me!)
        </button>
      </div>

      <div style={{marginBottom: '15px'}}>
        <strong>Fetch Test:</strong>
        <button 
          onClick={testFetch}
          style={{
            padding: '8px 16px',
            background: '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '8px'
          }}
        >
          Test Backend Fetch
        </button>
        {data && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: '#c6f6d5',
            borderRadius: '4px'
          }}>
            <strong>✅ Data received:</strong>
            <pre style={{fontSize: '0.75rem'}}>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={{fontSize: '0.875rem', color: '#4a5568'}}>
        <strong>What this tests:</strong>
        <ul style={{marginLeft: '20px', marginTop: '5px'}}>
          <li>React state updates (counter)</li>
          <li>Event handlers (button clicks)</li>
          <li>Fetch API (backend connection)</li>
          <li>State rendering (data display)</li>
        </ul>
        <div style={{marginTop: '10px', padding: '8px', background: '#fff3cd', borderRadius: '4px'}}>
          💡 If counter increments and fetch works, React is fine. The issue is in the main components.
        </div>
      </div>
    </div>
  );
};

export default ReactTest;
