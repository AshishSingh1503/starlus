const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.static('.'));

// Storage setup
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Data storage
let users = {};
let notebooks = {};
let notes = {};

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Routes
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(400).json({ error: 'User exists' });
    }
    users[username] = await bcrypt.hash(password, 10);
    res.json({ success: true });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (users[username] && await bcrypt.compare(password, users[username])) {
        res.json({ success: true, username });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.get('/api/notebooks/:username', (req, res) => {
    const { username } = req.params;
    res.json(notebooks[username] || []);
});

app.post('/api/notebooks', (req, res) => {
    const { username, notebook } = req.body;
    if (!notebooks[username]) notebooks[username] = [];
    notebook.id = Date.now();
    notebooks[username].push(notebook);
    io.emit('notebook-updated', { username, notebooks: notebooks[username] });
    res.json(notebook);
});

app.put('/api/notebooks/:id', (req, res) => {
    const { id } = req.params;
    const { username, notebook } = req.body;
    if (notebooks[username]) {
        const index = notebooks[username].findIndex(n => n.id == id);
        if (index !== -1) {
            notebooks[username][index] = { ...notebooks[username][index], ...notebook };
            io.emit('notebook-updated', { username, notebooks: notebooks[username] });
            res.json(notebooks[username][index]);
        }
    }
});

app.post('/api/upload-pdf', upload.single('pdf'), (req, res) => {
    const { username } = req.body;
    const pdfData = {
        id: Date.now(),
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        uploadDate: new Date().toISOString()
    };
    
    if (!notes[username]) notes[username] = [];
    notes[username].push({ type: 'pdf', ...pdfData });
    
    io.emit('notes-updated', { username, notes: notes[username] });
    res.json(pdfData);
});

app.get('/api/pdf/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    res.sendFile(filePath);
});

app.get('/api/notes/:username', (req, res) => {
    res.json(notes[req.params.username] || []);
});

// Socket.io for real-time sync
io.on('connection', (socket) => {
    socket.on('join-room', (username) => {
        socket.join(username);
    });

    socket.on('notebook-change', (data) => {
        socket.to(data.username).emit('notebook-sync', data);
    });

    socket.on('note-change', (data) => {
        if (!notes[data.username]) notes[data.username] = [];
        const noteIndex = notes[data.username].findIndex(n => n.id === data.note.id);
        if (noteIndex !== -1) {
            notes[data.username][noteIndex] = data.note;
        } else {
            notes[data.username].push(data.note);
        }
        socket.to(data.username).emit('notes-sync', data);
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});