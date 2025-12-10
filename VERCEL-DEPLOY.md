# Vercel Deployment Guide for DeepFish

## 🚀 Step-by-Step Instructions

### Step 1: Go to Vercel
1. Open your browser
2. Go to: **https://vercel.com**
3. Click **"Sign Up"** (top right)

### Step 2: Sign in with GitHub
1. Click **"Continue with GitHub"**
2. Authorize Vercel to access your GitHub
3. You'll be redirected to Vercel dashboard

### Step 3: Create New Project
1. Click **"Add New..."** button (top right)
2. Select **"Project"**
3. You'll see a list of your GitHub repos

### Step 4: Import DeepFish
1. Find **"DeepFish"** in the list
2. Click **"Import"** next to it
3. Vercel will analyze your repo

### Step 5: Configure Project
You'll see a configuration screen:

**Framework Preset**: Should auto-detect as "Vite"
- If not, select "Vite" from dropdown

**Root Directory**: Leave as `./` (default)

**Build Command**: Should be `npm run build` (auto-detected)

**Output Directory**: Should be `dist` (auto-detected)

### Step 6: Add Environment Variable
This is the MOST IMPORTANT step!

1. Click **"Environment Variables"** section (expand it)
2. Add a new variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `YOUR_GEMINI_API_KEY_HERE` (get from https://aistudio.google.com/app/apikey)
3. Make sure it's checked for **Production**, **Preview**, and **Development**

### Step 7: Deploy!
1. Click the big **"Deploy"** button
2. Wait 2-3 minutes while Vercel builds your app
3. You'll see a progress screen with logs

### Step 8: Get Your URL
1. Once deployment succeeds, you'll see: **"Congratulations!"**
2. Click **"Visit"** to see your live app
3. Your URL will be something like: `deepfish-xyz.vercel.app`

---

## ✅ What to Expect

**Build time**: 2-3 minutes
**Your URL**: `https://deepfish-[random].vercel.app`

You can customize the URL later in project settings!

---

## 🐛 Troubleshooting

### If build fails:
1. Check the build logs
2. Look for error messages
3. Most common issue: Missing environment variable

### If app loads but doesn't work:
1. Check browser console (F12)
2. Verify `GEMINI_API_KEY` is set
3. Check Vercel function logs

---

## 🎉 After Deployment

Once live, you can:
1. **Share the URL** with beta users
2. **Add a custom domain** (Settings → Domains)
3. **View analytics** (Analytics tab)
4. **Check logs** (Functions → Logs)

---

**Ready? Let's deploy!** 🚀
