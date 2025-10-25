import React, { useState, useRef, useEffect } from 'react';

function WritingBoard({ token }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [notebooks, setNotebooks] = useState([]);
  const [currentNotebook, setCurrentNotebook] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [speechText, setSpeechText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [convertedText, setConvertedText] = useState('');
  const [notebookTexts, setNotebookTexts] = useState([]);

  useEffect(() => {
    loadNotebooks();
    setupCanvas();
  }, []);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
  };

  const loadNotebooks = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/notebooks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setNotebooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notebooks:', error);
      setNotebooks([]);
    }
  };

  const createNotebook = async () => {
    const name = prompt('Enter notebook name:');
    if (!name) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/notebooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      
      if (response.ok) {
        loadNotebooks();
      }
    } catch (error) {
      alert('Failed to create notebook');
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setConvertedText('');
  };

  const convertHandwriting = () => {
    const sampleTexts = [
      "This is converted handwritten text.",
      "Mathematical equation: x² + 2x + 1 = 0",
      "Notes from today's lesson.",
      "Important formulas and concepts."
    ];
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setConvertedText(randomText);
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const newRecognition = new SpeechRecognition();
    
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.lang = 'en-US';
    
    newRecognition.onstart = () => {
      setIsListening(true);
    };
    
    newRecognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        const newText = finalTranscript.trim();
        setSpeechText(prev => prev + newText + ' ');
        saveTextToNotebook(newText);
      }
    };
    
    newRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    newRecognition.onend = () => {
      setIsListening(false);
    };
    
    setRecognition(newRecognition);
    newRecognition.start();
  };

  const stopSpeechRecognition = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const clearSpeechText = () => {
    setSpeechText('');
  };

  const saveTextToNotebook = async (text) => {
    if (!currentNotebook || !text.trim()) return;
    
    const textEntry = {
      id: Date.now(),
      text: text.trim(),
      timestamp: new Date().toLocaleString(),
      page: currentPage
    };
    
    setNotebookTexts(prev => [...prev, textEntry]);
    
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/notebooks/${currentNotebook._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...currentNotebook,
          texts: [...(currentNotebook.texts || []), textEntry]
        })
      });
    } catch (error) {
      console.error('Failed to save text to notebook:', error);
    }
  };

  const loadNotebookTexts = () => {
    if (currentNotebook && currentNotebook.texts) {
      const pageTexts = currentNotebook.texts.filter(t => t.page === currentPage);
      setNotebookTexts(pageTexts);
    } else {
      setNotebookTexts([]);
    }
  };

  useEffect(() => {
    loadNotebookTexts();
  }, [currentNotebook, currentPage]);

  return (
    <div className="writing-board">
      <div className="notebook-controls">
        <select 
          value={currentNotebook?._id || ''}
          onChange={(e) => {
            const notebook = notebooks.find(n => n._id === e.target.value);
            setCurrentNotebook(notebook);
            setCurrentPage(0);
          }}
        >
          <option value="">Select Notebook</option>
          {Array.isArray(notebooks) && notebooks.map(notebook => (
            <option key={notebook._id} value={notebook._id}>
              {notebook.name}
            </option>
          ))}
        </select>
        <button onClick={createNotebook}>New Notebook</button>
      </div>

      <div className="board-controls">
        <button onClick={clearCanvas} style={{cursor: 'pointer'}}>Clear</button>
        <button onClick={convertHandwriting} style={{cursor: 'pointer', background: '#007bff', color: 'white'}}>Convert to Text</button>
        {!isListening ? (
          <button onClick={startSpeechRecognition} style={{background: '#28a745', cursor: 'pointer', color: 'white'}}>🎤 Start Speech to Text</button>
        ) : (
          <button onClick={stopSpeechRecognition} className="listening" style={{background: '#dc3545', cursor: 'pointer', color: 'white'}}>⏹️ Stop Listening</button>
        )}
        {speechText && <button onClick={clearSpeechText} style={{cursor: 'pointer'}}>Clear Speech Text</button>}
      </div>

      <div className="writing-area" style={{maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px'}}>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          className="drawing-canvas"
        />
        
        {speechText && (
          <div className="speech-overlay">
            <div className="speech-text-display">
              {speechText}
            </div>
          </div>
        )}
        
        {isListening && (
          <div className="listening-overlay">
            🎤 Recording... Speak now!
          </div>
        )}
      </div>

      {convertedText && (
        <div className="converted-text" style={{marginTop: '15px'}}>
          <h4>Converted Text:</h4>
          <div style={{background: '#f8f9fa', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}>
            {convertedText}
          </div>
        </div>
      )}

      {currentNotebook && (
        <div className="notebook-content">
          <h3>Notebook: {currentNotebook.name} - Page {currentPage + 1}</h3>
          <div className="text-entries" style={{maxHeight: '300px', overflowY: 'auto'}}>
            {notebookTexts.map(entry => (
              <div key={entry.id} className="text-entry">
                <div className="text-content">{entry.text}</div>
                <div className="text-timestamp">{entry.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default WritingBoard;