import React, { useState } from 'react';
import './App.css';
import StartJourney from './components/StartJourney';
import JourneyEntry from './components/JourneyEntry';
import mapPattern from './assets/bg.svg';
function App() {
  const [currentView, setCurrentView] = useState('start');

  const handleStart = () => {
    setCurrentView('entry');
  };

  return (
    <div className="App">
      <div className="map-background">
        <img src={mapPattern} alt="Map Pattern" className="map-pattern" />
      </div>
      {currentView === 'start' ? (
        <StartJourney onStart={handleStart} />
      ) : (
        <JourneyEntry />
      )}
    </div>
  );
}

export default App;
