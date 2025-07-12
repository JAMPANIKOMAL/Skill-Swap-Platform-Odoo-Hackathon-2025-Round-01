import { useEffect, useState } from "react";
import { swapsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "../components/ui/use-toast";
import RatingModal from "../components/RatingModal";
import StatusFilter from "../components/StatusFilter";
import { Star, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  pending: "text-yellow-600 border-yellow-300 bg-yellow-50",
  accepted: "text-green-600 border-green-300 bg-green-50",
  rejected: "text-red-600 border-red-300 bg-red-50",
  completed: "text-blue-600 border-blue-300 bg-blue-50",
  cancelled: "text-gray-600 border-gray-300 bg-gray-50",
};

const SwapRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("All");
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    swapId: string;
    otherUserName: string;
  }>({
    isOpen: false,
    swapId: "",
    otherUserName: ""
  });

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = { page, limit: 6 };
      if (status !== "All") filters.status = status;
      const response = await swapsAPI.getUserSwaps(filters);
      setSwaps(response.data.swaps || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      setError("Failed to load swap requests.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      setLoadingCounts(true);
      // Fetch counts for all statuses
      const statuses = ["pending", "accepted", "rejected", "completed", "cancelled"];
      const counts: Record<string, number> = {};
      
      for (const status of statuses) {
        try {
          const response = await swapsAPI.getUserSwaps({ status, limit: 1 });
          counts[status] = response.data.pagination?.total || 0;
        } catch (error) {
          counts[status] = 0;
        }
      }
      
      // Get total count
      try {
        const totalResponse = await swapsAPI.getUserSwaps({ limit: 1 });
        counts["All"] = totalResponse.data.pagination?.total || 0;
      } catch (error) {
        counts["All"] = 0;
      }
      
      setStatusCounts(counts);
    } catch (error) {
      console.error("Failed to fetch status counts:", error);
    } finally {
      setLoadingCounts(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSwaps();
    }
    // eslint-disable-next-line
  }, [page, status, user]);

  useEffect(() => {
    if (user) {
      fetchStatusCounts();
    }
  }, [user]);

  const handleAction = async (swapId: string, action: "accept" | "reject" | "complete") => {
    try {
      if (action === "accept") {
        await swapsAPI.acceptSwap(swapId);
        toast({ title: "Swap accepted!" });
      } else if (action === "reject") {
        await swapsAPI.rejectSwap(swapId);
        toast({ title: "Swap rejected." });
      } else if (action === "complete") {
        await swapsAPI.completeSwap(swapId);
        toast({ title: "Swap completed!" });
      }
      fetchSwaps();
      fetchStatusCounts(); // Refresh counts after status change
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update swap.", variant: "destructive" });
    }
  };

  const handleRateSwap = (swapId: string, otherUserName: string) => {
    setRatingModal({
      isOpen: true,
      swapId,
      otherUserName
    });
  };

  const handleRatingSubmitted = () => {
    // Force a full reload of swaps and status counts after rating
    fetchSwaps();
    fetchStatusCounts();
  };

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Swap Requests</h1>
          <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
        </div>
        <div className="text-destructive">Please log in to view your swap requests.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Swap Requests</h1>
        <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
      </div>
      
      {/* Enhanced Status Filter */}
      <div className="mb-8">
        <StatusFilter
          selectedStatus={status}
          onStatusChange={(newStatus) => {
            setStatus(newStatus);
            setPage(1);
          }}
          statusCounts={statusCounts}
          loading={loadingCounts}
        />
      </div>

      {/* Results Summary */}
      {!loading && !error && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Showing {swaps.length} swap{swaps.length !== 1 ? 's' : ''}
                {status !== "All" && ` with status "${status}"`}
              </span>
              {status !== "All" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatus("All");
                    setPage(1);
                  }}
                  className="text-xs h-6 px-2"
                >
                  Clear Filter
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : swaps.length === 0 ? (
        <p className="text-muted-foreground">No swap requests found.</p>
      ) : (
        <>
          <div className="space-y-4">
            {swaps.map((swap) => {
              const isIncoming = swap.provider.id === user?.id;
              const otherUser = isIncoming ? swap.requester : swap.provider;
              return (
                <div
                  key={swap.id}
                  className="bg-card rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between border border-border cursor-pointer hover:bg-muted/50 transition"
                  onClick={() => navigate(`/swaps/${swap.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                      <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-lg">{otherUser.name}</div>
                      <div className="text-sm text-muted-foreground">{otherUser.location}</div>
                      <div className="text-xs mt-1">
                        <span className="font-medium">Offers:</span> {swap.offeredSkill}
                        <span className="ml-2 font-medium">Wants:</span> {swap.requestedSkill}
                      </div>
                      {swap.message && <div className="text-xs mt-1 italic">"{swap.message}"</div>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end mt-4 md:mt-0 min-w-[120px]">
                    <span className={`px-3 py-1 rounded-full border text-xs font-semibold mb-2 ${statusColors[swap.status] || ""}`}>
                      {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                    </span>
                    
                    {/* Action Buttons */}
                    {isIncoming && swap.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAction(swap.id, "accept")}>Accept</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(swap.id, "reject")}>Reject</Button>
                      </div>
                    )}
                    
                    {/* Complete Button for accepted swaps */}
                    {swap.status === "accepted" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleAction(swap.id, "complete")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    
                    {/* Rating Button for completed swaps */}
                    {swap.status === "completed" && (
                      <div className="space-y-2 text-xs">
                        {/* Your rating for the other user */}
                        {isIncoming && swap.providerRating && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>Your rating for {otherUser.name}: {swap.providerRating}/5</span>
                          </div>
                        )}
                        {!isIncoming && swap.requesterRating && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>Your rating for {otherUser.name}: {swap.requesterRating}/5</span>
                          </div>
                        )}
                        {/* Their rating for you */}
                        {isIncoming && swap.requesterRating && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{otherUser.name}'s rating for you: {swap.requesterRating}/5</span>
                          </div>
                        )}
                        {!isIncoming && swap.providerRating && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{otherUser.name}'s rating for you: {swap.providerRating}/5</span>
                          </div>
                        )}
                        {/* Rate button - only show if user hasn't rated yet */}
                        {((isIncoming && !swap.providerRating) || (!isIncoming && !swap.requesterRating)) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRateSwap(swap.id, otherUser.name)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Rate
                          </Button>
                        )}
                        {/* Already rated indicator (only for current user) */}
                        {((isIncoming && swap.providerRating) || (!isIncoming && swap.requesterRating)) && (
                          <div className="text-green-600 font-medium">
                            ✓ Rated
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center mt-8 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Prev
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}
      
      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, swapId: "", otherUserName: "" })}
        swapId={ratingModal.swapId}
        otherUserName={ratingModal.otherUserName}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  );
};

export default SwapRequests; 