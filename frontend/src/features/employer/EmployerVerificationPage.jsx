import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Clock,
  Sparkles,
  Briefcase,
  Bot,
  BarChart3,
  Users,
  Copy,
  CheckCircle2,
  Send,
  ArrowRight,
  HelpCircle,
  FileCheck,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  Download,
  FileDown,
  Target,
  Zap,
  Sliders,
  Award,
  Cpu,
  UserCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "../../ui/primitives/PageHeader";
import { GlassCard } from "../../ui/primitives/GlassCard";
import { SectionHeader } from "../../ui/primitives/SectionHeader";

const EmployerVerificationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const adminEmail = "intervuos@gmail.com";
  const adminPhone = "+91 86550 21064";
  const adminPhoneClean = "+918655021064";
  const whatsappNumber = "+91 86550 21064";
  const whatsappCleanNumber = "8655021064";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopiedEmail(true);
    toast.success("Admin email copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleExpressVerification = (e) => {
    e.preventDefault();
    if (!companyName.trim() || !websiteUrl.trim()) {
      return toast.error("Please provide your company name and website URL.");
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setRequestSent(true);
      toast.success("Express verification request sent to administrators!");
    }, 1200);
  };

  return (
    <div className="bg-transparent min-h-screen text-[var(--color-on-surface,#dae2fd)] font-['Inter'] pb-24">
      <div className="max-w-[1300px] mx-auto p-4 md:p-8 space-y-10">

        {/* Page Header */}
        <PageHeader
          badgeIcon={HelpCircle}
          badgeText="Support & Contact"
          title="Employer platform support & contact"
          description="Reach out directly to the IntervuOS administrative team for dedicated support, platform onboarding, and custom enterprise requirements."
        />

        {/* Contact Details Section */}
        <div className="max-w-4xl mx-auto">

          {/* Contact Details Card (Including WhatsApp, Email, Phone) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard padding="p-6 md:p-8" className="h-full flex flex-col justify-between space-y-6">
              <div>
                <SectionHeader
                  icon={Mail}
                  title="Direct Admin & Verification Contact Desk"
                  subtitle="Need priority account activation? Reach out to our administrative verification team directly."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* WhatsApp Priority Desk */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      WhatsApp Priority Desk
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--color-on-surface)]">
                        {whatsappNumber}
                      </span>
                      <a
                        href={`https://wa.me/${whatsappCleanNumber}?text=Hello%20IntervuOS%20Team,%20I%20need%20priority%20employer%20verification%20and%20custom%20campaign%20setup.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-md shadow-emerald-500/20 shrink-0"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Chat
                      </a>
                    </div>
                  </div>

                  {/* Email Support */}
                  <div className="p-4 rounded-xl bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                      Verification Desk Email
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--color-on-surface)] select-all truncate">
                        {adminEmail}
                      </span>
                      <button
                        onClick={handleCopyEmail}
                        className="p-1.5 rounded-lg bg-[var(--color-primary-md3)]/10 hover:bg-[var(--color-primary-md3)]/20 text-[var(--color-primary-md3)] transition-colors border border-[var(--color-primary-md3)]/20 shrink-0"
                        title="Copy Email"
                      >
                        {copiedEmail ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Phone Hotline */}
                  <div className="p-4 rounded-xl bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                      Employer Priority Line
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--color-on-surface)]">
                        {adminPhone}
                      </span>
                      <a
                        href={`tel:${adminPhoneClean}`}
                        className="px-3 py-1.5 rounded-lg bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-md shadow-[var(--color-primary-md3)]/20 shrink-0"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    </div>
                  </div>

                  {/* Hours & SLA */}
                  <div className="p-4 rounded-xl bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                      Operating Hours & SLA
                    </span>
                    <p className="text-xs font-medium text-[var(--color-on-surface-variant)]">
                      Mon – Sat: 9:00 AM – 8:00 PM EST<br />
                      Average review turnaround: <span className="font-bold text-[var(--color-on-surface)]">2-12 hours</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--color-outline-variant)]/30 text-[11px] text-[var(--color-on-surface-variant)]/70 italic flex items-center gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 text-[var(--color-primary-md3)]" />
                <span>Verification protects campaign candidates from unverified recruiters.</span>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Section Divider */}
        <div className="border-t border-[var(--color-outline-variant)]/20 my-6" />

        {/* NEW DEDICATED SECTION: Customized Campaigns for Candidate Shortlisting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard padding="p-8 md:p-10" className="border-[var(--color-primary-md3)]/30 bg-gradient-to-b from-[var(--color-primary-md3)]/10 via-transparent to-purple-950/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary-md3)]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--color-outline-variant)]/30 pb-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--color-primary-md3)]/20 text-[var(--color-primary-md3)] border border-[var(--color-primary-md3)]/40 text-[10px] font-black uppercase tracking-widest">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Bespoke Recruitment Engine
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                    Customized Campaigns for Candidate Shortlisting
                  </h2>
                  <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] leading-relaxed font-medium">
                    Automate 100% of candidate screening with zero human interviewer overhead. Define exact custom questions, target benchmark answer criteria, and get instant downloadable candidate scorecards & reports.
                  </p>
                </div>

                <a
                  href={`https://wa.me/${whatsappCleanNumber}?text=Hi%20IntervuOS%20Team,%20I'm%20interested%20in%20setting%20up%20a%20Customized%20Candidate%20Shortlisting%20Campaign.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 shrink-0 self-start md:self-auto"
                >
                  <MessageSquare className="w-4 h-4" />
                  Request Custom Setup on WhatsApp
                </a>
              </div>

              {/* Enhanced Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Feature 1: Zero Manpower Autonomous Interviews */}
                <div className="p-6 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 space-y-4 hover:border-[var(--color-primary-md3)]/40 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                      100% Autonomous (No Manpower Required)
                    </h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed font-medium">
                      Zero human interview panels needed. The AI interviewer conducts full interactive voice & technical evaluations 24/7 without recruiter scheduling fatigue.
                    </p>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-[var(--color-on-surface-variant)] font-semibold border-t border-[var(--color-outline-variant)]/20 pt-3">
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Zero manual scheduling
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Parallel 24/7 evaluation
                    </li>
                  </ul>
                </div>

                {/* Feature 2: Custom Questions & Target Benchmark Answers */}
                <div className="p-6 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 space-y-4 hover:border-[var(--color-primary-md3)]/40 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                      Custom Questions & Benchmark Answer Keys
                    </h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed font-medium">
                      Specify exact custom questions, technical scenarios, and target benchmark answers. The AI evaluates candidates against your exact standard to find ideal fits.
                    </p>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-[var(--color-on-surface-variant)] font-semibold border-t border-[var(--color-outline-variant)]/20 pt-3">
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Custom technical rubrics
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Ideal candidate profiling
                    </li>
                  </ul>
                </div>

                {/* Feature 3: Downloadable Candidate Scorecard & PDF Reports */}
                <div className="p-6 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 space-y-4 hover:border-[var(--color-primary-md3)]/40 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileDown className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                      Downloadable Scorecard & PDF Reports
                    </h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed font-medium">
                      Generate and download full candidate evaluation PDF reports with quantitative score breakdowns, full interview transcripts, and audio playback.
                    </p>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-[var(--color-on-surface-variant)] font-semibold border-t border-[var(--color-outline-variant)]/20 pt-3">
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> 1-Click PDF exports
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Full audio & transcript logs
                    </li>
                  </ul>
                </div>

                {/* Feature 4: Effortless Screening & Instant Shortlist */}
                <div className="p-6 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 space-y-4 hover:border-[var(--color-primary-md3)]/40 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                      Instant Shortlist & Automated Ranking
                    </h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed font-medium">
                      Filter top 10% candidates automatically based on skill match scores. Instantly eliminate unqualified applicants without scanning stacks of resumes.
                    </p>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-[var(--color-on-surface-variant)] font-semibold border-t border-[var(--color-outline-variant)]/20 pt-3">
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Automated candidate ranking
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Instant top-performer tags
                    </li>
                  </ul>
                </div>

                {/* Feature 5: Anti-Cheating & Integrity Audit */}
                <div className="p-6 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 space-y-4 hover:border-[var(--color-primary-md3)]/40 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                      Anti-Cheating & Integrity Audit
                    </h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed font-medium">
                      Built-in session monitoring flags window tab switches, suspicious pauses, or candidate impersonation to ensure verified, tamper-proof evaluations.
                    </p>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-[var(--color-on-surface-variant)] font-semibold border-t border-[var(--color-outline-variant)]/20 pt-3">
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Tab-switch detection
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Anti-tamper audit logs
                    </li>
                  </ul>
                </div>

                {/* Feature 6: Express Custom Setup SLA */}
                <div className="p-6 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 space-y-4 hover:border-[var(--color-primary-md3)]/40 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                      Bespoke Campaign Setup SLA
                    </h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed font-medium">
                      Need custom engineering tracks or complex domain questions? Our AI prompt engineering team builds bespoke campaign setups for your organization within 24 hours.
                    </p>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-[var(--color-on-surface-variant)] font-semibold border-t border-[var(--color-outline-variant)]/20 pt-3">
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Dedicated prompt engineering
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Tailored scoring weights
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Employer Platform Capabilities Showcase */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 bg-[var(--color-primary-md3)]/15 text-[var(--color-primary-md3)] border border-[var(--color-primary-md3)]/30 rounded-full text-[10px] font-black uppercase tracking-widest">
              Built Exclusively for Recruiters & Hiring Managers
            </span>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[var(--color-on-surface)]">
              Next-Gen Autonomous Recruitment Suite
            </h2>
            <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] font-medium">
              Eliminate preliminary phone screens and manual interview scheduling. IntervuOS conducts AI-driven voice & technical assessments tailored to your exact job specifications.
            </p>
          </div>

          {/* Employer Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard padding="p-6" glowEffect className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-md3)]/15 border border-[var(--color-primary-md3)]/30 text-[var(--color-primary-md3)] flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                  1. Tailored Campaign Creation
                </h3>
                <p className="text-xs text-[var(--color-on-surface-variant)] font-medium leading-relaxed">
                  Specify target job roles, preset technical topics (React, Node.js, System Design, SQL), duration, and custom prompt guidelines for the AI engine.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary-md3)] flex items-center gap-1">
                Employer Feature <ArrowRight className="w-3 h-3" />
              </span>
            </GlassCard>

            <GlassCard padding="p-6" glowEffect className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                  2. Voice & Adaptive AI Interviewer
                </h3>
                <p className="text-xs text-[var(--color-on-surface-variant)] font-medium leading-relaxed">
                  Our voice-enabled AI interviewer conducts live interactive questioning, asking follow-ups, clarifying answers, and measuring technical depth autonomously.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1">
                Autonomous Engine <ArrowRight className="w-3 h-3" />
              </span>
            </GlassCard>

            <GlassCard padding="p-6" glowEffect className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                  3. Deep Evaluation Scorecards
                </h3>
                <p className="text-xs text-[var(--color-on-surface-variant)] font-medium leading-relaxed">
                  Recruiter scorecards feature quantitative skill scores, candidate transcripts, audio recording playback, anti-cheat detection, and re-enrollment tools.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                Instant Analytics <ArrowRight className="w-3 h-3" />
              </span>
            </GlassCard>

            <GlassCard padding="p-6" glowEffect className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                  4. Automated Candidate Invites
                </h3>
                <p className="text-xs text-[var(--color-on-surface-variant)] font-medium leading-relaxed">
                  Generate unique interview campaign join codes to invite candidates at scale. Monitor candidate progression in real-time from your employer console.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1">
                Scale Recruitment <ArrowRight className="w-3 h-3" />
              </span>
            </GlassCard>
          </div>

          {/* Photo & Media Showcase Placeholders */}
          <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                  Platform Interface Showcase
                </h3>
                <p className="text-xs text-[var(--color-on-surface-variant)] font-medium">
                  Visual preview of the IntervuOS employer dashboard, live interview environment, and scorecard analytics.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary-md3)] px-3 py-1 rounded-full bg-[var(--color-primary-md3)]/10 border border-[var(--color-primary-md3)]/30">
                Media Preview
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Photo Placeholder 1: Interview Operating System Interface */}
              <GlassCard padding="p-0" className="overflow-hidden group border-[var(--color-outline-variant)]/30">
                <div className="h-48 bg-[var(--color-surface-container-highest)]/40 relative flex flex-col items-center justify-center p-6 text-center border-b border-[var(--color-outline-variant)]/30 group-hover:bg-[var(--color-surface-container-highest)]/60 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-blue-900/20" />

                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary-md3)]/20 border border-[var(--color-primary-md3)]/40 text-[var(--color-primary-md3)] flex items-center justify-center shadow-lg">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary-md3)]">
                        UI Showcase Frame 1
                      </span>
                      <h4 className="text-xs font-bold text-[var(--color-on-surface)] mt-0.5">
                        Live AI Voice Interview Console
                      </h4>
                    </div>
                  </div>

                  {/* Dummy audio wave & avatar overlay representation */}
                  <div className="absolute bottom-3 inset-x-4 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live Audio Stream
                    </span>
                    <span>Gemini 2.5 Voice Engine</span>
                  </div>
                </div>
                <div className="p-4 space-y-1 bg-[var(--color-surface-container-low)]">
                  <h4 className="text-xs font-bold text-[var(--color-on-surface)] uppercase">AI Interview Room Interface</h4>
                  <p className="text-[11px] text-[var(--color-on-surface-variant)] font-medium">Real-time candidate speech synthesis, 3D avatar interaction, and automated question stream.</p>
                </div>
              </GlassCard>

              {/* Photo Placeholder 2: Candidate Evaluation Scorecard */}
              <GlassCard padding="p-0" className="overflow-hidden group border-[var(--color-outline-variant)]/30">
                <div className="h-48 bg-[var(--color-surface-container-highest)]/40 relative flex flex-col items-center justify-center p-6 text-center border-b border-[var(--color-outline-variant)]/30 group-hover:bg-[var(--color-surface-container-highest)]/60 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/20 via-transparent to-teal-900/20" />

                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        UI Showcase Frame 2
                      </span>
                      <h4 className="text-xs font-bold text-[var(--color-on-surface)] mt-0.5">
                        Candidate Evaluation Scorecard
                      </h4>
                    </div>
                  </div>

                  {/* Dummy score badge overlay */}
                  <div className="absolute bottom-3 inset-x-4 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-mono text-amber-300">
                    <span>Overall Score: 92 / 100</span>
                    <span className="text-emerald-400 font-bold">RECOMMENDED</span>
                  </div>
                </div>
                <div className="p-4 space-y-1 bg-[var(--color-surface-container-low)]">
                  <h4 className="text-xs font-bold text-[var(--color-on-surface)] uppercase">AI Scorecard & Radar Analytics</h4>
                  <p className="text-[11px] text-[var(--color-on-surface-variant)] font-medium">Detailed candidate score breakdowns, technical competence metrics, and full transcript history.</p>
                </div>
              </GlassCard>

              {/* Photo Placeholder 3: Campaign Configuration Engine */}
              <GlassCard padding="p-0" className="overflow-hidden group border-[var(--color-outline-variant)]/30">
                <div className="h-48 bg-[var(--color-surface-container-highest)]/40 relative flex flex-col items-center justify-center p-6 text-center border-b border-[var(--color-outline-variant)]/30 group-hover:bg-[var(--color-surface-container-highest)]/60 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 via-transparent to-purple-900/20" />

                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-lg">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                        UI Showcase Frame 3
                      </span>
                      <h4 className="text-xs font-bold text-[var(--color-on-surface)] mt-0.5">
                        Campaign Prompt Customizer
                      </h4>
                    </div>
                  </div>

                  {/* Dummy configuration overlay */}
                  <div className="absolute bottom-3 inset-x-4 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-mono text-purple-300">
                    <span>Topics: React, Node, System Design</span>
                    <span>Duration: 45 Min</span>
                  </div>
                </div>
                <div className="p-4 space-y-1 bg-[var(--color-surface-container-low)]">
                  <h4 className="text-xs font-bold text-[var(--color-on-surface)] uppercase">Technical Campaign Configurator</h4>
                  <p className="text-[11px] text-[var(--color-on-surface-variant)] font-medium">Configure customized interviewer prompt instructions, duration limits, and candidate join codes.</p>
                </div>
              </GlassCard>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployerVerificationPage;
