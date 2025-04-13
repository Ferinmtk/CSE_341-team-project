
const mongoose = require('mongoose');
require('dotenv').config();

// Enhanced Configuration
const CONFIG = {
  MAX_RETRIES: 5,
  BASE_RETRY_DELAY: 3000, // 3 seconds base delay
  MAX_RETRY_DELAY: 30000, // 30 seconds maximum delay
  CONNECTION_TIMEOUT: 30000,
  SOCKET_TIMEOUT: 45000,
  HEARTBEAT_FREQ: 10000 // Check connection every 10 seconds
};

// Exponential backoff with jitter
function getRetryDelay(attempt) {
  const delay = Math.min(
    CONFIG.BASE_RETRY_DELAY * Math.pow(2, attempt),
    CONFIG.MAX_RETRY_DELAY
  );
  return delay * 0.8 + Math.random() * delay * 0.4; // Add jitter
}

jest.setTimeout(60000);

/**
 * Robust MongoDB connection with exponential backoff retry
 */
async function connectWithRetry(attempt = 0) {
  try {
    console.log(`Connecting to MongoDB (attempt ${attempt + 1})...`);
    
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: CONFIG.CONNECTION_TIMEOUT,
      socketTimeoutMS: CONFIG.SOCKET_TIMEOUT,
      heartbeatFrequencyMS: CONFIG.HEARTBEAT_FREQ,
      retryWrites: true,
      retryReads: true
    });

    console.log('✅ MongoDB connection established');
    return true;
  } catch (err) {
    console.error(`⚠️ Connection attempt failed: ${err.message}`);
    
    if (attempt < CONFIG.MAX_RETRIES - 1) {
      const delay = getRetryDelay(attempt);
      console.log(`⏳ Retrying in ${(delay/1000).toFixed(1)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectWithRetry(attempt + 1);
    }
    
    console.error('❌ Max connection retries reached');
    throw new Error(`Failed to connect to MongoDB after ${CONFIG.MAX_RETRIES} attempts`);
  }
}

/**
 * Resilient collection cleanup
 */
async function cleanCollections() {
  if (mongoose.connection.readyState !== 1) {
    console.log('Skipping cleanup - no active connection');
    return;
  }

  try {
    const collections = mongoose.connection.collections;
    for (const [name, collection] of Object.entries(collections).reverse()) {
      try {
        if (!name.startsWith('system.')) {
          await collection.deleteMany({});
        }
      } catch (err) {
        if (!err.message.includes('ns not found')) {
          console.warn(`⚠️ Could not clean collection ${name}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    console.error('⚠️ Collection cleanup error:', err.message);
  }
}

// Connection event handlers
function setupConnectionEvents() {
  mongoose.connection.on('connected', () => {
    console.log('📶 MongoDB connected');
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🔌 MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('♻️ MongoDB reconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
}

// Test lifecycle hooks
beforeAll(async () => {
  setupConnectionEvents();
  await connectWithRetry();
});

afterEach(async () => {
  await cleanCollections();
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.disconnect();
      console.log('🛑 MongoDB connection closed');
    } catch (err) {
      console.error('⚠️ Error disconnecting:', err.message);
    }
  }
});










// const mongoose = require('mongoose');
// require('dotenv').config();

// // Configuration
// const MAX_RETRIES = 5;
// const RETRY_DELAY = 5000; // 5 seconds between retries
// const CONNECTION_TIMEOUT = 30000; // 30 seconds timeout
// const SOCKET_TIMEOUT = 45000; // 45 seconds timeout

// jest.setTimeout(60000); // Increased global timeout to 60 seconds

// /**
//  * Attempts to connect to MongoDB with retry logic
//  */
// async function connectWithRetry(retryCount = 0) {
//   try {
//     await mongoose.connect(process.env.MONGODB_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: CONNECTION_TIMEOUT,
//       socketTimeoutMS: SOCKET_TIMEOUT,
//       retryWrites: true,
//       retryReads: true
//     });
//     console.log('Successfully connected to MongoDB');
//     return true;
//   } catch (err) {
//     console.error(`MongoDB connection attempt ${retryCount + 1} failed:`, err.message);
    
//     if (retryCount < MAX_RETRIES - 1) {
//       console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
//       await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
//       return connectWithRetry(retryCount + 1);
//     }
    
//     console.error('Max retries reached. Giving up.');
//     throw err;
//   }
// }

// /**
//  * Cleans up test collections
//  */
// async function cleanCollections() {
//   if (mongoose.connection.readyState === 0) return;

//   const collections = mongoose.connection.collections;
//   const collectionNames = Object.keys(collections).reverse();
  
//   for (const name of collectionNames) {
//     try {
//       if (name.startsWith('system.')) continue;
//       await collections[name].deleteMany({});
//     } catch (err) {
//       if (!err.message.includes('ns not found') && !err.message.includes('collection not found')) {
//         console.error(`Error cleaning collection ${name}:`, err);
//       }
//     }
//   }
// }

// // Test setup lifecycle hooks
// beforeAll(async () => {
//   console.log('Attempting MongoDB connection...');
//   await connectWithRetry();
// });

// afterEach(async () => {
//   try {
//     await cleanCollections();
//   } catch (err) {
//     console.error('Error during test cleanup:', err);
//   }
// });

// afterAll(async () => {
//   if (mongoose.connection.readyState !== 0) {
//     try {
//       await mongoose.disconnect();
//       console.log('MongoDB connection closed');
//     } catch (err) {
//       console.error('Error disconnecting from MongoDB:', err);
//     }
//   }
// });

// // Enhanced error handling for the connection
// mongoose.connection.on('error', err => {
//   console.error('MongoDB connection error:', err);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('MongoDB disconnected. Will attempt to reconnect if needed.');
// });

// mongoose.connection.on('reconnected', () => {
//   console.log('MongoDB reconnected successfully');
// });











// const mongoose = require('mongoose');
// require('dotenv').config();

// // Increase timeout to 30 seconds
// jest.setTimeout(30000);

// beforeAll(async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
//       socketTimeoutMS: 45000, // 45 seconds timeout for sockets
//     });
//     console.log('Connected to MongoDB for testing');
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//     throw err;
//   }
// });

// afterEach(async () => {
//   const collections = mongoose.connection.collections;
  
//   // Skip cleanup if connection is already closed
//   if (mongoose.connection.readyState === 0) return;

//   // Clear collections in reverse order to respect references
//   const collectionNames = Object.keys(collections).reverse();
  
//   for (const name of collectionNames) {
//     try {
//       // Skip system collections
//       if (name.startsWith('system.')) continue;
      
//       await collections[name].deleteMany({});
//     } catch (err) {
//       // Skip if collection is already dropped or doesn't exist
//       if (err.message !== 'ns not found' && !err.message.includes('collection not found')) {
//         console.error(`Error cleaning collection ${name}:`, err);
//       }
//     }
//   }
// });

// afterAll(async () => {
//   if (mongoose.connection.readyState !== 0) {
//     await mongoose.disconnect();
//   }
// });



