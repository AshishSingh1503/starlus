// User management
let currentUser = null;
let socket;

// Notebook management
let currentNotebook = null;
let currentPage = 0;
let notebooks = [];
let notes = [];

// Google Drive API
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const API_KEY = 'YOUR_GOOGLE_API_KEY';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
let gapi, googleAuth;

// Drawing variables
let isDrawing = false;
let canvas, ctx;
let drawingData = [];

// Speech recognition
let recognition;

// API Base URL
const API_BASE = 'http://localhost:3000/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    setupCanvas();
    setupSpeechRecognition();
    initializeGoogleAPI();
    initializeSocket();
}

function setupEventListeners() {
    // Login/Register
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerBtn').addEventListener('click', handleRegister);
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Tool switching
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', switchTool);
    });

    // Notebook management
    document.getElementById('newNotebook').addEventListener('click', createNotebook);
    document.getElementById('saveNotebook').addEventListener('click', saveNotebook);
    document.getElementById('notebookSelect').addEventListener('change', loadNotebook);
    
    // Page management
    document.getElementById('addPage').addEventListener('click', addPage);
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
    document.getElementById('clearPage').addEventListener('click', clearPage);
    
    // Drawing board
    document.getElementById('convertText').addEventListener('click', convertHandwriting);
    document.getElementById('startSpeech').addEventListener('click', startSpeechRecognition);

    // Notes
    document.getElementById('saveNote').addEventListener('click', saveNote);
    document.getElementById('uploadPdfBtn').addEventListener('click', () => {
        document.getElementById('pdfUpload').click();
    });
    document.getElementById('pdfUpload').addEventListener('change', handlePdfUpload);
    document.getElementById('saveToDriveBtn').addEventListener('click', saveToGoogleDrive);
    document.getElementById('closePdf').addEventListener('click', closePdfViewer);
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            currentUser = username;
            showDashboard();
        } else {
            alert('Invalid credentials');
        }
    } catch (error) {
        alert('Connection error. Please try again.');
    }
}

async function handleRegister() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                alert('Registration successful! Please login.');
            } else {
                const error = await response.json();
                alert(error.error || 'Registration failed');
            }
        } catch (error) {
            alert('Connection error. Please try again.');
        }
    } else {
        alert('Please enter username and password');
    }
}

function logout() {
    currentUser = null;
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

async function showDashboard() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    document.getElementById('userDisplay').textContent = currentUser;
    
    socket.emit('join-room', currentUser);
    await loadNotebooks();
    await loadNotes();
}

function switchTool(e) {
    const toolName = e.target.dataset.tool;
    
    // Update active button
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Show corresponding tool
    document.querySelectorAll('.tool').forEach(tool => tool.classList.remove('active'));
    document.getElementById(toolName + 'Tool').classList.add('active');
}

// Drawing Board Functions
function setupCanvas() {
    canvas = document.getElementById('drawingBoard');
    ctx = canvas.getContext('2d');
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('convertedText').innerHTML = '';
}

function convertHandwriting() {
    // Simulated handwriting to text conversion
    const sampleTexts = [
        "This is converted handwritten text.",
        "Mathematical equation: x² + 2x + 1 = 0",
        "Notes from today's lesson.",
        "Important formulas and concepts."
    ];
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    document.getElementById('convertedText').innerHTML = `<strong>Converted Text:</strong><br>${randomText}`;
}

// Speech Recognition
function setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            document.getElementById('startSpeech').textContent = '🎤 Listening...';
            document.getElementById('startSpeech').style.background = '#e74c3c';
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('convertedText').innerHTML = `<strong>Speech to Text:</strong><br>${transcript}`;
            document.getElementById('startSpeech').textContent = '🎤 Speech to Text';
            document.getElementById('startSpeech').style.background = '#667eea';
        };
        
        recognition.onend = function() {
            document.getElementById('startSpeech').textContent = '🎤 Speech to Text';
            document.getElementById('startSpeech').style.background = '#667eea';
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            document.getElementById('convertedText').innerHTML = `<strong>Error:</strong><br>Speech recognition failed: ${event.error}`;
            document.getElementById('startSpeech').textContent = '🎤 Speech to Text';
            document.getElementById('startSpeech').style.background = '#667eea';
        };
    }
}

function startSpeechRecognition() {
    if (!recognition) {
        document.getElementById('convertedText').innerHTML = '<strong>Error:</strong><br>Speech recognition not supported in this browser. Try Chrome or Edge.';
        return;
    }
    
    try {
        recognition.start();
    } catch (error) {
        console.error('Recognition start error:', error);
        document.getElementById('convertedText').innerHTML = '<strong>Error:</strong><br>Could not start speech recognition. Make sure microphone is available.';
    }
}

