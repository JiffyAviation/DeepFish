# DeepFish Railway Deployment Guide

## 🚀 Quick Deploy

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway to access your repos

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `JiffyAviation/DeepFish`
4. Railway will auto-detect the configuration

### Step 3: Add Environment Variables
In Railway dashboard, add these variables:

```
GEMINI_API_KEY=AIzaSyD8kn_VN5UnptGOGYvM10hXDoAliqGLafM
NODE_ENV=production
PORT=3001
```

### Step 4: Deploy!
1. Railway will automatically build and deploy
2. Wait 2-3 minutes for deployment
3. Click "Generate Domain" to get your URL
4. Visit your URL!

---

## 🔧 Configuration

### Build Command
```bash
npm run railway:build
```

This will:
- Install dependencies
- Build the Vite frontend
- Compile TypeScript server code

### Start Command
```bash
npm start
```

This runs the Express proxy server which serves the built frontend.

---

## 🌐 Your URLs

After deployment, you'll get:
- **Frontend**: `https://your-app.up.railway.app`
- **API Proxy**: Same URL (served by Express)

---

## ✅ Verify Deployment

1. Visit your Railway URL
2. Check email gate loads
3. Enter email and access app
4. Test chat with an agent
5. Try voice input/output
6. Upload a file

If all works → **YOU'RE LIVE!** 🎉

---

## 🐛 Troubleshooting

### Build Fails
- Check Railway logs
- Verify `package.json` scripts
- Ensure all dependencies listed

### App Doesn't Load
- Check environment variables set
- Verify `GEMINI_API_KEY` is correct
- Check Railway logs for errors

### API Errors
- Verify proxy server is running
- Check Railway logs
- Test API key with Google AI Studio

---

## 📊 Monitoring

### Railway Dashboard
- View logs (real-time)
- Monitor CPU/memory usage
- Check deployment status
- View metrics

### What to Watch
- Response times
- Error rates
- Memory usage
- API quota (Google Gemini)

---

## 💰 Costs

### Railway Free Tier
- $5 free credit/month
- Enough for testing/beta
- ~500 hours of runtime

### Estimated Costs (After Free Tier)
- Small app: ~$5-10/month
- With users: ~$20-30/month
- Scale as needed

---

## 🚀 Next Steps

1. **Test thoroughly** on Railway URL
2. **Share with beta users** (5-10 people)
3. **Monitor logs** for errors
4. **Gather feedback**
5. **Iterate!**

---

## 🎯 Custom Domain (Optional)

1. Buy domain (Namecheap, Google Domains)
2. In Railway: Settings → Domains
3. Add custom domain
4. Update DNS records
5. Wait for SSL certificate

Example: `deepfish.ai` → Railway app

---

**Ready to deploy? Let's catch some fish! 🐟**
