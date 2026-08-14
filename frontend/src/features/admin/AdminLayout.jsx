import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  BrainCircuit,
  MessageSquareWarning,
  Users,
  LogOut,
  Menu,
  X,
  User,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Admin logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const navItems = [
    { label: "Admin Console", icon: LayoutDashboard, path: "/admin" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] font-['Inter'] flex flex-col md:flex-row">
      
      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[var(--card)]/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-[var(--primary)]/30">
            AD
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight text-white uppercase flex items-center gap-1.5">
              IntervuOS <Sparkles className="w-3 h-3 text-[var(--color-text-accent)]" />
            </h1>
            <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">
              Single Admin Portal
            </p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-[var(--background-secondary)] text-[var(--text-primary)] hover:border-[var(--border-active,#6338F6)] transition-colors border border-[var(--border)]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 z-40 bg-black/80 backdrop-blur-md flex flex-col justify-between p-4 overflow-y-auto max-h-[calc(100vh-57px)] animate-in fade-in duration-200">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 border border-[var(--primary)]/30 text-[var(--color-text-accent)] flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name.substring(0, 1) : "A"}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user?.name || "Admin"}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-[var(--primary)]/20 text-[var(--color-text-accent)] border border-[var(--primary)]/30 rounded-full">
                ROOT ADMIN
              </span>
            </div>

            <nav className="space-y-2 bg-[var(--card)] border border-[var(--border)] p-3 rounded-2xl">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    location.pathname === item.path
                      ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      )}

      {/* Desktop Expandable Sidebar */}
      <aside className="hidden md:flex group w-20 hover:w-72 border-r border-[var(--border)] bg-[var(--card)] flex-col fixed bottom-0 top-0 left-0 z-40 transition-all duration-300 overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 p-5 mb-2 min-w-[288px]">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-black shadow-lg shadow-[var(--primary)]/30">
            AD
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              IntervuOS <Sparkles className="w-3.5 h-3.5 text-[var(--color-text-accent)] animate-pulse" />
            </h1>
            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">
              Root Control Center
            </p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-2 px-3 min-w-[288px]">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-3.5 py-3 text-sm font-bold rounded-xl transition-all ${
                location.pathname === item.path
                  ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--primary)] border border-[var(--primary)]/30 shadow-[0_0_20px_rgba(91,58,242,0.15)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)]"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0 text-[var(--primary)]" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Admin User Footer Card */}
        <div className="p-3 border-t border-[var(--border)] space-y-2 min-w-[288px]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Admin Profile"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-[var(--border)]"
              />
            ) : (
              <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center text-xs font-black uppercase border border-[var(--primary)]/30">
                {user?.name ? user.name.substring(0, 1) : "A"}
              </div>
            )}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Admin Owner"}</p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-3.5 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-20 transition-all duration-300 w-full overflow-x-hidden p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
