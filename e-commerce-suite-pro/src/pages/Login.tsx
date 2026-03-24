import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const user = await login(email, password);
       
    if (user?.user?.role === "admin") {
      navigate("/admin");
    } else if (user?.user?.role === "superadmin") {
      navigate("/superadmin");
    } else if(user?.user?.role ==="user") {
      navigate("/");
    }
    else{
      navigate("/login");
    }

  } catch (err) {
    console.error(err);
    toast({
      title: "Something went wrong",
      description: "Please try again later.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">S</span>
            </div>
          </Link>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2"
              disabled={isLoading || !email || !password}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

          </form>

          <div className="mt-6 space-y-4">

  {/* Google Sign In */}
  <Button
    variant="outline"
    className="w-full flex items-center justify-center gap-2"
    onClick={() => {
      // yaha baad me Google auth logic lagana
      console.log("Google Sign In");
    }}
  >
    <img
      src="https://www.svgrepo.com/show/475656/google-color.svg"
      alt="Google"
      className="h-4 w-4"
    />
    Sign in with Google
  </Button>

  {/* Divider */}
  <div className="flex items-center gap-2">
    <div className="flex-1 h-px bg-border" />
    <span className="text-xs text-muted-foreground">OR</span>
    <div className="flex-1 h-px bg-border" />
  </div>

  {/* Login link */}
  <p className="text-center text-sm text-muted-foreground">
    Don&apos;t have an account?{" "}
    <Link
      to="/register"
      className="text-primary font-medium hover:underline"
    >
      Sign Up
    </Link>
  </p>

</div>

        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
