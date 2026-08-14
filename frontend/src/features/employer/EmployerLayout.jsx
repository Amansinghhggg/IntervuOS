import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, CreditCard, HelpCircle, LogOut, Menu, X, User, ShieldAlert, Sun, Moon, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../ui/shared/ThemeProvider';
import { toast } from 'react-hot-toast';

export default function EmployerLayout() {
    const { user, logout } = useAuth();
    const { employerTheme, toggleEmployerTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(false);

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
        ...(!user?.isVerified ? [{ label: "Verification Status", icon: ShieldAlert, path: "/employer/verification-pending" }] : []),
        { label: "New Campaign", icon: FileText, path: "/employer/create-interview" },
        { label: "Manage Subscriptions", icon: CreditCard, path: "/employer/subscriptions" },
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] font-['Inter'] flex flex-col">
            
            {/* Top Exponent Style Promo Banner */}
            {!bannerDismissed && (
                <div className="bg-[#6338F6] text-white py-2 px-4 text-xs font-semibold flex items-center justify-between relative z-50 shadow-md">
                    <div className="flex-1 flex items-center justify-center gap-2 text-center">
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider">New</span>
                        <span>IntervuOS AI Interview Engine 2.0 is live!</span>
                        <button 
                            onClick={() => navigate('/employer/create-interview')}
                            className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-90 transition-opacity font-bold ml-1"
                        >
                            Try it out <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    <button 
                        onClick={() => setBannerDismissed(true)} 
                        className="text-white/80 hover:text-white p-1 rounded-md transition-colors"
                        aria-label="Dismiss banner"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

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
                        {/* Theme Toggle Control */}
                        <button
                            onClick={toggleEmployerTheme}
                            className="p-2 rounded-xl bg-[var(--background-secondary)] text-[var(--text-primary)] hover:border-[var(--border-active,#6338F6)] transition-colors border border-[var(--border)]"
                            title={`Switch to ${employerTheme === 'dark' ? 'Light' : 'Dark'} Theme`}
                            aria-label="Toggle Employer theme"
                        >
                            {employerTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                        </button>
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
                        <nav className="space-y-2 bg-[var(--card)] border border-[var(--border)] p-4 rounded-3xl shadow-2xl">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        handleNavItemClick(item.path);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                                        location.pathname === item.path
                                            ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)]'
                                    }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-3xl shadow-2xl space-y-2">
                            <button
                                onClick={() => {
                                    navigate('/employer/profile');
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                                    location.pathname === '/employer/profile'
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)]'
                                }`}
                            >
                                <User className="w-4 h-4" />
                                <span>Profile</span>
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/employer/contact');
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                                    location.pathname === '/employer/contact' || location.pathname === '/employer/verification-pending'
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)]'
                                }`}
                            >
                                <HelpCircle className="w-4 h-4" />
                                <span>Contact Us</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Desktop Expandable Sidebar (hidden on < md screens) */}
                <aside className="hidden md:flex group w-20 hover:w-72 border-r border-[var(--border)] bg-[var(--card)] flex-col fixed bottom-0 top-0 left-0 z-40 transition-all duration-300 overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between p-5 mb-4 min-w-[288px]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--primary)]/30">
                                IO
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                <h1 className="text-sm font-black tracking-tight text-[var(--text-primary)]">IntervuOS</h1>
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Recruitment Suite</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2 px-4 min-w-[288px]">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => handleNavItemClick(item.path)}
                                className={`w-full flex items-center gap-4 px-3 py-3 text-sm font-bold rounded-xl transition-all ${
                                    location.pathname === item.path
                                        ? 'bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--primary)] border border-[var(--primary)]/30 shadow-[0_0_15px_rgba(91,58,242,0.15)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                <item.icon className="w-6 h-6 shrink-0" />
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-[var(--border)] space-y-2 min-w-[288px]">
                        {/* Theme Toggle Button in Desktop Sidebar */}
                        <button
                            onClick={toggleEmployerTheme}
                            className="w-full flex items-center gap-4 px-3 py-2.5 text-sm font-bold rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)] transition-all"
                            title={`Switch to ${employerTheme === 'dark' ? 'Light' : 'Dark'} Theme`}
                        >
                            {employerTheme === 'dark' ? (
                                <Sun className="w-6 h-6 shrink-0 text-amber-400" />
                            ) : (
                                <Moon className="w-6 h-6 shrink-0 text-indigo-400" />
                            )}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                {employerTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </span>
                        </button>

                        <button
                            onClick={() => navigate('/employer/profile')}
                            className={`w-full flex items-center gap-4 px-3 py-3 text-sm font-bold rounded-xl transition-all ${
                                location.pathname === '/employer/profile'
                                    ? 'bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--primary)] border border-[var(--primary)]/30 shadow-[0_0_15px_rgba(91,58,242,0.15)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)]'
                            }`}
                        >
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full object-cover shrink-0" />
                            ) : (
                                <div className="w-6 h-6 shrink-0 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center text-[10px] font-black uppercase border border-[var(--primary)]/30">
                                    {user?.name ? user.name.substring(0, 1) : "U"}
                                </div>
                            )}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Profile</span>
                        </button>
                        <button
                            onClick={() => navigate('/employer/contact')}
                            className={`w-full flex items-center gap-4 px-3 py-3 text-sm font-bold rounded-xl transition-all ${
                                location.pathname === '/employer/contact' || location.pathname === '/employer/verification-pending'
                                    ? 'bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--primary)] border border-[var(--primary)]/30 shadow-[0_0_15px_rgba(91,58,242,0.15)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover,#1E1E2A)] hover:text-[var(--text-primary)]'
                            }`}
                        >
                            <HelpCircle className="w-6 h-6 shrink-0" />
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Contact Us</span>
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 px-3 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                            <LogOut className="w-6 h-6 shrink-0" />
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 md:ml-20 transition-all duration-300 w-full overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

