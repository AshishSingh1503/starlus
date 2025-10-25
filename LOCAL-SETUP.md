# Local Setup Instructions

## Quick Start (Easiest)

1. **Double-click `run-local.bat`**
   - This will install all dependencies and start both servers
   - Wait for both servers to start
   - Open http://localhost:3001 in your browser

## Manual Setup

### Prerequisites
- Node.js 16+ (Download from https://nodejs.org)

### Step 1: Backend
```bash
cd backend
npm install
npm start
```

### Step 2: Frontend (New Terminal)
```bash
cd frontend
npm install
npm start
```

### Step 3: Access Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

## Features Available Locally

✅ **Working Features:**
- User registration and login
- Writing board with drawing
- Speech to text (Chrome/Edge only)
- Text notes creation and storage
- PDF upload and viewing
- Calculator
- Real-time sync between browser tabs

⚠️ **Limitations:**
- No MongoDB (uses in-memory storage)
- Data resets when server restarts
- Google Drive integration requires setup

## Troubleshooting

**Port Already in Use:**
- Close other applications using ports 3000 or 3001
- Or change ports in the .env files

**Speech Recognition Not Working:**
- Use Chrome or Edge browser
- Allow microphone permissions
- Ensure HTTPS or localhost

**PDF Upload Issues:**
- Check file size (max 10MB)
- Only PDF files are supported

## Next Steps

For production deployment with persistent database:
1. Install MongoDB
2. Update MONGODB_URI in backend/.env
3. Follow full setup in main README.md