import React, { useState, useEffect } from 'react';

function Notes({ token }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pdfViewer, setPdfViewer] = useState({ show: false, url: '', title: '' });
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notes:', error);
      setNotes([]);
    }
  };

  const saveNote = async () => {
    if (!title || !content) {
      alert('Please enter both title and content');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });

      if (response.ok) {
        setTitle('');
        setContent('');
        loadNotes();
        alert('Note saved successfully!');
      }
    } catch (error) {
      alert('Failed to save note');
    }
  };

  const uploadPdf = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/notes/upload-pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        loadNotes();
        alert('PDF uploaded successfully!');
      }
    } catch (error) {
      alert('Failed to upload PDF');
    }
  };

  const viewPdf = (filename, originalName) => {
    setPdfViewer({
      show: true,
      url: `${process.env.REACT_APP_API_URL}/notes/pdf/${filename}?token=${token}`,
      title: originalName
    });
  };

  const startSpeechToText = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const newRecognition = new SpeechRecognition();
    
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.lang = 'en-US';
    
    newRecognition.onstart = () => setIsListening(true);
    
    newRecognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      
      if (finalTranscript) {
        setContent(prev => prev + finalTranscript);
      }
    };
    
    newRecognition.onerror = () => setIsListening(false);
    newRecognition.onend = () => setIsListening(false);
    
    setRecognition(newRecognition);
    newRecognition.start();
  };

  const stopSpeechToText = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="notes-container">
      <div className="notes-form">
        <input
          type="text"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={saveNote}>Save Note</button>
        <input
          type="file"
          accept=".pdf"
          onChange={uploadPdf}
          style={{ display: 'none' }}
          id="pdf-upload"
        />
        <button onClick={() => document.getElementById('pdf-upload').click()}>
          📄 Upload PDF
        </button>
        {!isListening ? (
          <button onClick={startSpeechToText} style={{background: '#28a745', cursor: 'pointer'}}>🎤 Dictate</button>
        ) : (
          <button onClick={stopSpeechToText} className="listening" style={{background: '#dc3545', cursor: 'pointer'}}>⏹️ Stop</button>
        )}
      </div>

      <textarea
        placeholder="Write your notes here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
      />

      <div className="notes-list">
        {Array.isArray(notes) && notes.map(note => (
          <div key={note._id} className={`note-item ${note.type === 'pdf' ? 'pdf-note' : ''}`}>
            {note.type === 'pdf' ? (
              <div className="pdf-item">
              <div 
                className="pdf-name" 
                onClick={() => viewPdf(note.filename, note.originalName)}
              >
                📄 {note.originalName}
              </div>
              <div className="pdf-quick-actions">
                <button 
                  onClick={() => viewPdf(note.filename, note.originalName)}
                  className="view-btn"
                >
                  👁️ View
                </button>
                <button 
                  onClick={() => window.open(`${process.env.REACT_APP_API_URL}/notes/pdf/${note.filename}?token=${token}`, '_blank')}
                  className="open-btn"
                >
                  🔗 Open
                </button>
              </div>
            </div>
            ) : (
              <>
                <div className="note-title">{note.title}</div>
                <div className="note-content">{note.content}</div>
              </>
            )}
            <div className="note-date">
              {new Date(note.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {pdfViewer.show && (
        <div className="pdf-viewer">
          <div className="pdf-controls">
            <button onClick={() => setPdfViewer({ show: false, url: '', title: '' })}>
              ✕ Close PDF
            </button>
            <span className="pdf-title">{pdfViewer.title}</span>
            <div className="pdf-actions">
              <button onClick={() => window.open(pdfViewer.url, '_blank')}>
                🔗 Open in New Tab
              </button>
              <a href={pdfViewer.url} download={pdfViewer.title}>
                <button>💾 Download</button>
              </a>
            </div>
          </div>
          <div className="pdf-content">
            <iframe 
              src={pdfViewer.url} 
              width="100%" 
              height="100%"
              title={pdfViewer.title}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;