# LLM Backend Connection Fix

## Problem Identified

The React Native app was showing **"Sin conexión a internet"** error when trying to connect to the LLM backend at `https://adhd-chatbot-api.onrender.com/api/chat`.

### Root Cause

**The issue was in `/src/services/chatService.js` lines 15-17:**

```javascript
// OLD CODE (BROKEN):
const API_URL = __DEV__
  ? 'http://localhost:3000/api/chat' // Development (local backend)
  : 'https://adhd-chatbot-api.onrender.com/api/chat'; // Production
```

**Why it failed:**
1. In Expo Go tunnel mode, `__DEV__` is ALWAYS `true` (development mode)
2. The app tried to connect to `http://localhost:3000` which doesn't exist on the phone/emulator
3. This triggered "Network request failed" → "Sin conexión a internet"

## Solution Applied

### 1. Fixed API URL Configuration

**File**: `/home/nicolas/Trabajo Final de Grado/adhd-focus-app/src/services/chatService.js`

Changed the API URL detection logic to use an explicit flag instead of `__DEV__`:

```javascript
// NEW CODE (FIXED):
const USE_LOCAL_BACKEND = false; // Set to true only if running backend locally

const API_URL = USE_LOCAL_BACKEND
  ? 'http://localhost:3000/api/chat' // Development (local backend - only for emulator)
  : 'https://adhd-chatbot-api.onrender.com/api/chat'; // Production (Render.com)
```

### 2. Added Debug Logging

Added console logs to help track API calls:

```javascript
async function callLLMAPI(userMessage, context) {
  // Log API URL for debugging
  console.log('[ChatService] Calling LLM API:', API_URL);

  // ... rest of code
}
```

Enhanced error logging:

```javascript
console.error('[ChatService] LLM API Error:', {
  name: error.name,
  message: error.message,
  stack: error.stack,
});
```

### 3. Added Android Network Permissions

**File**: `/home/nicolas/Trabajo Final de Grado/adhd-focus-app/app.json`

Added explicit network permissions for Android:

```json
"android": {
  "permissions": [
    "INTERNET",
    "ACCESS_NETWORK_STATE"
  ],
  "usesCleartextTraffic": false
}
```

Note: `usesCleartextTraffic: false` ensures only HTTPS connections (secure).

## How to Test the Fix

### Option 1: Using Test Script

```bash
cd /home/nicolas/Trabajo\ Final\ de\ Grado/adhd-focus-app
node testConnection.js
```

This will test both the health endpoint and chat endpoint.

### Option 2: Using curl

```bash
# Test health endpoint
curl https://adhd-chatbot-api.onrender.com/health

# Test chat endpoint
curl -X POST https://adhd-chatbot-api.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "No sé por dónde empezar",
    "context": {
      "tasks": [],
      "pomodoroSessions": 0,
      "hasPendingTasks": false
    }
  }'
```

### Option 3: In the App

1. **Restart Expo**:
   ```bash
   cd /home/nicolas/Trabajo\ Final\ de\ Grado/adhd-focus-app
   npm start
   ```

2. **Watch the console logs**:
   - Look for: `[ChatService] Calling LLM API: https://adhd-chatbot-api.onrender.com/api/chat`
   - This confirms the correct URL is being used

3. **Test in the app**:
   - Go to Chat screen
   - Send a message like "No sé por dónde empezar"
   - You should see:
     - Loading indicator ("Pensando...")
     - LLM badge "✨ LLM" on the response
     - Natural language response from the backend

## Expected Behavior After Fix

### Success Scenario

**Console Logs:**
```
[ChatService] Calling LLM API: https://adhd-chatbot-api.onrender.com/api/chat
```

**UI:**
```
User: "No sé por dónde empezar"

Assistant (✨ LLM):
"Entiendo que te sientes abrumado. Comienza con una tarea
simple, como planificar una comida o hacer una lista breve..."

🔓 Parálisis ejecutiva
```

### Fallback Scenario (if backend is down)

**Console Logs:**
```
[ChatService] Calling LLM API: https://adhd-chatbot-api.onrender.com/api/chat
[ChatService] LLM API Error: { name: 'TypeError', message: 'Network request failed' }
LLM API failed, using fallback: Sin conexión a internet
```

**UI:**
```
User: "No sé por dónde empezar"

Assistant (Fallback):
"La parálisis ejecutiva es común en TDAH. Estrategia:

1. Elige UNA tarea (la más pequeña)
2. Comprométete a solo 5 minutos
3. Usa el temporizador Pomodoro

No pienses en terminarla, solo en EMPEZAR."
```

## Verification Checklist

- [x] Fixed `chatService.js` to use `USE_LOCAL_BACKEND` instead of `__DEV__`
- [x] Set `USE_LOCAL_BACKEND = false` to force production URL
- [x] Added debug logging to track API calls
- [x] Added enhanced error logging
- [x] Added Android network permissions to `app.json`
- [x] Backend CORS allows requests with no origin (mobile apps)
- [x] Created `testConnection.js` for easy testing
- [x] Verified backend is accessible from Node.js

## Architecture Notes

