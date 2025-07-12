import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usersAPI } from "../services/api";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "../components/ui/use-toast";
import { SkillSelector } from "../components/SkillSelector";

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

  if (!user) return <div className="container mx-auto py-12 px-4">Loading...</div>;

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <div className="bg-card rounded-xl shadow p-8 flex flex-col items-center">
        {/* Avatar */}
        <div className="mb-4">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-4xl font-bold text-primary">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
        </div>
        {/* Name & Email */}
        <h1 className="text-2xl font-bold mb-1 text-center">
          {editMode ? (
            <Input value={form.name} onChange={e => handleChange("name", e.target.value)} className="text-center" />
          ) : (
            user.name
          )}
        </h1>
        <p className="text-muted-foreground mb-2 text-center">{user.email}</p>
        {/* Location & Availability */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <span className="inline-flex items-center gap-1 text-sm">
            <span className="font-medium">Location:</span>
            {editMode ? (
              <Input value={form.location} onChange={e => handleChange("location", e.target.value)} className="w-32" />
            ) : (
              <span>{user.location}</span>
            )}
          </span>
          <span className="inline-flex items-center gap-1 text-sm">
            <span className="font-medium">Availability:</span>
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
        {/* Bio */}
        <div className="w-full mb-4">
          <span className="font-medium text-sm">Bio:</span>
          {editMode ? (
            <Textarea
              value={form.bio}
              onChange={e => handleChange("bio", e.target.value)}
              rows={3}
              className="w-full mt-1"
            />
          ) : (
            <p className="mt-1 text-muted-foreground">{user.bio || <span className="italic">No bio yet.</span>}</p>
          )}
        </div>
        {/* Skills Offered */}
        <div className="w-full mb-4">
          <span className="font-medium text-sm">Skills I Can Offer:</span>
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
                <Badge key={i} variant="secondary">{skill}</Badge>
              )) : <span className="italic text-muted-foreground">None</span>}
            </div>
          )}
        </div>
        {/* Skills Wanted */}
        <div className="w-full mb-4">
          <span className="font-medium text-sm">Skills I Want to Learn:</span>
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
                <Badge key={i} variant="outline">{skill}</Badge>
              )) : <span className="italic text-muted-foreground">None</span>}
            </div>
          )}
        </div>
        {/* Edit/Save/Cancel Buttons */}
        <div className="flex gap-2 mt-4">
          {editMode ? (
            <>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button variant="secondary" onClick={() => { setEditMode(false); setForm({
                name: user.name,
                location: user.location,
                bio: user.bio || "",
                skillsOffered: user.skillsOffered,
                skillsWanted: user.skillsWanted,
                availability: user.availability,
              }); }} disabled={loading}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 