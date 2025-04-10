import React from 'react';
import './JourneyResults.css';

// Component to display journey calculation results and segment breakdown
const JourneyResults = ({ results, postcodes, onBack, isLoading }) => {
  // Helper function to get postcode value
  const getPostcodeValue = (postcode) => {
    return typeof postcode === 'string' ? postcode : postcode.value;
  };

  // Helper function to format time in appropriate units
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} minutes`;
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`;
    } else { // 24 hours or more
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      return `${days} ${days === 1 ? 'day' : 'days'}${remainingHours > 0 ? ` ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}` : ''}`;
    }
  };

  // Show loading state while calculating
  if (isLoading) {
    return (
      <div className="container journey-results">
        <div className="loading-message">Calculating your journey...</div>
      </div>
    );
  }

  // Handle empty or invalid results
  if (!results || results.trim() === '') {
    return (
      <div className="container journey-results">
        <h2>Journey Results</h2>
        <div className="error-message">
          Unable to calculate journey times. Please try again with different postcodes.
        </div>
        <button onClick={onBack} className="back-button">
          Try Again
        </button>
      </div>
    );
  }

  // Parse journey segments from results string
  const segments = results.split(';').filter(segment => segment.trim() !== '');
  let totalTime = 0;
  let totalDistance = 0;
  let hasValidData = false;

  // Calculate journey totals from all segments
  segments.forEach(segment => {
    const [time, distance] = segment.split(',').map(num => parseFloat(num));
    if (!isNaN(time) && !isNaN(distance)) {
      totalTime += time;
      totalDistance += distance;
      hasValidData = true;
    }
  });

  // Show error if no valid segments were found
  if (!hasValidData) {
    return (
      <div className="container journey-results">
        <h2>Journey Results</h2>
        <div className="error-message">
          No valid journey data available. Please check your postcodes and try again.
        </div>
        <button onClick={onBack} className="back-button">
          Try Again
        </button>
      </div>
    );
  }

  // Render successful journey results
  return (
    <div className="container journey-results">
      <h2>Journey Results</h2>
      
      {/* Journey summary showing total distance and time */}
      <div className="journey-summary">
        <div className="summary-item">
          <h3>Total Journey Distance</h3>
          <p>{totalDistance.toFixed(1)} miles</p>
        </div>
        <div className="summary-item">
          <h3>Total Journey Time</h3>
          <p>{formatTime(totalTime)}</p>
        </div>
      </div>

      {/* Detailed breakdown of journey segments */}
      <div className="journey-details">
        <h3>Journey Segments</h3>
        <table className="segments-table">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Distance</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment, index) => {
              const [time, distance] = segment.split(',').map(num => parseFloat(num));
              if (isNaN(time) || isNaN(distance)) return null;
              
              return (
                <tr key={index}>
                  <td>{getPostcodeValue(postcodes[index])}</td>
                  <td>{getPostcodeValue(postcodes[index + 1])}</td>
                  <td>{distance.toFixed(1)} miles</td>
                  <td>{formatTime(time)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button onClick={onBack} className="back-button">
        Plan Another Journey
      </button>
    </div>
  );
};

export default JourneyResults; 