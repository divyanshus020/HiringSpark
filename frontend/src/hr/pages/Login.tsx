import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Helmet } from "react-helmet-async";
import { Briefcase, Mail, Lock, Github, Linkedin, Loader2 } from "lucide-react";
import { loginAPI } from "../../api/auth/auth.api";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginAPI({ email, password });

      if (response.data && response.data.success) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        sessionStorage.setItem("isAuth", "true");

        toast.success(`Welcome back, ${response.data.user.fullName}!`);

        // Navigate based on role
        setTimeout(() => {
          if (response.data.user.role === "Admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/hr/dashboard");
          }
        }, 500);
      } else {
        toast.error(response.data?.message || "Login failed. Please try again.");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>HR Login - Hiring Bazaar</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6 -ml-6">
                  <img src="/hiring_bazaar.jpeg" alt="Hiring Bazaar" className="w-64 h-auto" />
                </div>

                <div className="flex justify-between items-center">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">Log in</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Don't have an account?</span>
                    <Link to="/hr/register">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>




              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username or Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter your username or email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log in"
                  )}
                </Button>
              </form>

              {/* Forgot Password */}
              <div className="mt-4 text-center">
                <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              {/* Social Login */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Log in with</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center gap-4">
                  <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-800 transition-colors group">
                    <Github className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                  </button>
                  <button className="p-3 rounded-full bg-gray-100 hover:bg-blue-600 transition-colors group">
                    <Linkedin className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                  </button>
                  <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-800 transition-colors group">
                    <svg className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-amber-50 to-orange-50 p-8 lg:p-12 flex items-center justify-center relative overflow-hidden">
              <div className="relative z-10 max-w-md">
                {/* Decorative Elements */}
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-200 rounded-full opacity-30 blur-2xl"></div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-200 rounded-full opacity-30 blur-2xl"></div>

                {/* Hiring Illustration - SVG */}
                <svg viewBox="0 0 400 400" className="w-full h-auto drop-shadow-xl">
                  {/* Stack of Resumes/Documents */}
                  <g>
                    {/* Bottom Document - Purple */}
                    <rect x="80" y="280" width="200" height="80" rx="8" fill="#8B5CF6" opacity="0.9" />
                    <rect x="100" y="295" width="120" height="8" rx="4" fill="white" opacity="0.3" />
                    <rect x="100" y="315" width="80" height="6" rx="3" fill="white" opacity="0.3" />

                    {/* Middle Document - Orange */}
                    <rect x="90" y="220" width="200" height="80" rx="8" fill="#F97316" opacity="0.9" />
                    <circle cx="140" cy="245" r="15" fill="white" opacity="0.3" />
                    <rect x="165" y="240" width="80" height="6" rx="3" fill="white" opacity="0.3" />
                    <rect x="165" y="252" width="60" height="5" rx="2.5" fill="white" opacity="0.3" />
                    <rect x="110" y="275" width="140" height="6" rx="3" fill="white" opacity="0.3" />

                    {/* Top Document - Teal */}
                    <rect x="100" y="160" width="200" height="80" rx="8" fill="#14B8A6" opacity="0.9" />
                    <circle cx="150" cy="185" r="15" fill="white" opacity="0.3" />
                    <rect x="175" y="180" width="80" height="6" rx="3" fill="white" opacity="0.3" />
                    <rect x="175" y="192" width="60" height="5" rx="2.5" fill="white" opacity="0.3" />
                    <rect x="120" y="215" width="140" height="6" rx="3" fill="white" opacity="0.3" />

                    {/* Resume Icon - Blue */}
                    <rect x="110" y="100" width="180" height="80" rx="8" fill="#3B82F6" opacity="0.9" />
                    <rect x="130" y="115" width="100" height="8" rx="4" fill="white" opacity="0.4" />
                    <circle cx="170" cy="145" r="12" fill="white" opacity="0.4" />
                    <rect x="130" y="165" width="120" height="5" rx="2.5" fill="white" opacity="0.4" />
                  </g>

                  {/* Decorative Stars/Sparkles */}
                  <g opacity="0.6">
                    <path d="M 320 100 L 325 110 L 335 112 L 325 116 L 323 126 L 318 116 L 308 114 L 318 110 Z" fill="#FCD34D" />
                    <path d="M 350 180 L 354 188 L 362 190 L 354 193 L 352 201 L 348 193 L 340 191 L 348 188 Z" fill="#60A5FA" />
                    <path d="M 70 140 L 74 148 L 82 150 L 74 153 L 72 161 L 68 153 L 60 151 L 68 148 Z" fill="#A78BFA" />
                  </g>

                  {/* Plant Pot */}
                  <ellipse cx="340" cy="350" rx="30" ry="15" fill="#DC2626" opacity="0.8" />
                  <rect x="315" y="335" width="50" height="25" rx="5" fill="#EF4444" opacity="0.9" />

                  {/* Plant Leaves */}
                  <ellipse cx="325" cy="320" rx="15" ry="25" fill="#10B981" opacity="0.8" transform="rotate(-20 325 320)" />
                  <ellipse cx="340" cy="315" rx="15" ry="25" fill="#059669" opacity="0.8" transform="rotate(10 340 315)" />
                  <ellipse cx="355" cy="320" rx="15" ry="25" fill="#10B981" opacity="0.8" transform="rotate(20 355 320)" />

                  {/* Pen */}
                  <rect x="320" y="340" width="8" height="40" rx="2" fill="#1F2937" opacity="0.7" transform="rotate(25 324 360)" />
                  <polygon points="318,362 326,362 322,370" fill="#4B5563" opacity="0.7" transform="rotate(25 322 366)" />
                </svg>

                {/* Text Content */}
                <div className="mt-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Welcome Back, Recruiter!
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Access your dashboard to manage candidates, post jobs, and streamline your hiring process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
