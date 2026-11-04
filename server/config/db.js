const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Ensure environment variables are loaded regardless of current working directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Disable Mongoose command buffering globally so queries fail fast
// instead of hanging/buffering for 10,000ms when disconnected
mongoose.set('bufferCommands', false);

let isConnecting = false;
let retryInterval = null;

const getSanitizedUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
};

const getDatabaseName = (uri) => {
  if (process.env.DB_NAME) return process.env.DB_NAME;
  try {
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (e) {}
  return 'prepai';
};

const diagnoseConnectionError = (error, uri) => {
  const errMsg = error.message || '';
  const sanitized = getSanitizedUri(uri);

  console.error(`\n[Database Diagnostics] Connection failed to ${sanitized}`);
  console.error(`[Error Detail] ${errMsg}`);

  if (errMsg.includes('Authentication failed') || error.codeName === 'AuthenticationFailed') {
    console.warn(
      '  🔍 DIAGNOSIS: Invalid MongoDB Credentials.\n' +
      '  Action: Check the database username and password in server/.env MONGODB_URI.'
    );
  } else if (errMsg.includes('ENOTFOUND') || errMsg.includes('getaddrinfo')) {
    console.warn(
      '  🔍 DIAGNOSIS: DNS Hostname Resolution Failure.\n' +
      '  Action: Verify your internet connection and ensure the MongoDB Atlas cluster hostname exists and is not paused/deleted.'
    );
  } else if (error.name === 'MongooseServerSelectionError' || errMsg.includes('Server selection timed out')) {
    console.warn(
      '  🔍 DIAGNOSIS: Network Access / IP Whitelist Block.\n' +
      '  Action: Your current IP address is not in MongoDB Atlas Network Access whitelist.\n' +
      '  Step: Log into cloud.mongodb.com -> Security -> Network Access -> Add IP Address -> Add Current IP (or 0.0.0.0/0 for dev).'
    );
  } else if (errMsg.includes('ECONNREFUSED')) {
    console.warn(
      '  🔍 DIAGNOSIS: Local MongoDB Server Not Running.\n' +
      '  Action: If running locally, start your mongod service or update MONGODB_URI to your Atlas cluster.'
    );
  } else {
    console.warn(
      '  🔍 DIAGNOSIS: Network/TLS Handshake Error.\n' +
      '  Action: Check firewall/VPN settings and ensure outbound port 27017 is permitted.'
    );
  }
};

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prepai';
  const targetDb = getDatabaseName(mongoURI);

  if (mongoose.connection.readyState === 1) {
    return { success: true, host: mongoose.connection.host, dbName: mongoose.connection.name };
  }

  if (isConnecting) {
    return { success: false, connecting: true };
  }

  isConnecting = true;
  console.log(`[Database] Connecting to MongoDB at ${getSanitizedUri(mongoURI)} (dbName: ${targetDb})...`);

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      dbName: targetDb,
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    isConnecting = false;
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed question bank idempotently if empty or below current dataset size
    if (process.env.NODE_ENV !== 'test') {
      setTimeout(async () => {
        try {
          const Question = require('../models/Question');
          const seedDatabase = require('../services/seedService');
          const count = await Question.countDocuments();
          if (count < 180) {
            console.log(`[Database Sync] Question count in DB is ${count}. Initiating automatic idempotent seed...`);
            await seedDatabase({ skipDisconnect: true });
          }
        } catch (seedErr) {
          console.warn(`[Database Sync Notice] Auto-seed check: ${seedErr.message}`);
        }
      }, 500);
    }

    return {
      success: true,
      host: conn.connection.host,
      dbName: conn.connection.name,
    };
  } catch (error) {
    isConnecting = false;
    diagnoseConnectionError(error, mongoURI);

    // Schedule background retry if not already retrying (so app reconnects automatically when network/IP is restored)
    if (!retryInterval && process.env.NODE_ENV !== 'test') {
      retryInterval = setInterval(async () => {
        if (mongoose.connection.readyState !== 1) {
          console.log('[Database] Retrying connection to MongoDB...');
          await connectDB();
        } else {
          clearInterval(retryInterval);
          retryInterval = null;
        }
      }, 10000);
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('[Database Event] Mongoose connection state: CONNECTED');
});

mongoose.connection.on('disconnected', () => {
  console.warn('[Database Event] Mongoose connection state: DISCONNECTED');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Event] Mongoose error: ${err.message}`);
});

const isDBConnected = () => mongoose.connection.readyState === 1;

const getDBStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.isDBConnected = isDBConnected;
module.exports.getDBStatus = getDBStatus;
