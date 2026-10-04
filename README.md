# StepWise DSA

**Tagline:** "Learn the approach, not the answer."

StepWise DSA is an AI-powered DSA learning mentor. It helps students understand how to solve DSA problems without immediately giving them the final answer. The application has two core modes:

1. **Approach Mode**: Guides the student's thinking stage-by-stage.
2. **Code Hint Mode**: Analyzes student code to provide bug hints, complexity analysis, and edge cases.

Each learner registers an account and signs in. Every learning session, hint, submitted code revision, and conversation is saved to that authenticated account in MongoDB.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **AI**: Gemma open-weight model (via local Ollama) or Google Gemini API.

## Project Structure
- `/client` - React frontend
- `/server` - Express backend with AI service
- `/render.yaml` - Render deployment configuration

## Local Development Setup

### 1. MongoDB Setup
- Create a MongoDB Atlas cluster.
- Copy your connection string.
- Set it as `MONGODB_URI` in the root `.env`. The app uses an ephemeral in-memory database only when this variable is omitted in local development, so that data is not persistent.

### 2. AI Setup
- The default hosted provider is Groq: set `AI_PROVIDER=groq`, `GROQ_API_KEY`, and optionally `GROQ_MODEL`.
- Alternatively use Gemini with `AI_PROVIDER=gemini` and `GOOGLE_API_KEY`, or local Ollama with `AI_PROVIDER=ollama` and `GEMMA_API_URL`.

### 3. Backend Setup
1. Clone the repository and navigate to the project root.
2. Run `npm install` to install backend dependencies.
3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

   Confirm the configured database is connected in the startup log (`MongoDB Connected: ...`).

### 4. Frontend Setup
1. Open a new terminal and navigate to `/client`.
2. Run `npm install`.
3. Create `.env` in the `/client` directory and add `VITE_API_URL=http://localhost:3001/api`.
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173`, register an account, then begin an Approach or Code Hint session. Use **My History** to revisit sessions saved to your account.

## Deployment (Render)
This project is Render-ready.
1. Create a new "Web Service" on Render.
2. Connect your GitHub repository.
3. Render will automatically detect `render.yaml` and configure the build settings.
4. Set your Environment Variables in the Render Dashboard (`MONGODB_URI`, `AI_PROVIDER=groq`, `GROQ_API_KEY`).
5. Deploy!

*(Note: For cloud deployments, a hosted API like Google Gemini is easier to deploy than Ollama, unless you have a dedicated server for Ollama. The codebase supports both via the `AI_PROVIDER` flag.)*
