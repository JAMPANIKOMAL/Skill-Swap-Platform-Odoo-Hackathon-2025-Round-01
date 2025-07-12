import { useEffect, useState } from "react";
import { swapsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "../components/ui/use-toast";
import RatingModal from "../components/RatingModal";
import StatusFilter from "../components/StatusFilter";
import { Star, CheckCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "text-yellow-600 border-yellow-300 bg-yellow-50",
  accepted: "text-green-600 border-green-300 bg-green-50",
  rejected: "text-red-600 border-red-300 bg-red-50",
  completed: "text-blue-600 border-blue-300 bg-blue-50",
  cancelled: "text-gray-600 border-gray-300 bg-gray-50",
};

const SwapRequests = () => {
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
    fetchSwaps();
    // eslint-disable-next-line
  }, [page, status]);

  useEffect(() => {
    fetchStatusCounts();
  }, []);

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
    fetchSwaps();
    fetchStatusCounts(); // Refresh counts after rating
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 flex justify-center items-start">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-slate-100 max-w-3xl w-full">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-2 text-center text-slate-900">Swap Requests</h1>
        <p className="text-slate-500 mb-8 text-center">Manage your skill swap requests and track their status.</p>
        {/* Status Filter */}
        <div className="mb-8 w-full">
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
          <div className="mb-6 p-4 bg-slate-50 rounded-xl w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
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
              <div className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </div>
            </div>
          </div>
        )}
        {/* Main Content */}
        {loading ? (
          <div className="w-full flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-destructive text-center w-full py-8">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
            <p>{error}</p>
          </div>
        ) : swaps.length === 0 ? (
          <div className="text-center w-full py-16">
            <div className="text-slate-400 mb-6">
              <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">No swap requests found</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Try adjusting your filter or check back later for new swaps.
            </p>
          </div>
        ) : (
          <div className="w-full space-y-6">
            {swaps.map((swap) => {
              const isIncoming = swap.provider.id === user?.id;
              const otherUser = isIncoming ? swap.requester : swap.provider;
              return (
                <div key={swap.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between border border-slate-200">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-14 w-14 ring-4 ring-slate-100 shadow-lg">
                      <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold text-lg">
                        {otherUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-lg text-slate-900">{otherUser.name}</div>
                      <div className="text-sm text-slate-500">{otherUser.location}</div>
                      <div className="text-xs mt-1">
                        <span className="font-medium">Offers:</span> {swap.offeredSkill}
                        <span className="ml-2 font-medium">Wants:</span> {swap.requestedSkill}
                      </div>
                      {swap.message && <div className="text-xs mt-1 italic text-slate-500">"{swap.message}"</div>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end mt-4 md:mt-0 min-w-[140px]">
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
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    {/* Rating Button for completed swaps */}
                    {swap.status === "completed" && (
                      <div className="space-y-2">
                        {/* Show existing rating if any */}
                        {(swap.requesterRating || swap.providerRating) && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>
                              {swap.requesterRating || swap.providerRating}/5
                            </span>
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
                        {/* Already rated indicator */}
                        {((isIncoming && swap.providerRating) || (!isIncoming && swap.requesterRating)) && (
                          <div className="text-xs text-green-600 font-medium">
                            ✓ Rated
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
          </div>
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
    </div>
  );
};

export default SwapRequests; 