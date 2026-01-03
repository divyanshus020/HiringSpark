import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Helmet } from "react-helmet-async";
import { Briefcase, Mail, Lock, User, Building2, Github, Linkedin, Loader2, Phone, MapPin } from "lucide-react";
import { registerAPI } from "../../api/auth/auth.api";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.companyName || !formData.email || !formData.phone || !formData.address || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerAPI({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        companyName: formData.companyName,
        address: formData.address,
      });

      if (response.data && response.data.success) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        sessionStorage.setItem("isAuth", "true");

        toast.success("Registration successful! Redirecting...");
        setTimeout(() => {
          navigate("/hr/dashboard");
        }, 500);
      } else {
        toast.error(response.data?.message || "Registration failed. Please try again.");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>HR Register - Hiring Spark</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Illustration */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 lg:p-12 flex items-center justify-center relative overflow-hidden order-2 lg:order-1">
              <div className="relative z-10 max-w-md">
                {/* Decorative Elements */}
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-emerald-200 rounded-full opacity-30 blur-2xl"></div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-teal-200 rounded-full opacity-30 blur-2xl"></div>

                {/* Team/Hiring Illustration - SVG */}
                <svg viewBox="0 0 400 400" className="w-full h-auto drop-shadow-xl">
                  {/* Laptop/Computer */}
                  <rect x="100" y="200" width="200" height="120" rx="8" fill="#1F2937" opacity="0.9" />
                  <rect x="110" y="210" width="180" height="100" rx="4" fill="#3B82F6" opacity="0.2" />

                  {/* Screen Content - Charts/Graphs */}
                  <rect x="130" y="230" width="60" height="40" rx="4" fill="#10B981" opacity="0.6" />
                  <rect x="200" y="240" width="60" height="30" rx="4" fill="#F59E0B" opacity="0.6" />
                  <rect x="130" y="280" width="130" height="8" rx="4" fill="#6366F1" opacity="0.4" />

                  {/* Laptop Base */}
                  <path d="M 80 320 L 320 320 L 310 340 L 90 340 Z" fill="#374151" opacity="0.9" />

                  {/* People Icons - Team */}
                  <g>
                    {/* Person 1 - Left */}
                    <circle cx="130" cy="140" r="20" fill="#8B5CF6" opacity="0.9" />
                    <path d="M 110 170 Q 110 155 130 155 Q 150 155 150 170 L 145 190 L 115 190 Z" fill="#8B5CF6" opacity="0.9" />

                    {/* Person 2 - Center */}
                    <circle cx="200" cy="120" r="25" fill="#3B82F6" opacity="0.9" />
                    <path d="M 175 155 Q 175 135 200 135 Q 225 135 225 155 L 218 180 L 182 180 Z" fill="#3B82F6" opacity="0.9" />

                    {/* Person 3 - Right */}
                    <circle cx="270" cy="140" r="20" fill="#EC4899" opacity="0.9" />
                    <path d="M 250 170 Q 250 155 270 155 Q 290 155 290 170 L 285 190 L 255 190 Z" fill="#EC4899" opacity="0.9" />
                  </g>

                  {/* Connection Lines */}
                  <line x1="150" y1="150" x2="180" y2="140" stroke="#94A3B8" strokeWidth="3" opacity="0.5" />
                  <line x1="220" y1="140" x2="250" y2="150" stroke="#94A3B8" strokeWidth="3" opacity="0.5" />

                  {/* Decorative Elements */}
                  <circle cx="350" cy="100" r="8" fill="#F59E0B" opacity="0.6" />
                  <circle cx="370" cy="150" r="6" fill="#10B981" opacity="0.6" />
                  <circle cx="50" cy="120" r="10" fill="#3B82F6" opacity="0.6" />
                  <circle cx="40" cy="180" r="7" fill="#EC4899" opacity="0.6" />

                  {/* Document/Resume floating */}
                  <rect x="320" y="220" width="60" height="80" rx="6" fill="white" opacity="0.9" transform="rotate(15 350 260)" />
                  <rect x="330" y="235" width="40" height="6" rx="3" fill="#3B82F6" opacity="0.4" transform="rotate(15 350 238)" />
                  <rect x="330" y="250" width="35" height="5" rx="2.5" fill="#6366F1" opacity="0.4" transform="rotate(15 347.5 252.5)" />
                  <rect x="330" y="265" width="40" height="5" rx="2.5" fill="#8B5CF6" opacity="0.4" transform="rotate(15 350 267.5)" />
                </svg>

                {/* Text Content */}
                <div className="mt-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Build Your Dream Team
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Join thousands of companies using Hiring Spark to find and hire the best candidates efficiently.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 order-1 lg:order-2">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-3xl mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    HireSpark
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">Sign up</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span> </span>
                    <Link to="/hr/login">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
                      >
                        Log In
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>



              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      name="companyName"
                      placeholder="Enter your company name"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      name="address"
                      placeholder="Enter your company address"
                      value={formData.address}
                      onChange={handleChange}
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
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
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
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