// Notes Functions
function saveNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    
    if (title && content) {
        if (!notes[currentUser]) {
            notes[currentUser] = [];
        }
        
        notes[currentUser].push({
            id: Date.now(),
            title: title,
            content: content,
            date: new Date().toLocaleDateString()
        });
        
        localStorage.setItem('notes', JSON.stringify(notes));
        
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
        
        loadNotes();
        alert('Note saved successfully!');
    } else {
        alert('Please enter both title and content');
    }
}

async function loadNotes() {
    try {
        const response = await fetch(`${API_BASE}/notes/${currentUser}`);
        notes = await response.json();
        displayNotes();
    } catch (error) {
        console.error('Failed to load notes:', error);
    }
}

function displayNotes() {
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';
    
    notes.forEach(note => {
        if (note.type === 'pdf') {
            const pdfDiv = document.createElement('div');
            pdfDiv.className = 'pdf-item';
            pdfDiv.innerHTML = `
                <div class="pdf-name" onclick="viewPdf('${note.filename}', '${note.originalName}')">
                    📄 ${note.originalName}
                </div>
                <div class="note-date">Uploaded: ${new Date(note.uploadDate).toLocaleDateString()}</div>
            `;
            notesList.appendChild(pdfDiv);
        } else {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'note-item';
            noteDiv.innerHTML = `
                <div class="note-title">${note.title}</div>
                <div class="note-date">${note.date}</div>
                <div class="note-content">${note.content}</div>
            `;
            notesList.appendChild(noteDiv);
        }
    });
}

function viewPdf(filename, originalName) {
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfFrame = document.getElementById('pdfFrame');
    const pdfTitle = document.getElementById('pdfTitle');
    
    pdfFrame.src = `${API_BASE}/pdf/${filename}`;
    pdfTitle.textContent = originalName;
    pdfViewer.style.display = 'block';
}

function closePdfViewer() {
    document.getElementById('pdfViewer').style.display = 'none';
    document.getElementById('pdfFrame').src = '';
}

// Calculator Functions
function appendCalc(value) {
    document.getElementById('calcDisplay').value += value;
}

function clearCalc() {
    document.getElementById('calcDisplay').value = '';
}

function deleteLast() {
    const display = document.getElementById('calcDisplay');
    display.value = display.value.slice(0, -1);
}

function calculate() {
    const display = document.getElementById('calcDisplay');
    try {
        display.value = eval(display.value);
    } catch (error) {
        display.value = 'Error';
    }
}

// Google Drive API Functions
function initializeGoogleAPI() {
    if (typeof gapi !== 'undefined') {
        gapi.load('api:auth2', initializeGapiClient);
    }
}

function initializeGapiClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: [DISCOVERY_DOC],
        scope: SCOPES
    }).then(() => {
        googleAuth = gapi.auth2.getAuthInstance();
    });
}

// PDF Upload Functions
async function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('username', currentUser);
        
        try {
            const response = await fetch(`${API_BASE}/upload-pdf`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                showStatus('PDF uploaded successfully!', 'success');
                document.getElementById('saveToDriveBtn').style.display = 'inline-block';
                await loadNotes();
            } else {
                showStatus('Failed to upload PDF', 'error');
            }
        } catch (error) {
            showStatus('Upload error. Please try again.', 'error');
        }
    } else {
        showStatus('Please select a valid PDF file', 'error');
    }
}

function saveToGoogleDrive() {
    if (!googleAuth.isSignedIn.get()) {
        googleAuth.signIn().then(() => {
            uploadToGoogleDrive();
        }).catch(error => {
            showStatus('Google Drive authentication failed', 'error');
        });
    } else {
        uploadToGoogleDrive();
    }
}

function uploadToGoogleDrive() {
    const userPdfs = uploadedPdfs[currentUser];
    if (!userPdfs || userPdfs.length === 0) {
        showStatus('No PDFs to upload', 'error');
        return;
    }
    
    const latestPdf = userPdfs[userPdfs.length - 1];
    
    // Convert base64 to blob
    const base64Data = latestPdf.data.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'application/pdf'});
    
    const metadata = {
        'name': latestPdf.name,
        'parents': ['appDataFolder']
    };
    
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', blob);
    
    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + googleAuth.currentUser.get().getAuthResponse().access_token
        }),
        body: form
    }).then(response => {
        if (response.ok) {
            showStatus('PDF saved to Google Drive successfully!', 'success');
        } else {
            showStatus('Failed to save to Google Drive', 'error');
        }
    }).catch(error => {
        showStatus('Error uploading to Google Drive', 'error');
    });
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = message;
    statusDiv.className = type;
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}