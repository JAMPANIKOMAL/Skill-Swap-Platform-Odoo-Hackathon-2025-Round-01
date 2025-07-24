import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env.example as fallback for development
const loadEnvExample = () => {
  try {
    const envExamplePath = join(__dirname, '..', 'env.example');
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

export const config = getConfig();
export default config; 