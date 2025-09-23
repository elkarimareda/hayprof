import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Globe, CheckCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/request";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ReviewForm from "@/components/Reviews/FormReview";
import { useAuth } from "@/hooks/useAuth";
import type { Course } from "@/apis/courses";
import Stars from "@/components/Reviews/Stars";
import ListReviews from "@/components/Reviews/ListReviews";
import type { Review } from "@/Models/Review";

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
          prev
            ? {
                ...prev,
                total_reviews: (prev.total_reviews || 0) + 1,
                // Optionally recalculate rating
                rating: prev.rating
                  ? (prev.rating * (prev.total_reviews || 0) +
                      reviewData.rating) /
                    ((prev.total_reviews || 0) + 1)
                  : reviewData.rating,
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
                  <Stars rating={teacher.rating} />
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
                    editingReview={editingReview}
                    onEditComplete={() => setEditingReview(null)}
                  />
                </div>
                {teacher?.rating && teacher?.total_reviews && (
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Stars rating={teacher.rating} />
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
