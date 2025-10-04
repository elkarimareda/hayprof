import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
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
  type Enrollment,
  type EnrollmentResponse,
  getCourseMeeting,
  joinCourseMeeting,
} from "@/apis/courses";
import Avatar from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { Meeting } from "@/Models/Meeting";
import { formatPrice, getInitials } from "@/lib/utils";
import { format } from "date-fns";
import type { Course } from "@/Models/Course";
import EnrollmentStatus from "@/components/EnrollmentStatus";
import CourseActionButtons from "@/components/CourseActionButtons";
import EnrollmentProgress from "@/components/EnrollmentProgress";

export const Route = createFileRoute("/_public/course/$id")({
  component: CourseProfile,
});

// Constants
const DEBOUNCE_TIMEOUT = 1000; // ms

function CourseProfile() {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  // State management
  const [enrolling, setEnrolling] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [enrolledStudentsCount, setEnrolledStudentsCount] = useState<number>(0);
  const [confirmUnenrollOpen, setConfirmUnenrollOpen] = useState(false);

  // Prevent rapid repeated join calls
  const isJoiningRef = useRef(false);

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
        } finally {
          setCheckingEnrollment(false);
        }
      }
    };

    const fetchEnrollmentCount = async () => {
      try {
        const enrollmentsData = await getCourseEnrollments(parseInt(id));
        const confirmedEnrollments = enrollmentsData.enrollments.filter(
          (enrollment) => enrollment.status === "confirmed"
        );
        setEnrolledStudentsCount(confirmedEnrollments.length);
      } catch (error) {
        console.error("Failed to fetch enrollment count:", error);
      }
    };

    fetchCourse();
    checkEnrollment();
    fetchEnrollmentCount();
  }, [id, t, isAuthenticated, user]);

  // Helper: safely read the runtime-injected meeting from a schedule object
  const getMeetingFromSchedule = (schedule: unknown): Meeting | undefined => {
    return (schedule as { meeting?: Meeting })?.meeting;
  };

  const getDifficultyColor = (level?: string): string => {
    if (!level) return "bg-gray-100 text-gray-800";

    switch (level.toLowerCase()) {
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

  const handleEnrollment = async () => {
    try {
      setEnrolling(true);
      const resp: EnrollmentResponse = await enrollInCourse(parseInt(id));
      if (resp?.enrollment) {
        setEnrollment(resp.enrollment);
        setEnrolledStudentsCount((prev) => prev + 1);
        toast.success(t("course.enroll_success", "Successfully enrolled"));
      } else {
        toast.error(t("course.enroll_error", "Failed to enroll in course"));
      }
    } catch (error) {
      console.error("Failed to enroll in course:", error);
      toast.error(t("course.enroll_error", "Failed to enroll in course"));
    } finally {
      setEnrolling(false);
    }
  };

  // Enrollment status helpers
  const isEnrolled = !!enrollment && enrollment.status !== "cancelled";
  const isCancelled = !!enrollment && enrollment.status === "cancelled";
  const isStudent = user?.user_type === "student";

  const canEnroll =
    isAuthenticated && isStudent && (!isEnrolled || isCancelled);
  const canUnenroll =
    isAuthenticated &&
    isStudent &&
    isEnrolled &&
    enrollment?.status === "confirmed";

  // Loading state
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Course not found state
  if (!course) {
    return (
      <div>
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

  const joinMeeting = async (meeting?: Meeting) => {
    if (!meeting) {
      toast.error(t("course.no_meeting", "Meeting not available"));
      return;
    }

    // Require authentication
    if (!isAuthenticated || !user) {
      toast.error(
        t("course.login_required", "Please login to join the meeting")
      );
      return;
    }

    // Authorization check: only enrolled students or course teacher can join
    const isTeacher =
      !!course?.teacher && String(user.id) === String(course.teacher.id);
    const isStudentAndEnrolled = isStudent && isEnrolled;

    if (!isTeacher && !isStudentAndEnrolled) {
      toast.error(
        t(
          "course.join_not_allowed",
          "Only enrolled students or the course teacher can join this meeting"
        )
      );
      return;
    }

    // If a join is already in progress (or just happened), ignore subsequent calls
    if (isJoiningRef.current) return;
    isJoiningRef.current = true;

    let newWindow: Window | null = null;
    try {
      const data = await joinCourseMeeting(
        meeting.meeting_id,
        user?.name || "test",
        meeting.moderator_password,
        true
      );

      // Open uniquely-named blank window to avoid popup blockers
      const windowName = `join_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      newWindow = window.open("about:blank", windowName);

      if (data?.join_url) {
        if (newWindow) {
          try {
            // Security: null the opener reference
            try {
              (newWindow as Window & { opener?: Window | null }).opener = null;
            } catch {
              // Ignore browser restrictions
            }
            newWindow.location.replace(data.join_url);
            newWindow.focus();
          } catch {
            // Fallback to current tab if navigation fails
            window.location.assign(data.join_url);
          }
        } else {
          // Popup blocked - navigate in current tab
          window.location.assign(data.join_url);
        }
      } else {
        // No URL returned - clean up and show error
        if (newWindow && !newWindow.closed) {
          try {
            newWindow.close();
          } catch {
            // Ignore close errors
          }
        }
        console.warn("No join_url returned from joinCourseMeeting", data);
        toast.error(t("course.join_failed", "Failed to get meeting URL"));
      }
    } catch (error) {
      console.error("Failed to join meeting:", error);
      toast.error(t("course.join_error", "Failed to join meeting"));

      // Clean up opened window on error
      if (newWindow && !newWindow.closed) {
        try {
          newWindow.close();
        } catch {
          // Ignore close errors
        }
      }
    } finally {
      // Reset debounce after timeout
      setTimeout(() => {
        isJoiningRef.current = false;
      }, DEBOUNCE_TIMEOUT);
    }
  };

  return (
    <div>
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
              <div className="flex gap-4 items-center mb-6">
                <div className="">{t("course.subject", "Subject")} : </div>
                <div className="text-xl font-bold ">
                  {course.subject.name}{" "}
                  <span className=" font-semibold text-sm">
                    {course.proficiency_level &&
                      t(`language.proficiency.${course.proficiency_level}`)}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 items-center mb-6">
                <div className="">{t("course.sessions", "Sessions")} : </div>
                <div className="text-xl font-bold ">
                  {t("minutes", { count: course.duration_session })}{" "}
                  <span className=" font-semibold text-sm">
                    x {course.count_session}
                  </span>
                </div>
              </div>

              {/* Enrollment Progress Bar */}
              <EnrollmentProgress
                enrolledStudentsCount={enrolledStudentsCount}
                max_students={course.max_students}
              />

              {/* Action Buttons */}
              <CourseActionButtons
                canEnroll={canEnroll}
                canUnenroll={canUnenroll}
                enrolling={enrolling}
                checkingEnrollment={checkingEnrollment}
                isCancelled={isCancelled}
                confirmUnenrollOpen={confirmUnenrollOpen}
                onEnroll={handleEnrollment}
                onUnenroll={handleUnenrollment}
                onConfirmUnenrollOpen={setConfirmUnenrollOpen}
              />

              {/* Enrollment Status Message */}
              <EnrollmentStatus
                isAuthenticated={isAuthenticated}
                userType={user?.user_type}
                isEnrolled={isEnrolled}
                isCancelled={isCancelled}
              />
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
                      onClick={() =>
                        joinMeeting(getMeetingFromSchedule(schedule))
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium">
                            {format(
                              schedule.datetime_scheduled,
                              "MMMM d, yyyy, h:mm a"
                            )}
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
                      {t(`language.proficiency.${course.proficiency_level}`) ||
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
                    {format(new Date(course.created_at), "MMMM d, yyyy")}
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
                  <Avatar
                    alt={`${course.teacher.first_name} ${course.teacher.last_name}`}
                    image={course.teacher.photo_url}
                    fallback={getInitials(
                      course.teacher.first_name,
                      course.teacher.last_name
                    )}
                  />
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
                  <CourseActionButtons
                    canEnroll={canEnroll}
                    canUnenroll={canUnenroll}
                    enrolling={enrolling}
                    checkingEnrollment={checkingEnrollment}
                    isCancelled={isCancelled}
                    confirmUnenrollOpen={confirmUnenrollOpen}
                    onEnroll={handleEnrollment}
                    onUnenroll={handleUnenrollment}
                    onConfirmUnenrollOpen={setConfirmUnenrollOpen}
                  />

                  <EnrollmentStatus
                    isAuthenticated={isAuthenticated}
                    userType={user?.user_type}
                    isEnrolled={isEnrolled}
                    isCancelled={isCancelled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
