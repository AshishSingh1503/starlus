# Starlus - Learning Platform

A modern web application for students with interactive learning tools including multi-page writing boards, real-time synchronization, and comprehensive note management.

## Features

### Core Functionality
- **Student Authentication**: Secure JWT-based registration and login
- **Multi-page Writing Board**: Tablet-like notebook experience with unlimited pages
- **Real-time Synchronization**: Instant sync across devices using Socket.io
- **Speech to Text**: Voice recognition for note-taking
- **PDF Management**: Upload, view, and manage PDF documents
- **Notes Storage**: Create, edit, and organize text notes
- **Mathematical Calculator**: Built-in calculator for computations

### Advanced Features
- **Google Drive Integration**: Save PDFs directly to Google Drive
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Offline Support**: Local storage fallback for offline usage
- **File Management**: Secure file upload and storage
- **User Profiles**: Personal dashboards and settings

## Technology Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Multer** - File upload handling
- **Winston** - Logging
- **Helmet** - Security middleware

### Frontend
- **React 18** - UI framework
- **Material-UI** - Component library
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates
- **Fabric.js** - Canvas drawing
- **React PDF** - PDF viewing

### DevOps
- **Docker** + **Docker Compose** - Containerization
- **ESLint** - Code linting
- **Jest** - Testing framework

## Quick Start

### Prerequisites
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)
- **Git** - [Download here](https://git-scm.com/)

### One-Click Setup (Recommended)

**Windows Users:**
```bash
# Clone and navigate to project
git clone <your-repository-url>
cd starlus-1

# Run the automated setup script
quick-start.bat
```

**Mac/Linux Users:**
```bash
# Clone and navigate to project
git clone <your-repository-url>
cd starlus-1

# Install all dependencies and start servers
npm run setup-all
```

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd starlus-1
   ```

2. **Install all dependencies at once**
   ```bash
   # Install backend dependencies
   cd backend && npm install --legacy-peer-deps
   
   # Install frontend dependencies
   cd ../frontend && npm install --legacy-peer-deps
   
   # Return to root
   cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   
   # Frontend environment
   cd ../frontend
   cp .env.example .env
   cd ..
   ```

4. **Start MongoDB**
   - **Local MongoDB**: Start MongoDB service on your system
   - **MongoDB Atlas**: Update `MONGODB_URI` in `backend/.env` with your Atlas connection string

5. **Start the application**
   ```bash
   # Terminal 1: Start Backend
   cd backend
   node src/server.js
   
   # Terminal 2: Start Frontend (new terminal)
   cd frontend
   npm start
   ```

6. **Access the application**
   - **Frontend**: http://localhost:3001
   - **Backend API**: http://localhost:3000
   - **Health Check**: http://localhost:3000/health

### Docker Setup (Alternative)

1. **Install Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - **Application**: http://localhost
   - **API**: http://localhost:3000

## Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/starlus
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_API_KEY=your-google-api-key
UPLOAD_MAX_SIZE=10485760
CORS_ORIGIN=http://localhost:3001
LOG_LEVEL=info
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_GOOGLE_API_KEY=your-google-api-key
```

## API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Notebooks
- `GET /api/notebooks` - Get user notebooks
- `POST /api/notebooks` - Create notebook
- `GET /api/notebooks/:id` - Get specific notebook
- `PUT /api/notebooks/:id` - Update notebook
- `DELETE /api/notebooks/:id` - Delete notebook

### Notes
- `GET /api/notes` - Get user notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/upload-pdf` - Upload PDF
- `GET /api/notes/pdf/:filename` - View PDF

## Security Features

- **JWT Authentication** with secure token handling
- **Input Validation** using Joi schemas
- **Rate Limiting** to prevent abuse
- **Helmet.js** for security headers
- **CORS** configuration
- **File Upload Validation** with size and type restrictions
- **Error Handling** without information leakage

## Performance Optimizations

- **Database Indexing** for fast queries
- **Compression** middleware
- **Caching** strategies
- **Lazy Loading** for large datasets
- **Image Optimization** for uploads
- **Bundle Splitting** for frontend

## Monitoring & Logging

- **Winston** structured logging
- **Morgan** HTTP request logging
- **Health Check** endpoint
- **Error Tracking** with stack traces
- **Performance Metrics** collection

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export MONGODB_URI=your-production-mongodb-uri
   export JWT_SECRET=your-production-jwt-secret
   ```

2. **Build and Deploy**
   ```bash
   # Build frontend
   cd frontend
   npm run build

   # Start backend
   cd ../backend
   npm start
   ```

### Docker Production

```bash
# Build and start production containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill processes on ports 3000/3001
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

**MongoDB Connection Issues:**
- Ensure MongoDB is running locally OR
- Update `MONGODB_URI` in `backend/.env` with correct connection string

**Dependencies Issues:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Frontend Won't Start:**
```bash
# Set explicit port
set PORT=3001 && npm start  # Windows
PORT=3001 npm start         # Mac/Linux
```

### Quick Scripts

Add these to root `package.json` for easier management:
```json
{
  "scripts": {
    "setup-all": "cd backend && npm install --legacy-peer-deps && cd ../frontend && npm install --legacy-peer-deps",
    "start-backend": "cd backend && node src/server.js",
    "start-frontend": "cd frontend && npm start",
    "dev": "concurrently \"npm run start-backend\" \"npm run start-frontend\""
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints
- Check the Troubleshooting section above

## First Time Setup Checklist

- [ ] Node.js 16+ installed
- [ ] MongoDB installed/configured
- [ ] Git installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install` in both backend and frontend)
- [ ] Environment files copied (`.env.example` → `.env`)
- [ ] MongoDB running
- [ ] Backend started (port 3000)
- [ ] Frontend started (port 3001)
- [ ] Application accessible at http://localhost:3001

## Roadmap

- [ ] Mobile app development
- [ ] Advanced collaboration features
- [ ] AI-powered handwriting recognition
- [ ] Cloud storage integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support