import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import type { Course } from "@/Models/Course";
import type { Subject } from "@/Models/Common";
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
  Star,
  Target,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// Mock data for demo
const mockCourses = [
  {
    id: 1,
    title: "Spanish Conversation Mastery",
    description:
      "Master everyday Spanish through interactive conversations and real-world scenarios.",
    price_per_student: 29,
    subject: { name: "Spanish" },
    proficiency_level: "Intermediate",
    thumbnail_url: null,
  },
  {
    id: 2,
    title: "French Grammar Fundamentals",
    description:
      "Build a solid foundation in French grammar with engaging exercises and examples.",
    price_per_student: 25,
    subject: { name: "French" },
    proficiency_level: "Beginner",
    thumbnail_url: null,
  },
  {
    id: 3,
    title: "Japanese Culture & Language",
    description:
      "Explore Japanese language through cultural context and authentic materials.",
    price_per_student: 35,
    subject: { name: "Japanese" },
    proficiency_level: "Advanced",
    thumbnail_url: null,
  },
];

const mockSubjects = [
  { id: 1, name: "Spanish", code: "ES" },
  { id: 2, name: "French", code: "FR" },
  { id: 3, name: "German", code: "DE" },
  { id: 4, name: "Italian", code: "IT" },
  { id: 5, name: "Japanese", code: "JP" },
  { id: 6, name: "Chinese", code: "CN" },
  { id: 7, name: "Korean", code: "KR" },
  { id: 8, name: "Arabic", code: "AR" },
];

export const Route = createFileRoute("/_public/")({
  component: Index,
});

