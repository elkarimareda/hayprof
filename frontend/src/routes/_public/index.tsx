import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  ArrowRight,
  Globe,
  Clock,
  Award,
  Play,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getValidatedCourses, type Course } from "@/apis/courses";
import { getSubjects, type Subject } from "@/apis/reference";

export const Route = createFileRoute("/_public/")({
  component: Index,
});

function Index() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, subjectsData] = await Promise.all([
          getValidatedCourses(),
          getSubjects(),
        ]);
        setFeaturedCourses(coursesData.courses.slice(0, 6));
        setSubjects(subjectsData.subjects.slice(0, 8));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: "Active Students", value: "10,000+", icon: Users },
    { label: "Expert Teachers", value: "500+", icon: Award },
    { label: "Course Hours", value: "50,000+", icon: Clock },
    { label: "Success Rate", value: "95%", icon: TrendingUp },
  ];

  const features = [
    {
      title: "Learn from Experts",
      description: "Connect with qualified teachers from around the world",
      icon: Users,
    },
    {
      title: "Flexible Schedule",
      description: "Book lessons that fit your schedule and timezone",
      icon: Clock,
    },
    {
      title: "Interactive Learning",
      description: "Engage in real-time conversations and practice",
      icon: MessageCircle,
    },
    {
      title: "Global Community",
      description: "Join learners from 150+ countries worldwide",
      icon: Globe,
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-br from-secondary/10 to-accent/20 rounded-3xl">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Learn Languages with
            <span className="text-primary"> Expert Teachers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Master any language through personalized 1-on-1 lessons with
            certified teachers. Start speaking confidently from day one.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses">
              <Button size="lg" className="px-8 py-3 text-lg">
                Browse Courses
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/teachers">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                <Play className="mr-2 w-5 h-5" />
                Find Teachers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Courses */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Featured Courses
            </h2>
            <p className="text-gray-600">
              Discover our most popular language courses
            </p>
          </div>
          <Link to="/courses">
            <Button variant="outline">
              View All Courses
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <Card
                key={course.id}
                className="group hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-secondary/20 to-accent/30 rounded-t-lg flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white text-gray-800">
                      {course.subject.name}
                    </Badge>
                  </div>
                  {course.proficiency_level && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">
                        {course.proficiency_level}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    {/* <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.number_of_hours}h
                    </div> */}
                    <div className="text-lg font-bold text-primary">
                      ${course.price_per_student}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Subjects Grid */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Popular Languages
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our wide selection of languages and start your learning
            journey today
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              to="/courses"
              search={{ subject_id: subject.id }}
            >
              <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary/30 transition-colors">
                    <span className="text-primary font-bold text-lg">
                      {subject.code || subject.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                    {subject.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 rounded-3xl py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose HayProf?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the future of language learning with our innovative
              platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-gradient-to-r from-primary to-primary/80 rounded-3xl text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who are already improving their language
            skills
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-3 text-lg"
              >
                Start Learning Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/teachers">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                <Play className="mr-2 w-5 h-5" />
                Find Teachers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
