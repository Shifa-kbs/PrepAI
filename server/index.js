const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { checkDBConnection } = require('./middleware/dbCheckMiddleware');
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const studyPlanRoutes = require('./routes/studyPlanRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cognitiveRoutes = require('./routes/cognitiveRoutes');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables explicitly from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Express Application
const app = express();

// Connect Database (in-memory or Atlas)
connectDB();

// Security & Core Middlewares
app.use(helmet());
const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or curl/Postman requests without origin
      if (!origin) return callback(null, true);

      // Check allowed list
      if (clientUrls.includes(origin) || clientUrls.includes('*')) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments (*.vercel.app)
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Allow local development ports
      if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(null, true); // Fallback to avoid breaking valid cross-origin requests
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiting Middlewares (Permissive in test mode to protect automated suites)
const isTest = process.env.NODE_ENV === 'test';
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 5000 : 80,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
});

const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isTest ? 5000 : 30,
  message: { success: false, message: 'Interview request limit reached. Please wait a few moments before starting another interview.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
});

// Health Endpoint (Does not block on DB connectivity; reports status)
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    message: 'PrepAI API is running',
    database: {
      status: dbConnected ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
    },
  });
});

// Database-dependent API Routes guarded with checkDBConnection to fail fast
// with clear HTTP 503 instead of buffering for 10000ms
app.use('/api/auth', authLimiter, checkDBConnection, authRoutes);
app.use('/api/questions', checkDBConnection, questionRoutes);
app.use('/api/practice', checkDBConnection, practiceRoutes);
app.use('/api/interview', aiLimiter, checkDBConnection, interviewRoutes);
app.use('/api/cognitive', checkDBConnection, cognitiveRoutes);
app.use('/api/analytics', checkDBConnection, analyticsRoutes);
app.use('/api/study-plan', checkDBConnection, studyPlanRoutes);
app.use('/api/admin', checkDBConnection, adminRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`,
  });
});

// Centralized Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  (async () => {
    // Attempt database connection before starting HTTP listener
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[PrepAI Backend] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection] ${err.message}`);
    });
  })();
}

module.exports = app;
