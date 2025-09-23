import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Users,
  Calendar,
  DollarSign,
  BookOpen,
  User,
  CheckCircle,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCourse,
  enrollInCourse,
  getCourseEnrollment,
  getCourseEnrollments,
  unenrollFromCourse,
  type Course,
  type Enrollment,
  getCourseMeeting,
  joinCourseMeeting,
} from "@/apis/courses";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_public/course/$id")({
  component: CourseProfile,
});

function CourseProfile() {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [enrolledStudentsCount, setEnrolledStudentsCount] = useState<number>(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await getCourse(id);
        const meetings = await getCourseMeeting(id);
        setCourse({
          ...data,
          schedules: data.schedules.map((s) => ({
            ...s,
            meeting: meetings.meetings.find(
              (m) => m.metadata.schedule_id === s.id
            ),
          })),
        });
      } catch (error) {
        console.error("Failed to fetch course:", error);
        toast.error(t("errors.generic"));
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollment = async () => {
      if (isAuthenticated && user?.user_type === "student") {
        try {
          setCheckingEnrollment(true);
          const enrollmentData = await getCourseEnrollment(parseInt(id));
          setEnrollment(enrollmentData || null);
        } catch (error) {
          console.error("Failed to check enrollment:", error);
          // Don't show error to user as this is just checking enrollment status
        } finally {
          setCheckingEnrollment(false);
        }
      }
    };

    const fetchEnrollmentCount = async () => {
      try {
        const enrollmentsData = await getCourseEnrollments(parseInt(id));
        // Only count confirmed enrollments, not cancelled ones
        const confirmedEnrollments = enrollmentsData.enrollments.filter(
          (enrollment) => enrollment.status === "confirmed"
        );
        setEnrolledStudentsCount(confirmedEnrollments.length);
      } catch (error) {
        console.error("Failed to fetch enrollment count:", error);
        // Don't show error to user, just keep count at 0
      }
    };

    fetchCourse();
    checkEnrollment();
    fetchEnrollmentCount();
  }, [id, t, isAuthenticated, user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEnrollment = async () => {
    if (!isAuthenticated) {
      toast.error(
        t("course.login_required", "Please login to enroll in courses")
      );
      return;
    }

    if (user?.user_type !== "student") {
      toast.error(
        t("course.student_only", "Only students can enroll in courses")
      );
      return;
    }

    try {
      setEnrolling(true);
      const result = await enrollInCourse(parseInt(id));
      setEnrollment(result.enrollment);
      setEnrolledStudentsCount((prev) => prev + 1);
      toast.success(
        t("course.enrollment_success", "Successfully enrolled in course!")
      );
    } catch (error) {
      console.error("Failed to enroll in course:", error);
      toast.error(t("course.enrollment_error", "Failed to enroll in course"));
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenrollment = async () => {
    if (!enrollment) return;

    try {
      setEnrolling(true);
      await unenrollFromCourse(parseInt(id));
      setEnrollment(null);
      setEnrolledStudentsCount((prev) => Math.max(0, prev - 1));
      toast.success(
        t("course.unenroll_success", "Successfully unenrolled from course")
      );
    } catch (error) {
      console.error("Failed to unenroll from course:", error);
      toast.error(t("course.unenroll_error", "Failed to unenroll from course"));
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = !!enrollment && enrollment.status !== "cancelled";
  const isCancelled = !!enrollment && enrollment.status === "cancelled";
  const canEnroll =
    isAuthenticated &&
    user?.user_type === "student" &&
    (!isEnrolled || isCancelled);
  const canUnenroll =
    isAuthenticated &&
    user?.user_type === "student" &&
    isEnrolled &&
    enrollment?.status === "confirmed";

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

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t("course.not_found", "Course not found")}
        </h1>
        <p className="text-gray-600">
          {t(
            "course.not_found_message",
            "The course you're looking for doesn't exist."
          )}
        </p>
      </div>
    );
  }

  const joinMeeting = (meeting: {
    meeting_id: string;
    username: string;
    password: string;
    is_moderator: boolean;
  }) => {
    console.log("Joining meeting:", meeting);
    // Call the API to join the meeting
    joinCourseMeeting(
      meeting.meeting_id,
      user?.name || "test",
      meeting.moderator_password,
      true
    )
      .then((data) => {
        // Handle successful joining
        console.log("Joined meeting:", data.join_url);
      })
      .catch((error) => {
        // Handle errors
        console.error("Failed to join meeting:", error);
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Course Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Course Thumbnail */}
            <div className="w-full lg:w-80 h-48 bg-gray-100 rounded-lg overflow-hidden">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {course.title}
                  </h1>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {course.subject.name}
                    </Badge>
                    {course.proficiency_level && (
                      <Badge
                        className={getDifficultyColor(course.proficiency_level)}
                      >
                        {course.proficiency_level &&
                          t(`course.proficiency.${course.proficiency_level}`)}
                      </Badge>
                    )}
                    {course.is_validated && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t("course.validated", "Validated")}
                      </Badge>
                    )}
                    {isEnrolled && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Users className="w-3 h-3 mr-1" />
                        {t("course.enrolled", "Enrolled")}
                      </Badge>
                    )}
                    {isCancelled && (
                      <Badge className="bg-red-100 text-red-800">
                        <UserMinus className="w-3 h-3 mr-1" />
                        {t("course.cancelled", "Cancelled")}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {formatPrice(course.price_per_student)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("course.per_student", "per student")}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {course.count_session}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("course.sessions", "Sessions")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {t("minutes", { count: course.duration_session })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("course.per_session", "per session")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {course.min_students}-{course.max_students}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("course.students", "Students")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {enrolledStudentsCount}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("course.enrolled_students", "Enrolled")}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {canEnroll && (
                  <Button
                    size="lg"
                    className="flex-1 sm:flex-none"
                    onClick={handleEnrollment}
                    disabled={enrolling || checkingEnrollment}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {enrolling
                      ? t("course.enrolling", "Enrolling...")
                      : isCancelled
                        ? t("course.re_enroll", "Re-enroll")
                        : t("course.enroll", "Enroll Now")}
                  </Button>
                )}

                {canUnenroll && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 sm:flex-none text-red-600 border-red-600 hover:bg-red-50"
                    onClick={handleUnenrollment}
                    disabled={enrolling || checkingEnrollment}
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    {enrolling
                      ? t("course.unenrolling", "Unenrolling...")
                      : t("course.unenroll", "Unenroll")}
                  </Button>
                )}
              </div>

              {/* Enrollment Status Message */}
              {!isAuthenticated && (
                <p className="text-sm text-gray-600 mt-2">
                  {t(
                    "course.login_to_enroll",
                    "Please login as a student to enroll in this course"
                  )}
                </p>
              )}
              {isAuthenticated && user?.user_type !== "student" && (
                <p className="text-sm text-gray-600 mt-2">
                  {t(
                    "course.student_enrollment_only",
                    "Only students can enroll in courses"
                  )}
                </p>
              )}
              {isEnrolled && (
                <p className="text-sm text-green-600 mt-2">
                  {t(
                    "course.enrollment_confirmed",
                    "You are enrolled in this course"
                  )}
                </p>
              )}
              {isCancelled && (
                <p className="text-sm text-red-600 mt-2">
                  {t(
                    "course.enrollment_cancelled",
                    "Your enrollment was cancelled. You can enroll again if you wish."
                  )}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t("course.schedule", "Course Schedule")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {course.schedules.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  {t("course.no_schedules", "No schedules available yet.")}
                </p>
              ) : (
                <div className="space-y-3">
                  {course.schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      onClick={() => joinMeeting(schedule.meeting)}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium">
                            {formatDate(schedule.datetime_scheduled)}
                          </div>
                          <div className="font-medium">
                            {schedule.meeting.meeting_id}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {schedule.time_of_session} Minutes
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {t("course.details", "Course Details")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("course.subject", "Subject")}:
                  </span>
                  <Badge variant="outline">{course.subject.name}</Badge>
                </div>
                {course.proficiency_level && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {t("course.level", "Level")}:
                    </span>
                    <Badge
                      className={getDifficultyColor(
                        course.proficiency_level || ""
                      )}
                    >
                      {t(`course.proficiency.${course.proficiency_level}`) ||
                        t("course.not_specified", "Not specified")}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("course.total_duration", "Total Duration")}:
                  </span>
                  <span className="font-medium">
                    {t("minutes", {
                      count: course.count_session * course.duration_session,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("course.class_size", "Class Size")}:
                  </span>
                  <span className="font-medium">
                    {course.min_students}-{course.max_students} students
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("course.created_at", "Created")}:
                  </span>
                  <span className="font-medium">
                    {new Date(course.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("course.status", "Status")}:
                  </span>
                  <Badge
                    className={
                      course.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {course.is_active
                      ? t("course.active", "Active")
                      : t("course.inactive", "Inactive")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Teacher Info */}
          {course.teacher && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t("course.prof")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>
                      {getInitials(
                        course.teacher.first_name,
                        course.teacher.last_name
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {course.teacher.first_name} {course.teacher.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t("course.teacher", "Course Teacher")}
                    </p>
                  </div>
                </div>
                <Link
                  to="/teacher/$id"
                  params={{ id: course.teacher.id.toString() }}
                >
                  <Button variant="outline" className="w-full">
                    {t("course.view_teacher_profile", "View Teacher Profile")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Pricing Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {t("course.pricing", "Pricing")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-600">
                  {formatPrice(course.price_per_student)}
                </div>
                <div className="text-sm text-gray-600">
                  {t("course.per_student", "per student")}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrollment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t("course.enrollment", "Enrollment")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("course.minimum_students", "Minimum")}:
                  </span>
                  <span className="font-medium">{course.min_students}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("course.maximum_students", "Maximum")}:
                  </span>
                  <span className="font-medium">{course.max_students}</span>
                </div>
                <div className="pt-2 border-t">
                  {canEnroll && (
                    <Button
                      className="w-full"
                      onClick={handleEnrollment}
                      disabled={enrolling || checkingEnrollment}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {enrolling
                        ? t("course.enrolling", "Enrolling...")
                        : isCancelled
                          ? t("course.re_enroll", "Re-enroll")
                          : t("course.enroll_now", "Enroll Now")}
                    </Button>
                  )}

                  {canUnenroll && (
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                      onClick={handleUnenrollment}
                      disabled={enrolling || checkingEnrollment}
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      {enrolling
                        ? t("course.unenrolling", "Unenrolling...")
                        : t("course.unenroll", "Unenroll")}
                    </Button>
                  )}

                  {!canEnroll && !canUnenroll && (
                    <div className="text-center text-gray-600 text-sm">
                      {!isAuthenticated
                        ? t(
                            "course.login_to_enroll",
                            "Please login as a student to enroll"
                          )
                        : user?.user_type !== "student"
                          ? t(
                              "course.student_enrollment_only",
                              "Only students can enroll"
                            )
                          : t(
                              "course.enrollment_status_unknown",
                              "Enrollment status loading..."
                            )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
