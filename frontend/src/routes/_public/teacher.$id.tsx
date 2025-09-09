import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Award,
  Star,
  Calendar,
  BookOpen,
  MessageCircle,
  Globe,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/request";

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
  courses_count?: number;
  students_count?: number;
  rating?: number;
  total_reviews?: number;
  subjects?: string[];
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

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  student: {
    id: number;
    name: string;
    photo_url?: string;
  };
  course?: {
    id: number;
    title: string;
  };
}

interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  level: string;
  price: number;
  students_count: number;
  rating?: number;
  total_reviews?: number;
  subjects: string[];
  created_at: string;
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

function TeacherProfile() {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        setLoading(true);
        const data = await getTeacherProfile(id);
        setTeacher(data.profile);
        setReviews(data.reviews);
        setCourses(data.courses);
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
          ({rating.toFixed(1)})
        </span>
      </div>
    );
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

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button size="lg" className="flex-1 sm:flex-none">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t("teacher.book_lesson", "Book a Lesson")}
                </Button>
                <Button variant="outline" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t("teacher.message", "Message")}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            {t("teacher.overview", "Overview")}
          </TabsTrigger>
          <TabsTrigger value="courses">
            {t("teacher.courses", "Courses")}
          </TabsTrigger>
          <TabsTrigger value="reviews">
            {t("teacher.reviews", "Reviews")}
          </TabsTrigger>
          <TabsTrigger value="credentials">
            {t("teacher.credentials", "Credentials")}
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

              {/* Subjects */}
              {/* {teacher.subjects && teacher.subjects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("teacher.subjects", "Subjects")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject, index) => (
                        <Badge
                          key={index}
                          className="bg-blue-100 text-blue-800"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )} */}

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
                    {course.rating && (
                      <div className="flex items-center gap-2">
                        {renderStars(course.rating)}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {course.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {t("course.level", "Level")}:
                        </span>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {t("course.duration", "Duration")}:
                        </span>
                        <span>{course.duration} hours</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {t("course.students", "Students")}:
                        </span>
                        <span>{course.students_count}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.subjects.slice(0, 3).map((subject, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(course.price)}
                      </span>
                      <Button size="sm">
                        {t("course.view_details", "View Details")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-6">
          {reviews?.length === 0 ? (
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
          ) : (
            <div className="space-y-4">
              {reviews?.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.student.photo_url} />
                        <AvatarFallback>
                          {review.student.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{review.student.name}</h4>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.created_at)}
                          </span>
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

        {/* Credentials Tab */}
        <TabsContent value="credentials" className="mt-6">
          {!teacher.certifications || teacher.certifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("teacher.no_credentials", "No credentials yet")}
                </h3>
                <p className="text-gray-600">
                  {t(
                    "teacher.no_credentials_message",
                    "This teacher hasn't added any certifications yet."
                  )}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacher.certifications.map((cert) => (
                <Card key={cert.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <CardTitle className="text-lg">{cert.subject}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">
                          {t("credential.certificate", "Certificate")}:
                        </span>
                        <p className="font-medium">{cert.certificate}</p>
                      </div>
                      {cert.issuer && (
                        <div>
                          <span className="text-sm text-gray-600">
                            {t("credential.issuer", "Issuer")}:
                          </span>
                          <p className="font-medium">{cert.issuer}</p>
                        </div>
                      )}
                      {cert.issued_date && (
                        <div>
                          <span className="text-sm text-gray-600">
                            {t("credential.issued_date", "Issued")}:
                          </span>
                          <p className="font-medium">
                            {formatDate(cert.issued_date)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
