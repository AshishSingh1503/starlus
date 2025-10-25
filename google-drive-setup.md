# Google Drive API Setup Instructions

To enable PDF saving to Google Drive, you need to set up Google Drive API credentials:

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Drive API

## Step 2: Create Credentials
1. Go to "Credentials" in the left sidebar
2. Click "Create Credentials" → "API Key"
3. Copy the API Key
4. Click "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen if prompted
6. Set Application type to "Web application"
7. Add your domain to "Authorized JavaScript origins" (e.g., http://localhost:8000)
8. Copy the Client ID

## Step 3: Update Configuration
Replace these values in `script.js`:
```javascript
const CLIENT_ID = 'your-actual-client-id-here';
const API_KEY = 'your-actual-api-key-here';
```

## Step 4: Test the Feature
1. Open the webapp
2. Go to Notes section
3. Upload a PDF file
4. Click "Save to Google Drive"
5. Authenticate with Google when prompted
6. PDF will be saved to your Google Drive

## Security Note
For production use, implement proper OAuth flow and secure credential storage.