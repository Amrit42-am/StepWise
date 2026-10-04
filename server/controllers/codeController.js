import Session from '../models/Session.js';
import aiService from '../services/aiService.js';

export const startCodeReview = async (req, res) => {
  try {
    const { code, problem, language = 'javascript' } = req.body;

    if (!code || !problem) {
      return res.status(400).json({ error: 'Code and problem statement are required' });
    }

    const session = new Session({
      user: req.user._id,
      mode: 'code',
      problem,
      code,
      language,
      hintLevel: 0
    });

    const firstHint = await aiService.getInitialCodeHint(problem, code, language);

    session.hints.push(firstHint);
    session.conversation.push({
      role: 'user',
      content: `My code:\n\`\`\`${language}\n${code}\n\`\`\``
    });
    session.conversation.push({ role: 'assistant', content: firstHint });
    session.hintLevel = 1;

    await session.save();

    res.json({
      sessionId: session._id,
      hint: firstHint,
      hintLevel: 1,
      maxHints: 5
    });
  } catch (error) {
    console.error('Error in startCodeReview:', error);
    res.status(500).json({ error: 'Failed to start code review' });
  }
};

export const nextCodeHint = async (req, res) => {
  try {
    const { sessionId, studentResponse, updatedCode } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await Session.findOne({ _id: sessionId, user: req.user._id });
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

    if (updatedCode) {
      session.code = updatedCode;
    }

    if (studentResponse) {
      session.conversation.push({ role: 'user', content: studentResponse });
    }
    if (updatedCode) {
      session.conversation.push({
        role: 'user',
        content: `Updated code:\n\`\`\`${session.language}\n${updatedCode}\n\`\`\``
      });
    }

    const nextLevel = session.hintLevel + 1;
    const nextHint = await aiService.getNextCodeHint(
      session.problem,
      session.code,
      session.language,
      session.conversation,
      nextLevel,
      session.hints.length
    );

    session.hints.push(nextHint);
    session.conversation.push({ role: 'assistant', content: nextHint });
    session.hintLevel = nextLevel;
    session.updatedAt = new Date();

    await session.save();

    res.json({
      hint: nextHint,
      hintLevel: nextLevel,
      maxHints: 5
    });
  } catch (error) {
    console.error('Error in nextCodeHint:', error);
    res.status(500).json({ error: 'Failed to get next code hint' });
  }
};