function Index() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFeaturedCourses(mockCourses as unknown as Course[]);
      setSubjects(mockSubjects as unknown as Subject[]);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    {
      label: "Active Students",
      value: "10,000+",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Expert Teachers",
      value: "500+",
      icon: Award,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Course Hours",
      value: "50,000+",
      icon: Clock,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Success Rate",
      value: "95%",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
    },
  ];

  const features = [
    {
      title: "Expert Native Teachers",
      description:
        "Learn from certified native speakers with years of experience",
      icon: Users,
    },
    {
      title: "Flexible Scheduling",
      description: "Book lessons that fit your busy lifestyle and timezone",
      icon: Clock,
    },
    {
      title: "Interactive Classes",
      description: "Engage in real-time conversations and practical exercises",
      icon: MessageCircle,
    },
    {
      title: "Global Community",
      description: "Join students from 150+ countries around the world",
      icon: Globe,
    },
  ];

  const learningPaths = [
    {
      title: "Beginner",
      description: "Start from scratch and build solid foundations",
      duration: "3 months",
      courses: 12,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Intermediate",
      description: "Improve fluency and expand vocabulary",
      duration: "6 months",
      courses: 24,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Advanced",
      description: "Master the language and cultural nuances",
      duration: "9 months",
      courses: 36,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="space-y-32 pb-20 pt-24">
      {/* Hero Section - Inspired by Dribbble Design */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center bg-white/80 backdrop-blur border border-slate-200 rounded-2xl px-4 py-2">
                <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-slate-700">
                  AI-Powered Learning Paths
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                Learn Languages
                <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  with Live Teachers
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed">
                Master any language through personalized 1-on-1 lessons with
                certified native speakers. Start speaking confidently from your
                first lesson.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center">
                  Start Learning Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="group border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-semibold hover:border-purple-300 hover:text-purple-600 transition-all duration-300 bg-white/80 backdrop-blur flex items-center justify-center">
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-white"
                    ></div>
                  ))}
                </div>
                <div className="text-slate-600">
                  <div className="font-semibold">10,000+ Students</div>
                  <div className="text-sm">Joined this month</div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Illustration */}
            <div className="relative">
              <div className="relative z-10 bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-slate-200 p-8">
                <div className="grid grid-cols-2 gap-4">
                  {/* Language Cards */}
                  {[
                    {
                      flag: "🇪🇸",
                      name: "Spanish",
                      color: "from-red-400 to-orange-400",
                    },
                    {
                      flag: "🇫🇷",
                      name: "French",
                      color: "from-blue-400 to-purple-400",
                    },
                    {
                      flag: "🇯🇵",
                      name: "Japanese",
                      color: "from-red-400 to-pink-400",
                    },
                    {
                      flag: "🇩🇪",
                      name: "German",
                      color: "from-yellow-400 to-amber-400",
                    },
                  ].map((lang, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 border border-slate-200 hover:shadow-md transition-shadow duration-300"
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${lang.color} rounded-2xl flex items-center justify-center text-2xl mb-3`}
                      >
                        {lang.flag}
                      </div>
                      <div className="font-semibold text-slate-900">
                        {lang.name}
                      </div>
                      <div className="text-sm text-slate-500">24 Teachers</div>
                    </div>
                  ))}
                </div>

                {/* Floating Element */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-2xl shadow-lg">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span className="text-sm font-medium">4.9/5 Rating</span>
                  </div>
                </div>
              </div>

              {/* Background Elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl opacity-60"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl opacity-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div
                    className={`bg-gradient-to-br ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose HayProf?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our platform is designed to provide the most effective and
              enjoyable language learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group text-center">
                  <div className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-3 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-3">
                Featured Courses
              </h2>
              <p className="text-xl text-slate-600">
                Handpicked courses from our expert teachers
              </p>
            </div>
            <button className="flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-colors">
              View All Courses
              <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse bg-white rounded-3xl shadow-lg p-6"
                >
                  <div className="h-48 bg-slate-200 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded mb-3"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, index) => {
                const gradients = [
                  "from-blue-500 to-cyan-500",
                  "from-purple-500 to-pink-500",
                  "from-orange-500 to-red-500",
                ];
                return (
                  <div
                    key={course.id}
                    className="group bg-white/80 backdrop-blur rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:-translate-y-2"
                  >
                    <div
                      className={`relative h-48 bg-gradient-to-br ${gradients[index % 3]} flex items-center justify-center`}
                    >
                      <BookOpen className="w-12 h-12 text-white opacity-90" />
                      {course.proficiency_level && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-black/20 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-medium">
                            {course.proficiency_level}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                          {course.subject.name}
                        </span>
                        <div className="flex items-center text-sm text-slate-500">
                          <Clock className="w-4 h-4 mr-1" />
                          24 lessons
                        </div>
                      </div>

                      <h3 className="font-bold text-xl mb-3 text-slate-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-slate-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="flex mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-yellow-400 fill-current"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-500">(4.9)</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            ${course.price_per_student}
                          </div>
                          <div className="text-xs text-slate-500">
                            per month
                          </div>
                        </div>
                      </div>

                      <button className="w-full bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-700 py-3 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5">
                        Explore Course
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Learning Paths */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Structured Learning Paths
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Follow our carefully designed paths to achieve fluency step by
              step
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {learningPaths.map((path, index) => (
              <div key={index} className="group relative">
                <div className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${path.color} rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6`}
                  >
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-2xl text-slate-900 mb-3">
                    {path.title}
                  </h3>
                  <p className="text-slate-600 mb-6">{path.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-slate-600">
                      <Clock className="w-4 h-4 mr-3" />
                      <span>{path.duration} program</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <BookOpen className="w-4 h-4 mr-3" />
                      <span>{path.courses} courses</span>
                    </div>
                  </div>

                  <button className="w-full bg-slate-100 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white text-slate-700 py-3 rounded-xl font-medium transition-all duration-300">
                    Start Path
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Languages Grid */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Popular Languages
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose from our wide selection of languages and start your
              learning journey today
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {subjects.map((subject, index) => {
              const colors = [
                "from-red-500 to-pink-500",
                "from-blue-500 to-indigo-500",
                "from-green-500 to-emerald-500",
                "from-yellow-500 to-orange-500",
                "from-purple-500 to-pink-500",
                "from-cyan-500 to-blue-500",
                "from-rose-500 to-red-500",
                "from-amber-500 to-yellow-500",
              ];
              return (
                <div key={subject.id} className="group cursor-pointer">
                  <div className="bg-white/80 backdrop-blur rounded-3xl p-8 text-center border border-slate-200 transition-all duration-300 group-hover:-translate-y-2">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${colors[index % 8]} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-white font-bold text-xl">
                        {subject.code}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors text-lg">
                      {subject.name}
                    </h3>
                    <div className="text-sm text-slate-500 mt-2">
                      24 Teachers
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[3rem] text-white overflow-hidden">
            <div className="relative z-10 text-center py-20 px-8">
              <Target className="w-16 h-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                Join thousands of students who are already mastering new
                languages with our expert teachers
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                  Start Learning Today
                  <ArrowRight className="inline ml-2 w-5 h-5" />
                </button>
                <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur">
                  <Play className="inline mr-2 w-5 h-5" />
                  Find Teachers
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
