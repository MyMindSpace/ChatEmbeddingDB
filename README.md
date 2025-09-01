# MyMindSpace Chat Embedding Vector Database Service

A specialized vector database CRUD service for storing and retrieving chat embeddings from conversational AI interactions in the MyMindSpace mental wellness platform.

## 🎯 Purpose

This service manages chat embeddings with dual vector representations:
- **Primary embedding**: 768 dimensions (all-mpnet-base-v2)
- **Lightweight embedding**: 384 dimensions (all-MiniLM-L6-v2)

Designed for sophisticated conversation analysis, emotion tracking, and semantic search across chat interactions.

## � Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed
- AstraDB account (free tier available at [astra.datastax.com](https://astra.datastax.com))

### 1. Clone & Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd ChatEmbeddingDB

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. AstraDB Setup
1. **Create Database**: Go to [AstraDB Console](https://astra.datastax.com) → Create Database
   - Database Name: `mymindspace-chat-embeddings`
   - Keyspace: `default_keyspace`
   - Region: Choose closest to your deployment

2. **Get Credentials**: After database creation
   - Copy Database ID from dashboard
   - Generate Application Token with Database Admin permissions
   - Note the database region

3. **Update .env file**:
```bash
ASTRA_DB_ID=your_database_id_here
ASTRA_DB_REGION=your_region_here
ASTRA_DB_KEYSPACE=default_keyspace
ASTRA_DB_APPLICATION_TOKEN=your_token_here
API_KEY=your_secure_api_key_here
```

### 3. Start Service
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 4. Verify Setup
Check service health:
```bash
curl http://localhost:3000/health
```

## �🗄️ Schema

### Chat Embeddings Collection (`chat_embeddings`)

```json
{
  "id": "uuid",
  "user_id": "uuid", 
  "entry_id": "uuid",
  "message_content": "text",
  "message_type": "user_message | ai_response | system_message",
  "timestamp": "datetime",
  "session_id": "uuid",
  "conversation_context": "string",
  "primary_embedding": [768 dimensions],
  "lightweight_embedding": [384 dimensions],
  "text_length": "integer",
  "processing_time_ms": "float",
  "model_version": "string",
  "semantic_tags": ["array", "of", "topics"],
  "emotion_context": {
    "dominant_emotion": "string",
    "intensity": "float",
    "emotions": {
      "joy": "float",
      "sadness": "float",
      "anger": "float",
      "fear": "float",
      "surprise": "float", 
      "disgust": "float",
      "anticipation": "float",
      "trust": "float"
    }
  },
  "entities_mentioned": {
    "people": ["array", "of", "names"],
    "locations": ["array", "of", "places"], 
    "organizations": ["array", "of", "orgs"]
  },
  "temporal_context": {
    "hour_of_day": "integer",
    "day_of_week": "integer",
    "is_weekend": "boolean"
  }
}
```

## 🚀 API Endpoints & Usage

### Authentication
All API endpoints (except `/health`) require an API key in the header:
```bash
X-API-Key: your_api_key_here
```

### Core CRUD Operations

#### Create Chat Embedding
```bash
POST /api/chat-embeddings
Content-Type: application/json
X-API-Key: your_api_key_here

{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "entry_id": "550e8400-e29b-41d4-a716-446655440001",
  "message_content": "I'm feeling anxious about my upcoming exam",
  "message_type": "user_message",
  "session_id": "550e8400-e29b-41d4-a716-446655440002",
  "conversation_context": "User discussing academic stress",
  "primary_embedding": [0.1, 0.2, ...768 numbers],
  "lightweight_embedding": [0.3, 0.4, ...384 numbers],
  "text_length": 45,
  "processing_time_ms": 150.5,
  "model_version": "all-mpnet-base-v2",
  "semantic_tags": ["anxiety", "education", "stress"],
  "emotion_context": {
    "dominant_emotion": "fear",
    "intensity": 0.7,
    "emotions": {
      "joy": 0.1,
      "sadness": 0.2,
      "anger": 0.1,
      "fear": 0.7,
      "surprise": 0.0,
      "disgust": 0.0,
      "anticipation": 0.3,
      "trust": 0.2
    }
  },
  "entities_mentioned": {
    "people": [],
    "locations": [],
    "organizations": ["university"]
  },
  "temporal_context": {
    "hour_of_day": 14,
    "day_of_week": 1,
    "is_weekend": false
  }
}
```

#### Get Embedding by ID
```bash
GET /api/chat-embeddings/550e8400-e29b-41d4-a716-446655440000
X-API-Key: your_api_key_here
```

#### Update Embedding
```bash
PUT /api/chat-embeddings/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
X-API-Key: your_api_key_here

{
  "semantic_tags": ["anxiety", "education", "stress", "coping"],
  "emotion_context": {
    "dominant_emotion": "anticipation",
    "intensity": 0.5,
    "emotions": { /* updated emotion scores */ }
  }
}
```

#### Delete Embedding
```bash
DELETE /api/chat-embeddings/550e8400-e29b-41d4-a716-446655440000
X-API-Key: your_api_key_here
```

### Advanced Operations

#### Vector Similarity Search
Find conversations similar to a given embedding:
```bash
POST /api/chat-embeddings/similarity
Content-Type: application/json
X-API-Key: your_api_key_here

{
  "primary_embedding": [0.1, 0.2, ...768 numbers],
  "limit": 10,
  "filters": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "message_type": "user_message",
    "emotion_filter": {
      "dominant_emotion": "fear",
      "min_intensity": 0.5
    },
    "semantic_tags": ["anxiety", "stress"]
  }
}
```

#### Batch Create Embeddings
```bash
POST /api/chat-embeddings/batch
Content-Type: application/json
X-API-Key: your_api_key_here

{
  "embeddings": [
    { /* embedding object 1 */ },
    { /* embedding object 2 */ },
    // ... up to 50 embeddings
  ]
}
```

#### Query with Filters
```bash
GET /api/chat-embeddings/query?user_id=550e8400-e29b-41d4-a716-446655440000&message_type=user_message&limit=20&offset=0&sort_by=timestamp&sort_order=desc
X-API-Key: your_api_key_here
```

#### Get User's Chat History
```bash
GET /api/chat-embeddings/user/550e8400-e29b-41d4-a716-446655440000?limit=50&sort_order=desc
X-API-Key: your_api_key_here
```

#### Get Session Conversation
```bash
GET /api/chat-embeddings/session/550e8400-e29b-41d4-a716-446655440002?sort_order=asc
X-API-Key: your_api_key_here
```

#### Collection Statistics
```bash
GET /api/chat-embeddings/stats
X-API-Key: your_api_key_here
```

### Response Format
All successful responses follow this format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details"
}
```

## 📋 Environment Variables

Create a `.env` file with these variables:

```bash
# AstraDB Configuration (Required)
ASTRA_DB_ID=your_database_id
ASTRA_DB_REGION=us-east1
ASTRA_DB_KEYSPACE=default_keyspace
ASTRA_DB_APPLICATION_TOKEN=your_application_token

# Server Configuration
NODE_ENV=development
PORT=3000
API_KEY=your_secure_api_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Vector Configuration
DEFAULT_VECTOR_DIMENSIONS=768
MAX_VECTOR_DIMENSIONS=4096
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test API Endpoints
Use the provided examples or tools like Postman/Insomnia:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test with API key
curl -H "X-API-Key: your_api_key_here" http://localhost:3000/api/chat-embeddings/stats
```

## 🐳 Docker Deployment

### Build and Run Locally
```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run

# Or use docker commands directly
docker build -t mymindspace-chat-embedding .
docker run -p 3000:3000 --env-file .env mymindspace-chat-embedding
```

### Production Deployment
```bash
# Build for production
docker build -t mymindspace-chat-embedding:prod .

# Run with production config
docker run -d \
  --name chat-embedding-service \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e ASTRA_DB_ID=your_id \
  -e ASTRA_DB_REGION=your_region \
  -e ASTRA_DB_KEYSPACE=default_keyspace \
  -e ASTRA_DB_APPLICATION_TOKEN=your_token \
  -e API_KEY=your_secure_api_key \
  mymindspace-chat-embedding:prod
```

## ☁️ Google Cloud Deployment

### Deploy to Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/chat-embedding-service
gcloud run deploy chat-embedding-service \
  --image gcr.io/YOUR_PROJECT_ID/chat-embedding-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars ASTRA_DB_ID=your_id \
  --set-env-vars ASTRA_DB_REGION=your_region \
  --set-env-vars ASTRA_DB_KEYSPACE=default_keyspace \
  --set-env-vars ASTRA_DB_APPLICATION_TOKEN=your_token \
  --set-env-vars API_KEY=your_secure_api_key
```

### Deploy to App Engine
```bash
# Deploy using app.yaml
gcloud app deploy
```

## 💡 Usage Examples

### Node.js Client
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  }
});

