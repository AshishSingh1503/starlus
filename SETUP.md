# Starlus - Quick Setup Guide

## For New Users (First Time Setup)

### Step 1: Prerequisites
Install these on your computer:
- **Node.js 16+**: https://nodejs.org/
- **MongoDB**: https://www.mongodb.com/try/download/community
- **Git**: https://git-scm.com/

### Step 2: Clone & Setup
```bash
# Clone the repository
git clone <repository-url>
cd starlus-1

# Install all dependencies (this may take 2-3 minutes)
npm run setup-all
```

### Step 3: Configure Environment
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Step 4: Start MongoDB
- **Windows**: Start MongoDB service from Services
- **Mac**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### Step 5: Run Application
```bash
# Option 1: Run both servers with one command
npm run dev

# Option 2: Run servers separately
# Terminal 1:
npm run start-backend

# Terminal 2:
npm run start-frontend
```

### Step 6: Access Application
Open your browser and go to: **http://localhost:3001**

## Quick Commands

```bash
# Install all dependencies
npm run setup-all

# Start both servers
npm run dev

# Start backend only
npm run start-backend

# Start frontend only  
npm run start-frontend

# Clean and reinstall everything
npm run reset
```

## Troubleshooting

**Port 3000/3001 already in use?**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**MongoDB not connecting?**
- Make sure MongoDB service is running
- Check `backend/.env` for correct `MONGODB_URI`

**Dependencies not installing?**
```bash
npm run clean
npm run setup-all
```

## Default Credentials
- No default users - register a new account when you first access the app
- MongoDB runs on default port 27017
- Backend API runs on port 3000
- Frontend runs on port 3001

## Features Available
✅ User Registration/Login  
✅ Multi-page Writing Board  
✅ Speech to Text  
✅ PDF Upload & Viewing  
✅ Notes Management  
✅ Calculator  
✅ Real-time Sync  

Need help? Check the main README.md or create an issue on GitHub.