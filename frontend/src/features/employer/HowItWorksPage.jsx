import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    ShieldCheck,
    ShieldAlert,
    FileText,
    Users,
    Video,
    BarChart3,
    Settings,
    ArrowRight,
    CheckCircle2,
    Clock,
    Sparkles,
    Sliders,
    Layers,
    Share2,
    RotateCcw,
    Camera,
    HelpCircle,
    Info,
    ExternalLink,
    MessageSquare
} from 'lucide-react';

/**
 * Labeled screenshot placeholder component that renders a real image when imageSrc
 * is provided, or an elegant fallback placeholder frame with caption.
 */
const GuideScreenshot = ({ imageSrc, alt, caption }) => {
    if (imageSrc) {
        return (
            <div className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-canvas)] my-4 shadow-sm">
                <img src={imageSrc} alt={alt || caption} className="w-full h-auto object-cover max-h-[380px]" />
                {caption && (
                    <div className="px-3.5 py-2 bg-[var(--color-surface)] border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] flex items-center gap-1.5 font-medium">
                        <Camera className="w-3.5 h-3.5 shrink-0 text-[var(--color-text-accent)]" />
                        <span>{caption}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-hover)]/40 p-6 my-4 flex flex-col items-center justify-center text-center space-y-2.5 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] shadow-xs">
                <Camera className="w-5 h-5" />
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                    {caption || "Screenshot Preview"}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                    Visual walkthrough guide preview
                </p>
            </div>
        </div>
    );
};