// Create embedding
const createEmbedding = async (embeddingData) => {
  try {
    const response = await client.post('/chat-embeddings', embeddingData);
    return response.data;
  } catch (error) {
    console.error('Error creating embedding:', error.response.data);
  }
};

// Search similar embeddings
const searchSimilar = async (queryVector, filters = {}) => {
  try {
    const response = await client.post('/chat-embeddings/similarity', {
      primary_embedding: queryVector,
      limit: 10,
      filters
    });
    return response.data;
  } catch (error) {
    console.error('Error searching embeddings:', error.response.data);
  }
};
```

### Python Client
```python
import requests
import json

class ChatEmbeddingClient:
    def __init__(self, base_url="http://localhost:3000/api", api_key="your_api_key_here"):
        self.base_url = base_url
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }
    
    def create_embedding(self, embedding_data):
        response = requests.post(
            f"{self.base_url}/chat-embeddings",
            headers=self.headers,
            json=embedding_data
        )
        return response.json()
    
    def search_similar(self, query_vector, filters=None, limit=10):
        payload = {
            "primary_embedding": query_vector,
            "limit": limit,
            "filters": filters or {}
        }
        response = requests.post(
            f"{self.base_url}/chat-embeddings/similarity",
            headers=self.headers,
            json=payload
        )
        return response.json()

