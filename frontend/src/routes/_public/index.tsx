import { useState, useEffect } from "react";
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
  Zap,
  Target,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

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
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFeaturedCourses(mockCourses);
      setSubjects(mockSubjects);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    {
      label: "Active Students",
      value: "10,000+",
      icon: Users,
      color: "from-blue-400 to-blue-600",
    },
    {
      label: "Expert Teachers",
      value: "500+",
      icon: Award,
      color: "from-amber-400 to-orange-500",
    },
    {
      label: "Course Hours",
      value: "50,000+",
      icon: Clock,
      color: "from-emerald-400 to-green-600",
    },
    {
      label: "Success Rate",
      value: "95%",
      icon: TrendingUp,
      color: "from-purple-400 to-pink-500",
    },
  ];

  const features = [
    {
      title: "Learn from Experts",
      description: "Connect with qualified teachers from around the world",
      icon: Users,
      color: "from-blue-100 to-blue-200",
      iconColor: "text-blue-600",
    },
    {
      title: "Flexible Schedule",
      description: "Book lessons that fit your schedule and timezone",
      icon: Clock,
      color: "from-green-100 to-green-200",
      iconColor: "text-green-600",
    },
    {
      title: "Interactive Learning",
      description: "Engage in real-time conversations and practice",
      icon: MessageCircle,
      color: "from-purple-100 to-purple-200",
      iconColor: "text-purple-600",
    },
    {
      title: "Global Community",
      description: "Join learners from 150+ countries worldwide",
      icon: Globe,
      color: "from-orange-100 to-orange-200",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="space-y-20 pb-20">
        {/* Hero Section with Illustration */}
        <section className="relative overflow-hidden">
          {/* Background Illustration Elements with Parallax */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating Geometric Shapes with different parallax speeds */}
            <div
              className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-60 animate-pulse"
              style={{
                transform: `translateY(${scrollY * 0.2}px) rotate(${scrollY * 0.1}deg)`,
              }}
            ></div>
            <div
              className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-lg rotate-45 opacity-50"
              style={{
                transform: `translateY(${scrollY * -0.15}px) rotate(${45 + scrollY * 0.05}deg)`,
              }}
            ></div>
            <div
              className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-70 animate-pulse delay-1000"
              style={{ transform: `translateY(${scrollY * 0.25}px)` }}
            ></div>
            <div
              className="absolute top-60 left-1/3 w-16 h-16 bg-gradient-to-br from-green-200 to-emerald-200 rounded-lg rotate-12 opacity-60"
              style={{
                transform: `translateY(${scrollY * -0.1}px) rotate(${12 + scrollY * 0.08}deg)`,
              }}
            ></div>

            {/* Language Bubble Elements with subtle parallax */}
            <div
              className="absolute top-32 right-1/3 bg-white rounded-2xl p-3 shadow-lg rotate-12 opacity-80"
              style={{
                transform: `translateY(${scrollY * 0.12}px) rotate(${12 + scrollY * 0.03}deg)`,
              }}
            >
              <span className="text-2xl">🇪🇸</span>
              <span className="ml-2 text-sm font-medium text-gray-700">
                ¡Hola!
              </span>
            </div>
            <div
              className="absolute bottom-40 right-16 bg-white rounded-2xl p-3 shadow-lg -rotate-6 opacity-80"
              style={{
                transform: `translateY(${scrollY * -0.08}px) rotate(${-6 + scrollY * 0.02}deg)`,
              }}
            >
              <span className="text-2xl">🇫🇷</span>
              <span className="ml-2 text-sm font-medium text-gray-700">
                Bonjour!
              </span>
            </div>
            <div
              className="absolute top-48 left-16 bg-white rounded-2xl p-3 shadow-lg rotate-6 opacity-80"
              style={{
                transform: `translateY(${scrollY * 0.18}px) rotate(${6 + scrollY * 0.04}deg)`,
              }}
            >
              <span className="text-2xl">🇩🇪</span>
              <span className="ml-2 text-sm font-medium text-gray-700">
                Hallo!
              </span>
            </div>

            {/* Additional Parallax Background Elements */}
            <div
              className="absolute top-10 right-1/4 w-6 h-6 bg-gradient-to-br from-pink-300 to-red-300 rounded-full opacity-40"
              style={{ transform: `translateY(${scrollY * 0.35}px)` }}
            ></div>
            <div
              className="absolute bottom-20 left-1/2 w-8 h-8 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-lg opacity-30"
              style={{
                transform: `translateY(${scrollY * -0.2}px) rotate(${scrollY * 0.15}deg)`,
              }}
            ></div>
            <div
              className="absolute top-80 right-10 w-12 h-12 bg-gradient-to-br from-cyan-200 to-teal-200 rounded-full opacity-50"
              style={{ transform: `translateY(${scrollY * 0.28}px)` }}
            ></div>
          </div>

          <div className="relative z-10 text-center py-24 px-6">
            <div
              className="max-w-5xl mx-auto"
              style={{ transform: `translateY(${scrollY * -0.05}px)` }}
            >
              {/* Animated Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium mb-8 shadow-lg">
                <Zap className="w-4 h-4 mr-2" />
                New: AI-Powered Learning Paths Available
              </div>

              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Learn Languages with
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  {" "}
                  Expert Teachers
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Master any language through personalized 1-on-1 lessons with
                certified teachers. Join our global community and start speaking
                confidently from day one.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                  <span className="flex items-center">
                    Start Learning Free
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <button className="group border-2 border-gray-300 text-gray-700 px-10 py-4 rounded-2xl text-lg font-semibold hover:border-purple-300 hover:text-purple-600 transition-all duration-300 bg-white/80 backdrop-blur">
                  <span className="flex items-center">
                    <Play className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                    Watch Demo
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Animated Stats Section */}
        <section className="py-16 px-6 relative">
          {/* Parallax Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full opacity-30"
              style={{
                transform: `translateY(${scrollY * 0.1}px) translateX(${scrollY * 0.05}px)`,
              }}
            ></div>
            <div
              className="absolute bottom-20 right-20 w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-200 rounded-lg opacity-25"
              style={{
                transform: `translateY(${scrollY * -0.08}px) rotate(${scrollY * 0.02}deg)`,
              }}
            ></div>
          </div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center group">
                    <div
                      className={`bg-gradient-to-br ${stat.color} w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900 mb-3">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Courses with Modern Cards */}
        <section className="px-6 relative">
          {/* Subtle Parallax Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-0 right-1/4 w-32 h-32 bg-gradient-to-br from-purple-50 to-pink-100 rounded-full opacity-40"
              style={{ transform: `translateY(${scrollY * 0.15}px)` }}
            ></div>
            <div
              className="absolute bottom-0 left-1/3 w-24 h-24 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-lg opacity-30"
              style={{
                transform: `translateY(${scrollY * -0.12}px) rotate(${scrollY * 0.03}deg)`,
              }}
            ></div>
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Featured Courses
                </h2>
                <p className="text-gray-600 text-lg">
                  Discover our most popular language courses
                </p>
              </div>
              <button className="hidden md:flex items-center bg-gradient-to-r from-gray-100 to-gray-200 hover:from-purple-100 hover:to-pink-100 text-gray-700 hover:text-purple-600 px-6 py-3 rounded-xl font-medium transition-all duration-300">
                View All Courses
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCourses.map((course, index) => {
                  const gradients = [
                    "from-blue-400 to-purple-500",
                    "from-pink-400 to-orange-400",
                    "from-green-400 to-blue-500",
                  ];
                  return (
                    <div
                      key={course.id}
                      className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                    >
                      <div
                        className={`relative h-48 bg-gradient-to-br ${gradients[index % 3]} flex items-center justify-center`}
                      >
                        <div className="text-center text-white">
                          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
                          <div className="inline-block bg-white/20 backdrop-blur rounded-full px-4 py-2">
                            <span className="font-medium">
                              {course.subject.name}
                            </span>
                          </div>
                        </div>
                        {course.proficiency_level && (
                          <div className="absolute top-4 right-4">
                            <span className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-medium">
                              {course.proficiency_level}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-8">
                        <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-purple-600 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 mb-6 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-500 ml-2">
                              (4.9)
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-purple-600">
                            ${course.price_per_student}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Languages Grid with Illustrations */}
        <section className="px-6 relative">
          {/* Parallax Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-20 left-20 w-28 h-28 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full opacity-20"
              style={{
                transform: `translateY(${scrollY * 0.08}px) scale(${1 + scrollY * 0.0001})`,
              }}
            ></div>
            <div
              className="absolute bottom-10 right-10 w-36 h-36 bg-gradient-to-br from-green-100 to-emerald-200 rounded-3xl opacity-15"
              style={{
                transform: `translateY(${scrollY * -0.1}px) rotate(${scrollY * 0.02}deg)`,
              }}
            ></div>
            <div
              className="absolute top-1/2 left-10 w-12 h-12 bg-gradient-to-br from-red-200 to-pink-300 rounded-lg opacity-25"
              style={{
                transform: `translateY(${scrollY * 0.2}px) rotate(${scrollY * 0.05}deg)`,
              }}
            ></div>
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Popular Languages
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Choose from our wide selection of languages and start your
                learning journey today
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {subjects.map((subject, index) => {
                const colors = [
                  "from-red-400 to-pink-500",
                  "from-blue-400 to-indigo-500",
                  "from-green-400 to-emerald-500",
                  "from-yellow-400 to-orange-500",
                  "from-purple-400 to-pink-500",
                  "from-cyan-400 to-blue-500",
                  "from-rose-400 to-red-500",
                  "from-amber-400 to-yellow-500",
                ];
                return (
                  <div
                    key={subject.id}
                    className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl p-8 text-center">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${colors[index % 8]} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <span className="text-white font-bold text-xl">
                          {subject.code}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors text-lg">
                        {subject.name}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features with Modern Design */}
        <section className="px-6 relative">
          {/* Parallax Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-full opacity-10"
              style={{
                transform: `translateY(${scrollY * 0.12}px) translateX(${scrollY * 0.03}px)`,
              }}
            ></div>
            <div
              className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-200 rounded-2xl opacity-15"
              style={{
                transform: `translateY(${scrollY * -0.15}px) rotate(${scrollY * 0.02}deg)`,
              }}
            ></div>
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-[3rem] py-20 px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Why Choose HayProf?
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Experience the future of language learning with our innovative
                  platform designed for modern learners
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="text-center group">
                      <div
                        className={`bg-gradient-to-br ${feature.color} w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300`}
                      >
                        <Icon className={`w-10 h-10 ${feature.iconColor}`} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-3 text-xl">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section with Dynamic Elements */}
        <section className="px-6 relative">
          {/* Parallax Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-10 left-1/4 w-20 h-20 bg-gradient-to-br from-white/10 to-white/20 rounded-full"
              style={{
                transform: `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.03}deg)`,
              }}
            ></div>
            <div
              className="absolute bottom-20 right-1/3 w-16 h-16 bg-gradient-to-br from-white/5 to-white/15 rounded-lg"
              style={{
                transform: `translateY(${scrollY * -0.08}px) scale(${1 + scrollY * 0.0001})`,
              }}
            ></div>
          </div>
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[3rem] text-white overflow-hidden">
              {/* Background Pattern with Parallax */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full"
                  style={{ transform: `rotate(${scrollY * 0.02}deg)` }}
                ></div>
                <div
                  className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-lg rotate-45"
                  style={{ transform: `rotate(${45 + scrollY * 0.03}deg)` }}
                ></div>
                <div
                  className="absolute top-20 right-20 w-16 h-16 bg-white rounded-full opacity-20"
                  style={{
                    transform: `translateY(${scrollY * 0.05}px) scale(${1 + scrollY * 0.0001})`,
                  }}
                ></div>
              </div>

              <div className="relative z-10 text-center py-20 px-8">
                <Target className="w-16 h-16 mx-auto mb-6 opacity-80" />
                <h2 className="text-5xl font-bold mb-6">
                  Ready to Start Learning?
                </h2>
                <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                  Join thousands of students who are already mastering new
                  languages with our expert teachers and innovative learning
                  methods
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button className="bg-white text-purple-600 px-10 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                    Start Learning Today
                    <ArrowRight className="inline ml-2 w-5 h-5" />
                  </button>
                  <button className="border-2 border-white/30 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur">
                    <Play className="inline mr-2 w-5 h-5" />
                    Find Teachers
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
