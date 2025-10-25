import React, { useState } from 'react';
import WritingBoard from './WritingBoard';
import Notes from './Notes';
import Calculator from './Calculator';

function Dashboard({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('board');

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Welcome, {user.username}</h2>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </nav>
      
      <div className="tab-container">
        <div className="tabs">
          <button 
            className={activeTab === 'board' ? 'active' : ''}
            onClick={() => setActiveTab('board')}
          >
            Writing Board
          </button>
          <button 
            className={activeTab === 'notes' ? 'active' : ''}
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </button>
          <button 
            className={activeTab === 'calculator' ? 'active' : ''}
            onClick={() => setActiveTab('calculator')}
          >
            Calculator
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'board' && <WritingBoard token={token} />}
          {activeTab === 'notes' && <Notes token={token} />}
          {activeTab === 'calculator' && <Calculator />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;