export default function HowItWorksPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isVerified = user?.isVerified === true;

    return (
        <div className="w-full min-h-screen bg-transparent font-['Inter'] pb-24 text-[var(--color-text-primary)]">
            <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 space-y-8">

                {/* Hero / Orientation Header */}
                <header className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-4 relative overflow-hidden shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 max-w-3xl">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 text-xs font-medium inline-flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Employer workflow guide</span>
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-medium text-[var(--color-text-primary)] tracking-tight">
<<<<<<< HEAD
                                How ForkTalent works
                            </h1>
                            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                                A comprehensive walkthrough of the end-to-end recruitment lifecycle on ForkTalent — from account verification and campaign creation to candidate evaluation reports.
=======
                                How IntervuOS works
                            </h1>
                            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                                A comprehensive walkthrough of the end-to-end recruitment lifecycle on IntervuOS — from account verification and campaign creation to candidate evaluation reports.
>>>>>>> bc83f8f271ed2764f625168b80affb29ea5f449e
                            </p>
                        </div>

                        {/* Live Verification Status Card */}
                        <div className="shrink-0 p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-2 self-start md:self-auto min-w-[220px]">
                            <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                                Account status
                            </div>
                            <div className="flex items-center gap-2">
                                {isVerified ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Verified company</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        <span>Verification pending</span>
                                    </span>
                                )}
                            </div>
                            {!isVerified && (
                                <Link
                                    to="/employer/contact"
                                    className="text-[11px] text-[var(--color-text-accent)] hover:underline inline-flex items-center gap-1 font-medium pt-0.5"
                                >
                                    <span>Check status & support</span>
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* Top Highlight Banner: Custom Hiring Drives & Campaign Assistance */}
                <div className="bg-[var(--color-surface)] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-3xl">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                                <Sparkles className="w-3 h-3" />
                                <span>Custom Hiring Drives & Priority Campaign Setup</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-medium text-[var(--color-text-primary)] tracking-tight">
                                Want to create a custom hiring drive or tailored campaign?
                            </h2>
                            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                                Whether you're running a high-volume campus recruitment drive, need bespoke technical rubrics and benchmark answers, or require immediate setup assistance, connect directly with our operations team on WhatsApp.
                            </p>
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                            <a
<<<<<<< HEAD
                                href="https://wa.me/8655021064?text=Hello%20ForkTalent%20Team,%20I%20want%20to%20set%20up%20a%20custom%20hiring%20drive%20/%20campaign."
=======
                                href="https://wa.me/8655021064?text=Hello%20IntervuOS%20Team,%20I%20want%20to%20set%20up%20a%20custom%20hiring%20drive%20/%20campaign."
>>>>>>> bc83f8f271ed2764f625168b80affb29ea5f449e
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors inline-flex items-center gap-2 shadow-xs shrink-0"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Chat on WhatsApp</span>
                            </a>
                            <Link
                                to="/employer/contact"
                                className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs font-medium transition-colors inline-flex items-center gap-2 shrink-0"
                            >
                                <HelpCircle className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                                <span>Contact desk</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Vertical Stepper / Timeline (6 Stages) */}
                <div className="relative pl-6 sm:pl-10 space-y-8">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[17px] sm:left-[27px] top-6 bottom-6 w-px bg-[var(--color-border)] z-0" />

                    {/* STAGE 1: GET VERIFIED */}
                    <div className="relative z-10 space-y-4">
                        {/* Step Marker Node */}
                        <div className="absolute -left-6 sm:-left-10 top-5 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-xs">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center text-xs sm:text-sm font-medium border border-[var(--color-border-active,#6338F6)]/30">
                                1
                            </div>
                        </div>

                        {/* Stage Card */}
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs transition-colors hover:border-[var(--color-border-active,#6338F6)]/30">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                        </div>
                                        <h2 className="text-base sm:text-lg font-medium text-[var(--color-text-primary)] tracking-tight">
                                            Stage 1 — Get verified
                                        </h2>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-secondary)] font-normal">
                                        Build candidate trust and unlock candidate-facing campaign publishing
                                    </p>
                                </div>

                                {isVerified ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium self-start sm:self-auto">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Completed</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium self-start sm:self-auto">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Action required</span>
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                                <p>
                                    Every new employer account begins in an unverified state. Verification exists so candidates can trust that interview invitations originate from legitimate companies, and ensures that sensitive candidate evaluations and video recordings are strictly restricted to verified hiring teams.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                    <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1.5">
                                        <div className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                            <span>What to do</span>
                                        </div>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            Visit the Verification page or contact admin support to share your company name and official website. Review typically takes under 24 hours.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1.5">
                                        <div className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                                            <span>What happens next</span>
                                        </div>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            Once approved by the admin team, your Verified badge activates immediately and campaigns become active for candidate interviews.
                                        </p>
                                    </div>
                                </div>

                                {/* Explicit Clarification Callout */}
                                <div className="p-4 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 text-xs text-[var(--color-text-primary)] flex items-start gap-3">
                                    <Info className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)] shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="font-medium text-[var(--color-text-accent,#C4B5FD)]">Configuration is never blocked: </span>
                                        <span>
                                            You can build, customize, and configure full interview campaigns right away while waiting for verification. Only candidate-facing publishing is held until approval is granted.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {!isVerified && (
                                <div className="pt-2 flex flex-wrap items-center gap-3">
                                    <Link
                                        to="/employer/contact"
                                        className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
                                    >
                                        <span>Check status & support</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* STAGE 2: CREATE A CAMPAIGN */}
                    <div className="relative z-10 space-y-4">
                        {/* Step Marker Node */}
                        <div className="absolute -left-6 sm:-left-10 top-5 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-xs">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center text-xs sm:text-sm font-medium border border-[var(--color-border-active,#6338F6)]/30">
                                2
                            </div>
                        </div>

                        {/* Stage Card */}
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs transition-colors hover:border-[var(--color-border-active,#6338F6)]/30">
                            <div className="space-y-1 border-b border-[var(--color-border)] pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center">
                                        <FileText className="w-3.5 h-3.5" />
                                    </div>
                                    <h2 className="text-base sm:text-lg font-medium text-[var(--color-text-primary)] tracking-tight">
                                        Stage 2 — Create a campaign
                                    </h2>
                                </div>
                                <p className="text-xs text-[var(--color-text-secondary)] font-normal">
                                    Set up the role, syllabus topics, duration, and question generation strategy
                                </p>
                            </div>

                            <div className="space-y-4 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                                <p>
                                    Campaign creation is organized into a clean 5-step wizard (Essentials → Question Strategy → Candidate Invitations → AI Instructions → Review). You specify the target job title, seniority level, core skills, duration per question, and overall interview length.
                                </p>

                                {/* Question Strategy Decision Context */}
                                <div className="space-y-2.5">
                                    <div className="text-xs font-medium text-[var(--color-text-primary)]">
                                        Question generation strategies:
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                                            <span className="text-xs font-medium text-[var(--color-text-accent)] block">
                                                AI-Adaptive
                                            </span>
                                            <p className="text-[11px] text-[var(--color-text-secondary)] leading-normal">
                                                The AI dynamically invents follow-up questions tailored in real time to the candidate's previous answers, probing edge cases and technical depth.
                                            </p>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                                            <span className="text-xs font-medium text-[var(--color-text-accent)] block">
                                                Employer Preset
                                            </span>
                                            <p className="text-[11px] text-[var(--color-text-secondary)] leading-normal">
                                                You define the exact list of questions. Every candidate receives identical questions in identical order for rigid, standardized comparability.
                                            </p>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                                            <span className="text-xs font-medium text-[var(--color-text-accent)] block">
                                                Hybrid
                                            </span>
                                            <p className="text-[11px] text-[var(--color-text-secondary)] leading-normal">
                                                Combines your required preset questions with dynamic AI follow-ups whenever a candidate's response requires deeper technical clarification.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1.5">
                                    <div className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                                        <span>What happens next</span>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        Upon publishing, the campaign generates a unique 6-character interview code (e.g. <span className="font-mono text-[var(--color-text-accent)]">ABC123</span>) and appears immediately on your Employer Dashboard.
                                    </p>
                                </div>

                                {/* Custom Hiring Drive & Campaign Assistance Callout */}
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-[var(--color-text-primary)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start gap-2.5">
                                        <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                            <span className="font-medium text-emerald-400">Want to create a custom hiring drive or tailored campaign? </span>
                                            <p className="text-[11px] text-[var(--color-text-secondary)]">
                                                Our team can configure bespoke role tracks, campus drives, and custom benchmark answer rubrics for you.
                                            </p>
                                        </div>
                                    </div>
                                    <a
<<<<<<< HEAD
                                        href="https://wa.me/8655021064?text=Hello%20ForkTalent%20Team,%20I%20want%20help%20setting%20up%20a%20custom%20campaign%20or%20hiring%20drive."
=======
                                        href="https://wa.me/8655021064?text=Hello%20IntervuOS%20Team,%20I%20want%20help%20setting%20up%20a%20custom%20campaign%20or%20hiring%20drive."
>>>>>>> bc83f8f271ed2764f625168b80affb29ea5f449e
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>WhatsApp Us</span>
                                    </a>
                                </div>

                                {/* Placeholder Screenshot */}
                                <GuideScreenshot
                                    caption="Screenshot: 5-step campaign creation wizard"
                                    alt="Campaign creation wizard preview"
                                />
                            </div>

                            <div className="pt-2 flex flex-wrap items-center gap-3">
                                <Link
                                    to="/employer/create-interview"
                                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
                                >
                                    <span>Create a campaign</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                                <Link
                                    to="/employer/contact"
                                    className="bg-[var(--primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--primary-tint,rgba(99,56,246,0.15))]/80 text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/40 text-xs font-medium px-4 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
                                >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    <span>Contact us for custom drive</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* STAGE 3: GET CANDIDATES IN */}
                    <div className="relative z-10 space-y-4">
                        {/* Step Marker Node */}
                        <div className="absolute -left-6 sm:-left-10 top-5 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-xs">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center text-xs sm:text-sm font-medium border border-[var(--color-border-active,#6338F6)]/30">
                                3
                            </div>
                        </div>

                        {/* Stage Card */}
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs transition-colors hover:border-[var(--color-border-active,#6338F6)]/30">
                            <div className="space-y-1 border-b border-[var(--color-border)] pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center">
                                        <Users className="w-3.5 h-3.5" />
                                    </div>
                                    <h2 className="text-base sm:text-lg font-medium text-[var(--color-text-primary)] tracking-tight">
                                        Stage 3 — Get candidates in
                                    </h2>
                                </div>
                                <p className="text-xs text-[var(--color-text-secondary)] font-normal">
                                    Two flexible enrollment pathways: direct email invitations or public code sharing
                                </p>
                            </div>

                            <div className="space-y-4 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                                <p>
<<<<<<< HEAD
                                    ForkTalent supports two complementary ways to enroll candidates. You can use either method exclusively, or combine both on the same active campaign:
=======
                                    IntervuOS supports two complementary ways to enroll candidates. You can use either method exclusively, or combine both on the same active campaign:
>>>>>>> bc83f8f271ed2764f625168b80affb29ea5f449e
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-2">
                                        <div className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                                            <span className="px-2 py-0.5 rounded-md bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent)] text-[10px]">Method A</span>
                                            <span>Direct Email Invitations</span>
                                        </div>
                                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                            Add candidate emails directly from the campaign details screen — enter individual emails, paste a bulk list, or upload a CSV file. Candidates are pre-enrolled with pre-allocated access.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-2">
                                        <div className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                                            <span className="px-2 py-0.5 rounded-md bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent)] text-[10px]">Method B</span>
                                            <span>Share Interview Code</span>
                                        </div>
                                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                            Distribute your campaign's unique code on job postings or social channels. Candidates enter the code to join and appear on your candidate roster under <span className="font-medium text-[var(--color-text-primary)]">"Requested"</span> status for 1-click approval or rejection.
                                        </p>
                                    </div>
                                </div>

                                {/* Placeholder Screenshot */}
                                <GuideScreenshot
                                    caption="Screenshot: candidate invitations & interview code sharing"
                                    alt="Candidate invite management preview"
                                />
                            </div>
                        </div>
                    </div>

                    {/* STAGE 4: CANDIDATE TAKES THE INTERVIEW */}
                    <div className="relative z-10 space-y-4">
                        {/* Step Marker Node */}
                        <div className="absolute -left-6 sm:-left-10 top-5 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-xs">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center text-xs sm:text-sm font-medium border border-[var(--color-border-active,#6338F6)]/30">
                                4
                            </div>
                        </div>

                        {/* Stage Card */}
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs transition-colors hover:border-[var(--color-border-active,#6338F6)]/30">
                            <div className="space-y-1 border-b border-[var(--color-border)] pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center">
                                        <Video className="w-3.5 h-3.5" />
                                    </div>
                                    <h2 className="text-base sm:text-lg font-medium text-[var(--color-text-primary)] tracking-tight">
                                        Stage 4 — Candidate takes the interview
                                    </h2>
                                </div>
                                <p className="text-xs text-[var(--color-text-secondary)] font-normal">
                                    Privacy disclosure, hardware readiness check, and the live AI session
                                </p>
                            </div>

                            <div className="space-y-4 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                                <p>
                                    Knowing the candidate's exact experience helps your team communicate clear expectations before candidates launch their interview session:
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
                                        <div className="w-5 h-5 rounded-md bg-[var(--primary-tint)] text-[var(--color-text-accent)] flex items-center justify-center shrink-0 mt-0.5 text-xs font-medium">
                                            1
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-xs font-medium text-[var(--color-text-primary)]">Device & Privacy Check</span>
                                            <p className="text-xs text-[var(--color-text-secondary)]">
                                                Candidates complete an interactive hardware check to confirm microphone audio capture, camera functionality, network bandwidth, and AI data consent.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
                                        <div className="w-5 h-5 rounded-md bg-[var(--primary-tint)] text-[var(--color-text-accent)] flex items-center justify-center shrink-0 mt-0.5 text-xs font-medium">
                                            2
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-xs font-medium text-[var(--color-text-primary)]">Live Speech Interaction</span>
                                            <p className="text-xs text-[var(--color-text-secondary)]">
                                                The conversational AI avatar conducts the interview with real-time speech recognition and speech-to-text transcription.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
                                        <div className="w-5 h-5 rounded-md bg-[var(--primary-tint)] text-[var(--color-text-accent)] flex items-center justify-center shrink-0 mt-0.5 text-xs font-medium">
                                            3
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-xs font-medium text-[var(--color-text-primary)]">Timed & Non-Pausable</span>
                                            <p className="text-xs text-[var(--color-text-secondary)]">
                                                To preserve evaluation integrity and authenticity across all applicants, active sessions are timed per question and cannot be paused once initiated.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STAGE 5: REVIEW RESULTS */}
                    <div className="relative z-10 space-y-4">
                        {/* Step Marker Node */}
                        <div className="absolute -left-6 sm:-left-10 top-5 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-xs">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center text-xs sm:text-sm font-medium border border-[var(--color-border-active,#6338F6)]/30">
                                5
                            </div>
                        </div>

                        {/* Stage Card */}
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs transition-colors hover:border-[var(--color-border-active,#6338F6)]/30">
                            <div className="space-y-1 border-b border-[var(--color-border)] pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center">
                                        <BarChart3 className="w-3.5 h-3.5" />
                                    </div>
                                    <h2 className="text-base sm:text-lg font-medium text-[var(--color-text-primary)] tracking-tight">
                                        Stage 5 — Review results
                                    </h2>
                                </div>
                                <p className="text-xs text-[var(--color-text-secondary)] font-normal">
                                    Comprehensive AI evaluation report, video session playback, and collaborative sharing
                                </p>
                            </div>

                            <div className="space-y-4 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                                <p>
                                    As soon as an interview concludes, our evaluation engine analyzes the full audio transcript and recording to generate an immediate, objective Candidate Evaluation Report:
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                                        <span className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                            <span>Overall Score & Interpretation</span>
                                        </span>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            A calibrated 0–10 rating with AI summary reasoning and hire/borderline recommendations.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                                        <span className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                            <span>4-Metric Breakdown</span>
                                        </span>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            Detailed ratings across Technical ability, Communication, Confidence, and Problem solving.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                                        <span className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                                            <span>Strengths & Growth Areas</span>
                                        </span>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            Actionable AI takeaways highlighting standout skills and specific improvement opportunities.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                                        <span className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                            <span>Video Replay & Markers</span>
                                        </span>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            Interactive session replay with hoverable question timeline points and synchronized transcript.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1.5">
                                    <div className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                                        <Share2 className="w-3.5 h-3.5 text-[var(--color-text-accent)]" />
                                        <span>Share Link for Team Review</span>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        Generate a non-expiring evaluation link to share with technical interviewers, hiring managers, or team leads without requiring login credentials.
                                    </p>
                                </div>

                                {/* Placeholder Screenshot */}
                                <GuideScreenshot
                                    caption="Screenshot: candidate evaluation report & video replay"
                                    alt="Evaluation report workspace preview"
                                />
                            </div>
                        </div>
                    </div>

                    {/* STAGE 6: MANAGE THE CAMPAIGN */}
                    <div className="relative z-10 space-y-4">
                        {/* Step Marker Node */}
                        <div className="absolute -left-6 sm:-left-10 top-5 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-xs">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center text-xs sm:text-sm font-medium border border-[var(--color-border-active,#6338F6)]/30">
                                6
                            </div>
                        </div>

                        {/* Stage Card */}
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs transition-colors hover:border-[var(--color-border-active,#6338F6)]/30">
                            <div className="space-y-1 border-b border-[var(--color-border)] pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center">
                                        <Settings className="w-3.5 h-3.5" />
                                    </div>
                                    <h2 className="text-base sm:text-lg font-medium text-[var(--color-text-primary)] tracking-tight">
                                        Stage 6 — Manage the campaign
                                    </h2>
                                </div>
                                <p className="text-xs text-[var(--color-text-secondary)] font-normal">
                                    Ongoing administrative controls: completing, editing, re-enrolling, or deleting
                                </p>
                            </div>

                            <div className="space-y-4 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                                <p>
                                    From your campaign's detail page, you retain full operational authority throughout the recruitment cycle:
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                                        <span className="text-xs font-medium text-[var(--color-text-primary)] block">
                                            Complete Campaign
                                        </span>
                                        <p className="text-xs text-[var(--color-text-secondary)] leading-normal">
                                            Closes the campaign to any new candidate attempts while preserving all existing evaluation reports.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                                        <span className="text-xs font-medium text-[var(--color-text-primary)] block">
                                            Edit Configuration
                                        </span>
                                        <p className="text-xs text-[var(--color-text-secondary)] leading-normal">
                                            Modify campaign title, job description, duration, or topics as requirements evolve.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                                        <span className="text-xs font-medium text-[var(--color-text-primary)] block">
                                            Re-enroll Candidate
                                        </span>
                                        <p className="text-xs text-[var(--color-text-secondary)] leading-normal">
                                            Reset a candidate's session to allow a fresh attempt if they encountered hardware or connection issues.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                                        <span className="text-xs font-medium text-rose-400 block">
                                            Delete Campaign
                                        </span>
                                        <p className="text-xs text-[var(--color-text-secondary)] leading-normal">
                                            Permanently purge the campaign, candidate roster, and all evaluations (irreversible).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-wrap items-center gap-3">
                                <Link
                                    to="/employer/dashboard"
                                    className="bg-[var(--primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--primary-tint,rgba(99,56,246,0.15))]/80 text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/40 text-xs font-medium px-4 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
                                >
                                    <span>Go to employer dashboard</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
