import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (token) {
      try {
        // Basic JWT decode (payload is the second part)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const userData = JSON.parse(jsonPayload);
        
        const userInfo = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          profileImage: userData.profileImage
        };

        setAuth(userInfo, token);

        // Redirect based on role
        if (userInfo.role === "admin") {
          navigate("/admin");
        } else if (userInfo.role === "superadmin") {
          navigate("/superadmin");
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Completing login...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default LoginSuccess;