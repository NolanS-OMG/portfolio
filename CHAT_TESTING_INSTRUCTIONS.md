# Chat Widget Testing Instructions

## 🎯 What Changed

### UI Improvements
1. **Welcome Bubble**: Now shows OUTSIDE the chat with:
   - Red badge with "1" notification
   - Profile picture
   - Welcome message
   - 4 clickable suggestion chips
   - Close button (×)

2. **No More Overlaps**: Everything is properly positioned
   - Welcome bubble: Fixed position bottom-right
   - Suggestions: Inside the welcome bubble
   - Chat widget: Standard react-chatbotify position

3. **Better UX**:
   - Click suggestion → Auto-fills and sends message
   - Click badge → Opens welcome bubble
   - First interaction → Welcome bubble disappears
   - Clear chat → Reloads everything fresh

### Technical Improvements
1. **Comprehensive Logging**:
   - `[chatApi]` - All API calls, requests, responses
   - `[useChat]` - Hook lifecycle, state changes
   - `[ChatWidget]` - UI interactions, welcome loading
   - `[Flow]` - Message processing in chatbot flow

2. **Simplified Architecture**:
   - Removed complex event handlers
   - Using pure Flow-based approach
   - Direct API calls in flow message handler
   - Better session management

---

## 🚀 Testing Steps

### 1. Start Backend
```bash
cd ../prototipo-agente  # Your backend directory
uv run python -m app.main
```

Verify it's running at `http://localhost:8000`

### 2. Start Frontend
```bash
npm run dev
```

Visit `http://localhost:5173`

### 3. Open Browser DevTools
Press **F12** and go to **Console** tab - you'll see all logs

---

## ✅ Test Checklist

### Welcome Flow
- [ ] Page loads → See `[ChatWidget] Loading welcome message...`
- [ ] Welcome bubble appears bottom-right with:
  - Profile picture
  - "Nolan's AI Assistant"
  - "Just now" timestamp
  - Red badge with "1"
  - Welcome message text
  - 4 green suggestion chips
  - Close button (×) top-right
- [ ] Welcome bubble is OUTSIDE the chat widget (no overlap)

### Suggestion Chips
- [ ] Click any suggestion chip
- [ ] See `[Suggestion] Clicked: <text>` in console
- [ ] Message appears in chat as user message
- [ ] Bot responds with answer
- [ ] Welcome bubble disappears after first interaction

### Chat Interaction
- [ ] Type "Hello" and press Enter
- [ ] See in console:
  ```
  [Flow] Processing user input: Hello
  [Flow] Calling API...
  [chatApi] Fetching http://localhost:8000/api/v1/chat
  [chatApi] Response received { status: 200, ... }
  [Flow] API response: { session_id: ..., response: ... }
  ```
- [ ] Bot types response with animation
- [ ] Message appears in chat

### Session Management
- [ ] First message creates session
- [ ] See `[Flow] Saving new session: <id>` in console
- [ ] Check localStorage: `localStorage.getItem('portfolio_chat_session')`
- [ ] Should see session ID
- [ ] Reload page (F5)
- [ ] Chat should remember history (if backend supports it)

### Language Switching
- [ ] Click EN/ES button in top nav
- [ ] Send another message
- [ ] See `[Flow] Calling API... { sessionId: ..., language: 'es' }`
- [ ] Bot responds in the selected language

### Health Check
- [ ] Every 30 seconds, see `[chatApi] Fetching http://localhost:8000/api/v1/health`
- [ ] If healthy → No warnings
- [ ] Stop backend → After ~90s (3 failed checks):
  - Red banner appears: "⚠️ Chat temporarily unavailable"
  - "Email me instead →" link visible
  - Chat input disabled with "Chat unavailable" placeholder

### Clear Chat
- [ ] Click "Clear Chat" in footer
- [ ] See `[Footer] Clearing chat...` in console
- [ ] Page reloads
- [ ] Welcome bubble appears again
- [ ] Session ID cleared from localStorage

### Error Handling
- [ ] Stop backend
- [ ] Try to send message
- [ ] See error in console: `[chatApi] Attempt 1 failed`
- [ ] Bot shows error message: "Sorry, something went wrong"

### Mobile View
- [ ] Press F12 → Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select iPhone/Android
- [ ] Welcome bubble should still be visible and functional
- [ ] Chat widget goes full-screen when opened
- [ ] Everything should be touch-friendly

---

## 🐛 Debugging Tips

### Check API Connection
```javascript
// In browser console:
console.log('API URL:', 'http://localhost:8000');
fetch('http://localhost:8000/api/v1/health')
  .then(r => r.json())
  .then(console.log);
```

### Check Session ID
```javascript
// In browser console:
localStorage.getItem('portfolio_chat_session')
```

### Check Environment Variables
```javascript
// In browser console:
console.log('Vite env:', import.meta.env);
```

### Monitor Network Requests
- F12 → Network tab
- Filter by "chat" or "api"
- Should see:
  - `GET /api/v1/health` every 30s
  - `GET /api/v1/chat/welcome` on load
  - `POST /api/v1/chat` when sending messages

### Clear Everything
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

---

## 📊 Expected Console Output

### On Page Load
```
[ChatWidget] Loading welcome message...
[chatApi] Fetching http://localhost:8000/api/v1/chat/welcome
[chatApi] Attempt 1/3 { url: ..., method: 'GET', ... }
[chatApi] Response received { status: 200, ok: true }
[chatApi] Success response: { message: '...', suggestions: [...] }
[ChatWidget] Welcome data: { message: '...', suggestions: [...] }
=== ChatWidget State ===
Messages: []
Suggestions: ['Tell me about...', ...]
Is Loading: false
Error: null
Health: { status: 'healthy', isHealthy: true }
=======================
```

### On First Message
```
[Suggestion] Clicked: Tell me about his AI experience
[Flow] Processing user input: Tell me about his AI experience
[Flow] Calling API... { sessionId: null, language: 'en' }
[chatApi] Fetching http://localhost:8000/api/v1/chat
[chatApi] Attempt 1/1 { method: 'POST', body: { message: '...' } }
[chatApi] Response received { status: 200 }
[chatApi] Success response: { session_id: '...', response: '...' }
[Flow] API response: { session_id: '...', response: '...' }
[Flow] Saving new session: <session_id>
```

---

## ❌ Common Issues

### Issue: Welcome bubble not appearing
**Check:**
1. Backend is running (`curl http://localhost:8000/api/v1/health`)
2. Console for errors
3. Network tab for failed requests

### Issue: Suggestions not clickable
**Check:**
1. z-index conflicts (should be 9998)
2. Console for `[Suggestion] Clicked:` when clicking

### Issue: Bot not responding
**Check:**
1. Console for `[Flow] API response:`
2. Network tab for POST /api/v1/chat
3. Backend logs for errors

### Issue: Messages overlapping
**Check:**
1. Browser zoom is 100%
2. Screen width (should work on mobile too)
3. Clear browser cache

### Issue: "Chat unavailable" even though backend is up
**Check:**
1. Health check endpoint: `curl http://localhost:8000/api/v1/health`
2. Console for `[chatApi]` health check logs
3. CORS configuration in backend

---

## 📝 Notes

- **Session Persistence**: Sessions last 1 hour in Redis, permanent in PostgreSQL
- **Rate Limits**: Development = high, Production = ~20 requests/hour
- **Streaming**: Currently disabled (simStream in settings), can enable for real-time typing
- **API Key**: Required in .env.local, never commit it!

---

**Last Updated:** 2026-08-01
