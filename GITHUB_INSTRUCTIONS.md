# StepWise DSA - GitHub & Render Deployment Instructions

## 🎉 Your Project is Complete!

Your production-ready StepWise DSA application is fully built and ready to share with the world. This guide will help you publish it on GitHub and deploy it to Render.

---

## 📋 Checklist Before Pushing to GitHub

- ✅ All files created and committed locally
- ✅ `.env.example` contains template (not real secrets)
- ✅ `.gitignore` excludes `.env` files
- ✅ `render.yaml` configured for deployment
- ✅ `package.json` has all dependencies
- ✅ Documentation is comprehensive

---

## 🚀 Step 1: Push to GitHub

### Create a New Repository on GitHub

1. Go to [github.com](https://github.com)
2. Click **"New"** (top left under your profile)
3. Configure:
   - **Repository name**: `StepWise` or `stepwise-dsa`
   - **Description**: "AI-powered DSA learning assistant. Learn the approach, not the answer."
   - **Visibility**: **Public** (so others can see and use it)
   - **Initialize**: Skip (you already have git initialized)
4. Click **"Create repository"**

### Connect Local Repository to GitHub

```bash
# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/StepWise.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### Verify on GitHub

- Visit your repository: `https://github.com/USERNAME/StepWise`
- Verify all files are there
- Check that README.md displays correctly

---

## 🌐 Step 2: Deploy to Render

### Get Prerequisites

Before deploying, you need:

1. **MongoDB Atlas Connection String**
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster (M0)
   - Create database user
   - Whitelist IP: `0.0.0.0/0`
   - Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/stepwise-dsa`

2. **Google API Key**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project
   - Enable "Google Generative AI API"
   - Create API key
   - Copy the key

### Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign up or sign in (use GitHub for easier setup)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository

### Configure Service

| Setting | Value |
|---------|-------|
| Name | `stepwise-dsa` |
| Environment | `Node` |
| Region | Closest to you |
| Branch | `main` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free (or Paid for always-on) |

### Add Environment Variables

Before clicking "Create Web Service", scroll to **Environment** and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `GOOGLE_API_KEY` | Your Google API key |
| `FRONTEND_URL` | Leave empty (Render will fill it) |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

### Deploy

1. Click **"Create Web Service"**
2. Wait for build (2-3 minutes)
3. Wait for deployment (1-2 minutes)
4. Status shows **"Live"** when ready
5. Your app is at: `https://stepwise-dsa.onrender.com`

---

## ✅ Verify Deployment

### Test URLs

1. Open main app: `https://stepwise-dsa.onrender.com`
2. Check health: `https://stepwise-dsa.onrender.com/api/health`

### Test Both Modes

**Approach Mode:**
1. Enter a problem: "Given an array and target, find two numbers that sum to target"
2. Click "Get First Hint"
3. Should receive a conceptual hint

**Code Hint Mode:**
1. Paste sample code
2. Click "Get Code Hint"
3. Should receive targeted feedback

### Check Logs

- In Render dashboard, click on your service
- Go to "Logs" tab
- Check for errors

---

## 🔗 Share Your Project

### With Students

Share this link with students:
```
https://stepwise-dsa.onrender.com
```

They can immediately start:
- Entering DSA problems and getting guided hints
- Submitting code and getting feedback

### On GitHub

Share your repository:
```
https://github.com/USERNAME/StepWise
```

Others can:
- View your code
- Fork the repository
- Submit pull requests
- Create issues

### On Social Media

**Example post:**
> Just launched StepWise DSA - an AI mentor that teaches you HOW to solve DSA problems instead of just giving answers. 
> 
> 🚀 Try it: [link]
> 🔗 GitHub: [link]
> 
> Built with: Node.js, Gemma AI, MongoDB, Render
> #DSA #AI #OpenSource

---

## 📊 Monitor Your Deployment

### Render Dashboard

- Service status and logs
- Memory and CPU usage
- Deployment history
- Environment variables

### MongoDB Atlas

- Connected sessions
- Database storage usage
- Query analytics

---

## 🐛 Troubleshooting

### Build Fails

```
❌ "npm install failed"
```

**Fix:**
- Check `package.json` is in root directory
- Verify all dependencies are listed
- Try pushing a new commit

### App Crashes

```
❌ "Application error r10 (Boot timeout)"
```

**Fix:**
- Check Render logs for errors
- Verify environment variables are set correctly
- Check MongoDB connection string

### API Returns Errors

```
❌ "Failed to connect to database"
```

**Fix:**
- Verify `MONGODB_URI` in environment
- Ensure IP whitelist includes `0.0.0.0/0` in MongoDB Atlas
- Test connection string locally

### Front-end Not Loading

```
❌ "CORS error or blank page"
```

**Fix:**
- Clear browser cache
- Check browser console for errors
- Verify `FRONTEND_URL` is set correctly

---

## 📈 Next Steps After Deployment

### 1. Collect Feedback

- Have students use the app
- Gather feedback
- Track which problems are popular

### 2. Monitor Usage

- Check MongoDB for session data
- View Render logs
- Track error rates

### 3. Make Updates

Update the app anytime:

```bash
# Make changes locally
# Test locally
# Commit and push
git add .
git commit -m "Your message"
git push origin main

# Render auto-deploys in ~5 minutes
```

### 4. Scale If Needed

- Free tier: Limited, sleeps after 15 min
- Paid tier: Always-on, more resources
- Upgrade in Render dashboard

---

## 🎓 Example Session Flow

### Student: Approach Mode

```
Input: "Given array of integers and a target, find two numbers that sum to target"

AI (Level 1):
"What would happen if you checked every possible pair of numbers?"

Student:
"That would work but O(n²) complexity"

AI (Level 2):
"Good! What causes the O(n²) behavior?"

Student:
"We're searching through the array repeatedly"

AI (Level 3):
"What data structure lets you check if a value exists instantly?"

Student realizes: Hash map for O(1) lookup!
```

### Student: Code Hint Mode

```
Submits:
for(let i=0; i<n; i++) {
  for(let j=i+1; j<n; j++) {
    if(arr[i]+arr[j]==target) return [i,j];
  }
}

AI (Level 1):
"Your logic is correct. Look at the complexity—you're comparing pairs twice."

AI (Level 2):
"Can you avoid searching the rest of array for each element?"

AI (Level 3):
"What data structure would help check if a needed value already appeared?"

Student improves code themselves.
```

---

## 📚 Documentation Your Repo Contains

- **README.md** - Complete documentation
- **QUICKSTART.md** - 5-minute deployment guide
- **DEPLOYMENT.html** - Interactive guide
- **PROJECT_SUMMARY.md** - Project overview
- **CONTRIBUTING.md** - How to contribute
- **FINAL_SUMMARY.txt** - Complete details

---

## 🎉 Success!

Your StepWise DSA application is:

✅ On GitHub (open source)
✅ Deployed on Render (live and accessible)
✅ Ready for students (no setup needed)
✅ Ready for contributions (community-driven)

---

## 📞 Support

- **Local Issues?** Check logs in Render
- **Deployment Issues?** See troubleshooting above
- **Feature Ideas?** Open GitHub issues
- **Want to Contribute?** Submit pull requests

---

## 🚀 That's It!

Your complete StepWise DSA project is now:
- 🌐 Public on GitHub
- 🚀 Live on Render
- 🎓 Ready to help students learn DSA

Share it, celebrate it, and enjoy seeing students learn to think! 🎉

---

**Built with ❤️ for learners who want to understand, not just copy.**
