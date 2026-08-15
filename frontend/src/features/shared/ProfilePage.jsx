import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { User, Lock, Trash2, Mail, Save, Loader2, FileText, ShieldCheck, ShieldAlert, Eye, EyeOff } from "lucide-react";
import ResumeCard from "./components/ResumeCard";
import UploadProgress from "./components/UploadProgress";
import profileService from "../../services/profile.service";

const ProfilePage = () => {
  const { user, login } = useAuth(); // login from context updates the user state

  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [resume, setResume] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  // Fetch resume if candidate
  useEffect(() => {
    if (user?.role === "candidate") {
      profileService.getMyResume()
        .then(res => setResume(res.data))
        .catch(err => console.error("Failed to fetch resume:", err));
    }
  }, [user?.role]);

  const getInitials = (name) => {
    return name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "?";
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");

    setIsUpdatingName(true);
    try {
      const { data } = await api.put("/auth/profile", { name });
      if (data.success) {
        toast.success("Profile updated successfully");
        login(data.user); // update the context user
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill all password fields");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    setIsUpdatingPassword(true);
    try {
      const { data } = await api.put("/auth/password", { currentPassword, newPassword });
      if (data.success) {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleResumeReplace = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    setIsUploadingResume(true);
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

    const toastId = toast.loading("Uploading resume...");
    try {
      const response = await profileService.uploadResume(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setResume(response.data);
        toast.success("Resume updated successfully", { id: toastId });
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast.error(error.response?.data?.message || "Failed to upload resume", { id: toastId });
      setUploadProgress(null);
    } finally {
      setIsUploadingResume(false);
      e.target.value = "";
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent font-['Inter'] pb-24 text-[var(--color-text-primary,#FFFFFF)]">
      <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 md:p-10 space-y-8">

        {/* User Profile Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-6 py-8 border-b border-[var(--color-border,#232330)] mb-8"
        >
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-[var(--color-border-active,#6338F6)] p-1 bg-[var(--color-surface,#16161E)] overflow-hidden shadow-xl">
              <div className="w-full h-full rounded-full bg-[var(--color-canvas,#0B0B0E)] flex items-center justify-center text-[var(--color-text-accent,#C4B5FD)] overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-medium">
                    {getInitials(user?.name)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-medium text-[var(--color-text-primary,#FFFFFF)] tracking-tight">
              {user?.name || "Account"}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 text-xs font-medium capitalize">
                {user?.role || "Candidate"}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary,#94A3B8)] mt-2">
              Manage your professional identity and security settings.
            </p>
          </div>
        </motion.section>

        {/* General Information */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--color-surface,#16161E)] border border-[var(--color-border,#232330)] p-6 rounded-2xl shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-[var(--color-text-accent,#C4B5FD)]" />
            <h2 className="text-base font-medium text-[var(--color-text-primary,#FFFFFF)]">
              General information
            </h2>
          </div>

          <form onSubmit={handleUpdateName}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--color-text-secondary,#94A3B8)] px-1 block">
                  Email address
                </label>
                <div className="flex items-center gap-3 bg-[var(--color-canvas,#0B0B0E)] border border-[var(--color-border,#232330)] px-4 py-3 rounded-xl opacity-80">
                  <Mail className="w-4 h-4 text-[var(--color-text-muted,#6E7A8A)] shrink-0" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-transparent border-none focus:outline-none text-sm text-[var(--color-text-secondary,#94A3B8)] w-full cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted,#6E7A8A)] px-1">
                  Email address is linked to your login provider and cannot be changed.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--color-text-secondary,#94A3B8)] px-1 block">
                  Full name
                </label>
                <div className="flex items-center gap-3 bg-[var(--color-canvas,#0B0B0E)] border border-[var(--color-border,#232330)] px-4 py-3 rounded-xl focus-within:border-[var(--color-border-active,#6338F6)] transition-colors">
                  <User className="w-4 h-4 text-[var(--color-text-muted,#6E7A8A)] shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-sm text-[var(--color-text-primary,#FFFFFF)] w-full placeholder-[var(--color-text-muted,#6E7A8A)]"
                    placeholder="Your full name"
                  />
                </div>
              </div>
            </div>

            {/* Single Primary CTA for profile details */}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingName || name === user?.name}
                className="bg-[var(--color-primary,#5B3AF2)] hover:bg-[var(--color-primary-hover,#472CD7)] text-white text-xs sm:text-sm font-medium px-6 py-2.5 rounded-xl active:scale-[0.99] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
              >
                {isUpdatingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save changes</span>
              </button>
            </div>
          </form>
        </motion.section>

        {/* Security Section */}
        {user?.authProvider !== 'google' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--color-surface,#16161E)] border border-[var(--color-border,#232330)] p-6 rounded-2xl shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-5 h-5 text-[var(--color-text-accent,#C4B5FD)]" />
              <h2 className="text-base font-medium text-[var(--color-text-primary,#FFFFFF)]">
                Security
              </h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--color-text-secondary,#94A3B8)] px-1 block">
                  Current password
                </label>
                <div className="flex items-center gap-3 bg-[var(--color-canvas,#0B0B0E)] border border-[var(--color-border,#232330)] px-4 py-3 rounded-xl focus-within:border-[var(--color-border-active,#6338F6)] transition-colors">
                  <Lock className="w-4 h-4 text-[var(--color-text-muted,#6E7A8A)] shrink-0" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="bg-transparent border-none focus:outline-none text-sm text-[var(--color-text-primary,#FFFFFF)] w-full placeholder-[var(--color-text-muted,#6E7A8A)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-[var(--color-text-muted,#6E7A8A)] hover:text-[var(--color-text-primary,#FFFFFF)] transition-colors focus:outline-none"
                    aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--color-text-secondary,#94A3B8)] px-1 block">
                    New password
                  </label>
                  <div className="flex items-center gap-3 bg-[var(--color-canvas,#0B0B0E)] border border-[var(--color-border,#232330)] px-4 py-3 rounded-xl focus-within:border-[var(--color-border-active,#6338F6)] transition-colors">
                    <Lock className="w-4 h-4 text-[var(--color-text-muted,#6E7A8A)] shrink-0" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="bg-transparent border-none focus:outline-none text-sm text-[var(--color-text-primary,#FFFFFF)] w-full placeholder-[var(--color-text-muted,#6E7A8A)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-[var(--color-text-muted,#6E7A8A)] hover:text-[var(--color-text-primary,#FFFFFF)] transition-colors focus:outline-none"
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--color-text-secondary,#94A3B8)] px-1 block">
                    Confirm new password
                  </label>
                  <div className="flex items-center gap-3 bg-[var(--color-canvas,#0B0B0E)] border border-[var(--color-border,#232330)] px-4 py-3 rounded-xl focus-within:border-[var(--color-border-active,#6338F6)] transition-colors">
                    <Lock className="w-4 h-4 text-[var(--color-text-muted,#6E7A8A)] shrink-0" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="bg-transparent border-none focus:outline-none text-sm text-[var(--color-text-primary,#FFFFFF)] w-full placeholder-[var(--color-text-muted,#6E7A8A)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[var(--color-text-muted,#6E7A8A)] hover:text-[var(--color-text-primary,#FFFFFF)] transition-colors focus:outline-none"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Secondary Tint Fill CTA for password update */}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="bg-[var(--primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--primary-tint,rgba(99,56,246,0.25))] border border-[var(--color-border-active,#6338F6)]/40 text-[var(--color-text-accent,#C4B5FD)] text-xs sm:text-sm font-medium px-6 py-2.5 rounded-xl active:scale-[0.99] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
                >
                  {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Update password</span>
                </button>
              </div>
            </form>
          </motion.section>
        )}

        {/* Resume Section */}
        {user?.role === "candidate" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--color-surface,#16161E)] border border-[var(--color-border,#232330)] p-6 rounded-2xl shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-[var(--color-text-accent,#C4B5FD)]" />
              <h2 className="text-base font-medium text-[var(--color-text-primary,#FFFFFF)]">
                Resume & documents
              </h2>
            </div>

            <ResumeCard
              resume={resume}
              readOnly={false}
              onReplace={() => document.getElementById("resume-upload").click()}
              onDownload={(filename) => profileService.downloadResume("/profile/resume/download", filename)}
              viewUrl="/api/profile/resume/download"
            />

            {uploadProgress !== null && (
              <UploadProgress progress={uploadProgress} fileName="Replacement resume" />
            )}

            <input
              type="file"
              id="resume-upload"
              accept=".pdf"
              className="hidden"
              onChange={handleResumeReplace}
              disabled={isUploadingResume}
            />
          </motion.section>
        )}

        {/* Danger Zone */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border border-rose-500/20 p-6 rounded-2xl bg-[var(--color-surface,#16161E)] relative overflow-hidden shadow-xl"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3 text-rose-400">
              <Trash2 className="w-5 h-5" />
              <h2 className="text-base font-medium">
                Danger zone
              </h2>
            </div>
            <p className="text-sm text-[var(--color-text-secondary,#94A3B8)] mb-6 leading-relaxed">
              Once your account is deleted, all past assessments, mock reports, and campaign history will be permanently erased.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                type="button"
                disabled
                className="px-5 py-2.5 border border-rose-500/30 bg-rose-500/5 text-rose-400/60 font-medium text-xs rounded-xl cursor-not-allowed opacity-60 flex items-center gap-2"
                title="Account deletion is restricted in beta. Please contact support."
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete account</span>
              </button>
              <span className="text-xs text-[var(--color-text-muted,#6E7A8A)]">
                Account deletion is restricted in beta. Contact support to request account removal.
              </span>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default ProfilePage;
