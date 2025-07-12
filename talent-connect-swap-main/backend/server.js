import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { upload, uploadsDir } from './middleware/upload.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import skillRoutes from './routes/skills.js';
import swapRoutes from './routes/swaps.js';
import messageRoutes from './routes/messages.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

// Import socket handlers
import { setupSocketHandlers } from './socket/socketHandlers.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Load env.example as fallback for development
const loadEnvExample = () => {
  try {
    const envExamplePath = join(__dirname, 'env.example');
    const envExampleContent = readFileSync(envExamplePath, 'utf8');
    const envVars = {};
    
    envExampleContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.warn('⚠️  Could not load env.example, using defaults');
    return {};
  }
};

// Get configuration with fallbacks
const getConfig = () => {
  const envExample = loadEnvExample();
  
  return {
    PORT: process.env.PORT || envExample.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || envExample.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || envExample.MONGODB_URI || 'mongodb://localhost:27017/talent-connect',
    JWT_SECRET: process.env.JWT_SECRET || envExample.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || envExample.JWT_EXPIRES_IN || '7d',
    WS_CORS_ORIGIN: process.env.WS_CORS_ORIGIN || envExample.WS_CORS_ORIGIN || 'http://localhost:5173',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || parseInt(envExample.RATE_LIMIT_WINDOW_MS) || 900000,
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || parseInt(envExample.RATE_LIMIT_MAX_REQUESTS) || 100,
  };
};

const config = getConfig();

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',  // Vite default
  'http://localhost:8080',  // Alternative Vite port
  'http://localhost:3000',  // Create React App default
  'http://localhost:4173',  // Vite preview
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173'
];

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  }
});

const PORT = config.PORT;

// Security middleware with cross-origin image support
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for image requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
}, express.static(uploadsDir));

// Alternative proxy route for serving images with CORS
app.get('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = join(uploadsDir, filename);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Type', 'image/*');
  
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    mongodb: config.MONGODB_URI.includes('localhost') ? 'local' : 'cloud',
    cors: {
      allowedOrigins: allowedOrigins,
      requestOrigin: req.headers.origin
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/swaps', authMiddleware, swapRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);

// WebSocket connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Setup socket handlers
  setupSocketHandlers(io, socket);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log(`🔗 Connecting to MongoDB...`);
    console.log(`📍 URI: ${config.MONGODB_URI.includes('localhost') ? 'Local MongoDB' : 'Cloud MongoDB'}`);
    
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    if (config.MONGODB_URI.includes('localhost')) {
      console.log('\n💡 To fix this:');
      console.log('1. Install MongoDB: brew install mongodb-community');
      console.log('2. Start MongoDB: brew services start mongodb-community');
      console.log('3. Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
    } else {
      console.log('\n💡 To fix this:');
      console.log('1. Check your MongoDB Atlas connection string');
      console.log('2. Ensure your IP is whitelisted in MongoDB Atlas');
      console.log('3. Verify your username and password are correct');
    }
    
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🎯 Allowed CORS origins:`);
      allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export { io }; 