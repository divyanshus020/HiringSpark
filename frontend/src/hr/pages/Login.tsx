import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Helmet } from "react-helmet-async";
import { Briefcase, Mail, Lock, Github, Linkedin, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { loginAPI } from "../../api/auth/auth.api";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Email validation function
  const validateEmail = (email: string) => {
    if (!email) {
      return "Email is required";
    }

    // Check for valid email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address (e.g., user@gmail.com)";
    }

    // // Check if it's a Gmail address (optional - can be removed if other emails are allowed)
    // const gmailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    // if (!gmailRegex.test(email)) {
    //   return "Please use a valid Gmail address (e.g., user@gmail.com)";
    // }

    return "";
  };

  // Password validation function
  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    // Check for special character
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialCharRegex.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*...)";
    }

    return "";
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailTouched) {
      setEmailError(validateEmail(value));
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordTouched) {
      setPasswordError(validatePassword(value));
    }
  };

  // Handle email blur
  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  // Handle password blur
  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setEmailTouched(true);
    setPasswordTouched(true);

    // Validate all fields
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);

    // If there are validation errors, show toast and return
    if (emailValidationError || passwordValidationError) {
      toast.error("Please fix the validation errors before submitting");
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
        <title>HR Login - Hiring Spark</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    HiringBazaar
                  </h1>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">Log in</h1>
              </div>




              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter your Gmail address (e.g., user@gmail.com)"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      disabled={isLoading}
                      className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${emailError && emailTouched
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : email && !emailError && emailTouched
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : ""
                        }`}
                    />
                    {emailTouched && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {emailError ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : email ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {emailError && emailTouched && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {emailError}
                    </p>
                  )}
                  {!emailError && email && emailTouched && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Valid email format
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Enter your password (min 8 chars, 1 special char)"
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={handlePasswordBlur}
                      disabled={isLoading}
                      autoComplete="current-password"
                      className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${passwordError && passwordTouched
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : password && !passwordError && passwordTouched
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : ""
                        }`}
                    />
                    {passwordTouched && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {passwordError ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : password ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {passwordError && passwordTouched && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </p>
                  )}
                  {!passwordError && password && passwordTouched && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Password meets requirements
                    </p>
                  )}
                  {/* Password requirements hint */}
                  {!passwordTouched && (
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <p className="font-medium">Password must contain:</p>
                      <ul className="list-disc list-inside pl-2 space-y-0.5">
                        <li>At least 8 characters</li>
                        <li>At least one special character (!@#$%^&*...)</li>
                      </ul>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !!emailError || !!passwordError}
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

                {/* Sign Up Button - Moved below Login */}
                <div className="text-center">
                  <Link to="/hr/register">
                    <Button
                      variant="outline"
                      className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-gray-300 font-medium rounded-lg transition-all"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </form>

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
