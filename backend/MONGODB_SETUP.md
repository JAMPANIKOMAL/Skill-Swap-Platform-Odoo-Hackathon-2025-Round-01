# MongoDB Setup Guide

## 🚀 Quick Start Options

### Option 1: Using Homebrew (macOS)
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Test connection
mongosh --eval "db.runCommand('ping')"
```

### Option 2: Using Docker
```bash
# Start MongoDB container
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Test connection
docker exec mongodb mongosh --eval "db.runCommand('ping')"
```

### Option 3: Using our setup scripts
```bash
# Make scripts executable
chmod +x setup-mongodb.sh
chmod +x setup-mongodb-docker.sh

# Run setup script (choose one)
./setup-mongodb.sh        # Homebrew installation
./setup-mongodb-docker.sh # Docker installation
```

## 📋 Manual Setup Steps

### 1. Install MongoDB

#### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### Windows
Download and install from: https://docs.mongodb.com/manual/installation/

### 2. Start MongoDB Service

#### macOS
```bash
brew services start mongodb-community
```

#### Linux
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows
MongoDB runs as a Windows service automatically after installation.

### 3. Test Connection
```bash
mongosh --eval "db.runCommand('ping')"
```

## 🔧 Troubleshooting

### Connection Issues
1. **Check if MongoDB is running:**
   ```bash
   # macOS
   brew services list | grep mongodb
   
   # Linux
   sudo systemctl status mongod
   
   # Docker
   docker ps | grep mongodb
   ```

2. **Start MongoDB manually:**
   ```bash
   # Create data directory
   mkdir -p ~/data/db
   
   # Start MongoDB
   mongod --dbpath ~/data/db
   ```

3. **Check port availability:**
   ```bash
   lsof -i :27017
   ```

### Permission Issues
```bash
# Fix data directory permissions
sudo chown -R $USER ~/data/db
```

## 🎯 Next Steps

After MongoDB is running:

1. **Start the backend:**
   ```bash
   npm run dev
   ```

2. **Seed the database:**
   ```bash
   npm run seed
   ```

3. **Start the frontend:**
   ```bash
   cd ../frontend
   npm run dev
   ```

## 📊 Database Information

- **Database Name:** talent-connect
- **Connection String:** mongodb://localhost:27017/talent-connect
- **Collections:** users, swaps, messages, skills

## 🛠️ Useful Commands

```bash
# Start MongoDB service
npm run db:start

# Stop MongoDB service
npm run db:stop

# Restart MongoDB service
npm run db:restart

# Access MongoDB shell
mongosh

# View database
use talent-connect
show collections

# View users
db.users.find().pretty()
``` 