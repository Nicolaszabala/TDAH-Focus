# Deployment Guide - Render.com

## Bug Fix: Trust Proxy Configuration

### Problem Solved
Fixed `ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false` error that prevented the rate limiter from correctly identifying users.

### Solution Applied
Added `app.set('trust proxy', 1)` to `server.js` (line 11).

This configuration:
- Allows Express to trust the `X-Forwarded-For` header from Render's reverse proxy
- Enables `express-rate-limit` to correctly identify individual users by their real IP
- Fixes the "desconectado" status in the mobile app

---

## How to Deploy to Render.com

### Step 1: Commit and Push Changes

```bash
cd /home/nicolas/TDAH-Focus-Entrega/adhd-chatbot-backend
git add server.js
git commit -m "Fix: Add trust proxy configuration for Render.com deployment"
git push origin main
```

### Step 2: Automatic Deployment

Render.com will automatically detect the changes and trigger a new deployment:

1. Go to https://dashboard.render.com
2. Navigate to your service (tdah-focus backend)
3. Wait for the deployment to complete (usually 2-3 minutes)
4. Check logs for the startup message without errors

### Step 3: Verify Deployment

**Check health endpoint:**
```bash
curl https://tdah-focus.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T...",
  "uptime": 123.45,
  "environment": "production"
}
```

**Check chat endpoint:**
```bash
curl -X POST https://tdah-focus.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, necesito ayuda"}'
```

Expected: No `ValidationError` in Render logs.

### Step 4: Test from Mobile App

1. Open the TDAH Focus app
2. Navigate to ChatScreen
3. Send a test message
4. Verify:
   - No "desconectado" status
   - Response is received correctly
   - No errors in Render logs

---

## Environment Variables on Render

Ensure these are set in Render dashboard:

- `HUGGINGFACE_API_KEY` - Your Hugging Face API key
- `NODE_ENV=production`
- `MAX_REQUESTS_PER_MINUTE=20` (optional)
- `CACHE_TTL_SECONDS=3600` (optional)
- `ALLOWED_ORIGINS` (optional, for CORS)

---

## Monitoring

### Check Logs
```bash
# In Render dashboard, go to Logs tab
# Look for:
# - "🚀 ADHD Chatbot API Server" (successful startup)
# - No "ValidationError" messages
# - Successful chat requests
```

### Rate Limit Verification
The rate limiter should now correctly identify users:
- Different IPs should have independent rate limits
- The logs should show different IP addresses (not all the same proxy IP)

---

## Troubleshooting

### If "desconectado" still appears:

1. **Check mobile app API URL:**
   - Should be `https://tdah-focus.onrender.com`
   - NOT `http://` (must use HTTPS)

2. **Check Render deployment status:**
   - Service should be "Live"
   - No failed builds

3. **Check CORS:**
   - Render logs should NOT show CORS errors
   - Mobile apps typically send requests without origin header (allowed)

### If rate limit still shows errors:

1. **Verify trust proxy setting:**
   ```bash
   node verify-proxy-config.js
   ```

2. **Check Render proxy headers:**
   - Render should be sending `X-Forwarded-For`
   - Check logs: look for IP addresses, not "::1" or "127.0.0.1"

---

## Local Development

The `trust proxy: 1` setting is safe for local development:
- Express will use the connection's remote address if no proxy headers exist
- No changes needed in local `.env` file

Test locally:
```bash
npm run dev
# Should start without errors
```

---

## Production Considerations

### Security
- Trust proxy is set to `1` (only first proxy)
- This is correct for Render's architecture
- DO NOT set to `true` (trusts all proxies - security risk)

### Performance
- Rate limiting now works correctly
- Cache is still active (1 hour TTL by default)
- No performance impact from trust proxy setting

### Future Scaling
If you add additional proxies (CDN, load balancer):
- Review trust proxy setting
- May need to increase to `2` or use subnet configuration
- Consult Render documentation for multi-proxy setups

---

## References

- Express trust proxy documentation: https://expressjs.com/en/guide/behind-proxies.html
- Render proxy configuration: https://render.com/docs/web-services#request-headers
- express-rate-limit docs: https://express-rate-limit.mintlify.app/guides/troubleshooting-proxy-issues
