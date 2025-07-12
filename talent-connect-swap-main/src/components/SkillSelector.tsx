import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, X } from "lucide-react";

interface SkillSelectorProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  placeholder?: string;
  maxSkills?: number;
}

const popularSkills = [
  // Programming & Tech
  "JavaScript", "Python", "React", "Node.js", "Java", "C++", "C#", "PHP", "Ruby", "Go",
  "TypeScript", "Vue.js", "Angular", "Django", "Flask", "Express", "MongoDB", "PostgreSQL",
  "AWS", "Docker", "Kubernetes", "Git", "Linux", "DevOps", "Machine Learning", "Data Science",
  
  // Creative & Design
  "Graphic Design", "UI/UX Design", "Adobe Photoshop", "Adobe Illustrator", "Figma", "Sketch",
  "Web Design", "Logo Design", "Branding", "Typography", "Color Theory", "Illustration",
  "Digital Art", "3D Modeling", "Animation", "Video Editing", "Motion Graphics",
  
  // Languages
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese",
  "Korean", "Arabic", "Russian", "Hindi", "Sign Language",
  
  // Music & Arts
  "Guitar", "Piano", "Violin", "Drums", "Singing", "Music Theory", "Composition", "DJing",
  "Music Production", "Ableton Live", "Logic Pro", "GarageBand", "Dance", "Acting",
  
  // Sports & Fitness
  "Yoga", "Pilates", "Weight Training", "Running", "Swimming", "Tennis", "Golf", "Basketball",
  "Soccer", "Rock Climbing", "Hiking", "Cycling", "Martial Arts", "Boxing", "CrossFit",
  
  // Cooking & Food
  "Cooking", "Baking", "Pastry Making", "Grilling", "Sushi Making", "Wine Tasting", "Beer Brewing",
  "Food Photography", "Meal Planning", "Nutrition", "Vegetarian Cooking", "Vegan Cooking",
  
  // Photography & Video
  "Photography", "Portrait Photography", "Landscape Photography", "Street Photography", "Wedding Photography",
  "Videography", "Video Editing", "Drone Photography", "Lightroom", "Premiere Pro", "Final Cut Pro",
  
  // Business & Professional
  "Public Speaking", "Leadership", "Project Management", "Marketing", "Sales", "Negotiation",
  "Business Strategy", "Financial Planning", "Investing", "Entrepreneurship", "Networking",
  
  // Crafts & Hobbies
  "Knitting", "Crochet", "Sewing", "Woodworking", "Pottery", "Painting", "Drawing", "Calligraphy",
  "Origami", "Jewelry Making", "Candle Making", "Soap Making", "Gardening", "Beekeeping",
  
  // Life Skills
  "Time Management", "Organization", "Stress Management", "Meditation", "Mindfulness", "Goal Setting",
  "Personal Finance", "Tax Preparation", "Home Repair", "Car Maintenance", "First Aid", "CPR"
];

export function SkillSelector({ skills, onSkillsChange, placeholder = "Add a skill", maxSkills = 10 }: SkillSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [showPopular, setShowPopular] = useState(false);

  const addSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim()) && skills.length < maxSkills) {
      onSkillsChange([...skills, skill.trim()]);
      setInputValue("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const filteredPopularSkills = popularSkills.filter(
    skill => !skills.includes(skill) && skill.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Input and Add Button */}
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          type="button"
          size="sm"
          onClick={() => addSkill(inputValue)}
          disabled={!inputValue.trim() || skills.length >= maxSkills}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Current Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Popular Skills */}
      {skills.length < maxSkills && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Popular Skills</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPopular(!showPopular)}
            >
              {showPopular ? "Hide" : "Show"}
            </Button>
          </div>
          
          {showPopular && (
            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
              <div className="flex flex-wrap gap-1">
                {filteredPopularSkills.slice(0, 50).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => addSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Max Skills Warning */}
      {skills.length >= maxSkills && (
        <p className="text-sm text-muted-foreground">
          Maximum {maxSkills} skills reached
        </p>
      )}
    </div>
  );
} 