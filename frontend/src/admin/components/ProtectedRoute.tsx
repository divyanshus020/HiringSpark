import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Simulate authentication check with a slight delay for smooth UX
    const checkAuth = () => {
      const authStatus = sessionStorage.getItem("isAuth") === "true";
      
      // Add a minimum loading time for smooth transition
      setTimeout(() => {
        setIsAuth(authStatus);
        setIsChecking(false);
      }, 400);
    };

    checkAuth();
  }, []);

  // Show beautiful loader while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <style>
          {`
            .loader {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100px;
              height: 100px;
              perspective: 780px;
            }
            .text {
              font-size: 20px;
              font-weight: 700;
              color: #6366f1;
              z-index: 10;
            }
            .load-inner {
              position: absolute;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
            }
            .load-inner.load-one {
              left: 0%;
              top: 0%;
              border-bottom: 3px solid #5c5edc;
              animation: rotate1 1.5s ease-in-out infinite;
            }
            .load-inner.load-two {
              right: 0%;
              top: 0%;
              border-right: 3px solid #9147ff;
              animation: rotate2 1.5s 0.15s ease-in-out infinite;
            }
            .load-inner.load-three {
              right: 0%;
              bottom: 0%;
              border-top: 3px solid #3b82f6;
              animation: rotate3 1.5s 0.3s ease-in-out infinite;
            }
            @keyframes rotate1 {
              0% {
                transform: rotateX(45deg) rotateY(-45deg) rotateZ(0deg);
              }
              100% {
                transform: rotateX(45deg) rotateY(-45deg) rotateZ(360deg);
              }
            }
            @keyframes rotate2 {
              0% {
                transform: rotateX(45deg) rotateY(45deg) rotateZ(0deg);
              }
              100% {
                transform: rotateX(45deg) rotateY(45deg) rotateZ(360deg);
              }
            }
            @keyframes rotate3 {
              0% {
                transform: rotateX(-60deg) rotateY(0deg) rotateZ(0deg);
              }
              100% {
                transform: rotateX(-60deg) rotateY(0deg) rotateZ(360deg);
              }
            }
          `}
        </style>
        <div className="loader">
          <div className="load-inner load-one"></div>
          <div className="load-inner load-two"></div>
          <div className="load-inner load-three"></div>
          <span className="text">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