### Why the Original Code Failed

**Expo Go Behavior:**
- Expo Go ALWAYS runs in development mode (`__DEV__ === true`)
- Even with tunnel mode (`exp://qoyt4y0-anonymous-8081.exp.direct`)
- This is different from a production build (APK/IPA)

**Network Access in Expo Go:**
- Localhost (`http://localhost:3000`) is NOT accessible from:
  - Physical device (different machine)
  - Android emulator (unless using `10.0.2.2:3000`)
  - iOS simulator (unless using computer's local IP)
- HTTPS URLs work normally from anywhere

### CORS Configuration (Backend)

The backend at `/home/nicolas/Trabajo Final de Grado/adhd-chatbot-backend/server.js` has:

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    // ... rest of logic
  },
  credentials: true,
};
```

This is CORRECT for React Native apps because:
- React Native fetch requests often have NO `Origin` header
- Mobile apps are not browsers and don't follow same-origin policy
- The backend explicitly allows requests with no origin

## Troubleshooting

### If you still get "Sin conexión a internet"

1. **Verify the URL is correct**:
   ```bash
   cd /home/nicolas/Trabajo\ Final\ de\ Grado/adhd-focus-app
   grep "const API_URL" src/services/chatService.js
   ```
   Should show: `https://adhd-chatbot-api.onrender.com/api/chat`

2. **Check backend is running**:
   ```bash
   curl https://adhd-chatbot-api.onrender.com/health
   ```
   Should return: `{"status":"ok",...}`

3. **Check console logs in Expo**:
   - Look for `[ChatService] Calling LLM API: ...`
   - Look for full error details in `[ChatService] LLM API Error: ...`

4. **Test with physical device on same WiFi**:
   - Scan QR code from Expo
   - Try sending a chat message
   - Check if it works

5. **Verify app.json has permissions**:
   ```bash
   grep -A 5 "permissions" /home/nicolas/Trabajo\ Final\ de\ Grado/adhd-focus-app/app.json
   ```
   Should show: `["INTERNET", "ACCESS_NETWORK_STATE"]`

### If backend is timing out

The backend might be "sleeping" on Render's free tier:

1. **Wake up the backend**:
   ```bash
   curl https://adhd-chatbot-api.onrender.com/health
   ```

2. **Wait 30-60 seconds** for the container to start

3. **Try chat again** in the app

## For Development with Local Backend

If you want to test with a local backend running on your machine:

1. **Start local backend**:
   ```bash
   cd /home/nicolas/Trabajo\ Final\ de\ Grado/adhd-chatbot-backend
   npm start
   ```

2. **Update chatService.js**:
   ```javascript
   const USE_LOCAL_BACKEND = true; // Enable local mode
   ```

3. **Get your machine's IP**:
   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

4. **Update localhost to your IP**:
   ```javascript
   const API_URL = USE_LOCAL_BACKEND
     ? 'http://192.168.1.XXX:3000/api/chat' // Replace with your IP
     : 'https://adhd-chatbot-api.onrender.com/api/chat';
   ```

5. **Restart Expo** and test

**Note**: For Android emulator specifically, use `http://10.0.2.2:3000/api/chat` instead of localhost.

## Files Modified

1. `/home/nicolas/Trabajo Final de Grado/adhd-focus-app/src/services/chatService.js`
   - Lines 13-23: Changed `__DEV__` to `USE_LOCAL_BACKEND`
   - Line 62: Added API URL debug log
   - Lines 123-127: Added enhanced error logging

2. `/home/nicolas/Trabajo Final de Grado/adhd-focus-app/app.json`
   - Lines 24-28: Added Android network permissions

3. `/home/nicolas/Trabajo Final de Grado/adhd-focus-app/testConnection.js` (NEW)
   - Connection test script

4. `/home/nicolas/Trabajo Final de Grado/adhd-focus-app/LLM_CONNECTION_FIX.md` (NEW)
   - This documentation file

## Next Steps

1. **Restart the app**:
   ```bash
   cd /home/nicolas/Trabajo\ Final\ de\ Grado/adhd-focus-app
   npm start
   ```

2. **Clear the app cache** (press `Shift + C` in Expo terminal)

3. **Reload the app** (press `R` in Expo terminal, or shake device and select "Reload")

4. **Test the chat**:
   - Go to Chat screen
   - Send: "No sé por dónde empezar"
   - Watch for "✨ LLM" badge on response

5. **Monitor console logs** for:
   - `[ChatService] Calling LLM API: https://adhd-chatbot-api.onrender.com/api/chat`
   - Success or error messages

## Success Criteria

✅ Console shows correct API URL (production URL, not localhost)
✅ Chat requests complete without "Sin conexión a internet" error
✅ Responses show "✨ LLM" badge indicating backend is being used
✅ Response times are 1-3 seconds (LLM processing)
✅ Responses are natural language (not just pattern-based templates)

---

**Fixed on**: November 15, 2025
**Fixed by**: Claude Code
**Issue**: `__DEV__` causing localhost connection attempts in Expo Go
**Solution**: Explicit `USE_LOCAL_BACKEND` flag set to `false`