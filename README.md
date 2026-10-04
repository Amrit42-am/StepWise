# StepWise DSA

> **Learn the approach, not the answer.**

An AI-powered DSA learning assistant that helps students solve Data Structures and Algorithms problems through guided hints and progressive reasoning—not by generating complete solutions.

## 🎯 What is StepWise DSA?

StepWise DSA is designed for students who want to **learn how to think** about DSA problems, not just copy answers. Instead of getting complete code, students receive:

- **Approach Mode**: Step-by-step conceptual hints that guide problem-solving without revealing the solution
- **Code Hint Mode**: Targeted feedback on submitted code to help identify and fix inefficiencies

## ✨ Key Features

### 💡 Approach Mode
Enter a DSA problem and receive progressive hints:
1. **Level 1**: Conceptual clue pointing in the right direction
2. **Level 2**: Direction toward a strategy or idea
3. **Level 3**: Relevant data structure or algorithm hint
4. **Level 4**: Implementation guidance
5. **Level 5**: Pseudocode-level structure

### 🔍 Code Hint Mode
Submit your code and get:
- Analysis of your approach (brute-force, partial, optimized)
- Specific hints about inefficiencies, logic errors, or edge cases
- Guidance without rewriting your entire code

### 🤖 AI Mentor Behavior
The AI acts as a patient mentor:
- Asks questions instead of giving answers
- Encourages independent problem-solving
- Provides progressive hints based on your responses
- Points out issues without replacing your thinking

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | HTML5 + Vanilla JavaScript (responsive, theme-aware) |
| **Backend** | Node.js + Express |
| **AI Model** | Google Generative AI (Gemma via Gemini API) |
| **Database** | MongoDB Atlas |
| **Deployment** | Render |

## 📦 Project Structure

```
StepWise/
├── server.js                 # Express backend server
├── package.json              # Node dependencies
├── .env.example              # Environment variables template
├── README.md                 # This file
├── client/
│   ├── package.json          # Frontend dependencies
│   └── public/
│       └── index.html        # Single-page frontend
└── render.yaml               # Render deployment config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (free tier available)
- Google API key (Gemini/Generative AI)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/StepWise.git
cd StepWise
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials:
# - MONGODB_URI: your MongoDB Atlas connection string
# - GOOGLE_API_KEY: your Google Generative AI API key
# - FRONTEND_URL: http://localhost:3000
```

4. **Start the backend server**
```bash
npm start
# Server runs on http://localhost:5000
```

5. **Open the frontend**
   - Open `client/public/index.html` in your browser, or
   - Set up a simple HTTP server: `python3 -m http.server 3000 --directory client/public`

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/stepwise-dsa` |
| `GOOGLE_API_KEY` | Google Generative AI API key | Your API key |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `SESSION_MAX_HINTS` | Maximum hints per session | `10` |

## 📚 API Endpoints

### Approach Mode

**POST** `/api/approach/analyze`
- Request: `{ problem: string, userId?: string }`
- Response: `{ sessionId, hint, hintLevel, maxHints }`

**POST** `/api/approach/next-hint`
- Request: `{ sessionId: string, studentResponse?: string }`
- Response: `{ hint, hintLevel, maxHints, isMaxed?: boolean }`

### Code Hint Mode

**POST** `/api/code/review`
- Request: `{ code: string, problem: string, language: string, userId?: string }`
- Response: `{ sessionId, hint, hintLevel, maxHints }`

**POST** `/api/code/next-hint`
- Request: `{ sessionId: string, studentResponse?: string, updatedCode?: string }`
- Response: `{ hint, hintLevel, maxHints, isMaxed?: boolean }`

### Session

**GET** `/api/session/:sessionId`
- Response: Full session data including conversation history

## 🌐 Deployment on Render

### Steps

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name**: `stepwise-dsa`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free (or Paid for better performance)

3. **Set Environment Variables**
   - In Render dashboard, go to Environment
   - Add all variables from `.env.example`:
     - `MONGODB_URI`
     - `GOOGLE_API_KEY`
     - `FRONTEND_URL` (your Render URL)
     - `NODE_ENV=production`

4. **Deploy**
   - Render automatically deploys when you push to main
   - Your app is live at `https://stepwise-dsa.onrender.com`

## 💡 Example Sessions

### Approach Mode Example

**Problem:**
> Given an array of integers and a target, return the indices of two numbers whose sum equals the target.

**AI Hint 1 (Conceptual):**
> What would happen if you compared every possible pair of numbers in the array?

**Student:**
> That would work, but it would take O(n²) time.

**AI Hint 2 (Direction):**
> Good. What causes that O(n²) behavior?

**Student:**
> We're searching through the array repeatedly for each element.

**AI Hint 3 (Technique):**
> Exactly. Is there a way to avoid that repeated searching? What if you could look up a value instantly?

**Student realizes:** Hash map (dictionary) for O(1) lookup!

### Code Hint Mode Example

**Student Code:**
```javascript
for(let i = 0; i < n; i++) {
    for(let j = i + 1; j < n; j++) {
        if(arr[i] + arr[j] === target)
            return [i, j];
    }
}
```

**AI Hint 1:**
> Your code is logically correct. Look at the complexity—you're comparing pairs twice.

**AI Hint 2:**
> Can you avoid searching through remaining elements for each number?

**AI Hint 3:**
> What data structure would let you check if a needed value has already appeared?

## 🧠 AI Behavior Philosophy

The AI is configured to:

1. ✅ Act as a DSA mentor, not a code generator
2. ✅ Provide progressive hints (Level 1 → 5)
3. ✅ Encourage independent thinking
4. ✅ Ask questions rather than give answers
5. ✅ Preserve student ownership of code
6. ✅ Point out issues without rewriting
7. ✅ Consider edge cases relevant to the problem
8. ✅ Adapt hint strength based on student response

## 📊 Data Stored in MongoDB

### Session Document
```javascript
{
  userId: string,
  mode: 'approach' | 'code',
  problem: string,
  code?: string,
  language?: string,
  hintLevel: number (0-5),
  hints: string[],
  conversation: [{
    role: 'user' | 'assistant',
    content: string,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security & Privacy

- ✅ CORS configured for frontend URLs
- ✅ Environment variables for sensitive data
- ✅ No hardcoded API keys
- ✅ MongoDB Atlas connection string in environment
- ✅ Input validation on all endpoints
- ✅ Error handling without exposing internals

## 🎓 Success Metrics

The project succeeds when:
1. ✅ Student enters a problem and receives conceptual guidance
2. ✅ Hints progress from conceptual to more specific
3. ✅ Student develops approach independently
4. ✅ Student can paste code and receive targeted hints
5. ✅ Student improves their code without AI replacing it

**Most important metric:** "Did the AI help the student **think**?" not "Did it solve the problem?"

## 🚀 Future Features

- [ ] Personalized learning history
- [ ] Topic weakness detection
- [ ] Difficulty adaptation
- [ ] Support for multiple programming languages
- [ ] Local/offline AI mode
- [ ] Learning streaks and gamification
- [ ] Competitive programming integration
- [ ] Teacher/mentor dashboard

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📞 Support

- Found an issue? Open a GitHub issue
- Have a question? Check existing discussions
- Want to suggest a feature? We'd love to hear it!

---

**Built with ❤️ for learners who want to understand, not just copy.**
