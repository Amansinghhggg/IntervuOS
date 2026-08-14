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
  User,
  Building2,
  UserRound,
  ArrowRight,
  FileText
} from "lucide-react";
import UploadProgress from "../shared/components/UploadProgress";

const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["employer", "candidate"], {
      required_error: "Please select a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignupPage = () => {
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  const getRedirectRoute = (role) => {
    if (location.state?.from) return location.state.from;
    return role === "employer" ? "/employer/dashboard" : "/candidate/mock-interview";
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "candidate",
    },
  });

  const selectedRole = watch("role");

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    setIsLoading(true);
    try {
      const data = await googleLogin(credentialResponse.credential, selectedRole);
      toast.success("Account created via Google!");
      navigate(getRedirectRoute(data.user.role), { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Google signup failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    if (selectedRole === "candidate" && !resumeFile) {
      return toast.error("Resume is required for candidates");
    }

    setIsLoading(true);
    setUploadProgress(0);

    // Simulate gradual progress up to 90%
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const dataToSubmit = new FormData();
      dataToSubmit.append("name", formData.name);
      dataToSubmit.append("email", formData.email);
      dataToSubmit.append("password", formData.password);
      dataToSubmit.append("confirmPassword", formData.confirmPassword);
      dataToSubmit.append("role", formData.role);

      if (selectedRole === "candidate" && resumeFile) {
        dataToSubmit.append("resume", resumeFile);
      }

      const data = await signup(dataToSubmit, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success("Account created successfully!");
      navigate(getRedirectRoute(data.user.role), { replace: true });
    } catch (error) {
      clearInterval(progressInterval);
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again."
      );
      setUploadProgress(null);
    } finally {
      setIsLoading(false);
      // Keep at 100% briefly before hiding if success, but if error it's already null.
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are supported");
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Resume must be smaller than 5 MB");
        e.target.value = "";
        return;
      }
      setResumeFile(file);
    }
  };

  const inputClasses = "w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-border-active,#6338F6)] focus:ring-1 focus:ring-[var(--color-border-active,#6338F6)] transition-all placeholder:text-[var(--text-muted)]";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--background)] font-['Inter'] py-12">
      {/* Background noise and decorative gradients */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-[var(--primary)] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary)] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-[1000px] mx-4 z-10 grid md:grid-cols-2 gap-8 lg:gap-16 items-center">

        {/* Left side: Branding / Copy */}
        <div className="hidden md:flex flex-col pr-8 lg:pr-12">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-3xl font-black text-[var(--text-primary)] tracking-tight block">
                IntervuOS
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-accent,#C4B5FD)]">
                Recruitment Suite
              </span>
            </div>
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            Unlock your <br />
            <span className="text-[var(--color-primary-md3)]">full potential.</span>
          </h1>
          <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed mb-8 max-w-md">
            Join the platform built for modern hiring. Find the best talent or practice your interviewing skills with our advanced AI engine.
          </p>

          <div className="flex flex-col gap-5 mt-auto">
            <div className="flex items-center gap-4 text-[var(--color-on-surface-variant)]">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-md3)]/10 border border-[var(--color-primary-md3)]/20 flex items-center justify-center text-[var(--color-primary-md3)] shrink-0 font-bold">✓</div>
              <span className="text-sm font-bold tracking-wide">Create highly tailored AI interviews</span>
            </div>
            <div className="flex items-center gap-4 text-[var(--color-on-surface-variant)]">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-md3)]/10 border border-[var(--color-primary-md3)]/20 flex items-center justify-center text-[var(--color-primary-md3)] shrink-0 font-bold">✓</div>
              <span className="text-sm font-bold tracking-wide">Get real-time AI scoring & insights</span>
            </div>
            <div className="flex items-center gap-4 text-[var(--color-on-surface-variant)]">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-md3)]/10 border border-[var(--color-primary-md3)]/20 flex items-center justify-center text-[var(--color-primary-md3)] shrink-0 font-bold">✓</div>
              <span className="text-sm font-bold tracking-wide">Practice and improve continuously</span>
            </div>
          </div>
        </div>

        {/* Right side: Signup Card */}
        <div className="bg-[var(--color-surface-container-low)]/80 backdrop-blur-xl border border-[var(--color-outline-variant)]/30 rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary-md3)]/10 rounded-full blur-[40px] pointer-events-none" />

          <div className="text-center mb-8 md:hidden flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-md3)] flex items-center justify-center shadow-lg shadow-[var(--color-primary-md3)]/30 mb-4">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">IntervuOS</span>
          </div>

          <div className="mb-8 relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Create an account</h2>
            <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Start hiring smarter or showcase your skills</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            {/* Role Selector */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest mb-3 text-[var(--color-on-surface-variant)]">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  htmlFor="role-employer"
                  className={`relative flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border cursor-pointer transition-all duration-300 ${selectedRole === "employer"
                    ? "border-[var(--color-primary-md3)] bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                    : "border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/30 text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary-md3)]/50 hover:text-white"
                    }`}
                >
                  <input
                    id="role-employer"
                    type="radio"
                    value="employer"
                    {...register("role")}
                    className="sr-only"
                  />
                  <Building2 className="w-6 h-6 mb-1" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Employer</span>
                </label>
                <label
                  htmlFor="role-candidate"
                  className={`relative flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border cursor-pointer transition-all duration-300 ${selectedRole === "candidate"
                    ? "border-[var(--color-primary-md3)] bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                    : "border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/30 text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary-md3)]/50 hover:text-white"
                    }`}
                >
                  <input
                    id="role-candidate"
                    type="radio"
                    value="candidate"
                    {...register("role")}
                    className="sr-only"
                  />
                  <UserRound className="w-6 h-6 mb-1" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Candidate</span>
                </label>
              </div>
              {errors.role && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-1">
                  <span>•</span> {errors.role.message}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="signup-name"
                className="block text-[11px] font-black uppercase tracking-widest mb-3 text-[var(--color-on-surface-variant)]"
              >
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary-md3)] transition-colors" />
                <input
                  id="signup-name"
                  type="text"
                  {...register("name")}
                  className={`${inputClasses} pl-12`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-1">
                  <span>•</span> {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-[11px] font-black uppercase tracking-widest mb-3 text-[var(--color-on-surface-variant)]"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary-md3)] transition-colors" />
                <input
                  id="signup-email"
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
              <label
                htmlFor="signup-password"
                className="block text-[11px] font-black uppercase tracking-widest mb-3 text-[var(--color-on-surface-variant)]"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary-md3)] transition-colors" />
                <input
                  id="signup-password"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-[11px] font-black uppercase tracking-widest mb-3 text-[var(--color-on-surface-variant)]"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary-md3)] transition-colors" />
                <input
                  id="signup-confirm-password"
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={`${inputClasses} pl-12 pr-12`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-1">
                  <span>•</span> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Resume Upload (Candidate Only) */}
            {selectedRole === "candidate" && (
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest mb-3 text-[var(--color-on-surface-variant)]">
                  Resume (PDF, Max 5MB)
                </label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary-md3)] transition-colors" />
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className={`${inputClasses} pl-12 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-[var(--color-primary-md3)]/10 file:text-[var(--color-primary-md3)] hover:file:bg-[var(--color-primary-md3)]/20 cursor-pointer`}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress !== null && (
              <UploadProgress progress={uploadProgress} fileName={resumeFile?.name} />
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-4 bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  Sign up
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

          {/* Google Signup Button */}
          <div className="flex justify-center relative z-10">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Sign-Up failed or was closed")}
              theme="filled_blue"
              size="large"
              shape="pill"
              text="signup_with"
            />
          </div>

          {/* Sign in link */}
          <div className="mt-8 text-center pt-8 border-t border-[var(--color-outline-variant)]/30 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              Already have an account?{" "}
              <Link
                to="/login"
                state={{ from: location.state?.from }}
                className="text-[var(--color-primary-md3)] hover:text-white transition-colors ml-1"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
