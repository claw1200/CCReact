import React from 'react';
import './StartJourney.css';
// component for the start journey page
// this is the first page that the user sees
const StartJourney = ({ onStart }) => {
  return (
    <div className="start-journey">
      <div className="container">
        <h1>Journey Planner</h1>
        <p>Welcome to your personal journey planning assistant. Create, organize, and track your adventures with ease.</p>
        <button 
          className="start-button"
          onClick={onStart}
        >
          Start Your Journey
        </button>
      </div>
    </div>
  );
};

export default StartJourney; 