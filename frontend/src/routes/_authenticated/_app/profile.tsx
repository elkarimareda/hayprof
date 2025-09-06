import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Award,
  GraduationCap,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Users,
  BookOpen,
  MapPin,
  Globe,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import api from "@/utils/request";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserType } from "@/Models/Auth";

// Simple Badge component
// const Badge = ({
//   children,
//   variant = "default",
//   className = "",
// }: {
//   children: React.ReactNode;
//   variant?: "default" | "secondary" | "outline";
//   className?: string;
// }) => {
//   const baseClasses =
//     "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
//   const variantClasses = {
//     default: "bg-primary text-primary-foreground",
//     secondary: "bg-secondary text-secondary-foreground",
//     outline: "border border-input bg-background",
//   };

//   return (
//     <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
//       {children}
//     </div>
//   );
// };

interface Certification {
  id: number;
  subject: string;
  certificate: string;
  description?: string;
  issue_by?: string;
  year_of_study_start: string;
  year_of_study_end: string;
}

interface Education {
  id: number;
  university: string;
  degree: string;
  degree_type: string;
  specialization?: string;
  year_of_study_start: string;
  year_of_study_end: string;
}

interface Description {
  id: number;
  yourself?: string;
  experience?: string;
  motivation?: string;
  headline?: string;
}

interface TimeSlot {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface CourseSchedule {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface Course {
  id: number;
  title: string;
  subject: {
    id: number;
    name: string;
    code: string;
  };
  proficiency_level?: string;
  description: string;
  thumbnail_url?: string;
  price_per_student: number;
  number_of_hours: number;
  min_students: number;
  max_students: number;
  schedules: CourseSchedule[];
  is_active: boolean;
  is_validated: boolean;
  created_at: string;
}

interface Language {
  id: number;
  name: string;
  code: string;
  native_name?: string;
  proficiency_level?: string; // Direct proficiency level property
  pivot?: {
    proficiency_level: string;
  };
}

interface TeacherProfile {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  bio?: string;
  hourly_rate?: number;
  profile_video_url?: string;
  profile_photo_url?: string;
  photo_url?: string;
  video_url?: string;
  pricing?: number;
  onboarding_completed?: boolean;
  is_available: boolean;
  country?: string;
  timezone?: string;
  courses: Course[];
  educations: Education[];
  certifications: Certification[];
  languages?: Language[];
  description?: Description;
  availabilities?: Record<string, TimeSlot[]>;
}

interface StudentProfile {
  id: number;
  user_id: number;
  birth_date: string;
  country?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
  photo_url?: string;
  languages?: Language[];
}

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  user_type: string;
  profile: TeacherProfile | StudentProfile;
}

export const Route = createFileRoute("/_authenticated/_app/profile")({
  loader: async ({ context }) => {
    const user = context.auth.user;
    const userType = user?.user_type;
    const profileId = user?.profile?.id;

    const response = await api.get(`/${userType}/profile/${profileId}`);
    return response.data;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const profileData: ProfileData = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState("overview");

  // Type guard to check if profile is a teacher profile
  const isTeacher = (
    _profile: TeacherProfile | StudentProfile
  ): _profile is TeacherProfile => {
    return profileData.user_type === "teacher";
  };

  // Type guard to check if profile is a student profile
  const isStudent = (
    _profile: TeacherProfile | StudentProfile
  ): _profile is StudentProfile => {
    return profileData.user_type === UserType.student;
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: User },
    ...(isTeacher(profileData.profile)
      ? [
          { id: "certifications", label: "Certifications", icon: Award },
          { id: "education", label: "Education", icon: GraduationCap },
          { id: "description", label: "About Me", icon: FileText },
          { id: "availability", label: "Availability", icon: Calendar },
          { id: "courses", label: "Courses", icon: BookOpen },
          { id: "pricing", label: "Pricing", icon: DollarSign },
          { id: "languages", label: "Languages", icon: MessageCircle },
        ]
      : []),
  ];

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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

  const getValidationBadge = (course: Course) => {
    if (course.is_validated) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Validated
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          Pending Validation
        </Badge>
      );
    }
  };

