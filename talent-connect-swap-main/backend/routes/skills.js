import express from 'express';
import { query, validationResult } from 'express-validator';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all skill categories
router.get('/categories', asyncHandler(async (req, res) => {
  const skillCategories = [
    {
      name: "Technology",
      skills: ["Web Development", "Mobile Development", "Data Science", "AI/ML", "Cybersecurity", "Cloud Computing", "DevOps", "Blockchain", "Game Development", "UI/UX Design"]
    },
    {
      name: "Creative",
      skills: ["Graphic Design", "Photography", "Video Editing", "Music Production", "Writing", "Animation", "3D Modeling", "Digital Art", "Content Creation", "Branding"]
    },
    {
      name: "Languages",
      skills: ["Spanish", "French", "German", "Japanese", "Mandarin", "Arabic", "Italian", "Portuguese", "Russian", "Korean", "Hindi", "English"]
    },
    {
      name: "Business",
      skills: ["Digital Marketing", "SEO", "Public Speaking", "Leadership", "Project Management", "Finance", "Sales", "Consulting", "Strategy", "Analytics"]
    },
    {
      name: "Lifestyle",
      skills: ["Cooking", "Yoga", "Fitness", "Meditation", "Gardening", "Home Improvement", "Dancing", "Martial Arts", "Hiking", "Travel Planning"]
    },
    {
      name: "Arts & Crafts",
      skills: ["Painting", "Pottery", "Knitting", "Woodworking", "Jewelry Making", "Calligraphy", "Origami", "Sewing", "Candle Making", "Soap Making"]
    },
    {
      name: "Education",
      skills: ["Tutoring", "Test Preparation", "Academic Writing", "Research", "Curriculum Development", "Online Teaching", "Language Teaching", "Music Lessons", "Art Classes"]
    },
    {
      name: "Professional",
      skills: ["Resume Writing", "Interview Coaching", "Career Counseling", "Networking", "Public Relations", "Event Planning", "Legal Advice", "Accounting", "Real Estate"]
    }
  ];

  res.json({
    success: true,
    data: { skillCategories }
  });
}));

// Get popular skills
router.get('/popular', asyncHandler(async (req, res) => {
  const popularSkills = [
    "Web Development", "Graphic Design", "Photography", "Language Exchange",
    "Music Lessons", "Cooking", "Yoga", "Writing", "Marketing", "Data Analysis",
    "Spanish", "French", "Guitar", "Piano", "Digital Marketing", "SEO",
    "Video Editing", "UI/UX Design", "Python", "JavaScript", "React", "Vue.js"
  ];

  res.json({
    success: true,
    data: { popularSkills }
  });
}));

// Search skills
router.get('/search', [
  query('q').trim().notEmpty().withMessage('Search query is required'),
  query('category').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { q, category, limit = 20 } = req.query;

  // Get all skill categories
  const skillCategories = [
    {
      name: "Technology",
      skills: ["Web Development", "Mobile Development", "Data Science", "AI/ML", "Cybersecurity", "Cloud Computing", "DevOps", "Blockchain", "Game Development", "UI/UX Design"]
    },
    {
      name: "Creative",
      skills: ["Graphic Design", "Photography", "Video Editing", "Music Production", "Writing", "Animation", "3D Modeling", "Digital Art", "Content Creation", "Branding"]
    },
    {
      name: "Languages",
      skills: ["Spanish", "French", "German", "Japanese", "Mandarin", "Arabic", "Italian", "Portuguese", "Russian", "Korean", "Hindi", "English"]
    },
    {
      name: "Business",
      skills: ["Digital Marketing", "SEO", "Public Speaking", "Leadership", "Project Management", "Finance", "Sales", "Consulting", "Strategy", "Analytics"]
    },
    {
      name: "Lifestyle",
      skills: ["Cooking", "Yoga", "Fitness", "Meditation", "Gardening", "Home Improvement", "Dancing", "Martial Arts", "Hiking", "Travel Planning"]
    },
    {
      name: "Arts & Crafts",
      skills: ["Painting", "Pottery", "Knitting", "Woodworking", "Jewelry Making", "Calligraphy", "Origami", "Sewing", "Candle Making", "Soap Making"]
    },
    {
      name: "Education",
      skills: ["Tutoring", "Test Preparation", "Academic Writing", "Research", "Curriculum Development", "Online Teaching", "Language Teaching", "Music Lessons", "Art Classes"]
    },
    {
      name: "Professional",
      skills: ["Resume Writing", "Interview Coaching", "Career Counseling", "Networking", "Public Relations", "Event Planning", "Legal Advice", "Accounting", "Real Estate"]
    }
  ];

  let allSkills = [];
  
  if (category) {
    const selectedCategory = skillCategories.find(cat => 
      cat.name.toLowerCase() === category.toLowerCase()
    );
    if (selectedCategory) {
      allSkills = selectedCategory.skills;
    }
  } else {
    allSkills = skillCategories.flatMap(cat => cat.skills);
  }

  // Filter skills based on search query
  const matchingSkills = allSkills.filter(skill =>
    skill.toLowerCase().includes(q.toLowerCase())
  ).slice(0, parseInt(limit));

  res.json({
    success: true,
    data: { 
      skills: matchingSkills,
      total: matchingSkills.length,
      query: q,
      category: category || 'all'
    }
  });
}));

// Get users by skill
router.get('/users/:skill', [
  query('location').optional().trim(),
  query('availability').optional().isIn(['Weekdays', 'Weekends', 'Evenings', 'Flexible', 'Weekdays & Evenings']),
  query('rating').optional().isFloat({ min: 0, max: 5 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { skill } = req.params;
  const { 
    location, 
    availability, 
    rating, 
    page = 1, 
    limit = 20 
  } = req.query;

  const skip = (page - 1) * limit;
  const query = {
    $or: [
      { skillsOffered: { $regex: skill, $options: 'i' } },
      { skillsWanted: { $regex: skill, $options: 'i' } }
    ]
  };

  // Location filter
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Availability filter
  if (availability) {
    query.availability = availability;
  }

  // Rating filter
  if (rating) {
    query.rating = { $gte: parseFloat(rating) };
  }

  // Exclude current user from results
  if (req.user) {
    query._id = { $ne: req.user._id };
  }

  const users = await User.find(query)
    .select('name avatar location rating totalRatings totalSwaps skillsOffered skillsWanted availability isOnline lastSeen')
    .sort({ isOnline: -1, lastSeen: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      skill,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// Get skill statistics
router.get('/stats/:skill', asyncHandler(async (req, res) => {
  const { skill } = req.params;

  const [
    usersOffering,
    usersWanting,
    totalUsers
  ] = await Promise.all([
    User.countDocuments({ skillsOffered: { $regex: skill, $options: 'i' } }),
    User.countDocuments({ skillsWanted: { $regex: skill, $options: 'i' } }),
    User.countDocuments({
      $or: [
        { skillsOffered: { $regex: skill, $options: 'i' } },
        { skillsWanted: { $regex: skill, $options: 'i' } }
      ]
    })
  ]);

  res.json({
    success: true,
    data: {
      skill,
      stats: {
        usersOffering,
        usersWanting,
        totalUsers,
        demandRatio: totalUsers > 0 ? (usersWanting / totalUsers * 100).toFixed(1) : 0
      }
    }
  });
}));

export default router; 