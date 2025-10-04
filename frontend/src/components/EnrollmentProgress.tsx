import { useTranslation } from "react-i18next";

function EnrollmentProgress({
  enrolledStudentsCount,
  max_students,
}: {
  enrolledStudentsCount: number;
  max_students: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>{t("course.enrollment_progress", "Enrollment Progress")}</span>
        <span>
          {enrolledStudentsCount} / {max_students}{" "}
          {t("course.students", "students")}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          style={{
            width: `${Math.min((enrolledStudentsCount / max_students) * 100, 100)}%`,
          }}
        ></div>
      </div>
      {enrolledStudentsCount >= max_students && (
        <p className="text-sm text-black mt-1">
          {t("course.course_full", "Course is full")}
        </p>
      )}
    </div>
  );
}

export default EnrollmentProgress;
