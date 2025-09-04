const astraDB = require('../config/astradb');
const { v4: uuidv4 } = require('uuid');

class ChatEmbeddingService {
  constructor() {
    this.collection = null;
  }

  async initialize() {
    if (!this.collection) {
      this.collection = await astraDB.connect();
    }
    return this.collection;
  }

  // Create a new chat embedding
  async createChatEmbedding(embeddingData) {
    try {
      await this.initialize();

      const document = {
        _id: uuidv4(),
        user_id: embeddingData.user_id,
        entry_id: embeddingData.entry_id,
        message_content: embeddingData.message_content,
        message_type: embeddingData.message_type,
        timestamp: new Date().toISOString(),
        session_id: embeddingData.session_id,
        conversation_context: embeddingData.conversation_context,
        $vector: embeddingData.primary_embedding, // AstraDB uses $vector for the main vector
        lightweight_embedding: embeddingData.lightweight_embedding,
        text_length: embeddingData.text_length,
        processing_time_ms: embeddingData.processing_time_ms,
        model_version: embeddingData.model_version,
        semantic_tags: embeddingData.semantic_tags || [],
        emotion_context: embeddingData.emotion_context,
        entities_mentioned: embeddingData.entities_mentioned || { people: [], locations: [], organizations: [] },
        // New feature vector fields
        feature_vector: embeddingData.feature_vector,
        temporal_features: embeddingData.temporal_features,
        emotional_features: embeddingData.emotional_features,
        semantic_features: embeddingData.semantic_features,
        user_features: embeddingData.user_features,
        // New metadata fields
        feature_completeness: embeddingData.feature_completeness,
        confidence_score: embeddingData.confidence_score,
        temporal_context: embeddingData.temporal_context,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await this.collection.insertOne(document);
      
      return {
        id: document._id,
        ...document,
        insertedId: result.insertedId
      };
    } catch (error) {
      throw new Error(`Failed to create chat embedding: ${error.message}`);
    }
  }

  // Get chat embedding by ID
  async getChatEmbeddingById(id) {
    try {
      await this.initialize();

      const result = await this.collection.findOne({ _id: id });
      
      if (!result) {
        throw new Error('Chat embedding not found');
      }

      return {
        id: result._id,
        user_id: result.user_id,
        entry_id: result.entry_id,
        message_content: result.message_content,
        message_type: result.message_type,
        timestamp: result.timestamp,
        session_id: result.session_id,
        conversation_context: result.conversation_context,
        primary_embedding: result.$vector,
        lightweight_embedding: result.lightweight_embedding,
        text_length: result.text_length,
        processing_time_ms: result.processing_time_ms,
        model_version: result.model_version,
        semantic_tags: result.semantic_tags,
        emotion_context: result.emotion_context,
        entities_mentioned: result.entities_mentioned,
        // New feature vector fields
        feature_vector: result.feature_vector,
        temporal_features: result.temporal_features,
        emotional_features: result.emotional_features,
        semantic_features: result.semantic_features,
        user_features: result.user_features,
        // New metadata fields
        feature_completeness: result.feature_completeness,
        confidence_score: result.confidence_score,
        temporal_context: result.temporal_context,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      throw new Error(`Failed to get chat embedding: ${error.message}`);
    }
  }

  // Update chat embedding - REPLACES the entire entry
  async updateChatEmbedding(id, newEmbeddingData) {
    try {
      await this.initialize();

      // First check if the entry exists
      const existingEntry = await this.collection.findOne({ _id: id });
      
      if (!existingEntry) {
        throw new Error('Chat embedding not found');
      }

      // Create completely new entry data, preserving only id and timestamps
      const replacementDocument = {
        _id: id,  // Keep the same ID
        user_id: newEmbeddingData.user_id,
        entry_id: newEmbeddingData.entry_id,
        message_content: newEmbeddingData.message_content,
        message_type: newEmbeddingData.message_type,
        timestamp: newEmbeddingData.timestamp || new Date().toISOString(),
        session_id: newEmbeddingData.session_id,
        conversation_context: newEmbeddingData.conversation_context,
        $vector: newEmbeddingData.primary_embedding, // AstraDB uses $vector for the main vector
        lightweight_embedding: newEmbeddingData.lightweight_embedding,
        text_length: newEmbeddingData.text_length,
        processing_time_ms: newEmbeddingData.processing_time_ms,
        model_version: newEmbeddingData.model_version,
        semantic_tags: newEmbeddingData.semantic_tags || [],
        emotion_context: newEmbeddingData.emotion_context,
        entities_mentioned: newEmbeddingData.entities_mentioned || { people: [], locations: [], organizations: [] },
        // Feature vector fields
        feature_vector: newEmbeddingData.feature_vector,
        temporal_features: newEmbeddingData.temporal_features,
        emotional_features: newEmbeddingData.emotional_features,
        semantic_features: newEmbeddingData.semantic_features,
        user_features: newEmbeddingData.user_features,
        // Metadata fields
        feature_completeness: newEmbeddingData.feature_completeness,
        confidence_score: newEmbeddingData.confidence_score,
        temporal_context: newEmbeddingData.temporal_context,
        created_at: existingEntry.created_at,  // Preserve original creation time
        updated_at: new Date().toISOString()   // Update the modification time
      };

      // Replace the entire document
      const result = await this.collection.replaceOne(
        { _id: id },
        replacementDocument
      );

      if (result.matchedCount === 0) {
        throw new Error('Chat embedding not found');
      }

      // Fetch and return the replaced document
      const updatedEntry = await this.collection.findOne({ _id: id });

      return {
        id: updatedEntry._id,
        user_id: updatedEntry.user_id,
        entry_id: updatedEntry.entry_id,
        message_content: updatedEntry.message_content,
        message_type: updatedEntry.message_type,
        timestamp: updatedEntry.timestamp,
        session_id: updatedEntry.session_id,
        conversation_context: updatedEntry.conversation_context,
        primary_embedding: updatedEntry.$vector,
        lightweight_embedding: updatedEntry.lightweight_embedding,
        text_length: updatedEntry.text_length,
        processing_time_ms: updatedEntry.processing_time_ms,
        model_version: updatedEntry.model_version,
        semantic_tags: updatedEntry.semantic_tags,
        emotion_context: updatedEntry.emotion_context,
        entities_mentioned: updatedEntry.entities_mentioned,
        // Feature vector fields
        feature_vector: updatedEntry.feature_vector,
        temporal_features: updatedEntry.temporal_features,
        emotional_features: updatedEntry.emotional_features,
        semantic_features: updatedEntry.semantic_features,
        user_features: updatedEntry.user_features,
        // Metadata fields
        feature_completeness: updatedEntry.feature_completeness,
        confidence_score: updatedEntry.confidence_score,
        temporal_context: updatedEntry.temporal_context,
        created_at: updatedEntry.created_at,
        updated_at: updatedEntry.updated_at
      };
    } catch (error) {
      throw new Error(`Failed to update chat embedding: ${error.message}`);
    }
  }

  // Delete chat embedding
  async deleteChatEmbedding(id) {
    try {
      await this.initialize();

      const result = await this.collection.deleteOne({ _id: id });

      if (result.deletedCount === 0) {
        throw new Error('Chat embedding not found');
      }

      return {
        id,
        deleted: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      throw new Error(`Failed to delete chat embedding: ${error.message}`);
    }
  }

  // Find similar chat embeddings using vector similarity
  async findSimilarChatEmbeddings(queryVector, options = {}) {
    try {
      await this.initialize();

      const { limit = 10, filters = {} } = options;
      
      // Build query with filters
      let query = {};
      
      if (filters.user_id) query.user_id = filters.user_id;
      if (filters.session_id) query.session_id = filters.session_id;
      if (filters.message_type) query.message_type = filters.message_type;
      
      if (filters.date_range) {
        query.timestamp = {};
        if (filters.date_range.start) query.timestamp.$gte = filters.date_range.start;
        if (filters.date_range.end) query.timestamp.$lte = filters.date_range.end;
      }
      
      if (filters.emotion_filter) {
        if (filters.emotion_filter.dominant_emotion) {
          query['emotion_context.dominant_emotion'] = filters.emotion_filter.dominant_emotion;
        }
        if (filters.emotion_filter.min_intensity) {
          query['emotion_context.intensity'] = { $gte: filters.emotion_filter.min_intensity };
        }
      }
      
      if (filters.semantic_tags && filters.semantic_tags.length > 0) {
        query.semantic_tags = { $in: filters.semantic_tags };
      }

      // Perform vector similarity search
      const results = await this.collection.find(
        query,
        {
          sort: { $vector: queryVector },
          limit,
          includeSimilarity: true
        }
      ).toArray();

      return {
        query_vector_dimensions: queryVector.length,
        results_count: results.length,
        max_similarity_score: results.length > 0 ? results[0].$similarity : 0,
        min_similarity_score: results.length > 0 ? results[results.length - 1].$similarity : 0,
        results: results.map(result => ({
          id: result._id,
          user_id: result.user_id,
          entry_id: result.entry_id,
          message_content: result.message_content,
          message_type: result.message_type,
          timestamp: result.timestamp,
          session_id: result.session_id,
          conversation_context: result.conversation_context,
          primary_embedding: result.$vector,
          lightweight_embedding: result.lightweight_embedding,
          text_length: result.text_length,
          processing_time_ms: result.processing_time_ms,
          model_version: result.model_version,
          semantic_tags: result.semantic_tags,
          emotion_context: result.emotion_context,
          entities_mentioned: result.entities_mentioned,
          // New feature vector fields
          feature_vector: result.feature_vector,
          temporal_features: result.temporal_features,
          emotional_features: result.emotional_features,
          semantic_features: result.semantic_features,
          user_features: result.user_features,
          // New metadata fields
          feature_completeness: result.feature_completeness,
          confidence_score: result.confidence_score,
          temporal_context: result.temporal_context,
          similarity_score: result.$similarity,
          created_at: result.created_at,
          updated_at: result.updated_at
        }))
      };
    } catch (error) {
      throw new Error(`Failed to find similar chat embeddings: ${error.message}`);
    }
  }

  // Create multiple chat embeddings in batch
  async createChatEmbeddingsBatch(embeddingsArray) {
    try {
      await this.initialize();

      const documents = embeddingsArray.map(embeddingData => ({
        _id: uuidv4(),
        user_id: embeddingData.user_id,
        entry_id: embeddingData.entry_id,
        message_content: embeddingData.message_content,
        message_type: embeddingData.message_type,
        timestamp: new Date().toISOString(),
        session_id: embeddingData.session_id,
        conversation_context: embeddingData.conversation_context,
        $vector: embeddingData.primary_embedding,
        lightweight_embedding: embeddingData.lightweight_embedding,
        text_length: embeddingData.text_length,
        processing_time_ms: embeddingData.processing_time_ms,
        model_version: embeddingData.model_version,
        semantic_tags: embeddingData.semantic_tags || [],
        emotion_context: embeddingData.emotion_context,
        entities_mentioned: embeddingData.entities_mentioned || { people: [], locations: [], organizations: [] },
        // New feature vector fields
        feature_vector: embeddingData.feature_vector,
        temporal_features: embeddingData.temporal_features,
        emotional_features: embeddingData.emotional_features,
        semantic_features: embeddingData.semantic_features,
        user_features: embeddingData.user_features,
        // New metadata fields
        feature_completeness: embeddingData.feature_completeness,
        confidence_score: embeddingData.confidence_score,
        temporal_context: embeddingData.temporal_context,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const result = await this.collection.insertMany(documents);

      return {
        inserted_count: result.insertedCount,
        inserted_ids: result.insertedIds,
        documents: documents.map(doc => ({
          id: doc._id,
          user_id: doc.user_id,
          entry_id: doc.entry_id,
          message_content: doc.message_content,
          message_type: doc.message_type,
          timestamp: doc.timestamp,
          session_id: doc.session_id
        }))
      };
    } catch (error) {
      throw new Error(`Failed to create chat embeddings batch: ${error.message}`);
    }
  }

  // Query chat embeddings with filters and pagination
  async queryChatEmbeddings(queryOptions = {}) {
    try {
      await this.initialize();

      const {
        user_id,
        session_id,
        message_type,
        date_range,
        limit = 20,
        offset = 0,
        sort_by = 'timestamp',
        sort_order = 'desc'
      } = queryOptions;

      // Build query
      let query = {};
      
      if (user_id) query.user_id = user_id;
      if (session_id) query.session_id = session_id;
      if (message_type) query.message_type = message_type;
      
      if (date_range) {
        query.timestamp = {};
        if (date_range.start) query.timestamp.$gte = date_range.start;
        if (date_range.end) query.timestamp.$lte = date_range.end;
      }

      // Build sort
      const sortOrder = sort_order === 'asc' ? 1 : -1;
      const sortObj = { [sort_by]: sortOrder };

      // Execute query with pagination
      const results = await this.collection.find(query)
        .sort(sortObj)
        .skip(offset)
        .limit(limit)
        .toArray();

      // Get total count for pagination
      const totalCount = await this.collection.countDocuments(query);

      return {
        results: results.map(result => ({
          id: result._id,
          user_id: result.user_id,
          entry_id: result.entry_id,
          message_content: result.message_content,
          message_type: result.message_type,
          timestamp: result.timestamp,
          session_id: result.session_id,
          conversation_context: result.conversation_context,
          text_length: result.text_length,
          processing_time_ms: result.processing_time_ms,
          model_version: result.model_version,
          semantic_tags: result.semantic_tags,
          emotion_context: result.emotion_context,
          entities_mentioned: result.entities_mentioned,
          // New feature vector fields
          feature_vector: result.feature_vector,
          temporal_features: result.temporal_features,
          emotional_features: result.emotional_features,
          semantic_features: result.semantic_features,
          user_features: result.user_features,
          // New metadata fields
          feature_completeness: result.feature_completeness,
          confidence_score: result.confidence_score,
          temporal_context: result.temporal_context,
          created_at: result.created_at,
          updated_at: result.updated_at
        })),
        pagination: {
          total_count: totalCount,
          current_page: Math.floor(offset / limit) + 1,
          total_pages: Math.ceil(totalCount / limit),
          has_next: offset + limit < totalCount,
          has_previous: offset > 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to query chat embeddings: ${error.message}`);
    }
  }

  // Get collection statistics
  async getStatistics() {
    try {
      await this.initialize();

      const totalCount = await this.collection.countDocuments({});
      
      // Get statistics by message type
      const messageTypeStats = await this.collection.aggregate([
        { $group: { _id: '$message_type', count: { $sum: 1 } } }
      ]).toArray();

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentCount = await this.collection.countDocuments({
        timestamp: { $gte: sevenDaysAgo.toISOString() }
      });

      // Average processing time
      const processingStats = await this.collection.aggregate([
        {
          $group: {
            _id: null,
            avg_processing_time: { $avg: '$processing_time_ms' },
            min_processing_time: { $min: '$processing_time_ms' },
            max_processing_time: { $max: '$processing_time_ms' }
          }
        }
      ]).toArray();

      return {
        total_embeddings: totalCount,
        recent_embeddings_7_days: recentCount,
        message_type_distribution: messageTypeStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        processing_statistics: processingStats[0] || {
          avg_processing_time: 0,
          min_processing_time: 0,
          max_processing_time: 0
        },
        collection_info: {
          name: 'chat_embeddings',
          vector_dimensions: {
            primary: 768,
            lightweight: 384
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }
}

// Export singleton instance
const chatEmbeddingService = new ChatEmbeddingService();
module.exports = chatEmbeddingService;
