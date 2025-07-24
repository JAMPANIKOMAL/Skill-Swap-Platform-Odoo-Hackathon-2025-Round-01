import { useState } from "react";
import { MapPin, Star, Clock, MessageCircle, X, Sparkles, TrendingUp } from "lucide-react";
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
    averageRating?: number;
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
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        {/* User Info */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="relative">
            <Avatar className="h-14 w-14 ring-4 ring-slate-100 shadow-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold text-lg">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-3 border-white shadow-sm"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-lg truncate">{user.name}</h3>
            <div className="flex items-center text-sm text-slate-500 mt-1">
              {user.location && (
                <>
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="truncate">{user.location}</span>
                </>
              )}
            </div>
            <div className="flex items-center mt-3 space-x-4">
              <div className="flex items-center text-sm text-slate-600">
                <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{user.averageRating || user.rating || '0.0'}</span>
              </div>
              <div className="flex items-center text-sm text-slate-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{user.totalSwaps} swaps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Offered */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <h4 className="text-sm font-semibold text-slate-700">Offers</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillsOffered.slice(0, 3).map((skill, index) => (
              <Badge key={index} className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 rounded-full font-medium">
                {skill}
              </Badge>
            ))}
            {skillsOffered.length > 3 && (
              <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 px-3 py-1 rounded-full">
                +{skillsOffered.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-4 w-4 text-purple-500" />
            <h4 className="text-sm font-semibold text-slate-700">Wants</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillsWanted.slice(0, 3).map((skill, index) => (
              <Badge key={index} className="text-xs bg-purple-50 text-purple-700 border-purple-200 px-3 py-1 rounded-full font-medium">
                {skill}
              </Badge>
            ))}
            {skillsWanted.length > 3 && (
              <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 px-3 py-1 rounded-full">
                +{skillsWanted.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center text-sm text-slate-500 mb-6 p-3 bg-slate-50 rounded-xl">
          <Clock className="h-4 w-4 mr-2 text-slate-400" />
          <span className="font-medium">{availability}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => {
              if (!isAuthenticated) {
                toast({ title: "Please log in to request a swap.", variant: "destructive" });
                return;
              }
              setShowSwapModal(true);
            }}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Request Swap
          </Button>
          <Button 
            variant="outline" 
            className="px-4 py-3 rounded-xl border-slate-200 hover:bg-slate-50 font-medium transition-all duration-300"
            onClick={() => navigate(`/profile/${user.id}`)}
          >
            View Profile
          </Button>
        </div>

        {/* Swap Request Modal */}
        {showSwapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-slate-200">
              <button
                type="button"
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowSwapModal(false)}
                tabIndex={-1}
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Request Swap with {user.name}</h2>
              {matchingOfferedSkills.length === 0 || matchingWantedSkills.length === 0 ? (
                <div className="mb-6 text-center text-slate-600 bg-slate-50 p-6 rounded-xl">
                  <p className="font-medium mb-2">No matching skills for a swap.</p>
                  <p className="text-sm">You can only request a swap if you offer a skill they want, and they offer a skill you want.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Choose one of your offered skills</label>
                    <select
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Choose one of their offered skills</label>
                    <select
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Message (optional)</label>
                    <textarea
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                      rows={3}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Add a message to introduce yourself..."
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Swap Request"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}