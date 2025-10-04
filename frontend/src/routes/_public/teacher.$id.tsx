import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Globe, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ReviewForm from "@/components/Reviews/FormReview";
import { useAuth } from "@/hooks/useAuth";
import type { Course } from "@/Models/Course";
import Stars from "@/components/Reviews/Stars";
import ListReviews from "@/components/Reviews/ListReviews";
import type { Review } from "@/Models/Review";
import { formatPrice, getInitials } from "@/lib/utils";
import countries from "@/data/countries.json";
import {
  deleteReview,
  getTeacherProfile,
  getTeacherReviews,
} from "@/apis/teachers";
import type { Teacher } from "@/Models/Teacher";
import VideoPlayer from "@/components/ui/VideoPlayer";
import Avatar from "@/components/ui/Avatar";

export const Route = createFileRoute("/_public/teacher/$id")({
  component: TeacherProfile,
});

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

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        setLoading(true);
        const data = await getTeacherProfile(id);
        const dataReviews = await getTeacherReviews(id);

        console.log(dataReviews.reviews);

        setTeacher(data.profile);
        setReviews(dataReviews.reviews || []);
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

  const handleReviewSubmitted = (reviewData: Review) => {
    // Check if this is an update to an existing review
    const existingReviewIndex = reviews.findIndex(
      (r) => r.id === reviewData.id
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewData.id ? reviewData : review
        )
      );
    } else {
      // Add new review
      setReviews((prev) => [reviewData, ...prev]);

      // Update teacher stats for new reviews only
      if (teacher) {
        setTeacher((prev) =>
          prev?.reviews
            ? {
                ...prev,
                reviews: {
                  ...prev.reviews,
                  total_reviews: (prev.reviews.total_reviews || 0) + 1,
                  // Optionally recalculate rating
                  average_rating: prev.reviews.average_rating
                    ? (prev.reviews.average_rating *
                        (prev.reviews.total_reviews || 0) +
                        reviewData.rating) /
                      ((prev.reviews.total_reviews || 0) + 1)
                    : reviewData.rating,
                },
              }
            : null
        );
      }
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(reviewId);

      // Remove the review from the list
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));

      // Update teacher stats
      if (teacher) {
        setTeacher((prev) =>
          prev?.reviews
            ? {
                ...prev,
                reviews: {
                  ...prev.reviews,
                  total_reviews: Math.max(
                    (prev.reviews.total_reviews || 1) - 1,
                    0
                  ),
                },
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

  if (loading) {
    return (
      <div>
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
      <div>
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
    <div>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            <VideoPlayer
              src={teacher.video_url}
              thumbnail={teacher.thumbnail_video_url ?? teacher.photo_url}
              className="w-full md:w-1/2"
            />
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Avatar
                  image={teacher.photo_url}
                  alt={`${teacher.first_name} ${teacher.last_name}`}
                  fallback={getInitials(teacher.first_name, teacher.last_name)}
                />

                <h1 className="text-3xl font-bold text-gray-900">
                  {teacher.first_name} {teacher.last_name}
                </h1>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {
                      countries.find(
                        (c) => c.alpha2 === teacher.country.toLowerCase()
                      )?.name
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>{teacher.timezone}</span>
                </div>
              </div>

              {teacher.reviews?.average_rating && (
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <Stars rating={teacher.reviews.average_rating} />
                  <span className="ml-2 text-sm text-gray-600">
                    ({teacher.reviews.total_reviews || 0}{" "}
                    {t("teacher.reviews", "reviews")})
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">
                    {teacher.students?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("teacher.students", "Students")}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">
                    {teacher.courses.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("teacher.courses", "Courses")}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold ">
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
                            {t(
                              `language.proficiency.${language.proficiency_level}`
                            )}
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
                <Card key={course.id}>
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
                              `language.proficiency.${course.proficiency_level}`
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
                    {t("review.reviews_title", "Reviews")}
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
                    editingReview={editingReview}
                    onEditComplete={() => setEditingReview(null)}
                  />
                </div>
                {teacher.reviews?.average_rating &&
                  teacher.reviews?.total_reviews && (
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <Stars rating={teacher.reviews.average_rating} />
                      </div>
                      <span className="text-sm text-gray-600">
                        {t("review.based_on_reviews", {
                          count: teacher.reviews.total_reviews,
                          defaultValue: "Based on {{count}} reviews",
                        })}
                      </span>
                    </div>
                  )}
              </CardHeader>
            </Card>
          </div>
          <ListReviews
            reviews={reviews}
            onEditReview={handleEditReview}
            onDeleteReview={handleDeleteReview}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
