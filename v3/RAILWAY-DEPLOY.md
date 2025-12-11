# DeepFish V3 - Railway Deployment Guide

## Quick Deploy

1. **Connect GitHub Repository**
   ```
   Railway Dashboard → New Project → Deploy from GitHub
   → Select: JiffyAviation/DeepFish
   → Root directory: /v3
   ```

2. **Configure Environment Variables**
   ```
   GEMINI_API_KEY=your_gemini_key
   ELEVENLABS_API_KEY=your_elevenlabs_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=+1234567890
   EMAIL_USER=your_email@domain.com
   EMAIL_PASSWORD=your_app_password
   NODE_ENV=production
   PORT=3000
   ```

3. **Deploy**
   - Railway will auto-detect Node.js
   - Build command: `npm install && npm run build`
   - Start command: `npm run dev`

4. **Get Deployment URL**
   - Railway provides: `https://your-app.up.railway.app`

## Post-Deployment

1. Visit: `https://your-app.up.railway.app/config.html`
2. Configure API keys if not set in Railway
3. Test deployment

## Deployment Checklist

- [ ] GitHub connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] App running
- [ ] Config page accessible
- [ ] Test one bot conversation

**Deploy time:** ~3-5 minutes
**Cost:** Free tier available (500 hours/month)
