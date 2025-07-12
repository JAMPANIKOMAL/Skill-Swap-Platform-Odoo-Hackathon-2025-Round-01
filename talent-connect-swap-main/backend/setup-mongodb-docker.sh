#!/bin/bash

echo "🐳 Setting up MongoDB with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is available"

# Check if MongoDB container already exists
if docker ps -a --format "table {{.Names}}" | grep -q "mongodb"; then
    echo "🔄 MongoDB container already exists. Starting it..."
    docker start mongodb
else
    echo "🐳 Creating MongoDB container..."
    docker run -d \
        --name mongodb \
        -p 27017:27017 \
        -v mongodb_data:/data/db \
        -e MONGO_INITDB_DATABASE=talent-connect \
        mongo:latest
fi

# Wait for MongoDB to start
echo "⏳ Waiting for MongoDB to start..."
sleep 5

# Test connection
echo "🧪 Testing MongoDB connection..."
if docker exec mongodb mongosh --eval "db.runCommand('ping')" &> /dev/null; then
    echo "✅ MongoDB is running and accessible"
else
    echo "❌ MongoDB connection failed. Please check the container logs:"
    echo "   docker logs mongodb"
    exit 1
fi

echo ""
echo "🎉 MongoDB setup complete!"
echo "📝 Next steps:"
echo "1. Run: npm run dev (to start the backend)"
echo "2. Run: npm run seed (to populate the database)"
echo "3. Start your frontend application"
echo ""
echo "🔗 MongoDB will be available at: mongodb://localhost:27017"
echo "🐳 Container name: mongodb"
echo "💾 Data volume: mongodb_data" 