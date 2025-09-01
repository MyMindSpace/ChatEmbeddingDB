const express = require('express');
const router = express.Router();
const chatEmbeddingService = require('../services/chatEmbeddingService');
const { 
  validate, 
  validateQuery, 
  chatEmbeddingSchema, 
  updateChatEmbeddingSchema, 
  similaritySearchSchema, 
  batchSchema,
  querySchema 
} = require('../middleware/validation');

// @route   GET /api/chat-embeddings/stats
// @desc    Get collection statistics
// @access  Private
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await chatEmbeddingService.getStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/chat-embeddings/similarity
// @desc    Find similar chat embeddings using cosine similarity
// @access  Private
router.post('/similarity', validate(similaritySearchSchema), async (req, res, next) => {
  try {
    const { primary_embedding, limit, filters } = req.body;
    const result = await chatEmbeddingService.findSimilarChatEmbeddings(primary_embedding, { limit, filters });
    
    res.json({
      success: true,
      data: result,
      message: `Found ${result.results.length} similar chat embeddings`
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/chat-embeddings/batch
// @desc    Create multiple chat embeddings in batch
// @access  Private
router.post('/batch', validate(batchSchema), async (req, res, next) => {
  try {
    const { embeddings } = req.body;
    const result = await chatEmbeddingService.createChatEmbeddingsBatch(embeddings);
    
    res.status(201).json({
      success: true,
      data: result,
      message: `Successfully created ${result.inserted_count} chat embeddings`
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/chat-embeddings/query
// @desc    Query chat embeddings with filters and pagination
// @access  Private
router.get('/query', validateQuery(querySchema), async (req, res, next) => {
  try {
    const result = await chatEmbeddingService.queryChatEmbeddings(req.query);
    
    res.json({
      success: true,
      data: result,
      message: `Found ${result.results.length} chat embeddings`
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/chat-embeddings
// @desc    Create a new chat embedding
// @access  Private
router.post('/', validate(chatEmbeddingSchema), async (req, res, next) => {
  try {
    const chatEmbedding = await chatEmbeddingService.createChatEmbedding(req.body);
    
    res.status(201).json({
      success: true,
      data: chatEmbedding,
      message: 'Chat embedding created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/chat-embeddings/:id
// @desc    Get chat embedding by ID
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const chatEmbedding = await chatEmbeddingService.getChatEmbeddingById(req.params.id);
    
    res.json({
      success: true,
      data: chatEmbedding
    });
  } catch (error) {
    if (error.message === 'Chat embedding not found') {
      return res.status(404).json({
        success: false,
        error: 'Chat embedding not found'
      });
    }
    next(error);
  }
});

// @route   PUT /api/chat-embeddings/:id
// @desc    Update chat embedding by ID
// @access  Private
router.put('/:id', validate(updateChatEmbeddingSchema), async (req, res, next) => {
  try {
    const chatEmbedding = await chatEmbeddingService.updateChatEmbedding(req.params.id, req.body);
    
    res.json({
      success: true,
      data: chatEmbedding,
      message: 'Chat embedding updated successfully'
    });
  } catch (error) {
    if (error.message === 'Chat embedding not found') {
      return res.status(404).json({
        success: false,
        error: 'Chat embedding not found'
      });
    }
    next(error);
  }
});

// @route   DELETE /api/chat-embeddings/:id
// @desc    Delete chat embedding by ID
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await chatEmbeddingService.deleteChatEmbedding(req.params.id);
    
    res.json({
      success: true,
      data: result,
      message: 'Chat embedding deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Chat embedding not found') {
      return res.status(404).json({
        success: false,
        error: 'Chat embedding not found'
      });
    }
    next(error);
  }
});

// @route   GET /api/chat-embeddings/user/:userId
// @desc    Get all chat embeddings for a specific user
// @access  Private
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0, sort_by = 'timestamp', sort_order = 'desc' } = req.query;
    
    const result = await chatEmbeddingService.queryChatEmbeddings({
      user_id: userId,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sort_by,
      sort_order
    });
    
    res.json({
      success: true,
      data: result,
      message: `Found ${result.results.length} chat embeddings for user ${userId}`
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/chat-embeddings/session/:sessionId
// @desc    Get all chat embeddings for a specific session
// @access  Private
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0, sort_by = 'timestamp', sort_order = 'asc' } = req.query;
    
    const result = await chatEmbeddingService.queryChatEmbeddings({
      session_id: sessionId,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sort_by,
      sort_order
    });
    
    res.json({
      success: true,
      data: result,
      message: `Found ${result.results.length} chat embeddings for session ${sessionId}`
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/chat-embeddings/session/:sessionId
// @desc    Delete all chat embeddings for a specific session
// @access  Private
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    // First get all embeddings in the session
    const sessionData = await chatEmbeddingService.queryChatEmbeddings({
      session_id: sessionId,
      limit: 1000 // Reasonable limit for session cleanup
    });
    
    // Delete each embedding (could be optimized with batch delete in production)
    let deletedCount = 0;
    for (const embedding of sessionData.results) {
      try {
        await chatEmbeddingService.deleteChatEmbedding(embedding.id);
        deletedCount++;
      } catch (deleteError) {
        console.warn(`Failed to delete embedding ${embedding.id}:`, deleteError.message);
      }
    }
    
    res.json({
      success: true,
      data: {
        session_id: sessionId,
        deleted_count: deletedCount,
        found_count: sessionData.results.length
      },
      message: `Deleted ${deletedCount} chat embeddings from session ${sessionId}`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
