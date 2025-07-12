import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { swapsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "../components/ui/use-toast";
import { Star } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "text-yellow-600 border-yellow-300 bg-yellow-50",
  accepted: "text-green-600 border-green-300 bg-green-50",
  rejected: "text-red-600 border-red-300 bg-red-50",
  completed: "text-blue-600 border-blue-300 bg-blue-50",
  cancelled: "text-gray-600 border-gray-300 bg-gray-50",
};

const SwapDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [swap, setSwap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchSwap = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await swapsAPI.getSwap(id);
        setSwap(response.data.swap);
      } catch (err: any) {
        setError("Failed to load swap details.");
      } finally {
        setLoading(false);
      }
    };
    fetchSwap();
  }, [id]);

  const handleDelete = async () => {
    if (!swap) return;
    if (!window.confirm("Are you sure you want to delete this swap request?")) return;
    try {
      setDeleting(true);
      await swapsAPI.cancelSwap(swap._id, "User deleted the swap");
      toast({ title: "Swap deleted." });
      navigate("/swaps");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete swap.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="container mx-auto py-12 px-4">Loading...</div>;
  if (error || !swap) return <div className="container mx-auto py-12 px-4 text-destructive">{error || "Swap not found"}</div>;

  const isParticipant = user && (swap.requester.id === user.id || swap.provider.id === user.id);

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <div className="bg-card rounded-xl shadow p-8 flex flex-col gap-6 border border-border">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={swap.requester.avatar} alt={swap.requester.name} />
            <AvatarFallback>{swap.requester.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-lg">Requester: {swap.requester.name}</div>
            <div className="text-sm text-muted-foreground">{swap.requester.location}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={swap.provider.avatar} alt={swap.provider.name} />
            <AvatarFallback>{swap.provider.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-lg">Provider: {swap.provider.name}</div>
            <div className="text-sm text-muted-foreground">{swap.provider.location}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div><span className="font-medium">Status:</span> <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusColors[swap.status] || ""}`}>{swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}</span></div>
          <div><span className="font-medium">Offered Skill:</span> {swap.offeredSkill}</div>
          <div><span className="font-medium">Requested Skill:</span> {swap.requestedSkill}</div>
          {swap.message && <div><span className="font-medium">Message:</span> <span className="italic">"{swap.message}"</span></div>}
          {swap.scheduledDate && <div><span className="font-medium">Scheduled Date:</span> {new Date(swap.scheduledDate).toLocaleString()}</div>}
          {swap.location && <div><span className="font-medium">Location:</span> {swap.location}</div>}
          <div><span className="font-medium">Duration:</span> {swap.duration} minutes</div>
          <div><span className="font-medium">Remote:</span> {swap.isRemote ? "Yes" : "No"}</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="font-medium">Ratings & Feedback:</div>
          <div className="flex gap-4">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>Requester rating: {swap.requesterRating ? `${swap.requesterRating}/5` : "Not rated"}</span>
              </div>
              {swap.requesterReview && <div className="text-xs italic">"{swap.requesterReview}"</div>}
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>Provider rating: {swap.providerRating ? `${swap.providerRating}/5` : "Not rated"}</span>
              </div>
              {swap.providerReview && <div className="text-xs italic">"{swap.providerReview}"</div>}
            </div>
          </div>
        </div>
        {isParticipant && (
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete/Remove Swap"}
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate("/swaps")}>Back to Swap Requests</Button>
      </div>
    </div>
  );
};

export default SwapDetail; 