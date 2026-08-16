import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  BrainCircuit,
  MessageSquareWarning,
  Users,
  Briefcase,
  LogOut,
  Menu,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import ForkLogo from "../../ui/shared/ForkLogo";

const SIDEBAR_STORAGE_KEY = "forktalent_admin_sidebar_collapsed";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "overview";

  // Collapsible Sidebar State
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved !== null) {
      return saved === "true";
    }
    return typeof window !== "undefined" ? window.innerWidth < 1280 : false;
  });

  const [hasManualPreference, setHasManualPreference] = useState(() => {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) !== null;
  });

  useEffect(() => {
    if (hasManualPreference) return;
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hasManualPreference]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      setHasManualPreference(true);
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Admin logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/admin?tab=overview" },
    { id: "employers", label: "Employer Verification", icon: ShieldCheck, path: "/admin?tab=employers" },
    { id: "campaigns", label: "Interview Campaigns", icon: Briefcase, path: "/admin?tab=campaigns" },
    { id: "mocks", label: "Mock Interviews", icon: BrainCircuit, path: "/admin?tab=mocks" },
    { id: "users", label: "User Directory", icon: Users, path: "/admin?tab=users" },
    { id: "complaints", label: "Support & Complaints", icon: MessageSquareWarning, path: "/admin?tab=complaints" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] font-['Inter'] flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[var(--color-surface)]/90 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center p-2 shadow-lg shadow-[var(--color-primary)]/30">
            <ForkLogo className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-medium tracking-tight text-[var(--color-text-primary)] flex items-center gap-1.5">
              ForkTalent <Sparkles className="w-3 h-3 text-[var(--color-text-accent,#C4B5FD)]" />
            </h1>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-normal">
              Admin control console
            </p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-[var(--color-canvas)] text-[var(--color-text-primary)] hover:border-[var(--color-border-active,#6338F6)] transition-colors border border-[var(--color-border)]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 z-40 bg-black/80 backdrop-blur-md flex flex-col justify-between p-4 overflow-y-auto max-h-[calc(100vh-57px)] animate-in fade-in duration-200">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center font-medium text-sm">
                  {user?.name ? user.name.substring(0, 1) : "A"}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{user?.name || "Admin"}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{user?.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-medium tracking-tight bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 rounded-full">
                Root Admin
              </span>
            </div>

            <nav className="space-y-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-2xl">
              {navItems.map((item) => {
                const isActive = location.pathname === "/admin" && currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all border-l-[3px] ${isActive
                      ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-l-[var(--color-primary,#5B3AF2)] border-t-transparent border-b-transparent border-r-transparent"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover,#1E1E2A)] hover:text-[var(--color-text-primary)] border-l-transparent"
                      }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-xs font-medium text-[var(--color-danger)] bg-[var(--color-danger)]/10 hover:bg-[var(--color-danger)]/20 border border-[var(--color-danger)]/20 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout admin</span>
          </button>
        </div>
      )}

      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed bottom-0 top-0 left-0 z-40 bg-[var(--color-surface)] border-r border-[var(--color-border)] shadow-[1px_0_3px_0_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"
          }`}
      >
        {/* Header */}
        <div
          className={`flex items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-4"
            } py-5 border-b border-[var(--color-border)] min-h-[69px]`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-[var(--color-primary)] flex items-center justify-center p-2 shadow-sm shadow-[var(--color-primary)]/30">
              <ForkLogo className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 truncate">
                <h1 className="text-sm font-medium tracking-tight text-[var(--color-text-primary)] flex items-center gap-1.5 truncate">
                  ForkTalent <Sparkles className="w-3 h-3 text-[var(--color-text-accent,#C4B5FD)]" />
                </h1>
                <p className="text-[10px] text-[var(--color-text-secondary)] font-medium truncate">
                  Root control console
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover,#1E1E2A)] transition-colors shrink-0"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Quick Action Bar */}
        {isCollapsed && (
          <div className="px-2 pt-3 flex justify-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover,#1E1E2A)] transition-colors border border-[var(--color-border)]"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === "/admin" && currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "px-3 gap-3"
                  } py-2.5 text-xs font-medium rounded-xl transition-all border-l-[3px] ${isActive
                    ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-l-[var(--color-primary,#5B3AF2)] border-t-transparent border-b-transparent border-r-transparent"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover,#1E1E2A)] hover:text-[var(--color-text-primary)] border-l-transparent"
                  }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Admin User Footer Card */}
        <div className="p-3 border-t border-[var(--color-border)] space-y-1.5">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center p-1" : "gap-3 px-3 py-2"
              } rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]`}
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Admin Profile"
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover shrink-0 border border-[var(--color-border)]"
              />
            ) : (
              <div className="w-6 h-6 shrink-0 rounded-full bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center text-[10px] font-medium uppercase border border-[var(--color-border-active,#6338F6)]/30">
                {user?.name ? user.name.substring(0, 1) : "A"}
              </div>
            )}
            {!isCollapsed && (
              <div className="min-w-0 truncate">
                <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                  {user?.name || "Admin Owner"}
                </p>
                <p className="text-[10px] text-[var(--color-text-secondary)] truncate">{user?.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
            className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "px-3 gap-3"
              } py-2 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-xl transition-all border-l-[3px] border-l-transparent`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`flex-1 ${isCollapsed ? "md:ml-20" : "md:ml-64"
          } transition-all duration-300 ease-in-out w-full min-w-0 overflow-x-clip p-4 md:p-8`}
      >
        <Outlet />
      </main>
    </div>
  );
}

