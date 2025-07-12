import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Star, StarOff } from "lucide-react";
import { swapsAPI } from "../services/api";
import { toast } from "./ui/use-toast";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  swapId: string;
  otherUserName: string;
  onRatingSubmitted: () => void;
}

const RatingModal = ({ isOpen, onClose, swapId, otherUserName, onRatingSubmitted }: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      await swapsAPI.rateSwap(swapId, rating, review);
      toast({
        title: "Rating submitted!",
        description: "Thank you for your feedback."
      });
      onRatingSubmitted();
      onClose();
      // Reset form
      setRating(0);
      setReview("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setRating(0);
      setReview("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your swap with {otherUserName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                  disabled={submitting}
                >
                  {star <= rating ? (
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {rating === 0 && "Click on a star to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label htmlFor="review" className="text-sm font-medium">
              Review (optional)
            </label>
            <Textarea
              id="review"
              placeholder="Share your experience with this swap..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              maxLength={500}
              disabled={submitting}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground text-right">
              {review.length}/500
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="flex-1"
            >
              {submitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal; 