import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usersAPI } from "../services/api";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { MapPin, Star, TrendingUp, Sparkles, MessageCircle, Clock } from "lucide-react";

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await usersAPI.getUser(id);
        setUser(response.data.user);
      } catch (err: any) {
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <div className="container mx-auto py-16 px-4 text-center text-lg">Loading...</div>;
  if (error || !user) return <div className="container mx-auto py-16 px-4 text-center text-destructive text-lg">{error || "User not found"}</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 flex justify-center items-start">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-slate-100 max-w-2xl w-full">
        {/* Avatar and Header */}
        <div className="mb-6 relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg ring-4 ring-blue-100">
            {user.avatar ? (
              <Avatar className="h-28 w-28">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-4xl text-white font-bold">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <span className="text-4xl text-white font-bold">{user.name.charAt(0)}</span>
            )}
          </div>
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
        <h1 className="text-3xl font-bold mb-1 text-center text-slate-900">{user.name}</h1>
        <div className="flex items-center justify-center gap-2 text-slate-500 mb-4">
          <MapPin className="h-4 w-4" />
          <span>{user.location}</span>
        </div>
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-1 text-blue-600 font-semibold">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{user.averageRating || user.rating || '0.0'}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <TrendingUp className="h-4 w-4" />
            <span>{user.totalSwaps || 0} swaps</span>
          </div>
        </div>

        {/* Bio Section */}
        <div className="w-full mb-6 bg-slate-50 rounded-xl p-5 text-center">
          <span className="font-medium text-slate-700">Bio:</span>
          <p className="mt-2 text-slate-600">{user.bio ? user.bio : <span className="italic">No bio yet.</span>}</p>
        </div>

        {/* Skills Offered */}
        <div className="w-full mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-slate-700">Offers</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skillsOffered && user.skillsOffered.length > 0 ? user.skillsOffered.map((skill: string, i: number) => (
              <Badge key={i} className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 rounded-full font-medium">{skill}</Badge>
            )) : <span className="italic text-slate-400">None</span>}
          </div>
        </div>
        {/* Skills Wanted */}
        <div className="w-full mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-4 w-4 text-purple-500" />
            <span className="font-semibold text-slate-700">Wants</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skillsWanted && user.skillsWanted.length > 0 ? user.skillsWanted.map((skill: string, i: number) => (
              <Badge key={i} className="text-xs bg-purple-50 text-purple-700 border-purple-200 px-3 py-1 rounded-full font-medium">{skill}</Badge>
            )) : <span className="italic text-slate-400">None</span>}
          </div>
        </div>
        {/* Availability */}
        <div className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-50 rounded-xl p-3">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-700">{user.availability}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 