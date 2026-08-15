import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Mail,
  Phone,
  Clock,
  Sparkles,
  Copy,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Zap,
  Headphones,
  ArrowRight,
  ExternalLink,
  Target,
  FileCheck
} from "lucide-react";

export default function EmployerVerificationPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const adminEmail = "forktalent@gmail.com";
  const adminPhone = "+91 86550 21064";
  const adminPhoneClean = "+918655021064";
  const whatsappCleanNumber = "8655021064";
  const whatsappNumber = "+91 86550 21064";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopiedEmail(true);
    toast.success("Support email copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="w-full min-h-screen bg-transparent font-['Inter'] pb-24 text-[var(--color-text-primary)]">
      <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 space-y-8">

        {/* Page Header */}
        <header className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-3 relative overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/30 text-xs font-medium inline-flex items-center gap-1.5">
                  <Headphones className="w-3 h-3" />
                  <span>Employer Operations & Help Desk</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium text-[var(--color-text-primary)] tracking-tight">
                Help & Support
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                Direct contact channels for custom hiring drive creation, tailored campaigns, candidate re-enrollment, and instant issue fixes.
              </p>
            </div>

            <div className="shrink-0 p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1 text-xs self-start sm:self-auto min-w-[200px]">
              <span className="text-[11px] text-[var(--color-text-muted)] font-medium block">
                Support Hours (Mon–Sat)
              </span>
              <div className="flex items-center gap-1.5 text-[var(--color-text-accent)] font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>9:00 AM – 8:00 PM EST</span>
              </div>
            </div>
          </div>
        </header>

        {/* Highlight Banner: WhatsApp for Custom Drives & Campaigns */}
        <div className="bg-[var(--color-surface)] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-4 relative overflow-hidden shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                <span>Custom Hiring Drives & Priority Fixes</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-medium text-[var(--color-text-primary)] tracking-tight">
                Need a custom campaign, bulk hiring drive, or immediate issue resolution?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
                Connect with our recruitment operations team on WhatsApp to configure custom technical syllabi, benchmark answers, campus drives, or get quick fixes for active candidate sessions.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5">
              <a
                href={`https://wa.me/${whatsappCleanNumber}?text=Hello%20ForkTalent%20Team,%20I%20want%20to%20set%20up%20a%20custom%20hiring%20drive%20/%20campaign.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors inline-flex items-center gap-2 shadow-sm shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
              <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                {whatsappNumber}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Core Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: WhatsApp Priority Desk */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xs transition-colors hover:border-[var(--color-border-active)]/40">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    WhatsApp Desk
                  </h3>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-medium border border-emerald-500/20">
                    Fastest
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                  Best for bespoke campaign setups, bulk candidate screening drives, and live session troubleshooting.
                </p>
              </div>
              <div className="font-mono text-xs text-[var(--color-text-primary)] font-medium pt-1">
                {whatsappNumber}
              </div>
            </div>

            <a
              href={`https://wa.me/${whatsappCleanNumber}?text=Hello%20ForkTalent%20Team,%20I%20need%20support%20with%20an%20employer%20campaign.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Message on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 2: Support Email */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xs transition-colors hover:border-[var(--color-border-active)]/40">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Support Email
                  </h3>
                  <span className="text-[10px] text-[var(--color-text-accent)] bg-[var(--primary-tint)] px-2 py-0.5 rounded-md font-medium border border-[var(--color-border-active)]/20">
                    Official Desk
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                  Ideal for formal inquiries, account verification updates, and detailed technical ticket requests.
                </p>
              </div>
              <div className="font-mono text-xs text-[var(--color-text-primary)] font-medium pt-1 truncate select-all">
                {adminEmail}
              </div>
            </div>

            <button
              onClick={handleCopyEmail}
              className="w-full py-2.5 rounded-xl bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedEmail ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Email Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[var(--color-text-accent)]" />
                  <span>Copy Support Email</span>
                </>
              )}
            </button>
          </div>

          {/* Card 3: Priority Phone Line */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xs transition-colors hover:border-[var(--color-border-active)]/40">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Priority Phone Line
                  </h3>
                  <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-canvas)] px-2 py-0.5 rounded-md font-medium border border-[var(--color-border)]">
                    Voice Line
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                  Speak directly with an operations representative during business hours for urgent assistance.
                </p>
              </div>
              <div className="font-mono text-xs text-[var(--color-text-primary)] font-medium pt-1">
                {adminPhone}
              </div>
            </div>

            <a
              href={`tel:${adminPhoneClean}`}
              className="w-full py-2.5 rounded-xl bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[var(--color-text-accent)]" />
              <span>Call Priority Line</span>
            </a>
          </div>

        </div>

        {/* Info Grid: Topics & SLA Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Topics Box */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center">
                <Target className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
                What we can assist you with
              </h2>
            </div>

            <div className="space-y-3 text-xs text-[var(--color-text-secondary)] font-normal leading-relaxed">
              <div className="p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                <span className="font-medium text-[var(--color-text-primary)] block">Custom Hiring Drives & Campus Screening</span>
                <p>Configure specialized multi-topic interview campaigns for batch screening with automated ranking.</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                <span className="font-medium text-[var(--color-text-primary)] block">Account Verification Fast-Tracking</span>
                <p>Submit company documents to expedite verification approval and unblock candidate access.</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                <span className="font-medium text-[var(--color-text-primary)] block">Candidate Session Troubleshooting</span>
                <p>Assistance resetting candidate attempts or investigating connection interruptions.</p>
              </div>
            </div>
          </div>

          {/* SLA and Security Box */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
                Service commitments & turnaround
              </h2>
            </div>

            <div className="space-y-3 text-xs text-[var(--color-text-secondary)] font-normal leading-relaxed">
              <div className="p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                <span className="font-medium text-[var(--color-text-primary)] block">Fast WhatsApp Turnaround</span>
                <p>Average response within 15–30 minutes during active hours (Mon–Sat, 9:00 AM – 8:00 PM EST).</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                <span className="font-medium text-[var(--color-text-primary)] block">Email Support Desk</span>
                <p>Inquiries received by email are addressed within 2 to 4 business hours.</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                <span className="font-medium text-[var(--color-text-primary)] block">Data Privacy & Security</span>
                <p>All campaign specifications and applicant information remain strictly confidential.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
