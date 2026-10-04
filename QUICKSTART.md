# Quick Start Guide - StepWise DSA

## ⚡ Get Up and Running in 5 Minutes

This guide will help you deploy StepWise DSA to Render and share it with students.

## 📋 Prerequisites

Before you start, gather these:

1. **GitHub Account** - Repository will be here
2. **MongoDB Atlas Account** - Free tier available at mongodb.com
3. **Google API Key** - Get from console.cloud.google.com
4. **Render Account** - Deploy platform (render.com)

---

## Step 1: Get Your MongoDB Connection String (2 min)

### MongoDB Atlas Setup

```
1. Visit https://www.mongodb.com/cloud/atlas
2. Sign up or sign in
3. Create a Cluster → Free tier M0
4. Database Access → Create user (username + password)
5. Network Access → Allow 0.0.0.0/0 (allows Render)
6. Connect → Copy connection string:

mongodb+srv://username:password@cluster.mongodb.net/stepwise-dsa?retryWrites=true&w=majority

7. Replace username and password with your credentials
8. Save this string! ✅
```

---

## Step 2: Get Your Google API Key (2 min)

### Google Cloud Console

```
1. Visit https://console.cloud.google.com
2. Create new project (or select existing)
3. Search: "Google Generative AI API" → Enable
4. Credentials → Create Credentials → API Key
5. Copy your API key
6. Save this key! ✅
```

---

## Step 3: Deploy to Render (1 min setup, 5 min build)

### Render Deployment

```
1. Visit https://render.com
2. Sign up with GitHub (recommended)
3. Authorize GitHub access
4. Click "New +" → "Web Service"
5. Connect your StepWise repository
6. Configure:
   
   Name: stepwise-dsa
   Environment: Node
   Region: Choose closest to you
   Branch: main
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free (or Paid)

7. DON'T click "Create Web Service" yet - continue to next section
```

### Add Environment Variables in Render

**Before clicking "Create Web Service"**, scroll down to "Environment":

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `GOOGLE_API_KEY` | Your Google API key |
| `FRONTEND_URL` | Leave blank (Render will fill it) |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

**Then click "Create Web Service"**

---

## Step 4: Wait for Deployment ⏳

Render will:
- Build your app (2-3 minutes)
- Deploy it (another 1-2 minutes)
- Show status as "Live" when ready

Your app is now live at: **https://stepwise-dsa.onrender.com**

---

## 🎉 You're Done!

### Verify It Works

Open these URLs in your browser:

1. **https://stepwise-dsa.onrender.com** - Main app
2. **https://stepwise-dsa.onrender.com/api/health** - Health check

Both should load without errors.

---

## 🧪 Test the Application

### Try Approach Mode

1. Open your deployed app
2. Click "Approach Mode"
3. Enter a problem:
   ```
   Given an array and a target, find two numbers that sum to the target.
   ```
4. Click "Get First Hint"
5. You should receive a conceptual hint

### Try Code Hint Mode

1. Click "Code Hint Mode"
2. Enter the same problem
3. Paste some code:
   ```javascript
   for(let i = 0; i < arr.length; i++) {
       for(let j = i+1; j < arr.length; j++) {
           if(arr[i] + arr[j] === target) return [i,j];
       }
   }
   ```
4. Click "Get Code Hint"
5. You should receive targeted feedback

---

## 🔗 Share with Students

Your app is now ready to share:

**Share this link:** `https://stepwise-dsa.onrender.com`

Students can:
- Enter DSA problems and get hints
- Submit code and receive feedback
- Practice without getting direct answers

---

## ❌ Troubleshooting

### App Won't Deploy
- Check Render build logs
- Verify `package.json` is in root directory
- Try pushing a new commit to trigger rebuild

### API Returns Errors
- Verify MongoDB connection string (check for typos)
- Ensure MongoDB whitelist includes `0.0.0.0/0`
- Test Google API key is valid

### Can't Get Hints
- Check Render logs for AI errors
- Verify Google API key has permissions
- Confirm MongoDB connection works

### Need Help?
1. Check Render dashboard logs
2. Review [full deployment guide](./DEPLOYMENT.html)
3. Check [README.md](./README.md) for more details

---

## 📊 Monitor Your App

### Check Status
- Visit Render dashboard
- See "Live" status and memory usage
- View live logs in real-time

### Free Tier Notes
- App sleeps after 15 min of inactivity
- First request after sleep takes ~30 seconds to wake
- Upgrade to paid for always-on

---

## 🚀 Next Steps

### Make Updates
1. Edit code locally
2. Push to GitHub
3. Render auto-deploys in ~5 min

### Collect Student Data
- Sessions stored in MongoDB
- View in MongoDB Atlas dashboard
- Track problem topics and hints

### Future Improvements
- Add user authentication
- Build learning analytics dashboard
- Support more programming languages
- Create problem database

---

## 💡 Pro Tips

1. **Backup your .env values** somewhere safe
2. **Monitor MongoDB usage** (free tier has limits)
3. **Check logs regularly** for errors
4. **Test both modes** before sharing with students
5. **Share the link widely** - the more students use it, the better!

---

**That's it! You now have a live DSA learning assistant! 🎓**

Questions? Check the full README.md or DEPLOYMENT.html for detailed docs.
