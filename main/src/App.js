import React, { useState } from 'react';
import './App.css';
import StartJourney from './components/StartJourney';
import JourneyEntry from './components/JourneyEntry';

function App() {
  const [currentView, setCurrentView] = useState('start');

  const handleStart = () => {
    setCurrentView('entry');
  };

  return (
    <div className="App">
      {currentView === 'start' ? (
        <StartJourney onStart={handleStart} />
      ) : (
        <JourneyEntry />
      )}
    </div>
  );
}

export default App;
