# Talent Connect Swap - Complete Setup Guide

This guide will help you set up both the frontend and backend for the Talent Connect Swap platform.

## 🏗️ Project Overview

**Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
**Backend**: Node.js + Express + MongoDB + Socket.IO

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local or cloud instance)
- **Git** (for version control)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory
cd talent-connect-swap-main

# Install frontend dependencies
npm install

# Navigate to backend directory
cd backend

# Install backend dependencies
npm install
```

### 2. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB (macOS with Homebrew)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or start manually
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Update the backend `.env` file

### 3. Environment Configuration

#### Backend Configuration
```bash
cd backend
cp env.example .env
```

Edit `backend/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/talent-connect
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/talent-connect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# WebSocket Configuration
WS_CORS_ORIGIN=http://localhost:3000
```

### 4. Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📡 WebSocket server ready
🌍 Environment: development
🔗 Health check: http://localhost:5000/health
✅ MongoDB connected successfully
```

### 5. Test the Backend

```bash
cd backend
npm test
```

### 6. Start the Frontend

```bash
# In a new terminal, from the project root
npm run dev
```

You should see:
```
  VITE v5.4.1  ready in 300 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

### 7. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔧 Development Workflow

### Frontend Development
```bash
# Start frontend in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
cd backend

# Start backend in development mode
npm run dev

# Test backend functionality
npm test

# Start in production mode
npm start
```

## 📡 API Testing

### Using curl
```bash
# Health check
curl http://localhost:5000/health

# Get skill categories
curl http://localhost:5000/api/skills/categories

# Get popular skills
curl http://localhost:5000/api/skills/popular
```

### Using Postman
1. Import the API collection (if available)
2. Set base URL to `http://localhost:5000`
3. Test endpoints

## 🔌 WebSocket Testing

### Using Browser Console
```javascript
// Connect to WebSocket
const socket = io('http://localhost:5000');

// Authenticate
socket.emit('authenticate', { token: 'your-jwt-token' });

// Listen for events
socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);
});

socket.on('new_message', (data) => {
  console.log('New message:', data);
});
```

## 🗄️ Database Management

### MongoDB Compass (GUI)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Navigate to `talent-connect` database

### Command Line
```bash
# Connect to MongoDB shell
mongosh

# Switch to database
use talent-connect

# View collections
show collections

# View users
db.users.find()

# View swaps
db.swaps.find()

# View messages
db.messages.find()
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
npm test
```

## 🚀 Deployment

### Backend Deployment

#### Option A: Heroku
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab

# Deploy
git push heroku main
```

#### Option B: Railway
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

#### Option C: DigitalOcean
1. Create a droplet
2. Install Node.js and MongoDB
3. Clone repository
4. Set up PM2 for process management

### Frontend Deployment

#### Option A: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Option B: Netlify
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

## 🔒 Security Checklist

- [ ] Change default JWT secret
- [ ] Set up HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables
- [ ] Set up proper error handling

## 📊 Monitoring

### Backend Monitoring
- Health check endpoint: `/health`
- Log monitoring
- Error tracking
- Performance monitoring

### Frontend Monitoring
- Error boundary implementation
- Performance monitoring
- User analytics

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
```bash
# Check if port is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Check MongoDB connection
mongosh
```

#### Frontend won't start
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check port
lsof -i :8080
```

#### Database connection issues
```bash
# Check MongoDB status
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb-community
```

#### WebSocket connection issues
- Check CORS configuration
- Verify WebSocket URL
- Check authentication token

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review the logs for error messages
3. Verify all prerequisites are installed
4. Check environment variables
5. Ensure MongoDB is running

## 📝 Next Steps

After successful setup:

1. **Create test users** using the registration API
2. **Test skill exchange** functionality
3. **Implement real-time messaging**
4. **Add more features** as needed
5. **Deploy to production**

---

**Happy coding! 🎉** 