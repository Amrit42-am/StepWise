import Session from '../models/Session.js';
import aiService from '../services/aiService.js';

export const startApproach = async (req, res) => {
  try {
    const { problem } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'Problem statement is required' });
    }

    const session = new Session({
      user: req.user._id,
      mode: 'approach',
      problem,
      hintLevel: 0
    });

    const firstHint = await aiService.getInitialApproachHint(problem);

    session.hints.push(firstHint);
    session.conversation.push({ role: 'user', content: problem });
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
    console.error('Error in startApproach:', error);
    res.status(500).json({ error: 'Failed to start approach session' });
  }
};

export const nextApproachHint = async (req, res) => {
  try {
    const { sessionId, studentResponse } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await Session.findOne({ _id: sessionId, user: req.user._id });
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

    if (studentResponse) {
      session.conversation.push({ role: 'user', content: studentResponse });
    }

    const nextLevel = session.hintLevel + 1;
    const nextHint = await aiService.getNextApproachHint(session.problem, session.conversation, nextLevel);

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
    console.error('Error in nextApproachHint:', error);
    res.status(500).json({ error: 'Failed to get next approach hint' });
  }
};
