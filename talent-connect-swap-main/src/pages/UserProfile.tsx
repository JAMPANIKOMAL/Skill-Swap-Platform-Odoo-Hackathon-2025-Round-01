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

  if (loading) return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white/80 rounded-2xl shadow-xl p-10 flex flex-col items-center border border-slate-100 max-w-md w-full">
        <svg className="h-16 w-16 text-blue-300 animate-spin mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" strokeWidth="4" className="opacity-75" />
        </svg>
        <div className="text-lg text-slate-500">Loading profile...</div>
      </div>
    </div>
  );
  if (error || !user) return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white/80 rounded-2xl shadow-xl p-10 flex flex-col items-center border border-slate-100 max-w-md w-full">
        <svg className="h-16 w-16 text-red-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div className="text-destructive text-lg font-semibold mb-2">{error || "User not found"}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 flex justify-center items-start">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-slate-100 max-w-2xl w-full">
        {/* Avatar and Header */}
        <div className="mb-6 relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-xl ring-4 ring-blue-100">
            {user.avatar ? (
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-5xl text-white font-bold">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <span className="text-5xl text-white font-bold">{user.name.charAt(0)}</span>
            )}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md"></div>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-1 text-center text-slate-900">{user.name}</h1>
        <div className="flex items-center justify-center gap-2 text-slate-500 mb-4">
          <MapPin className="h-5 w-5" />
          <span className="text-lg">{user.location}</span>
        </div>
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="flex items-center gap-1 text-blue-600 font-semibold text-lg">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span>{user.averageRating || user.rating || '0.0'}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-lg">
            <TrendingUp className="h-5 w-5" />
            <span>{user.totalSwaps || 0} swaps</span>
          </div>
        </div>
        {/* Bio Section */}
        <div className="w-full mb-6 bg-slate-50 rounded-2xl p-6 text-center shadow">
          <span className="font-semibold text-slate-700">Bio</span>
          <p className="mt-2 text-slate-600">{user.bio ? user.bio : <span className="italic">No bio yet.</span>}</p>
        </div>
        {/* Skills Offered */}
        <div className="w-full mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <span className="font-semibold text-slate-700">Offers</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skillsOffered && user.skillsOffered.length > 0 ? user.skillsOffered.map((skill: string, i: number) => (
              <Badge key={i} className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 px-4 py-1 rounded-full font-semibold shadow-sm">{skill}</Badge>
            )) : <span className="italic text-slate-400">None</span>}
          </div>
        </div>
        {/* Skills Wanted */}
        <div className="w-full mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-5 w-5 text-purple-500" />
            <span className="font-semibold text-slate-700">Wants</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skillsWanted && user.skillsWanted.length > 0 ? user.skillsWanted.map((skill: string, i: number) => (
              <Badge key={i} className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 px-4 py-1 rounded-full font-semibold shadow-sm">{skill}</Badge>
            )) : <span className="italic text-slate-400">None</span>}
          </div>
        </div>
        {/* Availability */}
        <div className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-50 rounded-xl p-4 shadow">
          <Clock className="h-5 w-5 text-slate-400" />
          <span className="font-semibold text-slate-700">{user.availability}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 