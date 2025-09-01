const request = require('supertest');
const app = require('../server');

describe('Chat Embedding API', () => {
  const apiKey = process.env.API_KEY || 'test-api-key';
  
  // Sample embedding data for testing
  const sampleEmbedding = {
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    entry_id: '550e8400-e29b-41d4-a716-446655440001',
    message_content: 'I am feeling anxious about my upcoming exam',
    message_type: 'user_message',
    session_id: '550e8400-e29b-41d4-a716-446655440002',
    conversation_context: 'User discussing academic stress',
    primary_embedding: new Array(768).fill(0).map(() => Math.random() - 0.5),
    lightweight_embedding: new Array(384).fill(0).map(() => Math.random() - 0.5),
    text_length: 45,
    processing_time_ms: 150.5,
    model_version: 'all-mpnet-base-v2',
    semantic_tags: ['anxiety', 'education', 'stress'],
    emotion_context: {
      dominant_emotion: 'fear',
      intensity: 0.7,
      emotions: {
        joy: 0.1,
        sadness: 0.2,
        anger: 0.1,
        fear: 0.7,
        surprise: 0.0,
        disgust: 0.0,
        anticipation: 0.3,
        trust: 0.2
      }
    },
    entities_mentioned: {
      people: [],
      locations: [],
      organizations: ['university']
    },
    temporal_context: {
      hour_of_day: 14,
      day_of_week: 1,
      is_weekend: false
    }
  };

  beforeAll(async () => {
    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('API Authentication', () => {
    it('should require API key for protected endpoints', async () => {
      const response = await request(app)
        .get('/api/chat-embeddings/stats');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should accept valid API key', async () => {
      const response = await request(app)
        .get('/api/chat-embeddings/stats')
        .set('X-API-Key', apiKey);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Chat Embeddings CRUD', () => {
    let createdEmbeddingId;

    it('should create a new chat embedding', async () => {
      const response = await request(app)
        .post('/api/chat-embeddings')
        .set('X-API-Key', apiKey)
        .send(sampleEmbedding);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      
      createdEmbeddingId = response.body.data.id;
    });

    it('should get embedding by ID', async () => {
      if (!createdEmbeddingId) {
        return; // Skip if creation failed
      }

      const response = await request(app)
        .get(`/api/chat-embeddings/${createdEmbeddingId}`)
        .set('X-API-Key', apiKey);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', createdEmbeddingId);
      expect(response.body.data).toHaveProperty('message_content', sampleEmbedding.message_content);
    });

    it('should update embedding', async () => {
      if (!createdEmbeddingId) {
        return;
      }

      const updateData = {
        semantic_tags: ['anxiety', 'education', 'stress', 'updated']
      };

      const response = await request(app)
        .put(`/api/chat-embeddings/${createdEmbeddingId}`)
        .set('X-API-Key', apiKey)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.semantic_tags).toContain('updated');
    });

    it('should delete embedding', async () => {
      if (!createdEmbeddingId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/chat-embeddings/${createdEmbeddingId}`)
        .set('X-API-Key', apiKey);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('deleted', true);
    });
  });

  describe('Statistics', () => {
    it('should return collection statistics', async () => {
      const response = await request(app)
        .get('/api/chat-embeddings/stats')
        .set('X-API-Key', apiKey);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('total_embeddings');
      expect(response.body.data).toHaveProperty('collection_info');
    });
  });

  describe('Validation', () => {
    it('should reject invalid embedding data', async () => {
      const invalidData = {
        ...sampleEmbedding,
        primary_embedding: new Array(500).fill(0) // Wrong dimension
      };

      const response = await request(app)
        .post('/api/chat-embeddings')
        .set('X-API-Key', apiKey)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing required fields', async () => {
      const incompleteData = {
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        message_content: 'Test message'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/chat-embeddings')
        .set('X-API-Key', apiKey)
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
