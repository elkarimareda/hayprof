import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  MessageCircle,
  MapPin,
  Globe,
  CheckCircle,
  BookOpen,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/request";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ReviewForm from "@/components/FormReview";
import { useAuth } from "@/hooks/useAuth";
import type { Course } from "@/apis/courses";

export const Route = createFileRoute("/_public/teacher/$id")({
  component: TeacherProfile,
});

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  country: string;
  timezone: string;
  pricing: number;
  biography?: string;
  onboarding_completed: boolean;
  photo_url?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  certifications?: Array<{
    id: number;
    subject: string;
    certificate: string;
    issued_date?: string;
    issuer?: string;
  }>;
  courses: Course[];
  courses_count?: number;
  students_count?: number;
  rating?: number;
  total_reviews?: number;
  languages?: Array<{
    id: number;
    name: string;
    code: string;
    native_name: string;
    proficiency_level: string;
  }>;
  experience_years?: number;
  response_time?: string;
}

export interface Review {
  comment: string;
  course?: { title: string };
  created_at: string;
  id: number;
  is_verified: boolean;
  rating: number;
  student: {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    photo_url?: string;
  };
}

interface TeacherProfileData {
  profile: Teacher;
  reviews: Review[];
  courses: Course[];
}

// API function to get teacher profile
const getTeacherProfile = async (
  teacherId: string
): Promise<TeacherProfileData> => {
  const response = await api.get<TeacherProfileData>(`/teachers/${teacherId}`);
  return response.data;
};

// API function to get teacher reviews
const getTeacherReviews = async (
  teacherId: string
): Promise<{ reviews: { data: Review[] } }> => {
  const response = await api.get<{ reviews: { data: Review[] } }>(
    `/teachers/${teacherId}/reviews`
  );
  return response.data;
};

