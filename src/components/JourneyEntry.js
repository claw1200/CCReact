import React, { useState } from 'react';
import './JourneyEntry.css';
import JourneyResults from './JourneyResults';
import carIcon from '../assets/car.svg';
import walkIcon from '../assets/walk.svg';
import bikeIcon from '../assets/bike.svg';

// Main component for handling journey entry and postcode management
const JourneyEntry = () => {
  // State management for postcodes and UI
  const [postcodes, setPostcodes] = useState([]);
  const [currentPostcode, setCurrentPostcode] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [calculationResults, setCalculationResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [travelMode, setTravelMode] = useState('Driving'); // Default to Driving

  // Available transport modes
  const transportModes = ['Driving', 'Bicycling', 'Walking'];

  // Validates UK postcode format
  const isValidUKPostcode = (postcode) => {
    const regex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    return regex.test(postcode.trim());
  };

  // Handles adding new or updating existing postcodes
  const handleAddPostcode = () => {
    const trimmedPostcode = currentPostcode.trim().toUpperCase();
    if (!isValidUKPostcode(trimmedPostcode)) {
      setError('Please enter a valid UK postcode');
      return;
    }

    if (editIndex >= 0) {
      const newPostcodes = [...postcodes];
      newPostcodes[editIndex] = trimmedPostcode;
      setPostcodes(newPostcodes);
      setEditIndex(-1);
    } else {
      // Add new postcode with animation flag
      const newPostcode = {
        value: trimmedPostcode,
        isNew: true
      };
      setPostcodes([...postcodes, newPostcode]);
      // Remove the isNew flag after animation
      setTimeout(() => {
        setPostcodes(prev => prev.map((p, i) => 
          i === prev.length - 1 ? { value: p.value, isNew: false } : p
        ));
      }, 300);
    }
    setCurrentPostcode('');
    setError(null);
  };

  // Drag and drop handlers for reordering postcodes
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.target.classList.add('dragging');
    const dragImage = e.target.cloneNode(true);
    dragImage.style.opacity = '0.5';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    const draggedOverItem = e.target.closest('tr');
    if (draggedOverItem) {
      draggedOverItem.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    const draggedOverItem = e.target.closest('tr');
    if (draggedOverItem) {
      draggedOverItem.classList.remove('drag-over');
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const draggedOverItem = e.target.closest('tr');
    if (draggedOverItem) {
      draggedOverItem.classList.remove('drag-over');
    }
    
    if (draggedItem === null || draggedItem === dropIndex) return;

    // Reorder postcodes array
    const items = Array.from(postcodes);
    const [reorderedItem] = items.splice(draggedItem, 1);
    items.splice(dropIndex, 0, reorderedItem);
    
    setPostcodes(items);
    setDraggedItem(null);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedItem(null);
  };

  // Postcode edit and remove handlers
  const handleEdit = (index) => {
    const postcodeValue = typeof postcodes[index] === 'string' ? 
      postcodes[index] : postcodes[index].value;
    setCurrentPostcode(postcodeValue);
    setEditIndex(index);
  };

  const handleRemove = (index) => {
    // Add removing class to trigger animation
    const row = document.querySelector(`tr[data-index="${index}"]`);
    if (row) {
      row.classList.add('removing');
      // Wait for animation to complete before removing from state
      setTimeout(() => {
        const newPostcodes = postcodes.filter((_, i) => i !== index);
        setPostcodes(newPostcodes);
        if (editIndex === index) {
          setEditIndex(-1);
          setCurrentPostcode('');
        }
      }, 300); // Match animation duration
    } else {
      // Fallback if element not found
      const newPostcodes = postcodes.filter((_, i) => i !== index);
      setPostcodes(newPostcodes);
      if (editIndex === index) {
        setEditIndex(-1);
        setCurrentPostcode('');
      }
    }
  };

  // Calculates journey details using the API
  const handleCalculateJourney = async () => {
    if (postcodes.length < 2) {
      setError('Please enter at least 2 postcodes to calculate a journey');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Prepare and send API request
      const route = postcodes.map(p => typeof p === 'string' ? p : p.value).join(',');
      const url = `/Travel/JourneyPlan.aspx?Route=${route}&Format=Miles&TravelMode=${travelMode}&TrafficMode=best_guess`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Accept': 'text/plain',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Process and validate response data
      const data = await response.text();
      
      if (data && typeof data === 'string') {
        const segments = data.split(';').filter(segment => segment.trim() !== '');
        
        // Ensure each segment contains valid time and distance values
        const validSegments = segments.every(segment => {
          const [time, distance] = segment.split(',').map(num => parseFloat(num));
          return !isNaN(time) && !isNaN(distance);
        });

        if (validSegments && segments.length === postcodes.length - 1) {
          setCalculationResults(data);
        } else {
          throw new Error('Invalid response format - segments do not match expected format');
        }
      } else {
        throw new Error('Invalid response format - response is not a string');
      }
    } catch (err) {
      console.error('Journey calculation error:', err);
      setError('Failed to calculate journey. Please check your postcodes and try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Reset handler for returning to entry view
  const handleBackToEntry = () => {
    setCalculationResults(null);
    setError(null);
  };

  // Render results view if calculation is complete
  if (calculationResults) {
    return (
      <JourneyResults
        results={calculationResults}
        postcodes={postcodes}
        onBack={handleBackToEntry}
        isLoading={isCalculating}
      />
    );
  }

  // Main entry form render
  return (
    <div className="container journey-entry">
      <h2>Enter Your Journey Points</h2>
      
      {/* Transport mode selection */}
      <div className="transport-mode-selector">
        <h3>Select Transport Mode</h3>
        <div className="transport-options">
          {transportModes.map(mode => (
            <label key={mode} className={`transport-option ${travelMode === mode ? 'selected' : ''}`}>
              <input
                type="radio"
                name="transportMode"
                value={mode}
                checked={travelMode === mode}
                onChange={(e) => setTravelMode(e.target.value)}
              />
              <span className="transport-icon">
                {mode === 'Driving' && <img src={carIcon} alt="Car" className="mode-icon" />}
                {mode === 'Walking' && <img src={walkIcon} alt="Walking" className="mode-icon" />}
                {mode === 'Bicycling' && <img src={bikeIcon} alt="Bicycle" className="mode-icon" />}
              </span>
              {mode}
            </label>
          ))}
        </div>
      </div>

      <div className="postcode-input">
        <input
          type="text"
          value={currentPostcode}
          onChange={(e) => setCurrentPostcode(e.target.value)}
          placeholder="Enter UK Postcode"
          className="postcode-input-field"
          onKeyPress={(e) => e.key === 'Enter' && handleAddPostcode()}
        />
        <button onClick={handleAddPostcode} className="add-button">
          {editIndex >= 0 ? 'Update' : 'Add'} Postcode
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {postcodes.length > 0 && (
        <div className="table-container">
          <table className="postcode-table">
            <thead>
              <tr>
                <th></th>
                <th>Step</th>
                <th>Postcode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {postcodes.map((postcode, index) => (
                <tr
                  key={typeof postcode === 'string' ? postcode + index : postcode.value + index}
                  data-index={index}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`postcode-row ${typeof postcode === 'object' && postcode.isNew ? 'new-item' : ''}`}
                >
                  <td>
                    <span className="drag-handle" title="Drag to reorder">⋮⋮</span>
                  </td>
                  <td>{index + 1}</td>
                  <td>{typeof postcode === 'string' ? postcode : postcode.value}</td>
                  <td>
                    <button 
                      onClick={() => handleEdit(index)} 
                      className="edit-button"
                      title="Edit postcode"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleRemove(index)} 
                      className="remove-button"
                      title="Remove postcode"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {postcodes.length >= 2 && (
        <button 
          onClick={handleCalculateJourney} 
          className="calculate-button"
          disabled={isCalculating}
        >
          {isCalculating ? 'Calculating...' : 'Calculate Journey'}
        </button>
      )}
    </div>
  );
};

export default JourneyEntry; 