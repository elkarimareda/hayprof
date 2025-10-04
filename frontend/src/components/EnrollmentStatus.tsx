import { useTranslation } from "react-i18next";

interface Props {
  isAuthenticated?: boolean;
  userType?: string | null;
  isEnrolled: boolean;
  isCancelled: boolean;
  className?: string;
}

export default function EnrollmentStatus({
  isAuthenticated,
  userType,
  isEnrolled,
  isCancelled,
  className,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className={className}>
      {!isAuthenticated && (
        <p className="text-sm text-gray-600 mt-2">
          {t(
            "course.login_to_enroll",
            "Please login as a student to enroll in this course"
          )}
        </p>
      )}

      {isAuthenticated && userType !== "student" && (
        <p className="text-sm text-gray-600 mt-2">
          {t(
            "course.student_enrollment_only",
            "Only students can enroll in courses"
          )}
        </p>
      )}

      {isEnrolled && (
        <p className="text-sm text-green-600 mt-2">
          {t("course.enrollment_confirmed", "You are enrolled in this course")}
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
  );
}
