# Starlus Android App Setup Guide

## Prerequisites
1. **Android Studio** - [Download here](https://developer.android.com/studio)
2. **Node.js 16+** - Already installed
3. **Java Development Kit (JDK 11+)**
4. **Android SDK** (installed with Android Studio)

## Setup Steps

### 1. Configure Android Studio
1. Open Android Studio
2. Go to **Tools > SDK Manager**
3. Install **Android SDK Platform 33** (or latest)
4. Install **Android SDK Build-Tools**
5. Create an **Android Virtual Device (AVD)**:
   - Go to **Tools > AVD Manager**
   - Click **Create Virtual Device**
   - Choose **Pixel 4** or similar
   - Select **API Level 33** (Android 13)
   - Click **Finish**

### 2. Set Environment Variables
Add these to your system environment variables:

**Windows:**
```bash
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-11.0.x
```

**Add to PATH:**
```bash
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

### 3. Start Backend Server
```bash
# Terminal 1: Start backend (keep running)
cd c:\starlus-1\backend
node src/server.js
```

### 4. Run Android App
```bash
# Terminal 2: Start Android app
cd c:\starlus-1\StarlusMobile

# Start Metro bundler
npx react-native start

# Terminal 3: Run on Android (new terminal)
cd c:\starlus-1\StarlusMobile
npx react-native run-android
```

## Alternative Method (Android Studio)

### 1. Open Project in Android Studio
1. Open Android Studio
2. Click **Open an existing project**
3. Navigate to `c:\starlus-1\StarlusMobile\android`
4. Click **OK**

### 2. Run from Android Studio
1. Wait for Gradle sync to complete
2. Start your AVD (Android emulator)
3. Click the **Run** button (green play icon)
4. Select your emulator device

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
npx react-native start --reset-cache
```

### Build Issues
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Connection Issues
- Make sure backend is running on `http://localhost:3000`
- Android emulator uses `10.0.2.2` to access host machine's localhost
- App is configured to connect to `http://10.0.2.2:3000/api`

### Port Issues
```bash
# Kill processes on port 8081 (Metro)
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

## Features Available in Mobile App
✅ User Login  
✅ Notes Management  
✅ Create/View Notes  
✅ Writing Board (placeholder)  
✅ Responsive Mobile UI  

## Default Test Credentials
- **Email**: Any email (e.g., test@example.com)
- **Password**: Any password (e.g., password123)

## App Structure
```
StarlusMobile/
├── android/          # Android native code
├── ios/              # iOS native code (for future)
├── App.tsx           # Main app component
├── package.json      # Dependencies
└── metro.config.js   # Metro bundler config
```

## Next Steps
1. Start Android emulator
2. Run `npx react-native run-android`
3. App will install and launch automatically
4. Login with any credentials
5. Create and manage notes

The mobile app connects to your existing backend server and provides a native Android experience for the Starlus learning platform.