  const getProficiencyBadgeColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "native":
        return "bg-green-100 text-green-800 border-green-200";
      case "fluent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "conversational":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "basic":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "beginner":
        return "bg-red-100 text-red-800 border-red-200";
      case "intermediate":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "advanced":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatProficiencyLevel = (level?: string) => {
    if (!level) return "Not specified";

    // Capitalize first letter and replace underscores with spaces
    return level.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={profileData.profile.photo_url}
                alt={profileData.name}
              />
              <AvatarFallback className="text-2xl">
                {profileData.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-bold">{profileData.name}</h1>
              {isTeacher(profileData.profile) &&
                profileData.profile.description?.headline && (
                  <p className="text-lg text-muted-foreground">
                    {profileData.profile.description.headline}
                  </p>
                )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {isTeacher(profileData.profile) && (
                  <>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profileData.profile.country}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {profileData.profile.timezone}
                    </div>
                  </>
                )}
                {isStudent(profileData.profile) &&
                  (profileData.profile as StudentProfile).country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {(profileData.profile as StudentProfile).country}
                    </div>
                  )}
                {isStudent(profileData.profile) &&
                  (profileData.profile as StudentProfile).timezone && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {(profileData.profile as StudentProfile).timezone}
                    </div>
                  )}
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {profileData.email}
                </div>
                {profileData.phone_number && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {profileData.phone_number}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                {isTeacher(profileData.profile) && (
                  <Badge variant="secondary" className="text-lg font-semibold">
                    ${profileData.profile.pricing}/hour
                  </Badge>
                )}
                {isTeacher(profileData.profile) &&
                  profileData.profile.onboarding_completed && (
                    <Badge variant="default">Verified Teacher</Badge>
                  )}
                {isStudent(profileData.profile) && (
                  <Badge variant="default">Student</Badge>
                )}
              </div>
            </div>

            {isTeacher(profileData.profile) &&
              profileData.profile.video_url && (
                <div className="w-80 max-w-full">
                  <h3 className="text-lg font-semibold mb-2">
                    Video Introduction
                  </h3>
                  <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
                    <video
                      controls
                      className="w-full h-48 object-cover"
                      poster={profileData.profile.photo_url}
                    >
                      <source
                        src={profileData.profile.video_url}
                        type="video/mp4"
                      />
                      <source
                        src={profileData.profile.video_url}
                        type="video/webm"
                      />
                      <source
                        src={profileData.profile.video_url}
                        type="video/ogg"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {isTeacher(profileData.profile) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {profileData.profile.certifications?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Certifications
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {profileData.profile.educations?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Education Records
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {profileData.profile.courses?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Courses</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {Object.keys(profileData.profile.availabilities || {}).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Available Days
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isStudent(profileData.profile) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <User className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">Student</div>
              <div className="text-sm text-muted-foreground">Profile Type</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {new Date(profileData.profile.birth_date).getFullYear()}
              </div>
              <div className="text-sm text-muted-foreground">Birth Year</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Certifications</h2>
      {isTeacher(profileData.profile) ? (
        profileData.profile.certifications &&
        profileData.profile.certifications.length > 0 ? (
          <div className="grid gap-4">
            {profileData.profile.certifications.map((cert: Certification) => (
              <Card key={cert.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {cert.certificate}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <strong>Subject:</strong> {cert.subject}
                  </div>
                  {cert.issue_by && (
                    <div>
                      <strong>Issued by:</strong> {cert.issue_by}
                    </div>
                  )}
                  <div>
                    <strong>Duration:</strong> {cert.year_of_study_start} -{" "}
                    {cert.year_of_study_end}
                  </div>
                  {cert.description && (
                    <div>
                      <strong>Description:</strong> {cert.description}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No certifications added yet.
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Certifications are only available for teachers.
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Education</h2>
      {isTeacher(profileData.profile) ? (
        profileData.profile.educations &&
        profileData.profile.educations.length > 0 ? (
          <div className="grid gap-4">
            {profileData.profile.educations.map((edu: Education) => (
              <Card key={edu.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    {edu.degree}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <strong>University:</strong> {edu.university}
                  </div>
                  <div>
                    <strong>Degree Type:</strong> {edu.degree_type}
                  </div>
                  {edu.specialization && (
                    <div>
                      <strong>Specialization:</strong> {edu.specialization}
                    </div>
                  )}
                  <div>
                    <strong>Duration:</strong> {edu.year_of_study_start} -{" "}
                    {edu.year_of_study_end}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No education records added yet.
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Education records are only available for teachers.
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDescription = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">About Me</h2>
      {isTeacher(profileData.profile) ? (
        profileData.profile.description ? (
          <div className="space-y-6">
            {profileData.profile.description.yourself && (
              <Card>
                <CardHeader>
                  <CardTitle>About Myself</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">
                    {profileData.profile.description.yourself}
                  </p>
                </CardContent>
              </Card>
            )}

            {profileData.profile.description.experience && (
              <Card>
                <CardHeader>
                  <CardTitle>Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">
                    {profileData.profile.description.experience}
                  </p>
                </CardContent>
              </Card>
            )}

            {profileData.profile.description.motivation && (
              <Card>
                <CardHeader>
                  <CardTitle>Motivation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">
                    {profileData.profile.description.motivation}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No description added yet.
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Detailed descriptions are only available for teachers.
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAvailability = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Availability</h2>
      {isTeacher(profileData.profile) ? (
        <div className="grid gap-4">
          {daysOfWeek.map((day) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="capitalize flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(profileData.profile as TeacherProfile).availabilities?.[
                  day
                ] &&
                ((profileData.profile as TeacherProfile).availabilities?.[day]
                  ?.length ?? 0) > 0 ? (
                  <div className="space-y-2">
                    {(profileData.profile as TeacherProfile).availabilities?.[
                      day
                    ]?.map((slot: TimeSlot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatTime(slot.start_time)} -{" "}
                            {formatTime(slot.end_time)}
                          </span>
                        </div>
                        <Badge variant="outline">Available</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not available</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Availability scheduling is only available for teachers.
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Courses</h2>
        {isTeacher(profileData.profile) && (
          <Button variant="outline" size="sm">
            <BookOpen className="w-4 h-4 mr-2" />
            Create New Course
          </Button>
        )}
      </div>

      {isTeacher(profileData.profile) ? (
        ((profileData.profile as TeacherProfile).courses?.length ?? 0) > 0 ? (
          <div className="grid gap-6">
            {(profileData.profile as TeacherProfile).courses?.map(
              (course: Course) => (
                <Card
                  key={course.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {course.title}
                        </CardTitle>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="outline">{course.subject.name}</Badge>
                          {course.proficiency_level && (
                            <Badge
                              className={getProficiencyColor(
                                course.proficiency_level
                              )}
                            >
                              {course.proficiency_level}
                            </Badge>
                          )}
                          {getValidationBadge(course)}
                        </div>
                      </div>
                      {course.thumbnail_url && (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-20 h-20 object-cover rounded-lg ml-4"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{course.description}</p>

                    {/* Course Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                        <span className="font-semibold">
                          {formatPrice(course.price_per_student)}/student
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{course.number_of_hours} hours</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-2 text-purple-600" />
                        <span>
                          {course.min_students}-{course.max_students} students
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{course.schedules.length} time slots</span>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div>
                      <h4 className="font-semibold mb-2">Schedule:</h4>
                      <div className="space-y-2">
                        {course.schedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="flex items-center text-sm bg-gray-50 p-2 rounded"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="capitalize font-medium mr-2">
                              {schedule.day_of_week}:
                            </span>
                            <span>
                              {schedule.start_time} - {schedule.end_time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" size="sm">
                        Edit Course
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {!course.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                        >
                          Activate
                        </Button>
                      )}
                      {course.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses created yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start creating courses to share your knowledge with students.
              </p>
              <Button>
                <BookOpen className="w-4 h-4 mr-2" />
                Create Your First Course
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Course creation is only available for teachers.
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pricing</h2>
      {isTeacher(profileData.profile) ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Hourly Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-4">
              ${(profileData.profile as TeacherProfile).pricing}/hour
            </div>
            <p className="text-muted-foreground">
              This is the standard hourly rate for lessons with this teacher.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Pricing information is only available for teachers.
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderLanguages = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Languages Spoken</h2>

      {profileData.profile.languages &&
      profileData.profile.languages.length > 0 ? (
        <div className="grid gap-4">
          {profileData.profile.languages.map((language: Language) => (
            <Card
              key={language.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl mb-1">
                      {language.name}
                    </h3>
                    {language.native_name &&
                      language.native_name !== language.name && (
                        <p className="text-gray-600 mb-1">
                          {language.native_name}
                        </p>
                      )}
                  </div>
                  <div className="text-right ml-4">
                    <Badge
                      variant="outline"
                      className={`${getProficiencyBadgeColor(
                        language.pivot?.proficiency_level ||
                          language.proficiency_level
                      )} font-medium px-3 py-1`}
                    >
                      {formatProficiencyLevel(
                        language.pivot?.proficiency_level ||
                          language.proficiency_level
                      )}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">No languages specified</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "certifications":
        return renderCertifications();
      case "education":
        return renderEducation();
      case "description":
        return renderDescription();
      case "availability":
        return renderAvailability();
      case "courses":
        return renderCourses();
      case "pricing":
        return renderPricing();
      case "languages":
        return renderLanguages();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-2">
            <div className="lg:sticky lg:top-8">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
