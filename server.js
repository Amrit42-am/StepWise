import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Schema Definitions
const sessionSchema = new mongoose.Schema({
  userId: String,
  mode: { type: String, enum: ['approach', 'code'], required: true },
  problem: String,
  code: String,
  language: String,
  hintLevel: { type: Number, default: 0 },
  hints: [String],
  conversation: [{
    role: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);

// Initialize Gemma AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// System Prompts
const MENTOR_SYSTEM_PROMPT = `You are StepWise DSA - an expert DSA mentor who teaches through guided reasoning, NOT by giving answers.

CORE PRINCIPLES:
1. Act as a patient mentor, never a code generator
2. Do NOT give complete solutions immediately
3. Use progressive hints that become stronger over time
4. Start with conceptual questions, not algorithms
5. Encourage the student to think and reason independently
6. Preserve the student's ownership of their learning

HINT PROGRESSION (5 levels):
Level 1: Conceptual - Very small clue pointing in the right direction
Level 2: Direction - Point toward a strategy or idea type
Level 3: Technique - Suggest relevant data structure/algorithm without full solution
Level 4: Implementation - Guide toward code translation
Level 5: Pseudocode - Structure without revealing complete working code

BEHAVIOR RULES:
- Avoid giving the complete solution by default
- Ask questions like "What happens if...?" instead of explaining
- When reviewing code, point out the issue, don't rewrite it
- Consider edge cases: empty inputs, duplicates, negatives, boundaries
- Explain why a hint matters when necessary
- Keep explanations concise and clear
- Never pretend incorrect ideas are correct

RESPONSE FORMAT:
- Start with a brief acknowledgment
- Ask ONE useful question or provide ONE clear hint
- Encourage the student to attempt based on that hint
- Be warm, supportive, and conversational`;

const CODE_REVIEW_SYSTEM_PROMPT = `You are StepWise DSA - reviewing student code to provide learning hints, not to rewrite it.

When reviewing code:
1. Identify what the student is trying to do
2. Find the issue (logic, complexity, edge case, etc.)
3. Give the SMALLEST useful hint first
4. Preserve the student's code ownership
5. Point out errors without rewriting

Example hints:
- "Check your loop boundary."
- "Your approach works, but the repeated search makes it O(n^2)."
- "Think about what happens with empty input."
- "Your pointer movement may skip an element."
- "Consider if this value needs recalculation."

NEVER:
- Rewrite the entire code
- Give the complete optimized solution
- Explain without addressing the specific issue

Focus on ONE issue at a time, starting with the most critical.`;

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Approach Mode - Initial Problem Analysis
app.post('/api/approach/analyze', async (req, res) => {
  try {
    const { problem, userId } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'Problem statement is required' });
    }

    // Create new session
    const session = new Session({
      userId: userId || 'anonymous',
      mode: 'approach',
      problem,
      hintLevel: 0
    });

    // Get initial hint from Gemma
    const prompt = `${MENTOR_SYSTEM_PROMPT}

STUDENT PROBLEM:
${problem}

Provide the FIRST step of guidance. This should be a conceptual hint that helps the student understand what they need to think about. Be conversational and encouraging.`;

    const result = await model.generateContent(prompt);
    const firstHint = result.response.text();

    session.hints.push(firstHint);
    session.conversation.push({
      role: 'user',
      content: problem
    });
    session.conversation.push({
      role: 'assistant',
      content: firstHint
    });
    session.hintLevel = 1;

    await session.save();

    res.json({
      sessionId: session._id,
      hint: firstHint,
      hintLevel: 1,
      maxHints: parseInt(process.env.SESSION_MAX_HINTS) || 10
    });
  } catch (error) {
    console.error('Error in approach/analyze:', error);
    res.status(500).json({ error: 'Failed to analyze problem' });
  }
});