# Usage
client = ChatEmbeddingClient()
result = client.search_similar(query_vector, {"user_id": "user123"})
```

## 🔍 Monitoring & Health

### Health Check
The service provides a comprehensive health check endpoint:
```bash
GET /health
```

Response includes:
- Service status
- Database connectivity
- Uptime information
- Version details

### Logging
The service uses structured logging with different levels:
- `info`: General operation logs
- `error`: Error conditions
- `warn`: Warning conditions

Set log level via `LOG_LEVEL` environment variable.

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: AstraDB connection failed
```
**Solutions:**
- Verify `ASTRA_DB_APPLICATION_TOKEN` is correct
- Check `ASTRA_DB_ID` and `ASTRA_DB_REGION`
- Ensure database is active in AstraDB console
- Verify keyspace exists (use `default_keyspace` if unsure)

#### 2. API Key Issues
```
Error: Invalid or missing API key
```
**Solutions:**
- Set `API_KEY` in environment variables
- Include `X-API-Key` header in all requests
- In development, API key validation is relaxed

#### 3. Vector Dimension Mismatch
```
Error: Vector dimension mismatch
```
**Solutions:**
- Ensure primary embeddings have exactly 768 dimensions
- Ensure lightweight embeddings have exactly 384 dimensions
- Check your embedding generation pipeline

#### 4. Memory Issues
```
Error: JavaScript heap out of memory
```
**Solutions:**
- Reduce batch size for bulk operations
- Increase Node.js memory limit: `node --max-old-space-size=4096 server.js`
- Consider pagination for large queries

### Debug Mode
Enable debug logging:
```bash
LOG_LEVEL=debug npm run dev
```

## �️ Architecture & Integration

### Service Architecture
```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐    DataStax     ┌─────────────────┐
│   Client App    │ ──────────────► │ Chat Embedding  │ ──────────────► │   AstraDB       │
│                 │                 │    Service      │                 │  Vector Store   │
│  (React/Node)   │ ◄────────────── │  (Express.js)   │ ◄────────────── │  (Cassandra)    │
└─────────────────┘    API Key      └─────────────────┘   SDK/HTTP      └─────────────────┘
```

### Integration with MyMindSpace
This service is designed to integrate seamlessly with the MyMindSpace ecosystem:

1. **Journal Service**: Store embeddings of journal entries for semantic search
2. **AI Chat Service**: Store conversation embeddings for context retrieval
3. **Analytics Service**: Query embeddings for user behavior analysis
4. **Recommendation Engine**: Use similarity search for personalized content

### Microservice Communication
```javascript
// Example integration with other MyMindSpace services
const chatEmbeddingService = {
  baseURL: process.env.CHAT_EMBEDDING_SERVICE_URL,
  apiKey: process.env.CHAT_EMBEDDING_API_KEY
};

// Store AI response embedding
const storeAIResponse = async (response, context) => {
  const embedding = await generateEmbedding(response);
  await axios.post(`${chatEmbeddingService.baseURL}/api/chat-embeddings`, {
    user_id: context.userId,
    entry_id: uuidv4(),
    message_content: response,
    message_type: 'ai_response',
    session_id: context.sessionId,
    primary_embedding: embedding.primary,
    lightweight_embedding: embedding.lightweight,
    // ... other fields
  }, {
    headers: { 'X-API-Key': chatEmbeddingService.apiKey }
  });
};
```

