import { useState } from "react";
import { MapPin, Star, Clock, MessageCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { swapsAPI } from "../services/api";
import { toast } from "./ui/use-toast";

interface SkillCardProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    location?: string;
    rating: number;
    totalSwaps: number;
  };
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
  isOnline?: boolean;
}

export function SkillCard({ user, skillsOffered, skillsWanted, availability, isOnline }: SkillCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [offeredSkill, setOfferedSkill] = useState("");
  const [wantedSkill, setWantedSkill] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Only show your offered skills that they want
  const matchingOfferedSkills = (currentUser?.skillsOffered || []).filter(skill => skillsWanted.includes(skill));
  // Only show their offered skills that you want
  const matchingWantedSkills = skillsOffered.filter(skill => (currentUser?.skillsWanted || []).includes(skill));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeredSkill || !wantedSkill) {
      toast({ title: "Please select both skills.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await swapsAPI.createSwap({
        providerId: user.id,
        offeredSkill,
        requestedSkill: wantedSkill,
        message,
      });
      toast({ title: "Swap request sent!", description: `Your request to ${user.name} was sent.` });
      setShowSwapModal(false);
      setOfferedSkill("");
      setWantedSkill("");
      setMessage("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send swap request.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50">
      <CardContent className="p-6">
        {/* User Info */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-success rounded-full border-2 border-card"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              {user.location && (
                <>
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{user.location}</span>
                </>
              )}
            </div>
            <div className="flex items-center mt-2 space-x-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="h-3 w-3 mr-1 fill-warning text-warning" />
                <span>{user.rating}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {user.totalSwaps} swaps
              </div>
            </div>
          </div>
        </div>

        {/* Skills Offered */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Offers</h4>
          <div className="flex flex-wrap gap-1">
            {skillsOffered.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                {skill}
              </Badge>
            ))}
            {skillsOffered.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{skillsOffered.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Wants</h4>
          <div className="flex flex-wrap gap-1">
            {skillsWanted.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs border-accent/30 text-accent">
                {skill}
              </Badge>
            ))}
            {skillsWanted.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{skillsWanted.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Clock className="h-3 w-3 mr-1" />
          <span>{availability}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="hero"
            size="sm"
            className="flex-1"
            onClick={() => {
              if (!isAuthenticated) {
                toast({ title: "Please log in to request a swap.", variant: "destructive" });
                return;
              }
              setShowSwapModal(true);
            }}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Request Swap
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${user.id}`)}>
            View Profile
          </Button>
        </div>

        {/* Swap Request Modal */}
        {showSwapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <form
              className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md relative"
              onSubmit={handleSubmit}
            >
              <button
                type="button"
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                onClick={() => setShowSwapModal(false)}
                tabIndex={-1}
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold mb-4">Request Swap with {user.name}</h2>
              {matchingOfferedSkills.length === 0 || matchingWantedSkills.length === 0 ? (
                <div className="mb-4 text-center text-muted-foreground">
                  <p>No matching skills for a swap.</p>
                  <p className="text-xs">You can only request a swap if you offer a skill they want, and they offer a skill you want.</p>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Choose one of your offered skills</label>
                    <select
                      className="w-full border rounded px-2 py-2"
                      value={offeredSkill}
                      onChange={e => setOfferedSkill(e.target.value)}
                      required
                    >
                      <option value="">Select a skill</option>
                      {matchingOfferedSkills.map((skill, i) => (
                        <option key={i} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Choose one of their offered skills</label>
                    <select
                      className="w-full border rounded px-2 py-2"
                      value={wantedSkill}
                      onChange={e => setWantedSkill(e.target.value)}
                      required
                    >
                      <option value="">Select a skill</option>
                      {matchingWantedSkills.map((skill, i) => (
                        <option key={i} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Message (optional)</label>
                    <textarea
                      className="w-full border rounded px-2 py-2"
                      rows={3}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Add a message..."
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Submit"}
                  </Button>
                </>
              )}
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}