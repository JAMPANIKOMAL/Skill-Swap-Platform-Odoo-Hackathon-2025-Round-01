# Running Talent Connect SkillSwap

This guide will help you run both the frontend and backend of the Talent Connect SkillSwap application.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Set Up Environment Variables

```bash
# Copy backend environment template
cp backend/env.example backend/.env

# Edit the .env file with your MongoDB connection string
# For local MongoDB: mongodb://localhost:27017/talent-connect
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/talent-connect
```

### 3. Start MongoDB

If using local MongoDB:
```bash
# Start MongoDB service
mongod
```

### 4. Start the Backend

```bash
# Navigate to backend directory
cd backend

# Start the server
npm start

# Or use the provided script
./start.sh
```

The backend will start on `http://localhost:5000`

### 5. Start the Frontend

In a new terminal:
```bash
# From the root directory
npm run dev
```

The frontend will start on `http://localhost:5173`

## Testing the Connection

### Backend Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Frontend-Backend Integration

1. Open `http://localhost:5173` in your browser
2. Click the user icon in the header to open the auth modal
3. Create a new account or sign in
4. Browse the skills grid to see real data from the backend

## API Endpoints

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

## WebSocket Events

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

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Port Already in Use**
   - Change port in `backend/.env`
   - Kill process using port 5000

3. **JWT Secret Missing**
   - Add `JWT_SECRET` to `.env`
   - Generate a secure random string

### Frontend Issues

1. **API Connection Error**
   - Ensure backend is running on port 5000
   - Check CORS settings
   - Verify API_BASE_URL in `src/services/api.js`

2. **WebSocket Connection Error**
   - Ensure backend WebSocket server is running
   - Check WebSocket URL in `src/services/socket.js`

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify all dependencies are installed

### Common Solutions

```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Reset MongoDB (if using local)
mongo
use talent-connect
db.dropDatabase()
exit

# Check logs
# Backend logs will appear in the terminal
# Frontend logs will appear in browser console
```

## Development Workflow

1. **Backend Development**
   - Make changes to backend files
   - Server will auto-restart with nodemon
   - Test endpoints with Postman or curl

2. **Frontend Development**
   - Make changes to frontend files
   - Vite will hot-reload changes
   - Check browser console for errors

3. **Database Changes**
   - Update Mongoose models in `backend/models/`
   - Restart backend server
   - Test with API calls

## Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Use PM2 or similar process manager
3. Set up MongoDB Atlas or production MongoDB
4. Configure domain and SSL

### Frontend Deployment
1. Build with `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update API_BASE_URL for production
4. Configure environment variables

## Security Notes

- JWT tokens are stored in localStorage
- Passwords are hashed with bcrypt
- CORS is configured for development
- Rate limiting is enabled
- Input validation is implemented

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs
3. Check browser console for frontend errors
4. Verify all environment variables are set 