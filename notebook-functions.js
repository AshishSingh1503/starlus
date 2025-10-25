// Socket.io initialization
function initializeSocket() {
    socket = io('http://localhost:3000');
    
    socket.on('notebook-updated', (data) => {
        if (data.username === currentUser) {
            notebooks = data.notebooks;
            updateNotebookSelect();
        }
    });
    
    socket.on('notebook-sync', (data) => {
        if (data.username === currentUser && data.notebookId === currentNotebook?.id) {
            currentNotebook = data.notebook;
            loadCurrentPage();
        }
    });
    
    socket.on('notes-updated', (data) => {
        if (data.username === currentUser) {
            notes = data.notes;
            displayNotes();
        }
    });
}

// Notebook Management
async function loadNotebooks() {
    try {
        const response = await fetch(`${API_BASE}/notebooks/${currentUser}`);
        notebooks = await response.json();
        updateNotebookSelect();
    } catch (error) {
        console.error('Failed to load notebooks:', error);
    }
}

function updateNotebookSelect() {
    const select = document.getElementById('notebookSelect');
    select.innerHTML = '<option value="">Select Notebook</option>';
    
    notebooks.forEach(notebook => {
        const option = document.createElement('option');
        option.value = notebook.id;
        option.textContent = notebook.name;
        select.appendChild(option);
    });
}

async function createNotebook() {
    const name = prompt('Enter notebook name:');
    if (!name) return;
    
    const notebook = {
        name,
        pages: [{ drawings: [], text: '' }],
        createdAt: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_BASE}/notebooks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, notebook })
        });
        
        const savedNotebook = await response.json();
        notebooks.push(savedNotebook);
        updateNotebookSelect();
        
        document.getElementById('notebookSelect').value = savedNotebook.id;
        loadNotebook();
    } catch (error) {
        alert('Failed to create notebook');
    }
}

function loadNotebook() {
    const notebookId = document.getElementById('notebookSelect').value;
    if (!notebookId) {
        currentNotebook = null;
        currentPage = 0;
        clearCanvas();
        updatePageInfo();
        return;
    }
    
    currentNotebook = notebooks.find(n => n.id == notebookId);
    currentPage = 0;
    loadCurrentPage();
    updatePageInfo();
}

async function saveNotebook() {
    if (!currentNotebook) return;
    
    // Save current page before saving notebook
    saveCurrentPage();
    
    try {
        await fetch(`${API_BASE}/notebooks/${currentNotebook.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, notebook: currentNotebook })
        });
        
        socket.emit('notebook-change', {
            username: currentUser,
            notebookId: currentNotebook.id,
            notebook: currentNotebook
        });
        
        showStatus('Notebook saved successfully!', 'success');
    } catch (error) {
        showStatus('Failed to save notebook', 'error');
    }
}

// Page Management
function addPage() {
    if (!currentNotebook) {
        alert('Please select or create a notebook first');
        return;
    }
    
    saveCurrentPage();
    currentNotebook.pages.push({ drawings: [], text: '' });
    currentPage = currentNotebook.pages.length - 1;
    clearCanvas();
    updatePageInfo();
}

function changePage(direction) {
    if (!currentNotebook) return;
    
    saveCurrentPage();
    const newPage = currentPage + direction;
    
    if (newPage >= 0 && newPage < currentNotebook.pages.length) {
        currentPage = newPage;
        loadCurrentPage();
        updatePageInfo();
    }
}

function clearPage() {
    if (!currentNotebook) return;
    
    clearCanvas();
    currentNotebook.pages[currentPage] = { drawings: [], text: '' };
    document.getElementById('convertedText').innerHTML = '';
}

function saveCurrentPage() {
    if (!currentNotebook || !currentNotebook.pages[currentPage]) return;
    
    currentNotebook.pages[currentPage].drawings = drawingData;
    currentNotebook.pages[currentPage].text = document.getElementById('convertedText').innerHTML;
}

function loadCurrentPage() {
    if (!currentNotebook || !currentNotebook.pages[currentPage]) return;
    
    clearCanvas();
    drawingData = currentNotebook.pages[currentPage].drawings || [];
    
    // Redraw all strokes
    drawingData.forEach(stroke => {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
    });
    
    document.getElementById('convertedText').innerHTML = currentNotebook.pages[currentPage].text || '';
}

function updatePageInfo() {
    const info = document.getElementById('pageInfo');
    if (currentNotebook) {
        info.textContent = `Page ${currentPage + 1} of ${currentNotebook.pages.length}`;
    } else {
        info.textContent = 'No notebook selected';
    }
}

// Enhanced Drawing Functions
function setupCanvas() {
    canvas = document.getElementById('drawingBoard');
    ctx = canvas.getContext('2d');
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    drawingData = [];
}

let currentStroke = null;

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    currentStroke = { points: [{ x, y }] };
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing || !currentStroke) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    currentStroke.points.push({ x, y });
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    if (isDrawing && currentStroke) {
        drawingData.push(currentStroke);
        currentStroke = null;
        
        // Auto-save every few strokes
        if (drawingData.length % 5 === 0) {
            saveCurrentPage();
            if (currentNotebook) {
                socket.emit('notebook-change', {
                    username: currentUser,
                    notebookId: currentNotebook.id,
                    notebook: currentNotebook
                });
            }
        }
    }
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                     e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingData = [];
}