// API function to update review
const updateReview = async (
  reviewId: number,
  reviewData: { rating: number; comment: string }
): Promise<Review> => {
  const response = await api.put<Review>(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

// API function to delete review
const deleteReview = async (reviewId: number): Promise<void> => {
  await api.delete(`/reviews/${reviewId}`);
};

function TeacherProfile() {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        setLoading(true);
        const data = await getTeacherProfile(id);
        const dataReviews = await getTeacherReviews(id);

        setTeacher(data.profile);
        setReviews(dataReviews.reviews.data || []);
        setCourses(data.profile.courses);
      } catch (error) {
        console.error("Failed to fetch teacher profile:", error);
        toast.error(t("errors.generic"));
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [id, t]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < Math.floor(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">
          ({rating?.toFixed(1)})
        </span>
      </div>
    );
  };

  const handleReviewSubmitted = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);

    // Update teacher stats if available
    if (teacher) {
      setTeacher((prev) =>
        prev
          ? {
              ...prev,
              total_reviews: (prev.total_reviews || 0) + 1,
              // Optionally recalculate rating
              rating: prev.rating
                ? (prev.rating * (prev.total_reviews || 0) + newReview.rating) /
                  ((prev.total_reviews || 0) + 1)
                : newReview.rating,
            }
          : null
      );
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async () => {
    if (!editingReview || editRating === 0 || !editComment.trim()) {
      toast.error(t("review.fill_all_fields", "Please fill all fields"));
      return;
    }

    setIsUpdating(true);
    try {
      const updatedReview = await updateReview(editingReview.id, {
        rating: editRating,
        comment: editComment.trim(),
      });

      // Update the review in the list
      setReviews((prev) =>
        prev.map((review) =>
          review.id === editingReview.id
            ? { ...review, ...updatedReview }
            : review
        )
      );

      toast.success(t("review.updated", "Review updated successfully"));
      setEditingReview(null);
      setEditRating(0);
      setEditComment("");
    } catch (error) {
      console.error("Failed to update review:", error);
      toast.error(t("review.update_error", "Failed to update review"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(reviewId);

      // Remove the review from the list
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));

      // Update teacher stats
      if (teacher) {
        setTeacher((prev) =>
          prev
            ? {
                ...prev,
                total_reviews: Math.max((prev.total_reviews || 1) - 1, 0),
              }
            : null
        );
      }

      toast.success(t("review.deleted", "Review deleted successfully"));
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast.error(t("review.delete_error", "Failed to delete review"));
    }
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditComment("");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t("teacher.not_found", "Teacher not found")}
        </h1>
        <p className="text-gray-600">
          {t(
            "teacher.not_found_message",
            "The teacher you're looking for doesn't exist."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Teacher Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-32 h-32 mx-auto md:mx-0">
              <AvatarImage
                src={teacher.photo_url}
                alt={`${teacher.first_name} ${teacher.last_name}`}
              />
              <AvatarFallback className="text-2xl">
                {getInitials(teacher.first_name, teacher.last_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {teacher.first_name} {teacher.last_name}
                </h1>
                {teacher.onboarding_completed && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{teacher.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>{teacher.timezone}</span>
                </div>
              </div>

              {teacher.rating && (
                <div className="flex items-center justify-center md:justify-start mb-4">
                  {renderStars(teacher.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    ({teacher.total_reviews} {t("teacher.reviews", "reviews")})
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {teacher.students_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("teacher.students", "Students")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {teacher.courses_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("teacher.courses", "Courses")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {teacher.experience_years || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("teacher.years_exp", "Years Exp.")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatPrice(teacher.pricing)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("teacher.per_hour", "per hour")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            {t("teacher.overview", "Overview")}
          </TabsTrigger>
          <TabsTrigger value="courses">
            {t("teacher.courses", "Courses")}
          </TabsTrigger>
          <TabsTrigger value="reviews">
            {t("teacher.reviews", "Reviews")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("teacher.about", "About")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {teacher.biography ||
                      t("teacher.no_biography", "No biography available.")}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {/* Languages */}
              {teacher.languages && teacher.languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("teacher.languages", "Languages")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {teacher.languages.map((language) => (
                        <div
                          key={language.id}
                          className="flex items-center justify-between"
                        >
                          <span className="font-medium">{language.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {language.proficiency_level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Teaching Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("teacher.teaching_info", "Teaching Info")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {teacher.response_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        {t("teacher.response_time", "Response time")}:
                      </span>
                      <span className="font-medium">
                        {teacher.response_time}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {t("teacher.pricing", "Hourly rate")}:
                    </span>
                    <span className="font-medium text-green-600">
                      {formatPrice(teacher.pricing)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-6">
          {courses?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("teacher.no_courses", "No courses yet")}
                </h3>
                <p className="text-gray-600">
                  {t(
                    "teacher.no_courses_message",
                    "This teacher hasn't created any courses yet."
                  )}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses?.map((course) => (
                <Card
                  key={course.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {course.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {t("course.subject", "Subject")}:
                        </span>
                        <span>{course.subject.name}</span>
                      </div>
                      {course.proficiency_level && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {t("course.level", "Level")}:
                          </span>
                          <Badge variant="outline">
                            {t(
                              `course.proficiency.${course.proficiency_level}`
                            )}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {t("course.sessions", "Sessions")}:
                        </span>
                        <span>{course.count_session}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {t("course.duration", "Duration")}:
                        </span>
                        <span>{course.duration_session}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(course.price_per_student || 0)}
                      </span>
                      <Link
                        to="/course/$id"
                        params={{ id: course.id.toString() }}
                      >
                        <Button size="sm">
                          {t("course.view_details", "View Details")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-6">
          {/* Review Form */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {t("review.reviews_title", "Student Reviews")}
                  </CardTitle>
                  <ReviewForm
                    teacherId={id}
                    onReviewSubmitted={handleReviewSubmitted}
                    hasReviewed={
                      isAuthenticated &&
                      (user?.user_type !== "student" ||
                        reviews.some(
                          (r) => r.student?.id === user?.profile?.id
                        ))
                    }
                  />
                </div>
                {teacher?.rating && teacher?.total_reviews && (
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      {renderStars(teacher.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {t("review.based_on_reviews", {
                        count: teacher.total_reviews,
                        defaultValue: "Based on {{count}} reviews",
                      })}
                    </span>
                  </div>
                )}
              </CardHeader>
            </Card>
          </div>

          {/* Reviews List */}
          {reviews?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("teacher.no_reviews", "No reviews yet")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t(
                    "teacher.no_reviews_message",
                    "This teacher hasn't received any reviews yet."
                  )}
                </p>
                <ReviewForm
                  teacherId={id}
                  onReviewSubmitted={handleReviewSubmitted}
                  hasReviewed={
                    isAuthenticated &&
                    (user?.user_type !== "student" ||
                      reviews.some((r) => r.student?.id === user?.profile?.id))
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews?.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.student?.photo_url} />
                        <AvatarFallback>
                          {review.student?.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            {review.student?.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {formatDate(review.created_at)}
                            </span>
                            {/* Edit/Delete buttons for user's own review */}
                            {isAuthenticated &&
                              user?.profile.id === review.student?.id && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditReview(review)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          {t(
                                            "review.delete_title",
                                            "Delete Review"
                                          )}
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
                                          {t("common.cancel", "Cancel")}
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeleteReview(review.id)
                                          }
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          {t("common.delete", "Delete")}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(review.rating)}
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
          )}
        </TabsContent>

        {/* Edit Review Dialog */}
        <Dialog
          open={!!editingReview}
          onOpenChange={(open) => !open && cancelEdit()}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t("review.edit_review_title", "Edit Review")}
              </DialogTitle>
              <DialogDescription>
                {t("review.edit_review_description", "Update your review")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Rating Stars */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("review.rating", "Rating")}
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      onClick={() => setEditRating(star)}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= editRating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300 hover:text-yellow-200"
                        }`}
                      />
                    </button>
                  ))}
                  {editRating > 0 && (
                    <span className="ml-2 text-sm text-gray-600">
                      ({editRating} {editRating === 1 ? "star" : "stars"})
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label htmlFor="edit-comment" className="text-sm font-medium">
                  {t("review.comment", "Comment")}
                </label>
                <Textarea
                  id="edit-comment"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder={t(
                    "review.comment_placeholder",
                    "Share your thoughts about this teacher..."
                  )}
                  rows={4}
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500">
                  {editComment.length}/500
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                onClick={handleUpdateReview}
                disabled={isUpdating || editRating === 0 || !editComment.trim()}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isUpdating
                  ? t("review.updating", "Updating...")
                  : t("review.update", "Update Review")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
}