## 🔧 Development & Customization

### Project Structure
```
ChatEmbeddingDB/
├── config/
│   └── astradb.js              # Database connection & config
├── middleware/
│   ├── errorHandler.js         # Centralized error handling
│   └── validation.js           # Joi schema validation
├── routes/
│   └── chatEmbeddings.js       # REST API endpoints
├── services/
│   └── chatEmbeddingService.js # Business logic & DB operations
├── tests/
│   ├── setup.js               # Test configuration
│   └── *.test.js             # Test suites
├── .env                      # Environment configuration
├── server.js                 # Express app setup
└── package.json              # Dependencies & scripts
```

### Extending the Service

#### Adding New Endpoints
```javascript
// In routes/chatEmbeddings.js
router.get('/custom-analysis/:userId', async (req, res, next) => {
  try {
    const analysis = await chatEmbeddingService.performCustomAnalysis(req.params.userId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});
```

#### Custom Validation Schemas
```javascript
// In middleware/validation.js
const customAnalysisSchema = Joi.object({
  timeRange: Joi.object({
    start: Joi.date().iso().required(),
    end: Joi.date().iso().required()
  }).required(),
  analysisType: Joi.string().valid('emotion', 'topic', 'sentiment').required()
});
```

#### Adding New Service Methods
```javascript
// In services/chatEmbeddingService.js
async performEmotionAnalysis(userId, timeRange) {
  const embeddings = await this.queryChatEmbeddings({
    user_id: userId,
    date_range: timeRange
  });
  
  // Analyze emotion patterns
  return this.analyzeEmotionPatterns(embeddings.results);
}
```

## 🔐 Security Considerations

### API Security
- **API Key Authentication**: Required for all operations
- **Rate Limiting**: 100 requests per 15 minutes by default
- **CORS**: Configured for specific origins
- **Input Validation**: Comprehensive Joi schema validation
- **Error Sanitization**: No sensitive data in error responses

### Data Security
- **Vector Data**: Embeddings don't contain raw text (privacy-preserving)
- **User Isolation**: All queries are user-scoped
- **Audit Logging**: All operations are logged with timestamps
- **Encryption**: Data encrypted at rest and in transit (AstraDB)

### Production Recommendations
```bash
# Use strong API keys
API_KEY=$(openssl rand -hex 32)

# Enable security headers
NODE_ENV=production

# Use HTTPS in production
FORCE_HTTPS=true

# Restrict CORS origins
CORS_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

## � Performance & Scaling

### Performance Optimization
- **Vector Indexing**: AstraDB automatically indexes vectors for fast similarity search
- **Connection Pooling**: Persistent database connections
- **Response Caching**: Consider adding Redis for frequently accessed data
- **Batch Operations**: Use bulk endpoints for high-throughput scenarios

### Scaling Considerations
- **Horizontal Scaling**: Stateless service design allows easy scaling
- **Database Scaling**: AstraDB handles automatic scaling
- **Memory Management**: Monitor heap usage for large vector operations
- **Rate Limiting**: Adjust based on usage patterns

### Monitoring Metrics
Track these key metrics:
- Request latency (p95, p99)
- Error rates by endpoint
- Vector similarity search performance
- Database connection pool utilization
- Memory usage patterns

## 🤝 Contributing

### Development Setup
```bash
# Clone and setup
git clone <repository-url>
cd ChatEmbeddingDB
npm install

# Start development server
npm run dev

# Run tests
npm test

# Check code style
npm run lint
```

### Code Standards
- Use ESLint configuration provided
- Write tests for new functionality
- Follow existing patterns for consistency
- Update documentation for API changes

### Submitting Changes
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit pull request with description

## 📝 License & Support

### License
MIT License - Part of the MyMindSpace mental wellness platform.

### Support
- **Documentation**: This README and inline code comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Community**: MyMindSpace developer community

### Changelog
- **v1.0.0**: Initial release with core CRUD and vector similarity features

---

**MyMindSpace Chat Embedding Service** - Powering intelligent conversation analysis for mental wellness support through advanced vector database operations and semantic understanding.
