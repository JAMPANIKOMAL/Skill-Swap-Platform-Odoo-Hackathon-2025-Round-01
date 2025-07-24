import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const config = {
  MONGODB_URI: process.env.MONGODB_URI || loadEnvExample().MONGODB_URI || 'mongodb://localhost:27017/talent-connect',
};

// Sample users data
const sampleUsers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'password123',
    location: 'San Francisco, CA',
    skillsOffered: ['JavaScript', 'React', 'Node.js', 'Web Development'],
    skillsWanted: ['Python', 'Machine Learning', 'Data Analysis'],
    availability: 'Weekdays & Evenings',
    bio: 'Full-stack developer passionate about creating user-friendly applications.',
    rating: 4.8,
    totalSwaps: 12,
    isOnline: true
  },
  {
    name: 'Mike Chen',
    email: 'mike@example.com',
    password: 'password123',
    location: 'New York, NY',
    skillsOffered: ['Python', 'Machine Learning', 'Data Science', 'SQL'],
    skillsWanted: ['JavaScript', 'React', 'Mobile Development'],
    availability: 'Weekends',
    bio: 'Data scientist with expertise in ML and analytics.',
    rating: 4.9,
    totalSwaps: 8,
    isOnline: false
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    password: 'password123',
    location: 'Austin, TX',
    skillsOffered: ['Graphic Design', 'UI/UX Design', 'Adobe Creative Suite', 'Illustration'],
    skillsWanted: ['Photography', 'Video Editing', 'Animation'],
    availability: 'Flexible',
    bio: 'Creative designer focused on user experience and visual storytelling.',
    rating: 4.7,
    totalSwaps: 15,
    isOnline: true
  },
  {
    name: 'David Kim',
    email: 'david@example.com',
    password: 'password123',
    location: 'Seattle, WA',
    skillsOffered: ['Java', 'Spring Boot', 'Microservices', 'AWS'],
    skillsWanted: ['Go', 'Kubernetes', 'DevOps'],
    availability: 'Weekdays',
    bio: 'Backend engineer with experience in scalable systems.',
    rating: 4.6,
    totalSwaps: 6,
    isOnline: true
  },
  {
    name: 'Lisa Thompson',
    email: 'lisa@example.com',
    password: 'password123',
    location: 'Chicago, IL',
    skillsOffered: ['Photography', 'Photo Editing', 'Lightroom', 'Portrait Photography'],
    skillsWanted: ['Videography', 'Video Editing', 'Drone Photography'],
    availability: 'Weekends & Evenings',
    bio: 'Professional photographer specializing in portraits and events.',
    rating: 4.9,
    totalSwaps: 20,
    isOnline: false
  },
  {
    name: 'Alex Wong',
    email: 'alex@example.com',
    password: 'password123',
    location: 'Los Angeles, CA',
    skillsOffered: ['Guitar', 'Music Production', 'Ableton Live', 'Songwriting'],
    skillsWanted: ['Piano', 'Music Theory', 'Audio Engineering'],
    availability: 'Evenings',
    bio: 'Musician and producer looking to collaborate and learn new instruments.',
    rating: 4.5,
    totalSwaps: 9,
    isOnline: true
  },
  {
    name: 'Rachel Green',
    email: 'rachel@example.com',
    password: 'password123',
    location: 'Boston, MA',
    skillsOffered: ['Cooking', 'Baking', 'Recipe Development', 'Food Photography'],
    skillsWanted: ['Gardening', 'Sustainable Living', 'Fermentation'],
    availability: 'Weekends',
    bio: 'Food enthusiast and home cook passionate about sustainable cooking.',
    rating: 4.8,
    totalSwaps: 14,
    isOnline: true
  },
  {
    name: 'James Wilson',
    email: 'james@example.com',
    password: 'password123',
    location: 'Denver, CO',
    skillsOffered: ['Yoga', 'Meditation', 'Fitness Training', 'Nutrition'],
    skillsWanted: ['Rock Climbing', 'Hiking', 'Outdoor Skills'],
    availability: 'Weekdays & Evenings',
    bio: 'Certified yoga instructor and fitness enthusiast.',
    rating: 4.7,
    totalSwaps: 11,
    isOnline: false
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Seed the database
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Import User model
    const User = await import('./models/User.js');
    
    // Clear existing users (except admin)
    console.log('🧹 Clearing existing users...');
    await User.default.deleteMany({ email: { $nin: ['admin@example.com'] } });
    
    // Create sample users
    console.log('🌱 Creating sample users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user
      const user = new User.default({
        ...userData,
        password: hashedPassword,
        totalRatings: Math.floor(Math.random() * 20) + 5,
        lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
        preferences: {
          notifications: true,
          emailUpdates: true,
          privacy: 'public'
        },
        socialLinks: {
          linkedin: `https://linkedin.com/in/${userData.name.toLowerCase().replace(' ', '')}`,
          github: `https://github.com/${userData.name.toLowerCase().replace(' ', '')}`,
          portfolio: `https://${userData.name.toLowerCase().replace(' ', '')}.com`
        }
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name}`);
    }
    
    console.log(`\n🎉 Successfully created ${createdUsers.length} sample users!`);
    console.log('\n📧 Sample login credentials:');
    sampleUsers.forEach(user => {
      console.log(`   ${user.email} / password123`);
    });
    
    console.log('\n🚀 You can now test the application with these users!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seed script
seedDatabase(); 