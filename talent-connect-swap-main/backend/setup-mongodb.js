#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 MongoDB Setup Helper\n');

const checkMongoDB = () => {
  try {
    execSync('mongod --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
};

const checkDocker = () => {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
};

const checkMongoDBRunning = () => {
  try {
    execSync('mongosh --eval "db.runCommand({ping: 1})"', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
};

const main = async () => {
  console.log('1. Checking MongoDB installation...');
  
  if (checkMongoDB()) {
    console.log('✅ MongoDB is installed');
    
    console.log('\n2. Checking if MongoDB is running...');
    if (checkMongoDBRunning()) {
      console.log('✅ MongoDB is running');
      console.log('\n🎉 You\'re all set! You can now start the backend:');
      console.log('   npm run dev');
      return;
    } else {
      console.log('❌ MongoDB is not running');
      console.log('\n💡 To start MongoDB:');
      console.log('   brew services start mongodb-community');
      console.log('   or');
      console.log('   mongod');
    }
  } else {
    console.log('❌ MongoDB is not installed');
    
    console.log('\n2. Checking for Docker...');
    if (checkDocker()) {
      console.log('✅ Docker is available');
      console.log('\n💡 You can use Docker to run MongoDB:');
      console.log('   docker run -d -p 27017:27017 --name mongodb mongo:latest');
      console.log('   docker start mongodb  # to restart later');
    } else {
      console.log('❌ Docker is not available');
      console.log('\n💡 To install MongoDB:');
      console.log('   # On macOS with Homebrew:');
      console.log('   brew install mongodb-community');
      console.log('   brew services start mongodb-community');
      console.log('\n   # Or download from:');
      console.log('   https://www.mongodb.com/try/download/community');
    }
  }
  
  console.log('\n📝 Alternative: Use MongoDB Atlas (cloud)');
  console.log('1. Go to https://www.mongodb.com/atlas');
  console.log('2. Create a free account and cluster');
  console.log('3. Get your connection string');
  console.log('4. Update env.example with your connection string');
  
  console.log('\n🔗 After setting up MongoDB, start the backend:');
  console.log('   npm run dev');
};

main().catch(console.error); 