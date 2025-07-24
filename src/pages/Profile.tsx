import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usersAPI } from "../services/api";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "../components/ui/use-toast";
import { SkillSelector } from "../components/SkillSelector";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { MapPin, Star, TrendingUp, Sparkles, MessageCircle, Clock, Pencil, Camera } from "lucide-react";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    location: user?.location || "",
    bio: user?.bio || "",
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
    availability: user?.availability || "Flexible",
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update avatar preview when user avatar changes
  useEffect(() => {
    if (user?.avatar && !avatarPreview) {
      setAvatarPreview(user.avatar);
    }
  }, [user?.avatar, avatarPreview]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (skills: string[], type: "offered" | "wanted") => {
    setForm((prev) => ({
      ...prev,
      [type === "offered" ? "skillsOffered" : "skillsWanted"]: skills,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await usersAPI.updateProfile(form);
      await updateUser({}); // Refresh user context
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
      setEditMode(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update profile.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Upload and update avatar
  const handleAvatarSave = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    try {
      // Upload the file directly to the backend
      const response = await usersAPI.updateAvatar(avatarFile);
      
      // Update the user context with the new avatar URL
      if (response.data && response.data.user) {
        await updateUser(response.data.user);
      } else {
        await updateUser({});
      }
      
      toast({ title: "Profile photo updated!" });
      setAvatarFile(null);
      setAvatarPreview(""); // Clear the preview
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update photo.", variant: "destructive" });
    } finally {
      setAvatarLoading(false);
    }
  };

  if (!user) return <div className="container mx-auto py-16 px-4 text-center text-lg">Loading...</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 flex justify-center items-start">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-slate-100 max-w-2xl w-full">
        {/* Avatar and Edit Icon */}
        <div className="mb-6 relative group flex flex-col items-center">
          <div
            className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg ring-4 ring-blue-100 cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
            title="Change Profile Photo"
            style={{ position: 'relative' }}
          >
            {avatarPreview ? (
              <Avatar className="h-28 w-28">
                <AvatarImage src={avatarPreview} alt={user.name} />
                <AvatarFallback className="text-4xl text-white font-bold">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : user.avatar ? (
              <Avatar className="h-28 w-28">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-4xl text-white font-bold">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <span className="text-4xl text-white font-bold">{user.name.charAt(0)}</span>
            )}
            {/* Camera icon overlay on avatar only */}
            <div className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-all duration-200 group-hover:scale-110 z-10">
              <Camera className="h-4 w-4" />
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
          </div>
          {/* Save/Cancel for avatar - add margin-top and center horizontally */}
          {avatarFile && (
            <div className="flex gap-3 mt-6 justify-center w-full">
              <Button size="lg" onClick={handleAvatarSave} disabled={avatarLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl">
                {avatarLoading ? "Saving..." : "Save Photo"}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => { setAvatarFile(null); setAvatarPreview(""); }} className="px-6 py-2 rounded-xl">
                Cancel
              </Button>
            </div>
          )}
        </div>
        {/* Name & Email */}
        <h1 className="text-3xl font-bold mb-1 text-center text-slate-900">
          {editMode ? (
            <Input value={form.name} onChange={e => handleChange("name", e.target.value)} className="text-center text-lg font-bold" />
          ) : (
            user.name
          )}
        </h1>
        <p className="text-slate-500 mb-2 text-center">{user.email}</p>
        {/* Location & Availability */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <span className="inline-flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="h-4 w-4" />
            {editMode ? (
              <Input value={form.location} onChange={e => handleChange("location", e.target.value)} className="w-32" />
            ) : (
              <span>{user.location}</span>
            )}
          </span>
          <span className="inline-flex items-center gap-1 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            {editMode ? (
              <select
                value={form.availability}
                onChange={e => handleChange("availability", e.target.value)}
                className="w-32 border rounded px-2 py-1"
              >
                <option value="Flexible">Flexible</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Evenings">Evenings</option>
                <option value="Weekdays & Evenings">Weekdays & Evenings</option>
              </select>
            ) : (
              <span>{user.availability}</span>
            )}
          </span>
        </div>
        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="flex items-center gap-1 text-blue-600 font-semibold">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{user.averageRating || user.rating || '0.0'}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <TrendingUp className="h-4 w-4" />
            <span>{user.totalSwaps || 0} swaps</span>
          </div>
        </div>
        {/* Bio */}
        <div className="w-full mb-6 bg-slate-50 rounded-xl p-5 text-center">
          <span className="font-medium text-slate-700">Bio:</span>
          {editMode ? (
            <Textarea
              value={form.bio}
              onChange={e => handleChange("bio", e.target.value)}
              rows={3}
              className="w-full mt-2"
            />
          ) : (
            <p className="mt-2 text-slate-600">{user.bio || <span className="italic">No bio yet.</span>}</p>
          )}
        </div>
        {/* Skills Offered */}
        <div className="w-full mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-slate-700">Skills I Can Offer</span>
          </div>
          {editMode ? (
            <SkillSelector
              skills={form.skillsOffered}
              onSkillsChange={skills => handleSkillsChange(skills, "offered")}
              placeholder="Add a skill you can teach"
              maxSkills={8}
            />
          ) : (
            <div className="flex flex-wrap gap-2 mt-1">
              {user.skillsOffered.length > 0 ? user.skillsOffered.map((skill, i) => (
                <Badge key={i} className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 rounded-full font-medium">{skill}</Badge>
              )) : <span className="italic text-slate-400">None</span>}
            </div>
          )}
        </div>
        {/* Skills Wanted */}
        <div className="w-full mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-4 w-4 text-purple-500" />
            <span className="font-semibold text-slate-700">Skills I Want to Learn</span>
          </div>
          {editMode ? (
            <SkillSelector
              skills={form.skillsWanted}
              onSkillsChange={skills => handleSkillsChange(skills, "wanted")}
              placeholder="Add a skill you want to learn"
              maxSkills={8}
            />
          ) : (
            <div className="flex flex-wrap gap-2 mt-1">
              {user.skillsWanted.length > 0 ? user.skillsWanted.map((skill, i) => (
                <Badge key={i} className="text-xs bg-purple-50 text-purple-700 border-purple-200 px-3 py-1 rounded-full font-medium">{skill}</Badge>
              )) : <span className="italic text-slate-400">None</span>}
            </div>
          )}
        </div>
        {/* Edit/Save/Cancel Buttons */}
        <div className="flex gap-2 mt-6">
          {editMode ? (
            <>
              <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl">
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button variant="secondary" onClick={() => { setEditMode(false); setForm({
                name: user.name,
                location: user.location,
                bio: user.bio || "",
                skillsOffered: user.skillsOffered,
                skillsWanted: user.skillsWanted,
                availability: user.availability,
              }); }} disabled={loading} className="px-6 py-2 rounded-xl">
                Cancel
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Profile;