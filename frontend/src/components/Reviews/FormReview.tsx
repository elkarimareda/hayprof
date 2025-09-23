import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/utils/request";
import type { Review } from "@/Models/Review";

interface ReviewFormData {
  rating: number;
  comment: string;
  course_id?: number;
}

// API function to submit review
const submitReview = async (
  teacherId: string,
  reviewData: ReviewFormData
): Promise<Review> => {
  const response = await api.post<Review>(`/reviews`, {
    ...reviewData,
    teacher_id: teacherId,
  });
  return response.data;
};

// API function to update review
const updateReview = async (
  reviewId: number,
  reviewData: Omit<ReviewFormData, "course_id">
): Promise<Review> => {
  const response = await api.put<Review>(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

// Review Form Component
export default function ReviewForm({
  teacherId,
  onReviewSubmitted,
  hasReviewed,
  editingReview,
  onEditComplete,
  triggerButton,
}: {
  teacherId: string;
  onReviewSubmitted: (review: Review) => void;
  hasReviewed: boolean;
  editingReview?: Review | null;
  onEditComplete?: () => void;
  triggerButton?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [rating, setRating] = useState<number>(editingReview?.rating || 0);
  const [comment, setComment] = useState<string>(editingReview?.comment || "");
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(!!editingReview);

  const isEditMode = !!editingReview;

  // Update form when editingReview changes
  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating);
      setComment(editingReview.comment);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [editingReview]);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error(t("review.rating_required", "Please select a rating"));
      return;
    }

    if (!comment.trim()) {
      toast.error(t("review.comment_required", "Please write a comment"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editingReview) {
        // Update existing review
        const updatedReview = await updateReview(editingReview.id, {
          rating,
          comment: comment.trim(),
        });

        // Merge the updated review with the original review data
        const mergedReview = { ...editingReview, ...updatedReview };
        onReviewSubmitted(mergedReview);
        toast.success(t("review.updated", "Review updated successfully"));

        if (onEditComplete) {
          onEditComplete();
        }
      } else {
        // Create new review
        const newReview = await submitReview(teacherId, {
          rating,
          comment: comment.trim(),
        });

        onReviewSubmitted(newReview);
        toast.success(t("review.submitted", "Review submitted successfully"));
      }

      // Reset form
      setRating(0);
      setComment("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to submit review:", error);
      const errorMessage = isEditMode
        ? t("review.update_error", "Failed to update review")
        : t("review.submit_error", "Failed to submit review");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (!isEditMode) {
      setRating(0);
      setComment("");
    }
    setHoveredRating(0);
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      if (isEditMode && onEditComplete) {
        onEditComplete();
      } else {
        resetForm();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      {!isEditMode && (
        <DialogTrigger asChild>
          {triggerButton || (
            <Button className="w-full sm:w-auto" disabled={hasReviewed}>
              <Plus className="w-4 h-4 mr-2" />
              {t("review.write_review", "Write a Review")}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("review.edit_review_title", "Edit Review")
              : t("review.write_review_title", "Write a Review")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("review.edit_review_description", "Update your review")
              : t(
                  "review.write_review_description",
                  "Share your experience with this teacher"
                )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>{t("review.rating", "Rating")}</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  ({rating} {rating === 1 ? "star" : "stars"})
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">{t("review.comment", "Comment")}</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t(
                "review.comment_placeholder",
                "Share your thoughts about this teacher..."
              )}
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500">
              {comment.length}/500
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || !comment.trim()}
            >
              {isSubmitting
                ? isEditMode
                  ? t("review.updating", "Updating...")
                  : t("review.submitting", "Submitting...")
                : isEditMode
                  ? t("review.update", "Update Review")
                  : t("review.submit", "Submit Review")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
