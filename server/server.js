import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import approachRoutes from './routes/approachRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect to Database
// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

app.use('/api/approach', approachRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/auth', authRoutes);

// Error handling
app.use(errorHandler);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../', 'client', 'dist', 'index.html'))
  );
}

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => app.listen(PORT, () => {
    console.log(`StepWise DSA Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`AI Provider: ${process.env.AI_PROVIDER || 'groq'}`);
  })).catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  });
}

export default app;
