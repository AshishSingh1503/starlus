const API_BASE = 'http://localhost:3000/api';
let currentUser = null;
let token = null;
let isDrawing = false;
let canvas, ctx;

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupCanvas();
});

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerBtn').addEventListener('click', handleRegister);
    document.getElementById('logoutBtn').addEventListener('click', logout);

    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', switchTool);
    });

    document.getElementById('newNotebook').addEventListener('click', createNotebook);
    document.getElementById('clearBoard').addEventListener('click', clearBoard);
    document.getElementById('convertText').addEventListener('click', convertHandwriting);
    document.getElementById('startSpeech').addEventListener('click', startSpeechRecognition);

    document.getElementById('saveNote').addEventListener('click', saveNote);
    document.getElementById('uploadPdfBtn').addEventListener('click', () => {
        document.getElementById('pdfUpload').click();
    });
    document.getElementById('pdfUpload').addEventListener('change', handlePdfUpload);
    document.getElementById('closePdf').addEventListener('click', closePdfViewer);
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            token = data.token;
            showDashboard();
        } else {
            showMessage(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Connection error. Please try again.', 'error');
    }
}

async function handleRegister() {
    const username = prompt('Enter username:');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!username || !email || !password) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
        } else {
            showMessage(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Connection error. Please try again.', 'error');
    }
}

function logout() {
    currentUser = null;
    token = null;
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

function showDashboard() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    document.getElementById('userDisplay').textContent = currentUser.username;
    loadNotebooks();
    loadNotes();
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = type;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = '';
    }, 3000);
}

function switchTool(e) {
    const toolName = e.target.dataset.tool;
    
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    document.querySelectorAll('.tool').forEach(tool => tool.classList.remove('active'));
    document.getElementById(toolName + 'Tool').classList.add('active');
}

async function loadNotebooks() {
    try {
        const response = await fetch(`${API_BASE}/notebooks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const notebooks = await response.json();
        
        const select = document.getElementById('notebookSelect');
        select.innerHTML = '<option value="">Select Notebook</option>';
        
        notebooks.forEach(notebook => {
            const option = document.createElement('option');
            option.value = notebook._id;
            option.textContent = notebook.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load notebooks:', error);
    }
}

async function createNotebook() {
    const name = prompt('Enter notebook name:');
    if (!name) return;

    try {
        const response = await fetch(`${API_BASE}/notebooks`, {
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
}

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
    const sampleTexts = [
        "This is converted handwritten text.",
        "Mathematical equation: x² + 2x + 1 = 0",
        "Notes from today's lesson.",
        "Important formulas and concepts."
    ];
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    document.getElementById('convertedText').innerHTML = `<strong>Converted Text:</strong><br>${randomText}`;
}

function startSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('convertedText').innerHTML = `<strong>Speech to Text:</strong><br>${transcript}`;
        };
        
        recognition.onerror = function(event) {
            document.getElementById('convertedText').innerHTML = `<strong>Error:</strong><br>Speech recognition failed: ${event.error}`;
        };
        
        recognition.start();
    } else {
        document.getElementById('convertedText').innerHTML = '<strong>Error:</strong><br>Speech recognition not supported in this browser';
    }
}

async function saveNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    
    if (!title || !content) {
        alert('Please enter both title and content');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });

        if (response.ok) {
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').value = '';
            loadNotes();
            alert('Note saved successfully!');
        }
    } catch (error) {
        alert('Failed to save note');
    }
}

async function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);

    try {
        const response = await fetch(`${API_BASE}/notes/upload-pdf`, {
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
}

async function loadNotes() {
    try {
        const response = await fetch(`${API_BASE}/notes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const notes = await response.json();
        
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = '';
        
        notes.forEach(note => {
            const noteDiv = document.createElement('div');
            
            if (note.type === 'pdf') {
                noteDiv.className = 'note-item pdf-item';
                noteDiv.innerHTML = `
                    <div class="pdf-name" onclick="viewPdf('${note.filename}', '${note.originalName}')">
                        📄 ${note.originalName}
                    </div>
                    <div class="note-date">${new Date(note.createdAt).toLocaleDateString()}</div>
                `;
            } else {
                noteDiv.className = 'note-item';
                noteDiv.innerHTML = `
                    <div class="note-title">${note.title}</div>
                    <div class="note-content">${note.content}</div>
                    <div class="note-date">${new Date(note.createdAt).toLocaleDateString()}</div>
                `;
            }
            
            notesList.appendChild(noteDiv);
        });
    } catch (error) {
        console.error('Failed to load notes:', error);
    }
}

function viewPdf(filename, originalName) {
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfFrame = document.getElementById('pdfFrame');
    const pdfTitle = document.getElementById('pdfTitle');
    
    pdfFrame.src = `${API_BASE}/notes/pdf/${filename}`;
    pdfTitle.textContent = originalName;
    pdfViewer.style.display = 'block';
}

function closePdfViewer() {
    document.getElementById('pdfViewer').style.display = 'none';
    document.getElementById('pdfFrame').src = '';
}

// Calculator functions
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