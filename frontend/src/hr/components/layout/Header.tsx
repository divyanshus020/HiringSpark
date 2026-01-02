import { Bell, User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const Header = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  const hrUser = JSON.parse(localStorage.getItem("hrUser") || "{}");

  const navItems = [
    { label: "Dashboard", path: "/hr/dashboard" },
    { label: "Create Job", path: "/hr/create-job" },
    { label: "Candidates", path: "/hr/candidates" },
  ];

  const handleLogout = (): void => {
    sessionStorage.clear();
    navigate("/hr/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="container flex h-20 items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-12">
          <Link to="/hr/dashboard" className="flex items-center gap-3 group">
            <img
              src="/hiring_bazaar.jpeg"
              alt="Hiring Bazaar"
              className="h-12 w-auto transition-all group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-base font-semibold transition-all relative group",
                  location.pathname === item.path
                    ? "text-indigo-600"
                    : "text-gray-600 hover:text-indigo-600"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all",
                    location.pathname === item.path
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative rounded-full p-2.5 hover:bg-indigo-50 transition-colors group">
            <Bell className="h-6 w-6 text-gray-600 group-hover:text-indigo-600 transition-colors" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* User Avatar + Tooltip */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 transition-all hover:scale-105 cursor-pointer">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
              </TooltipTrigger>

              <TooltipContent
                side="bottom"
                align="end"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-xl
                           data-[state=delayed-open]:animate-in
                           data-[state=delayed-open]:fade-in
                           data-[state=delayed-open]:slide-in-from-top-1
                           data-[state=delayed-open]:zoom-in-95"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {hrUser.name || "HR User"}
                </p>
                {(hrUser.companyName || hrUser.company) && (
                  <p className="text-xs text-gray-500">
                    {hrUser.companyName || hrUser.company}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
