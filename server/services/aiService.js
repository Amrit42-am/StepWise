import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ... system prompts remain below ...
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

class AIService {
  async generateContent(prompt, systemPrompt) {
    const aiProvider = (process.env.AI_PROVIDER || 'groq').toLowerCase();

    try {
      if (aiProvider === 'groq') {
        if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is required when AI_PROVIDER=groq');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        });
        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('Groq returned an empty response');
        return content;
      }

      if (aiProvider === 'gemini') {
        if (!process.env.GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY is required when AI_PROVIDER=gemini');
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({
          model: process.env.GEMMA_MODEL || 'gemini-1.5-flash',
          systemInstruction: systemPrompt
        });
        const result = await model.generateContent(prompt);
        return result.response.text();
      }

      if (aiProvider === 'ollama') {
        const apiUrl = process.env.GEMMA_API_URL || 'http://localhost:11434';
        const model = process.env.GEMMA_MODEL || 'gemma';

        const response = await fetch(`${apiUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            system: systemPrompt,
            prompt: prompt,
            stream: false
          })
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
      }

      throw new Error(`Unsupported AI_PROVIDER: ${aiProvider}`);
    } catch (error) {
      console.error(`AI generation failed for ${aiProvider}: ${error.message}`);
      throw new Error('Failed to generate response from the configured AI provider');
    }
  }

  async getInitialApproachHint(problem) {
    const prompt = `STUDENT PROBLEM:\n${problem}\n\nProvide the FIRST step of guidance. This should be a conceptual hint that helps the student understand what they need to think about. Be conversational and encouraging.`;
    return this.generateContent(prompt, MENTOR_SYSTEM_PROMPT);
  }

  async getNextApproachHint(problem, conversation, currentLevel) {
    const hintLevelDescriptions = {
      1: 'LEVEL 1 - CONCEPTUAL HINT',
      2: 'LEVEL 2 - DIRECTION HINT',
      3: 'LEVEL 3 - DATA STRUCTURE/ALGORITHM HINT',
      4: 'LEVEL 4 - IMPLEMENTATION HINT',
      5: 'LEVEL 5 - PSEUDOCODE-LEVEL GUIDANCE'
    };

    const prompt = `ORIGINAL PROBLEM:\n${problem}\n\nCONVERSATION SO FAR:\n${conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')}\n\nThis is ${hintLevelDescriptions[currentLevel]}.\nProvide the next progressive hint that is STRONGER than previous hints but still avoids giving away the complete solution.\nBe specific but not revealing.`;
    
    return this.generateContent(prompt, MENTOR_SYSTEM_PROMPT);
  }

  async getInitialCodeHint(problem, code, language) {
    const prompt = `PROBLEM:\n${problem}\n\nSTUDENT CODE (${language}):\n\`\`\`${language}\n${code}\n\`\`\`\n\nAnalyze this code. Identify the main issue (if any) and provide the FIRST hint.\nBe specific about what to look at without rewriting the code.`;
    return this.generateContent(prompt, CODE_REVIEW_SYSTEM_PROMPT);
  }

  async getNextCodeHint(problem, code, language, conversation, currentLevel, hintsCount) {
    const prompt = `PROBLEM:\n${problem}\n\nCURRENT CODE (${language}):\n\`\`\`${language}\n${code}\n\`\`\`\n\nCONVERSATION SO FAR:\n${conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')}\n\nPrevious hints given: ${hintsCount}\n\nThis is hint level ${currentLevel} of 5. Give a STRONGER hint than before.\nStill avoid rewriting the code or giving the complete solution.\nBe more specific about the issue and what to consider.`;
    return this.generateContent(prompt, CODE_REVIEW_SYSTEM_PROMPT);
  }
}

export default new AIService();
