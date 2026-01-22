import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Helmet } from "react-helmet-async";
import { Briefcase, Mail, Lock, User, Building2, Github, Linkedin, Loader2, Phone, MapPin, AlertCircle, CheckCircle } from "lucide-react";
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

  // Error states for each field
  const [errors, setErrors] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  // Touched states for each field
  const [touched, setTouched] = useState({
    fullName: false,
    companyName: false,
    email: false,
    phone: false,
    address: false,
    password: false,
    confirmPassword: false,
  });

  // Validation functions
  const validateFullName = (name: string) => {
    if (!name) return "Full name is required";
    if (name.length < 3) return "Full name must be at least 3 characters";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Full name should only contain letters and spaces";
    return "";
  };

  const validateCompanyName = (name: string) => {
    if (!name) return "Company name is required";
    if (name.length < 2) return "Company name must be at least 2 characters";
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";

    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone) return "Phone number is required";
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) return "Phone number must be exactly 10 digits";
    return "";
  };

  const validateAddress = (address: string) => {
    if (!address) return "Address is required";
    if (address.length < 5) return "Address must be at least 5 characters";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialCharRegex.test(password)) return "Password must contain at least one special character";
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  // Handle field changes with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate on change if field has been touched
    if (touched[name as keyof typeof touched]) {
      validateField(name, value);
    }
  };

  // Validate individual field
  const validateField = (fieldName: string, value: string) => {
    let error = "";
    switch (fieldName) {
      case "fullName":
        error = validateFullName(value);
        break;
      case "companyName":
        error = validateCompanyName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "address":
        error = validateAddress(value);
        break;
      case "password":
        error = validatePassword(value);
        // Also revalidate confirm password if it's been touched
        if (touched.confirmPassword) {
          setErrors(prev => ({
            ...prev,
            confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
          }));
        }
        break;
      case "confirmPassword":
        error = validateConfirmPassword(value, formData.password);
        break;
    }
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Handle field blur
  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName as keyof typeof formData]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {
      fullName: true,
      companyName: true,
      email: true,
      phone: true,
      address: true,
      password: true,
      confirmPassword: true,
    };
    setTouched(allTouched);

    // Validate all fields
    const newErrors = {
      fullName: validateFullName(formData.fullName),
      companyName: validateCompanyName(formData.companyName),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      address: validateAddress(formData.address),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== "");
    if (hasErrors) {
      toast.error("Please fix all validation errors before submitting");
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
                      placeholder="Enter your full name (min 3 characters)"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={() => handleBlur("fullName")}
                      disabled={isLoading}
                      className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.fullName && touched.fullName
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : formData.fullName && !errors.fullName && touched.fullName
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : ""
                        }`}
                    />
                    {touched.fullName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {errors.fullName ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : formData.fullName ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.fullName && touched.fullName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullName}
                    </p>
                  )}
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
                      onBlur={() => handleBlur("companyName")}
                      disabled={isLoading}
                      className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.companyName && touched.companyName
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : formData.companyName && !errors.companyName && touched.companyName
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : ""
                        }`}
                    />
                    {touched.companyName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {errors.companyName ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : formData.companyName ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.companyName && touched.companyName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Enter your Gmail address (e.g., user@gmail.com)"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur("email")}
                      disabled={isLoading}
                      className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.email && touched.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : formData.email && !errors.email && touched.email
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : ""
                        }`}
                    />
                    {touched.email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {errors.email ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : formData.email ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.email && touched.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
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
                      placeholder="Enter 10-digit phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur("phone")}
                      disabled={isLoading}
                      className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.phone && touched.phone
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : formData.phone && !errors.phone && touched.phone
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : ""
                        }`}
                    />
                    {touched.phone && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {errors.phone ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : formData.phone ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
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
                      placeholder="Enter your company address (min 5 characters)"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={() => handleBlur("address")}
                      disabled={isLoading}
                      className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.address && touched.address
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : formData.address && !errors.address && touched.address
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : ""
                        }`}
                    />
                    {touched.address && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {errors.address ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : formData.address ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.address && touched.address && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.address}
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
                      name="password"
                      placeholder="Create a password (min 8 chars, 1 special char)"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur("password")}
                      disabled={isLoading}
                      className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.password && touched.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : formData.password && !errors.password && touched.password
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : ""
                        }`}
                    />
                    {touched.password && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {errors.password ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : formData.password ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                  {!touched.password && (
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <p className="font-medium">Password must contain:</p>
                      <ul className="list-disc list-inside pl-2 space-y-0.5">
                        <li>At least 8 characters</li>
                        <li>At least one special character (!@#$%^&*...)</li>
                      </ul>
                    </div>
                  )}
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
                      onBlur={() => handleBlur("confirmPassword")}
                      disabled={isLoading}
                      className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.confirmPassword && touched.confirmPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : formData.confirmPassword && !errors.confirmPassword && touched.confirmPassword
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : ""
                        }`}
                    />
                    {touched.confirmPassword && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {errors.confirmPassword ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : formData.confirmPassword ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {!errors.confirmPassword && formData.confirmPassword && touched.confirmPassword && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Passwords match
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || Object.values(errors).some(error => error !== "")}
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
