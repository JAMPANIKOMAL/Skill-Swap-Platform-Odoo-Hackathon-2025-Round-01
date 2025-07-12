import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usersAPI } from "../services/api";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

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

  if (loading) return <div className="container mx-auto py-12 px-4">Loading...</div>;
  if (error || !user) return <div className="container mx-auto py-12 px-4 text-destructive">{error || "User not found"}</div>;

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <div className="bg-card rounded-xl shadow p-8 flex flex-col items-center">
        <div className="mb-4">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-4xl font-bold text-primary">
            {user.avatar ? (
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              user.name.charAt(0)
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-1 text-center">{user.name}</h1>
        <p className="text-muted-foreground mb-2 text-center">{user.location}</p>
        <div className="w-full mb-4">
          <span className="font-medium text-sm">Bio:</span>
          <p className="mt-1 text-muted-foreground">{user.bio || <span className="italic">No bio yet.</span>}</p>
        </div>
        <div className="w-full mb-4">
          <span className="font-medium text-sm">Skills Offered:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {user.skillsOffered && user.skillsOffered.length > 0 ? user.skillsOffered.map((skill: string, i: number) => (
              <Badge key={i} variant="secondary">{skill}</Badge>
            )) : <span className="italic text-muted-foreground">None</span>}
          </div>
        </div>
        <div className="w-full mb-4">
          <span className="font-medium text-sm">Skills Wanted:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {user.skillsWanted && user.skillsWanted.length > 0 ? user.skillsWanted.map((skill: string, i: number) => (
              <Badge key={i} variant="outline">{skill}</Badge>
            )) : <span className="italic text-muted-foreground">None</span>}
          </div>
        </div>
        <div className="w-full mb-4">
          <span className="font-medium text-sm">Availability:</span> <span>{user.availability}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 