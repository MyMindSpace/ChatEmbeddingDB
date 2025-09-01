const Joi = require('joi');

// Emotion schema for emotion_context
const emotionSchema = Joi.object({
  joy: Joi.number().min(0).max(1).default(0),
  sadness: Joi.number().min(0).max(1).default(0),
  anger: Joi.number().min(0).max(1).default(0),
  fear: Joi.number().min(0).max(1).default(0),
  surprise: Joi.number().min(0).max(1).default(0),
  disgust: Joi.number().min(0).max(1).default(0),
  anticipation: Joi.number().min(0).max(1).default(0),
  trust: Joi.number().min(0).max(1).default(0)
});

// Emotion context schema
const emotionContextSchema = Joi.object({
  dominant_emotion: Joi.string().valid('joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'anticipation', 'trust').required(),
  intensity: Joi.number().min(0).max(1).required(),
  emotions: emotionSchema.required()
});

// Entities mentioned schema
const entitiesMentionedSchema = Joi.object({
  people: Joi.array().items(Joi.string()).default([]),
  locations: Joi.array().items(Joi.string()).default([]),
  organizations: Joi.array().items(Joi.string()).default([])
});

// Temporal context schema
const temporalContextSchema = Joi.object({
  hour_of_day: Joi.number().integer().min(0).max(23).required(),
  day_of_week: Joi.number().integer().min(0).max(6).required(),
  is_weekend: Joi.boolean().required()
});

// Chat embedding validation schema
const chatEmbeddingSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  entry_id: Joi.string().uuid().required(),
  message_content: Joi.string().min(1).max(10000).required(),
  message_type: Joi.string().valid('user_message', 'ai_response', 'system_message').required(),
  session_id: Joi.string().uuid().required(),
  conversation_context: Joi.string().max(2000).optional(),
  primary_embedding: Joi.array()
    .items(Joi.number())
    .length(768)
    .required()
    .messages({
      'array.base': 'Primary embedding must be an array of numbers',
      'array.length': 'Primary embedding must have exactly 768 dimensions',
      'any.required': 'Primary embedding is required'
    }),
  lightweight_embedding: Joi.array()
    .items(Joi.number())
    .length(384)
    .required()
    .messages({
      'array.base': 'Lightweight embedding must be an array of numbers',
      'array.length': 'Lightweight embedding must have exactly 384 dimensions',
      'any.required': 'Lightweight embedding is required'
    }),
  text_length: Joi.number().integer().min(0).required(),
  processing_time_ms: Joi.number().min(0).required(),
  model_version: Joi.string().required(),
  semantic_tags: Joi.array().items(Joi.string()).optional().default([]),
  emotion_context: emotionContextSchema.optional(),
  entities_mentioned: entitiesMentionedSchema.optional().default({ people: [], locations: [], organizations: [] }),
  temporal_context: temporalContextSchema.required()
});

// Update chat embedding schema (partial)
const updateChatEmbeddingSchema = Joi.object({
  message_content: Joi.string().min(1).max(10000).optional(),
  message_type: Joi.string().valid('user_message', 'ai_response', 'system_message').optional(),
  conversation_context: Joi.string().max(2000).optional(),
  primary_embedding: Joi.array()
    .items(Joi.number())
    .length(768)
    .optional(),
  lightweight_embedding: Joi.array()
    .items(Joi.number())
    .length(384)
    .optional(),
  text_length: Joi.number().integer().min(0).optional(),
  processing_time_ms: Joi.number().min(0).optional(),
  model_version: Joi.string().optional(),
  semantic_tags: Joi.array().items(Joi.string()).optional(),
  emotion_context: emotionContextSchema.optional(),
  entities_mentioned: entitiesMentionedSchema.optional(),
  temporal_context: temporalContextSchema.optional()
});

// Similarity search schema
const similaritySearchSchema = Joi.object({
  primary_embedding: Joi.array()
    .items(Joi.number())
    .length(768)
    .required()
    .messages({
      'array.length': 'Primary embedding must have exactly 768 dimensions for similarity search'
    }),
  limit: Joi.number().integer().min(1).max(100).default(10),
  filters: Joi.object({
    user_id: Joi.string().uuid().optional(),
    session_id: Joi.string().uuid().optional(),
    message_type: Joi.string().valid('user_message', 'ai_response', 'system_message').optional(),
    date_range: Joi.object({
      start: Joi.date().iso().optional(),
      end: Joi.date().iso().optional()
    }).optional(),
    emotion_filter: Joi.object({
      dominant_emotion: Joi.string().valid('joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'anticipation', 'trust').optional(),
      min_intensity: Joi.number().min(0).max(1).optional()
    }).optional(),
    semantic_tags: Joi.array().items(Joi.string()).optional()
  }).optional().default({})
});

// Batch schema for multiple chat embeddings
const batchSchema = Joi.object({
  embeddings: Joi.array()
    .items(chatEmbeddingSchema)
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': 'At least one embedding is required',
      'array.max': 'Maximum 50 embeddings allowed per batch'
    })
});

// Query validation schema
const querySchema = Joi.object({
  user_id: Joi.string().uuid().optional(),
  session_id: Joi.string().uuid().optional(),
  message_type: Joi.string().valid('user_message', 'ai_response', 'system_message').optional(),
  date_range: Joi.object({
    start: Joi.date().iso().optional(),
    end: Joi.date().iso().optional()
  }).optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
  sort_by: Joi.string().valid('timestamp', 'processing_time_ms', 'text_length').default('timestamp'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc')
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errorMessage
      });
    }
    
    next();
  };
};

// Query validation middleware
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { 
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: 'Query Validation Error',
        details: errorMessage
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  chatEmbeddingSchema,
  updateChatEmbeddingSchema,
  similaritySearchSchema,
  batchSchema,
  querySchema
};
