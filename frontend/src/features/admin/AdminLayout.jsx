import React, { useState, useEffect } from "react";
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
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import ForkLogo from "../../ui/shared/ForkLogo";

const SIDEBAR_STORAGE_KEY = 'forktalent_admin_sidebar_collapsed';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Collapsible Sidebar State (Remembers user preference, defaults to expanded on >= 1280px, collapsed on < 1280px)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
    return typeof window !== 'undefined' ? window.innerWidth < 1280 : false;
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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    { label: "Admin Console", icon: LayoutDashboard, path: "/admin" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] font-['Inter'] flex flex-col md:flex-row">
      
      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[var(--card)]/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center p-2 shadow-lg shadow-[var(--primary)]/30">
            <ForkLogo className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight text-white uppercase flex items-center gap-1.5">
              ForkTalent <Sparkles className="w-3 h-3 text-[var(--color-text-accent)]" />
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
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all border-l-[3px] ${
                      isActive
                        ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-l-[var(--color-primary,#5B3AF2)] border-t-transparent border-b-transparent border-r-transparent"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-white border-l-transparent"
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
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      )}

      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed bottom-0 top-0 left-0 z-40 bg-[var(--card)] border-r border-[var(--border)] shadow-[1px_0_3px_0_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} py-5 border-b border-[var(--border)]/60 min-h-[69px]`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-[var(--primary)] flex items-center justify-center p-2 shadow-sm">
              <ForkLogo className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 truncate">
                <h1 className="text-sm font-medium tracking-tight text-white flex items-center gap-1.5 truncate">
                  ForkTalent <Sparkles className="w-3 h-3 text-[var(--color-text-accent)]" />
                </h1>
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-medium truncate">
                  Root Control Center
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover,#1E1E2A)] transition-colors shrink-0"
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
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover,#1E1E2A)] transition-colors border border-[var(--border)]/50"
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
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'
                } py-2.5 text-xs font-medium rounded-xl transition-all border-l-[3px] ${
                  isActive
                    ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-l-[var(--color-primary,#5B3AF2)] border-t-transparent border-b-transparent border-r-transparent"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)] border-l-transparent"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Admin User Footer Card */}
        <div className="p-3 border-t border-[var(--border)]/60 space-y-1.5">
          <div className={`flex items-center ${isCollapsed ? 'justify-center p-1' : 'gap-3 px-3 py-2'} rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]`}>
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Admin Profile"
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover shrink-0 border border-[var(--border)]"
              />
            ) : (
              <div className="w-6 h-6 shrink-0 rounded-full bg-[var(--primary)]/20 text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center text-[10px] font-bold uppercase border border-[var(--primary)]/30">
                {user?.name ? user.name.substring(0, 1) : "A"}
              </div>
            )}
            {!isCollapsed && (
              <div className="min-w-0 truncate">
                <p className="text-xs font-medium text-white truncate">{user?.name || "Admin Owner"}</p>
                <p className="text-[10px] text-[var(--text-secondary)] truncate">{user?.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'
            } py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border-l-[3px] border-l-transparent`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`flex-1 ${
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        } transition-all duration-300 ease-in-out w-full min-w-0 overflow-x-clip p-4 md:p-8`}
      >
        <Outlet />
      </main>
    </div>
  );
}

