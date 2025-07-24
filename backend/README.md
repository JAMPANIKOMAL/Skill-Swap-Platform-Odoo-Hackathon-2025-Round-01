# Talent Connect Backend

A Node.js backend for the Talent Connect Swap platform with real-time messaging and skill exchange functionality.

## 🚀 Features

- **User Authentication** - JWT-based authentication with bcrypt password hashing
- **Real-time Messaging** - WebSocket-powered instant messaging
- **Skill Exchange** - Request and manage skill swaps between users
- **User Management** - Profile management, search, and filtering
- **Rating System** - Rate and review completed swaps
- **MongoDB Integration** - Robust data persistence with Mongoose ODM
- **Security** - Rate limiting, input validation, and error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for WebSocket communication
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Express-validator for input validation
- **Security**: Helmet, CORS, rate limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/talent-connect
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # WebSocket Configuration
   WS_CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB** (if using local instance)
   ```bash
   mongod
   ```

5. **Run the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 🗄️ Database Setup

The application uses MongoDB with the following collections:

- **users** - User profiles and authentication
- **swaps** - Skill exchange requests and status
- **messages** - Real-time chat messages

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users` - Get all users with filters
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/avatar` - Update user avatar
- `GET /api/users/swaps/history` - Get user's swap history
- `GET /api/users/swaps/pending` - Get pending swaps
- `GET /api/users/stats` - Get user statistics
- `DELETE /api/users/account` - Delete user account

### Skills
- `GET /api/skills/categories` - Get skill categories
- `GET /api/skills/popular` - Get popular skills
- `GET /api/skills/search` - Search skills
- `GET /api/skills/users/:skill` - Get users by skill
- `GET /api/skills/stats/:skill` - Get skill statistics

### Swaps
- `POST /api/swaps` - Create swap request
- `GET /api/swaps` - Get user's swaps
- `GET /api/swaps/:id` - Get swap by ID
- `PUT /api/swaps/:id/accept` - Accept swap
- `PUT /api/swaps/:id/reject` - Reject swap
- `PUT /api/swaps/:id/complete` - Complete swap
- `PUT /api/swaps/:id/cancel` - Cancel swap
- `POST /api/swaps/:id/rate` - Rate completed swap

### Messages
- `GET /api/messages/conversations` - Get conversations list
- `GET /api/messages/conversation/:userId` - Get conversation with user
- `POST /api/messages` - Send message
- `PUT /api/messages/read/:userId` - Mark messages as read
- `GET /api/messages/unread/count` - Get unread count
- `DELETE /api/messages/:messageId` - Delete message
- `GET /api/messages/search` - Search messages

## 🔌 WebSocket Events

### Client to Server
- `authenticate` - Authenticate user with JWT token
- `join_chat` - Join chat room with another user
- `send_message` - Send message to user
- `typing` - Send typing indicator
- `swap_request` - Send swap request
- `swap_response` - Respond to swap request
- `status_update` - Update online status

### Server to Client
- `authenticated` - Authentication successful
- `auth_error` - Authentication error
- `joined_chat` - Successfully joined chat room
- `new_message` - New message received
- `message_notification` - Message notification
- `user_typing` - User typing indicator
- `swap_request_received` - Swap request received
- `swap_request_sent` - Swap request sent
- `swap_response_received` - Swap response received
- `swap_response_sent` - Swap response sent
- `user_online` - User came online
- `user_offline` - User went offline
- `user_status_changed` - User status changed

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Express-validator for all inputs
- **Rate Limiting** - Prevent abuse with request limits
- **CORS Protection** - Configured for frontend access
- **Helmet Security** - HTTP headers for security
- **Error Handling** - Comprehensive error management

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Health Check

- `GET /health` - Server health status

## 🚀 Deployment

1. **Set production environment variables**
   ```env
   NODE_ENV=production
   MONGODB_URI_PROD=your-mongodb-atlas-uri
   JWT_SECRET=your-production-secret
   ```

2. **Build and start**
   ```bash
   npm start
   ```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/talent-connect |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `WS_CORS_ORIGIN` | WebSocket CORS origin | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🔧 Development

### Project Structure
```
backend/
├── models/          # MongoDB schemas
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── socket/          # WebSocket handlers
├── server.js        # Main server file
└── package.json     # Dependencies
```

### Adding New Features

1. **Create model** in `models/` directory
2. **Add routes** in `routes/` directory
3. **Add WebSocket handlers** in `socket/socketHandlers.js`
4. **Update documentation** in this README

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team. 