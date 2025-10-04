import { Card, CardContent } from "@/components/ui/card";
import type { Review } from "@/Models/Review";
import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { Edit, MessageCircle, Trash2 } from "lucide-react";
import Stars from "./Stars";
import {
  AlertDialogTrigger,
  AlertDialog,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { parseISO, format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  reviews: Review[];
  onEditReview?: (review: Review) => void;
  onDeleteReview?: (reviewId: number) => void;
}

function ListReviews({ reviews, onEditReview, onDeleteReview }: Props) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("teacher.no_reviews", "No reviews yet")}
          </h3>
          <p className="text-gray-600">
            {t(
              "teacher.no_reviews_message",
              "This teacher hasn't received any reviews yet."
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCreatedAt = (isoOrDate?: string) => {
    if (!isoOrDate) return "";
    try {
      const d = isoOrDate.includes("T")
        ? parseISO(isoOrDate)
        : new Date(isoOrDate);
      return format(d, "MMMM d, yyyy");
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar
                alt={review.student?.name}
                image={review.student?.photo_url}
                fallback={review.student?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{review.student?.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {formatCreatedAt(review.created_at)}
                    </span>
                    {/* Edit/Delete buttons for user's own review */}
                    {isAuthenticated &&
                      user?.profile.id === review.student?.id && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditReview?.(review)}
                            className="h-8 w-8 p-0"
                            aria-label={t("review.edit", "Edit review")}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                aria-label={t("review.delete", "Delete review")}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("review.delete_title", "Delete Review")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t(
                                    "review.delete_description",
                                    "Are you sure you want to delete this review? This action cannot be undone."
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("cancel", "Cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteReview?.(review.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {t("delete", "Delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Stars rating={review.rating} />
                  {review.course && (
                    <Badge variant="outline" className="text-xs">
                      {review.course.title}
                    </Badge>
                  )}
                </div>

                <p className="text-gray-700">{review.comment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ListReviews;
