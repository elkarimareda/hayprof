import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getSubjects } from "@/apis/reference";
import type { Subject } from "@/Models/Common";
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
import Avatar from "@/components/ui/Avatar";
import { Clock, Users, DollarSign, User, MapPin, Award } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/request";
import { formatPrice, getInitials } from "@/lib/utils";
import countries from "@/data/countries.json";
import type { Teacher, TeachersResponse } from "@/Models/Teacher";
import Stars from "@/components/Reviews/Stars";

export const Route = createFileRoute("/_public/teachers")({
  component: TeachersListing,
});

// API function to get teachers
const getTeachers = async (subjectId?: number): Promise<TeachersResponse> => {
  const params = new URLSearchParams();
  if (subjectId) {
    params.append("subject_id", subjectId.toString());
  }

  const response = await api.get<TeachersResponse>(
    `/teachers${params.toString() ? `?${params.toString()}` : ""}`
  );
  return response.data;
};

function TeachersListing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch subjects for filter
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjects();
        setSubjects(data.subjects ?? []);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        toast.error(t("errors.generic"));
      }
    };

    fetchSubjects();
  }, [t]);

  // Fetch teachers based on selected subject
  const fetchTeachers = useCallback(
    async (subjectValue: string) => {
      setLoading(true);
      try {
        const subjectId = subjectValue ? parseInt(subjectValue) : undefined;
        const data = await getTeachers(subjectId);
        setTeachers(data.teachers ?? []);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
        toast.error(t("errors.generic"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchTeachers(selectedSubject);
    return () => {
      mounted = false;
    };
  }, [selectedSubject, fetchTeachers]);

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value === "all" ? "" : value);
  };

  // memoize countries lookup for faster render
  const countriesMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of countries) {
      if (c.alpha2) m.set(String(c.alpha2).toLowerCase(), c.name);
    }
    return m;
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("teachers.browse_title", "Find Teachers")}
        </h1>
        <p className="text-gray-600">
          {t(
            "teachers.browse_subtitle",
            "Connect with qualified language teachers"
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
                  placeholder={t("filter_by_subject", "Filter by subject")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("all_subjects", "All Subjects")}
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
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
              {t("teachers.results", {
                count: teachers.length,
              })}
            </p>
          </div>

          {/* Teachers grid */}
          {teachers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("teachers.no_teachers", "No teachers found")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "teachers.no_teachers_message",
                  "Try adjusting your filters or check back later."
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <Card key={teacher.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Avatar
                        image={teacher.photo_url}
                        alt={`${teacher.first_name} ${teacher.last_name}`}
                        fallback={getInitials(
                          teacher.first_name,
                          teacher.last_name
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-1">
                          {teacher.first_name} {teacher.last_name}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">
                            {countriesMap.get(
                              (teacher.country || "").toLowerCase()
                            ) || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {teacher.reviews?.average_rating && (
                      <div className="flex items-center justify-center md:justify-start mb-4">
                        <Stars rating={teacher.reviews.average_rating} />
                        <span className="ml-2 text-sm text-gray-600">
                          ({teacher.reviews.total_reviews || 0}{" "}
                          {t("teacher.reviews", "reviews")})
                        </span>
                      </div>
                    )}
                    {/* Biography */}
                    {teacher.biography && (
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {teacher.biography}
                      </p>
                    )}

                    {/* Teacher details */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-semibold">
                          {formatPrice(teacher.pricing)}/hour
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{teacher.timezone}</span>
                      </div>
                      {teacher.courses_count && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>{teacher.courses_count} courses</span>
                        </div>
                      )}
                      {teacher.certifications &&
                        teacher.certifications.length > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Award className="h-4 w-4 mr-2" />
                            <span>
                              {teacher.certifications.length} certifications
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Subjects taught */}
                    {teacher.subjects && teacher.subjects.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Teaches:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects
                            .slice(0, 3)
                            .map((subject, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {subject}
                              </Badge>
                            ))}
                          {teacher.subjects.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{teacher.subjects.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1"
                        onClick={() =>
                          navigate({ to: `/teacher/${teacher.id}` })
                        }
                      >
                        {t("teachers.view_profile", "View Profile")}
                      </Button>
                    </div>
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
