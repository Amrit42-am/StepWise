import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;
let authHeader;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Close the default connection opened by server.js if any
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
  const res = await request(app).post('/api/auth/register').send({
    username: 'testlearner',
    email: 'test@example.com',
    password: 'secure-password'
  });
  authHeader = { Authorization: `Bearer ${res.body.token}` };
  userId = res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Mock the AI service to avoid real API calls during tests
vi.mock('../services/aiService.js', () => ({
  default: {
    getInitialApproachHint: vi.fn().mockResolvedValue('Mocked initial hint'),
    getNextApproachHint: vi.fn().mockResolvedValue('Mocked next hint'),
    getInitialCodeHint: vi.fn().mockResolvedValue('Mocked code hint'),
    getNextCodeHint: vi.fn().mockResolvedValue('Mocked next code hint')
  }
}));

describe('StepWise DSA API', () => {
  describe('Authentication', () => {
    it('should register a user and return a token', async () => {
      expect(userId).toBeTruthy();
      expect(authHeader.Authorization).toMatch(/^Bearer /);
    });
  });

  describe('Health Check', () => {
    it('should return server status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'Server is running');
    });
  });

  describe('Approach Mode', () => {
    let sessionId;

    it('should start an approach session successfully', async () => {
      const res = await request(app)
        .post('/api/approach/start')
        .set(authHeader)
        .send({ problem: 'Two Sum' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('sessionId');
      expect(res.body).toHaveProperty('hintLevel', 1);
      sessionId = res.body.sessionId;
    });

    it('should validate missing problem statement', async () => {
      const res = await request(app)
        .post('/api/approach/start')
        .set(authHeader)
        .send({});
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should get next hint', async () => {
      const res = await request(app)
        .post('/api/approach/next')
        .set(authHeader)
        .send({ sessionId, studentResponse: 'I am thinking about using nested loops' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('hintLevel', 2);
    });

    it('should return only the authenticated user\'s history', async () => {
      const res = await request(app).get('/api/sessions').set(authHeader);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].user).toEqual(userId);
    });

    it('should reject unauthenticated session requests', async () => {
      const res = await request(app).get('/api/sessions');
      expect(res.statusCode).toEqual(401);
    });
  });
});
