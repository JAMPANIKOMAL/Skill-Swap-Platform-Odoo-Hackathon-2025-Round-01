#!/bin/bash

echo "🚀 Setting up MongoDB for Talent Connect..."

# Check if MongoDB is installed
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is already installed"
else
    echo "📦 Installing MongoDB..."
    
    # Check OS and install accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo "🍺 Installing MongoDB via Homebrew..."
            brew tap mongodb/brew
            brew install mongodb-community
        else
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "🐧 Installing MongoDB on Linux..."
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        sudo apt-get update
        sudo apt-get install -y mongodb-org
    else
        echo "❌ Unsupported OS. Please install MongoDB manually:"
        echo "   https://docs.mongodb.com/manual/installation/"
        exit 1
    fi
fi

# Start MongoDB service
echo "🔄 Starting MongoDB service..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    brew services start mongodb-community
    echo "✅ MongoDB service started"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    sudo systemctl start mongod
    sudo systemctl enable mongod
    echo "✅ MongoDB service started"
fi

# Wait a moment for MongoDB to start
echo "⏳ Waiting for MongoDB to start..."
sleep 3

# Test connection
echo "🧪 Testing MongoDB connection..."
if mongosh --eval "db.runCommand('ping')" &> /dev/null; then
    echo "✅ MongoDB is running and accessible"
else
    echo "❌ MongoDB connection failed. Trying alternative methods..."
    
    # Try starting MongoDB manually
    echo "🔄 Attempting to start MongoDB manually..."
    mkdir -p ~/data/db
    mongod --dbpath ~/data/db &
    sleep 5
    
    if mongosh --eval "db.runCommand('ping')" &> /dev/null; then
        echo "✅ MongoDB started manually"
    else
        echo "❌ Could not start MongoDB. Please check the installation."
        exit 1
    fi
fi

echo ""
echo "🎉 MongoDB setup complete!"
echo "📝 Next steps:"
echo "1. Run: npm run dev (to start the backend)"
echo "2. Run: npm run seed (to populate the database)"
echo "3. Start your frontend application"
echo ""
echo "🔗 MongoDB will be available at: mongodb://localhost:27017" 