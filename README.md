# Talent Connect SkillSwap

A modern skill-sharing platform built with React, Node.js, and MongoDB. Connect with people nearby to exchange knowledge and learn new skills through collaborative learning.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Set Up MongoDB

The backend now uses `env.example` by default, so no `.env` file is needed!

**Option A: Local MongoDB (Recommended for Development)**
```bash
# Install MongoDB (macOS)
brew install mongodb-community
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update `backend/env.example` with your connection string

### 3. Start the Backend

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### 4. Start the Frontend

In a new terminal:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 Development Setup

### Backend Setup Helper

The backend includes a setup helper to check your MongoDB installation:

```bash
cd backend
npm run setup
```

This will:
- Check if MongoDB is installed
- Check if MongoDB is running
- Provide installation instructions if needed
- Suggest Docker alternatives

### Environment Configuration

The backend automatically uses `env.example` as fallback configuration. You can:

1. **Use defaults** (recommended for development)
   - No `.env` file needed
   - Uses local MongoDB: `mongodb://localhost:27017/talent-connect`

2. **Override with .env file**
   - Copy `backend/env.example` to `backend/.env`
   - Modify values as needed

3. **Use environment variables**
   - Set `MONGODB_URI` environment variable
   - Set `JWT_SECRET` for production

## 🧪 Testing

### Test Backend
```bash
cd backend
node test.js
```

### Test Integration
```bash
node test-integration.js
```

### Test Frontend-Backend Connection
1. Start both frontend and backend
2. Open `http://localhost:5173`
3. Click the user icon to test authentication
4. Browse skills to test API integration

## 📁 Project Structure

```
talent-connect-swap-main/
├── src/                    # Frontend React app
│   ├── components/        # React components
│   ├── contexts/          # React contexts (Auth)
│   ├── services/          # API and WebSocket services
│   └── pages/            # Page components
├── backend/               # Node.js backend
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── socket/           # WebSocket handlers
│   └── server.js         # Main server file
└── README.md             # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile

### Skills
- `GET /api/skills/popular` - Get popular skills
- `GET /api/skills/search` - Search skills
- `GET /api/skills/users/:skill` - Get users by skill

### Swaps
- `POST /api/swaps` - Create swap request
- `GET /api/swaps` - Get user's swaps
- `PUT /api/swaps/:id/accept` - Accept swap
- `PUT /api/swaps/:id/reject` - Reject swap

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversation/:userId` - Get conversation
- `POST /api/messages` - Send message

## 🔄 WebSocket Events

### Connection
- `authenticate` - Authenticate with JWT token
- `join_chat` - Join chat room

### Messages
- `send_message` - Send message
- `typing` - Send typing indicator
- `new_message` - Receive new message
- `user_typing` - Receive typing indicator

### Swaps
- `swap_request` - Send swap request
- `swap_response` - Send swap response
- `swap_request_received` - Receive swap request
- `swap_response_received` - Receive swap response

### User Status
- `status_update` - Update user status
- `user_online` - User came online
- `user_offline` - User went offline

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation
- **React Query** - Data fetching
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **Rate Limiting** - API protection

## 🚀 Features

### Core Features
- ✅ User authentication and registration
- ✅ Skill browsing and searching
- ✅ Real-time messaging
- ✅ Skill swap requests
- ✅ User profiles and ratings
- ✅ Online status tracking
- ✅ Responsive design

### Technical Features
- ✅ JWT-based authentication
- ✅ WebSocket real-time communication
- ✅ MongoDB with Mongoose
- ✅ Rate limiting and security
- ✅ Error handling and validation
- ✅ TypeScript support
- ✅ Hot reload development

## 🔒 Security

- JWT tokens for authentication
- bcrypt password hashing
- CORS configuration
- Rate limiting
- Input validation
- Security headers with Helmet

## 🐛 Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   brew services list | grep mongodb
   
   # Start MongoDB
   brew services start mongodb-community
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   ```

3. **Permission Issues**
   ```bash
   # Make setup script executable
   chmod +x backend/setup-mongodb.js
   ```

### Frontend Issues

1. **API Connection Error**
   - Ensure backend is running on port 5000
   - Check browser console for CORS errors
   - Verify API_BASE_URL in `src/services/api.js`

2. **WebSocket Connection Error**
   - Ensure backend WebSocket server is running
   - Check WebSocket URL in `src/services/socket.js`

3. **Build Errors**
   ```bash
   # Clear and reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📝 Development Workflow

1. **Backend Development**
   - Make changes to backend files
   - Server auto-restarts with nodemon
   - Test endpoints with Postman or curl

2. **Frontend Development**
   - Make changes to frontend files
   - Vite hot-reloads changes
   - Check browser console for errors

3. **Database Changes**
   - Update Mongoose models in `backend/models/`
   - Restart backend server
   - Test with API calls

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use PM2 or similar process manager
3. Set up MongoDB Atlas or production MongoDB
4. Configure domain and SSL

### Frontend Deployment
1. Build with `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update API_BASE_URL for production
4. Configure environment variables

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs
3. Check browser console for frontend errors
4. Verify all environment variables are set