// Approach Mode - Get Next Hint
app.post('/api/approach/next-hint', async (req, res) => {
  try {
    const { sessionId, studentResponse } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.hintLevel >= 5) {
      return res.json({
        hint: 'You have received all progressive hints. Time to code your solution! If you get stuck, try Code Hint Mode to review your implementation.',
        hintLevel: session.hintLevel,
        isMaxed: true
      });
    }

    // Add student response to conversation
    if (studentResponse) {
      session.conversation.push({
        role: 'user',
        content: studentResponse
      });
    }

    // Generate next hint based on hint level
    const hintLevelDescriptions = {
      1: 'LEVEL 1 - CONCEPTUAL HINT',
      2: 'LEVEL 2 - DIRECTION HINT',
      3: 'LEVEL 3 - DATA STRUCTURE/ALGORITHM HINT',
      4: 'LEVEL 4 - IMPLEMENTATION HINT',
      5: 'LEVEL 5 - PSEUDOCODE-LEVEL GUIDANCE'
    };

    const nextLevel = session.hintLevel + 1;
    const prompt = `${MENTOR_SYSTEM_PROMPT}

ORIGINAL PROBLEM:
${session.problem}

CONVERSATION SO FAR:
${session.conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')}

This is ${hintLevelDescriptions[nextLevel]}.
Provide the next progressive hint that is STRONGER than previous hints but still avoids giving away the complete solution.
Be specific but not revealing.`;

    const result = await model.generateContent(prompt);
    const nextHint = result.response.text();

    session.hints.push(nextHint);
    session.conversation.push({
      role: 'assistant',
      content: nextHint
    });
    session.hintLevel = nextLevel;
    session.updatedAt = new Date();

    await session.save();

    res.json({
      hint: nextHint,
      hintLevel: nextLevel,
      maxHints: parseInt(process.env.SESSION_MAX_HINTS) || 10
    });
  } catch (error) {
    console.error('Error in approach/next-hint:', error);
    res.status(500).json({ error: 'Failed to generate next hint' });
  }
});

// Code Hint Mode - Analyze Submitted Code
app.post('/api/code/review', async (req, res) => {
  try {
    const { code, problem, language = 'javascript', userId } = req.body;

    if (!code || !problem) {
      return res.status(400).json({ error: 'Code and problem statement are required' });
    }

    // Create new session
    const session = new Session({
      userId: userId || 'anonymous',
      mode: 'code',
      problem,
      code,
      language,
      hintLevel: 0
    });

    // Analyze code
    const prompt = `${CODE_REVIEW_SYSTEM_PROMPT}

PROBLEM:
${problem}

STUDENT CODE (${language}):
\`\`\`${language}
${code}
\`\`\`

Analyze this code. Identify the main issue (if any) and provide the FIRST hint.
Be specific about what to look at without rewriting the code.`;

    const result = await model.generateContent(prompt);
    const firstHint = result.response.text();

    session.hints.push(firstHint);
    session.conversation.push({
      role: 'user',
      content: `My code:\n\`\`\`${language}\n${code}\n\`\`\``
    });
    session.conversation.push({
      role: 'assistant',
      content: firstHint
    });
    session.hintLevel = 1;

    await session.save();

    res.json({
      sessionId: session._id,
      hint: firstHint,
      hintLevel: 1,
      maxHints: parseInt(process.env.SESSION_MAX_HINTS) || 10
    });
  } catch (error) {
    console.error('Error in code/review:', error);
    res.status(500).json({ error: 'Failed to review code' });
  }
});

// Code Hint Mode - Get Next Hint
app.post('/api/code/next-hint', async (req, res) => {
  try {
    const { sessionId, studentResponse, updatedCode } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.hintLevel >= 5) {
      return res.json({
        hint: 'You have explored this problem thoroughly. Consider implementing your solution and testing with edge cases.',
        hintLevel: session.hintLevel,
        isMaxed: true
      });
    }

    // Update code if provided
    if (updatedCode) {
      session.code = updatedCode;
    }

    // Add conversation
    if (studentResponse) {
      session.conversation.push({
        role: 'user',
        content: studentResponse
      });
    }
    if (updatedCode) {
      session.conversation.push({
        role: 'user',
        content: `Updated code:\n\`\`\`${session.language}\n${updatedCode}\n\`\`\``
      });
    }

    // Generate stronger hint
    const nextLevel = session.hintLevel + 1;
    const prompt = `${CODE_REVIEW_SYSTEM_PROMPT}

PROBLEM:
${session.problem}

CURRENT CODE (${session.language}):
\`\`\`${session.language}
${session.code}
\`\`\`

Previous hints given: ${session.hints.length}

This is hint level ${nextLevel} of 5. Give a STRONGER hint than before.
Still avoid rewriting the code or giving the complete solution.
Be more specific about the issue and what to consider.`;

    const result = await model.generateContent(prompt);
    const nextHint = result.response.text();

    session.hints.push(nextHint);
    session.conversation.push({
      role: 'assistant',
      content: nextHint
    });
    session.hintLevel = nextLevel;
    session.updatedAt = new Date();

    await session.save();

    res.json({
      hint: nextHint,
      hintLevel: nextLevel,
      maxHints: parseInt(process.env.SESSION_MAX_HINTS) || 10
    });
  } catch (error) {
    console.error('Error in code/next-hint:', error);
    res.status(500).json({ error: 'Failed to generate next hint' });
  }
});

// Get Session History
app.get('/api/session/:sessionId', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`StepWise DSA Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
