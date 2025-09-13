import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { getValidatedCourses, type Course } from "@/apis/courses";
import { getSubjects, type Subject } from "@/apis/reference";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, User, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_public/courses")({
  component: CoursesListing,
});

function CoursesListing() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch subjects for filter
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjects();
        setSubjects(data.subjects);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        toast.error(t("errors.generic"));
      }
    };

    fetchSubjects();
  }, [t]);

  // Fetch courses based on selected subject
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const subjectId = selectedSubject
          ? parseInt(selectedSubject)
          : undefined;
        const data = await getValidatedCourses(subjectId);
        setCourses(data.courses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast.error(t("errors.generic"));
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedSubject, t]);

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value === "all" ? "" : value);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getProficiencyColor = (level?: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "elementary":
        return "bg-blue-100 text-blue-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "upper_intermediate":
        return "bg-orange-100 text-orange-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      case "proficient":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("courses.browse_title", "Browse Courses")}
        </h1>
        <p className="text-gray-600">
          {t(
            "courses.browse_subtitle",
            "Discover courses from qualified teachers"
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <Select
              value={selectedSubject || "all"}
              onValueChange={handleSubjectChange}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    "courses.filter_by_subject",
                    "Filter by subject"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("courses.all_subjects", "All Subjects")}
                </SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {t("courses.results_count", {
                count: courses.length,
                defaultValue: "{{count}} courses found",
              })}
            </p>
          </div>

          {/* Courses grid */}
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("course.no_courses")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "courses.no_courses_message",
                  "Try adjusting your filters or check back later."
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="hover:shadow-lg transition-shadow duration-200"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {course.subject.name}
                      </Badge>
                    </div>
                    {course.proficiency_level && (
                      <Badge
                        className={`w-fit ${getProficiencyColor(course.proficiency_level)}`}
                      >
                        {t(
                          `proficiency.${course.proficiency_level}`,
                          course.proficiency_level
                        )}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {/* Thumbnail */}
                    {course.thumbnail_url && (
                      <div className="mb-4">
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Course details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>
                          {course.teacher?.first_name}{" "}
                          {course.teacher?.last_name}
                        </span>
                      </div>
                      {/* <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{course.number_of_hours} hours</span>
                      </div> */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          {course.min_students}-{course.max_students} students
                        </span>
                      </div>
                      <div className="flex items-center text-sm font-semibold text-green-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>{formatPrice(course.price_per_student)}</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <Link
                      to="/course/$id"
                      params={{ id: course.id.toString() }}
                    >
                      <Button className="w-full">
                        {t("courses.view_details", "View Details")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
