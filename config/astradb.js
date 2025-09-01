const { DataAPIClient } = require('@datastax/astra-db-ts');
require('dotenv').config();

class AstraDBConnection {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        return this.collection;
      }

      // Validate required environment variables
      this.validateConfig();

      console.log(`🔗 Connecting to AstraDB Chat Embeddings...`);
      console.log(`📍 Database ID: ${process.env.ASTRA_DB_ID}`);
      console.log(`🌍 Region: ${process.env.ASTRA_DB_REGION}`);
      console.log(`🔑 Keyspace: ${process.env.ASTRA_DB_KEYSPACE}`);

      // Initialize DataAPI client
      this.client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);

      // Connect to database using API endpoint
      const dbEndpoint = process.env.ASTRA_DB_API_ENDPOINT || 
        `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com`;

      console.log(`🔗 Using endpoint: ${dbEndpoint}`);

      this.db = this.client.db(dbEndpoint, {
        keyspace: process.env.ASTRA_DB_KEYSPACE
      });

      // Test connection by getting database info
      try {
        const dbInfo = await this.db.info();
        console.log(`✅ Database connected successfully`);
        console.log(`📊 Available keyspaces:`, dbInfo.info.keyspaces);
      } catch (infoError) {
        console.log(`⚠️  Could not get database info, proceeding with collection creation...`);
      }

      // Create or get chat embeddings collection
      console.log(`📦 Creating/accessing chat embeddings collection...`);
      
      try {
        // Try to create the collection with dual vector support
        // Primary embedding: 768 dimensions (all-mpnet-base-v2)
        // Lightweight embedding: 384 dimensions (all-MiniLM-L6-v2)
        this.collection = await this.db.createCollection('chat_embeddings', {
          vector: {
            dimension: 768, // Primary embedding dimension
            metric: 'cosine'
          }
        });
        console.log('✅ Chat embeddings collection created successfully');
      } catch (collectionError) {
        if (collectionError.message.includes('already exists')) {
          // Collection exists, just get it
          console.log('📦 Chat embeddings collection already exists, accessing it...');
          this.collection = this.db.collection('chat_embeddings');
          console.log('✅ Chat embeddings collection accessed successfully');
        } else {
          throw collectionError;
        }
      }

      this.isConnected = true;
      console.log('✅ Connected to AstraDB Chat Embeddings successfully');
      return this.collection;

    } catch (error) {
      console.error('❌ AstraDB Chat Embeddings connection failed:', error.message);
      
      // Provide helpful error messages
      if (error.message.includes('keyspace')) {
        console.error(`
🔧 KEYSPACE ISSUE DETECTED:
The keyspace '${process.env.ASTRA_DB_KEYSPACE}' doesn't exist in your database.

SOLUTIONS:
1. Update .env to use 'default_keyspace' instead of '${process.env.ASTRA_DB_KEYSPACE}'
2. Or create the '${process.env.ASTRA_DB_KEYSPACE}' keyspace in your AstraDB console
3. Or check your database for available keyspaces

Visit: https://astra.datastax.com/org/<your-org>/database/${process.env.ASTRA_DB_ID}
        `);
      }
      
      if (error.message.includes('token') || error.message.includes('authentication')) {
        console.error(`
🔐 AUTHENTICATION ISSUE:
Please check your ASTRA_DB_APPLICATION_TOKEN in the .env file.
Make sure it has the correct permissions for your database.
        `);
      }
      
      throw error;
    }
  }

  validateConfig() {
    const requiredVars = [
      'ASTRA_DB_APPLICATION_TOKEN',
      'ASTRA_DB_ID',
      'ASTRA_DB_REGION',
      'ASTRA_DB_KEYSPACE'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`
❌ Missing required environment variables: ${missingVars.join(', ')}

Please add these to your .env file:

ASTRA_DB_APPLICATION_TOKEN=your_token_here
ASTRA_DB_ID=your_database_id_here
ASTRA_DB_REGION=your_region_here
ASTRA_DB_KEYSPACE=default_keyspace

Visit https://astra.datastax.com to get these values.
      `);
    }

    console.log('✅ Environment configuration validated');
  }

  async disconnect() {
    try {
      if (this.client) {
        // DataAPI client doesn't have explicit disconnect method
        // Just mark as disconnected
        this.isConnected = false;
        this.collection = null;
        this.db = null;
        this.client = null;
        console.log('✅ Disconnected from AstraDB Chat Embeddings');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from AstraDB:', error.message);
      throw error;
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      // Try to get collection info to verify connection
      const stats = await this.collection.options();
      
      return {
        status: 'healthy',
        connected: this.isConnected,
        collection: 'chat_embeddings',
        vectorDimensions: stats.vector?.dimension || 768,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
const astraDB = new AstraDBConnection();
module.exports = astraDB;
