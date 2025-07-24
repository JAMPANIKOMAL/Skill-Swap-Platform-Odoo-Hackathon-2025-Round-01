import { useState, useEffect } from "react";
import { Filter, MapPin, Clock, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { skillsAPI } from "../services/api";

export function FilterSection() {
  const [popularSkills, setPopularSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularSkills = async () => {
      try {
        setLoading(true);
        const response = await skillsAPI.getPopularSkills();
        setPopularSkills(response.data.popularSkills);
      } catch (error) {
        console.error('Failed to fetch popular skills:', error);
        // Fallback to default skills if API fails
        setPopularSkills([
          "Web Development", "Graphic Design", "Photography", "Language Exchange",
          "Music Lessons", "Cooking", "Yoga", "Writing", "Marketing", "Data Analysis"
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularSkills();
  }, []);

  return (
    <section className="bg-muted/30 py-8 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Select>
              <SelectTrigger className="w-full sm:w-48 bg-background">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="nearby">Within 5 miles</SelectItem>
                <SelectItem value="city">Same City</SelectItem>
                <SelectItem value="remote">Remote Available</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full sm:w-48 bg-background">
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="weekdays">Weekdays</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
                <SelectItem value="evenings">Evenings</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full sm:w-48 bg-background">
                <Star className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4plus">4+ Stars</SelectItem>
                <SelectItem value="5">5 Stars Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Popular Skills */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-foreground mb-3">
            {loading ? 'Loading popular skills...' : 'Popular Skills'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {loading ? (
              // Loading skeleton for skills
              [...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-6 w-20 bg-muted-foreground/20 rounded-full"></div>
                </div>
              ))
            ) : (
              popularSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
                >
                  {skill}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}