import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  BrainCircuit,
  ArrowRight
} from "lucide-react";
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const LoginPage = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getRedirectRoute = (role) => {
    if (location.state?.from) return location.state.from;
    return role === "employer" ? "/employer/dashboard" : "/candidate/mock-interview";
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    setIsLoading(true);
    try {
      const data = await googleLogin(credentialResponse.credential);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(getRedirectRoute(data.user.role), { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Google login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(getRedirectRoute(data.user.role), { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 rounded-xl px-4 py-3 text-sm text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary-md3)] focus:ring-1 focus:ring-[var(--color-primary-md3)] transition-all placeholder:text-[var(--color-on-surface-variant)]/50";

  return (
    <div className="min-h-[100dvh] py-8 px-4 flex items-center justify-center relative overflow-hidden bg-[#0A0A0A] font-['Inter']">
      {/* Background noise and decorative gradients */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-primary-md3)] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-primary-md3)] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-[1000px] mx-auto z-10 grid md:grid-cols-2 gap-8 lg:gap-16 items-center">

        {/* Left side: Branding / Copy */}
        <div className="hidden md:flex flex-col pr-8 lg:pr-12">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-md3)] flex items-center justify-center shadow-lg shadow-[var(--color-primary-md3)]/30">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-3xl font-black text-white tracking-tight block">
                IntervuOS
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-md3)]">
                Recruitment Suite
              </span>
            </div>
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            The future of <br />
            <span className="text-[var(--color-primary-md3)]">hiring is here.</span>
          </h1>
          <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed mb-8 max-w-md">
            Sign in to your account to conduct AI-powered interviews, analyze candidate performance, or track your job applications.
          </p>
        </div>

        {/* Right side: Login Card */}
        <div className="bg-[var(--color-surface-container-low)]/80 backdrop-blur-xl border border-[var(--color-outline-variant)]/30 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary-md3)]/10 rounded-full blur-[40px] pointer-events-none" />

          <div className="text-center mb-10 md:hidden flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-md3)] flex items-center justify-center shadow-lg shadow-[var(--color-primary-md3)]/30 mb-4">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">IntervuOS</span>
          </div>

          <div className="mb-10 relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Welcome back</h2>
            <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-[11px] font-black uppercase tracking-widest mb-3 text-[var(--color-on-surface-variant)]"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary-md3)] transition-colors" />
                <input
                  id="login-email"
                  type="email"
                  {...register("email")}
                  className={`${inputClasses} pl-12`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-1">
                  <span>•</span> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="login-password"
                  className="block text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]"
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary-md3)] transition-colors" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`${inputClasses} pl-12 pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-1">
                  <span>•</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-4 bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-center gap-3 relative z-10">
            <div className="h-px bg-[var(--color-outline-variant)]/30 flex-1" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">OR</span>
            <div className="h-px bg-[var(--color-outline-variant)]/30 flex-1" />
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center relative z-10">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Sign-In failed or was closed")}
              theme="filled_blue"
              size="large"
              shape="pill"
              text="continue_with"
            />
          </div>

          {/* Sign up link */}
          <div className="mt-8 text-center pt-8 border-t border-[var(--color-outline-variant)]/30 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              Don't have an account yet?{" "}
              <Link
                to="/signup"
                state={{ from: location.state?.from }}
                className="text-[var(--color-primary-md3)] hover:text-white transition-colors ml-1"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
