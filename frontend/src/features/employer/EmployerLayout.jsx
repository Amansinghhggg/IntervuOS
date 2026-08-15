import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    FileText,
    CreditCard,
    HelpCircle,
    LogOut,
    Menu,
    X,
    User,
    ShieldAlert,
    Sparkles,
    ArrowRight,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const SIDEBAR_STORAGE_KEY = 'intervuos_employer_sidebar_collapsed';

export default function EmployerLayout() {
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

    // Auto-collapse on resize under ~1280px if no manual toggle preference exists
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
            toast.success("Logged out successfully");
            navigate("/login");
        } catch {
            toast.error("Logout failed");
        }
    };

    const handleNavItemClick = (path) => {
        navigate(path);
    };

    const navItems = [
        { label: "Dashboard", icon: Home, path: "/employer/dashboard" },
        { label: "New Campaign", icon: FileText, path: "/employer/create-interview" },
        { label: "How It Works", icon: HelpCircle, path: "/employer/how-it-works" }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] font-['Inter'] flex flex-col">

            {/* Top Exponent Style Promo Banner */}

            <div className="flex-1 flex flex-col md:flex-row relative">
                {/* Mobile Header Bar (visible on < md screens) */}
                <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[var(--card)]/90 backdrop-blur-md border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[var(--primary)]/30">
                            IO
                        </div>
                        <div>
                            <h1 className="text-xs font-black tracking-tight text-[var(--text-primary)] uppercase">IntervuOS</h1>
                            <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Employer Console</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl bg-[var(--background-secondary)] text-[var(--text-primary)] hover:border-[var(--border-active,#6338F6)] transition-colors border border-[var(--border)]"
                            aria-label="Toggle navigation menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </header>

                {/* Mobile Dropdown Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden fixed inset-x-0 top-[95px] bottom-0 z-40 bg-black/70 backdrop-blur-sm flex flex-col justify-between p-4 overflow-y-auto max-h-[calc(100vh-95px)] animate-in fade-in duration-200">
                        <nav className="space-y-1.5 bg-[var(--card)] border border-[var(--border)] p-3 rounded-2xl shadow-xl">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            handleNavItemClick(item.path);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all border-l-[3px] ${isActive
                                            ? 'bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-l-[var(--color-primary,#5B3AF2)] border-t-transparent border-b-transparent border-r-transparent'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)] border-l-transparent'
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4 shrink-0" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-2xl shadow-xl space-y-1.5 mt-3">
                            <button
                                onClick={() => {
                                    navigate('/employer/profile');
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all border-l-[3px] ${location.pathname === '/employer/profile'
                                    ? 'bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-l-[var(--color-primary,#5B3AF2)] border-t-transparent border-b-transparent border-r-transparent'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)] border-l-transparent'
                                    }`}
                            >
                                <User className="w-4 h-4 shrink-0" />
                                <span>Profile</span>
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/employer/contact');
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all border-l-[3px] ${location.pathname === '/employer/contact'
                                    ? 'bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-l-[var(--color-primary,#5B3AF2)] border-t-transparent border-b-transparent border-r-transparent'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)] border-l-transparent'
                                    }`}
                            >
                                <HelpCircle className="w-4 h-4 shrink-0" />
                                <span>Contact Us</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border-l-[3px] border-l-transparent"
                            >
                                <LogOut className="w-4 h-4 shrink-0" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Desktop Collapsible Sidebar (hidden on < md screens) */}
                <aside
                    className={`hidden md:flex flex-col fixed bottom-0 top-0 left-0 z-40 bg-[var(--card)] border-r border-[var(--border)] shadow-[1px_0_3px_0_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
                        }`}
                >
                    {/* Header with Logo and Collapse Toggle */}
                    <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} py-5 border-b border-[var(--border)]/60 min-h-[69px]`}>
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 shrink-0 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                IO
                            </div>
                            {!isCollapsed && (
                                <div className="min-w-0 truncate">
                                    <h1 className="text-sm font-medium tracking-tight text-[var(--text-primary)] truncate">IntervuOS</h1>
                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-medium truncate">Recruitment Suite</p>
                                </div>
                            )}
                        </div>

                        {!isCollapsed && (
                            <button
                                onClick={toggleSidebar}
                                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover,#1E1E2A)] transition-colors shrink-0"
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
                                className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover,#1E1E2A)] transition-colors border border-[var(--border)]/50"
                                title="Expand sidebar"
                                aria-label="Expand sidebar"
                            >
                                <PanelLeftOpen className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Nav Items */}
                    <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavItemClick(item.path)}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'
                                        } py-2.5 text-xs font-medium rounded-xl transition-all border-l-[3px] ${isActive
                                            ? 'bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-l-[var(--color-primary,#5B3AF2)] border-t-transparent border-b-transparent border-r-transparent'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)] border-l-transparent'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4 shrink-0" />
                                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer Section */}
                    <div className="p-3 border-t border-[var(--border)]/60 space-y-1.5">
                        <button
                            onClick={() => navigate('/employer/profile')}
                            title={isCollapsed ? 'Profile' : undefined}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'
                                } py-2 text-xs font-medium rounded-xl transition-all border-l-[3px] ${location.pathname === '/employer/profile'
                                    ? 'bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-l-[var(--color-primary,#5B3AF2)] border-t-transparent border-b-transparent border-r-transparent'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)] border-l-transparent'
                                }`}
                        >
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" referrerPolicy="no-referrer" className="w-5 h-5 rounded-full object-cover shrink-0" />
                            ) : (
                                <div className="w-5 h-5 shrink-0 rounded-full bg-[var(--primary)]/20 text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center text-[10px] font-bold uppercase border border-[var(--primary)]/30">
                                    {user?.name ? user.name.substring(0, 1) : "U"}
                                </div>
                            )}
                            {!isCollapsed && <span className="truncate">{user?.name || "Profile"}</span>}
                        </button>

                        <button
                            onClick={() => navigate('/employer/contact')}
                            title={isCollapsed ? 'Contact Us' : undefined}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'
                                } py-2 text-xs font-medium rounded-xl transition-all border-l-[3px] ${location.pathname === '/employer/contact'
                                    ? 'bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-l-[var(--color-primary,#5B3AF2)] border-t-transparent border-b-transparent border-r-transparent'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)] border-l-transparent'
                                }`}
                        >
                            <HelpCircle className="w-4 h-4 shrink-0" />
                            {!isCollapsed && <span className="truncate">Contact Us</span>}
                        </button>

                        <button
                            onClick={handleLogout}
                            title={isCollapsed ? 'Logout' : undefined}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'
                                } py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border-l-[3px] border-l-transparent`}
                        >
                            <LogOut className="w-4 h-4 shrink-0" />
                            {!isCollapsed && <span className="truncate">Logout</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content Area: margin-left strictly matches the sidebar width */}
                <main
                    className={`flex-1 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'
                        } transition-all duration-300 ease-in-out w-full min-w-0 overflow-x-clip`}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
}


