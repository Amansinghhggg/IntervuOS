import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Users,
  Briefcase,
  Clock,
  Tag,
  Key,
  CheckCircle2,
  Calendar,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Sparkles,
  AlignLeft,
  Play,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const InterviewDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCandidate, setSearchCandidate] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCandidateEmail, setNewCandidateEmail] = useState("");
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [addMode, setAddMode] = useState("single"); // 'single' | 'bulk' | 'csv'
  const [bulkEmails, setBulkEmails] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const fetchInterview = async () => {
    try {
      const { data } = await api.get(`/interviews/${id}`);
      if (data.success) {
        setInterview(data.interview);
      }
    } catch (error) {
      toast.error("Failed to load interview details");
      navigate("/employer/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const deleteInterview = async () => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const { data } = await api.delete(`/interviews/${id}`);
      if (data.success) {
        toast.success("Campaign deleted");
        navigate("/employer/dashboard");
      }
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  const removeCandidate = async (email) => {
    if (!window.confirm(`Are you sure you want to remove ${email}?`)) return;
    try {
      const { data } = await api.patch(`/interviews/${id}`, { removeCandidateEmail: email });
      if (data.success) {
        toast.success("Candidate removed");
        setInterview(data.interview);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove candidate");
    }
  };

  const completeInterview = async () => {
    if (window.confirm("Are you sure you want to mark this interview as completed? It will no longer be available for candidates to take.")) {
      try {
        const { data } = await api.patch(`/interviews/${id}`, { status: "completed" });
        if (data.success) {
          toast.success("Interview marked as completed");
          setInterview(data.interview);
        }
      } catch (error) {
        toast.error("Failed to complete interview");
      }
    }
  };

  const activateInterview = async () => {
    if (window.confirm("Are you sure you want to reactivate this interview? Candidates will be able to take it again.")) {
      try {
        const { data } = await api.patch(`/interviews/${id}`, { status: "active" });
        if (data.success) {
          toast.success("Interview marked as active");
          setInterview(data.interview);
        }
      } catch (error) {
        toast.error("Failed to activate interview");
      }
    }
  };

  const handleBulkSubmit = async (emailsArray) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emailsArray.filter(email => emailRegex.test(email));

    if (validEmails.length === 0) {
      toast.error("No valid emails found.");
      return;
    }

    setAddingCandidate(true);
    try {
      const { data } = await api.patch(`/interviews/${id}`, { candidateEmails: validEmails });
      if (data.success) {
        toast.success(`${validEmails.length} candidates added successfully`);
        setInterview(data.interview);
        setNewCandidateEmail("");
        setBulkEmails("");
        setCsvFile(null);
        setIsAddModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add candidates");
    } finally {
      setAddingCandidate(false);
    }
  };

  const addCandidate = async (e) => {
    e.preventDefault();
    if (addMode === "single") {
      if (!newCandidateEmail) return;
      handleBulkSubmit([newCandidateEmail]);
    } else if (addMode === "bulk") {
      if (!bulkEmails.trim()) return;
      const emailsArray = bulkEmails.split(/[\s,;]+/).map(e => e.trim()).filter(Boolean);
      handleBulkSubmit(emailsArray);
    } else if (addMode === "csv") {
      if (!csvFile) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const emailsArray = text.split(/[\s,;]+/).map(e => e.trim()).filter(Boolean);
        handleBulkSubmit(emailsArray);
      };
      reader.readAsText(csvFile);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      Pending: "bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30",
      "In Progress": "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20",
      Completed: "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20",
      Requested: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Rejected: "bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20",
    };
    return styles[status] || styles.Pending;
  };

  const handleJoinRequest = async (email, action) => {
    try {
      const { data } = await api.patch(`/interviews/${id}/requests`, { email, action });
      if (data.success) {
        toast.success(`Request ${action}d successfully`);
        setInterview(data.interview);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background-md3,var(--background))] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary-md3)]" />
      </div>
    );
  }

  if (!interview) return null;

  const inputClasses = "flex w-full rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/30 px-4 py-3 text-sm font-bold text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-md3)]/50 focus:border-[var(--color-primary-md3)] transition-all duration-300";

  return (
    <div className="min-h-screen bg-[var(--color-background-md3,var(--background))] pt-12 pb-24 font-['Inter']">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 space-y-8">

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary-md3)] transition-colors mb-4 text-[11px] font-black uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </motion.div>

        {/* Campaign Header & Overview Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary-md3)]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-secondary)]/5 rounded-full blur-[60px] pointer-events-none" />

            <div className="p-8 md:p-10 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-[var(--color-outline-variant)]/30">
                <div>
                  <h1 className="text-4xl font-black text-[var(--color-on-surface)] mb-4 tracking-tight uppercase">
                    {interview.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-[var(--color-on-surface-variant)]">
                    <span className="flex items-center gap-2 text-sm font-black tracking-widest uppercase">
                      <Briefcase className="w-4 h-4 text-[var(--color-primary-md3)]" />
                      {interview.jobRole}
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase bg-[var(--color-surface-container-highest)]/50 px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)]/30 text-[var(--color-primary-md3)] shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                      <Key className="w-3.5 h-3.5" />
                      Code: {interview.interviewCode}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-2.5 sm:gap-3 w-full sm:w-auto">
                  {interview.status !== "completed" ? (
                    <button onClick={completeInterview} className="px-4 sm:px-5 py-2.5 bg-transparent hover:bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-outline-variant)]/30 hover:border-[var(--color-success)]/50 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center shadow-sm w-full sm:w-auto">
                      <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                      Complete
                    </button>
                  ) : (
                    <button onClick={activateInterview} className="px-4 sm:px-5 py-2.5 bg-transparent hover:bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-outline-variant)]/30 hover:border-[var(--color-success)]/50 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center shadow-sm w-full sm:w-auto">
                      <Play className="w-4 h-4 mr-2 shrink-0" />
                      Activate
                    </button>
                  )}
                  <button onClick={() => navigate(`/employer/interviews/${interview._id}/edit`)} className="px-4 sm:px-5 py-2.5 bg-transparent hover:bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] border border-[var(--color-outline-variant)]/30 hover:border-[var(--color-primary-md3)]/50 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center shadow-sm w-full sm:w-auto">
                    <Edit className="w-4 h-4 mr-2 shrink-0" />
                    Edit
                  </button>
                  <button onClick={deleteInterview} className="px-4 sm:px-5 py-2.5 bg-transparent hover:bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-outline-variant)]/30 hover:border-[var(--color-error)]/30 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center shadow-sm w-full sm:w-auto">
                    <Trash2 className="w-4 h-4 mr-2 shrink-0" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Admin Verification Alert Banner */}
              <div className={`p-4 rounded-2xl border mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg transition-all ${
                interview.isVerified
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    interview.isVerified ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {interview.isVerified ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      {interview.isVerified ? "Campaign Verified & Visible to Candidates" : "Pending Admin Verification (Hidden from Candidates)"}
                    </h4>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {interview.isVerified
                        ? "This campaign has been approved by Admin. Assigned candidates can view, join, and take this interview."
                        : "This campaign is awaiting Admin verification. Assigned candidates cannot view or join this interview until approved."}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right self-end sm:self-center">
                  <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-xl bg-black/30 border border-current">
                    Capacity: {interview.assignedCandidates?.length || 0} / {interview.maxCandidates || 10} Candidates
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                {/* Duration */}
                <div className="bg-[var(--color-surface-container-highest)]/20 border border-[var(--color-outline-variant)]/30 rounded-2xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-tertiary)]/10 rounded-full blur-[30px] pointer-events-none group-hover:bg-[var(--color-tertiary)]/20 transition-all"></div>
                  <div className="relative z-10 flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-tertiary)]/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-[var(--color-tertiary)]" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-[0.2em] mb-1">Duration</p>
                  <h3 className="text-2xl font-black text-[var(--color-on-surface)]">{interview.duration} <span className="text-sm text-[var(--color-on-surface-variant)] uppercase tracking-widest">Mins</span></h3>
                </div>

                {/* Experience */}
                <div className="bg-[var(--color-surface-container-highest)]/20 border border-[var(--color-outline-variant)]/30 rounded-2xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-warning)]/10 rounded-full blur-[30px] pointer-events-none group-hover:bg-[var(--color-warning)]/20 transition-all"></div>
                  <div className="relative z-10 flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-warning)]/10 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-[var(--color-warning)]" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-[0.2em] mb-1">Experience</p>
                  <h3 className="text-2xl font-black text-[var(--color-on-surface)]">{interview.experienceLevel}</h3>
                </div>

                {/* Created On */}
                <div className="bg-[var(--color-surface-container-highest)]/20 border border-[var(--color-outline-variant)]/30 rounded-2xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-secondary)]/10 rounded-full blur-[30px] pointer-events-none group-hover:bg-[var(--color-secondary)]/20 transition-all"></div>
                  <div className="relative z-10 flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-secondary)]/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[var(--color-secondary)]" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-[0.2em] mb-1">Created On</p>
                  <h3 className="text-2xl font-black text-[var(--color-on-surface)]">{new Date(interview.createdAt).toLocaleDateString()}</h3>
                </div>

                {/* Candidates */}
                <div className="bg-[var(--color-surface-container-highest)]/20 border border-[var(--color-outline-variant)]/30 rounded-2xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-primary-md3)]/10 rounded-full blur-[30px] pointer-events-none group-hover:bg-[var(--color-primary-md3)]/20 transition-all"></div>
                  <div className="relative z-10 flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-md3)]/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-[var(--color-primary-md3)]" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-[0.2em] mb-1">Candidates</p>
                  <h3 className="text-2xl font-black text-[var(--color-on-surface)]">{interview.assignedCandidates?.length || 0}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-black text-[var(--color-on-surface)] mb-3 uppercase tracking-widest flex items-center gap-2">
                      <AlignLeft className="w-4 h-4 text-[var(--color-primary-md3)]" />
                      Description
                    </h3>
                    <p className="text-[var(--color-on-surface-variant)] leading-relaxed text-sm font-medium bg-[var(--color-surface-container-highest)]/20 p-4 rounded-xl border border-[var(--color-outline-variant)]/20">
                      {interview.description || "No description provided."}
                    </p>
                  </div>

                  {interview.topics && interview.topics.length > 0 && (
                    <div>
                      <h3 className="text-xs font-black text-[var(--color-on-surface)] mb-3 uppercase tracking-widest flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[var(--color-primary-md3)]" />
                        Topics
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {interview.topics.map(t => (
                          <span key={t} className="px-3 py-1.5 bg-[var(--color-surface-variant)]/50 border border-[var(--color-outline-variant)]/30 rounded-lg flex items-center gap-2 text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-widest">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-black text-[var(--color-on-surface)] mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--color-primary-md3)]" />
                    AI System Instructions
                  </h3>
                  <div className="bg-[var(--color-surface-container-highest)]/20 border border-[var(--color-primary-md3)]/20 rounded-xl p-5 shadow-[0_0_15px_rgba(139,92,246,0.05)] h-[calc(100%-2rem)]">
                    <p className="text-[var(--color-on-surface-variant)] leading-relaxed text-sm font-medium">
                      {interview.instructions || "No specific instructions provided. The AI will use standard interview protocols for this role and experience level."}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Candidates Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/20">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl font-black tracking-tight text-[var(--color-on-surface)] uppercase mb-1">Assigned Candidates</h2>
                <p className="text-[11px] text-[var(--color-on-surface-variant)] font-bold tracking-[0.2em] uppercase">Manage invites and review interview results.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary-md3)]" />
                  <input
                    placeholder="Search candidates..."
                    className={`${inputClasses} pl-11`}
                    value={searchCandidate}
                    onChange={(e) => setSearchCandidate(e.target.value)}
                  />
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="px-6 py-3 bg-[var(--color-primary-md3)] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-colors shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Candidate
                </button>
              </div>
            </div>

            {interview.assignedCandidates?.length === 0 ? (
              <div className="text-center py-20 px-6 max-w-lg mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center mx-auto text-[var(--color-text-accent,#C4B5FD)]">
                  <Users className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-medium text-[var(--color-on-surface)]">
                    No Candidates Invited Yet
                  </h3>
                  <p className="text-xs text-[var(--color-on-surface-variant)] font-normal leading-relaxed">
                    Invite applicants by email, paste multiple emails, or upload a CSV candidate roster. You can also share the direct interview code <code className="px-1.5 py-0.5 rounded bg-[var(--color-surface-container-highest)] text-[var(--color-text-accent)] font-mono text-[11px]">{interview.interviewCode}</code> with candidates.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-2.5 bg-[var(--primary,#5B3AF2)] hover:bg-[var(--primary-hover,#472CD7)] text-white text-xs font-medium rounded-xl transition-all shadow-sm inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)] focus-visible:outline-none"
                  >
                    <Plus className="w-4 h-4" /> Invite Candidates Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/10">
                      <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Candidate Email</th>
                      <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Status</th>
                      <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Joined At</th>
                      <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Submitted At</th>
                      <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interview.assignedCandidates
                      ?.filter((c) => c.email.toLowerCase().includes(searchCandidate.toLowerCase()))
                      .map((candidate, idx) => (
                        <tr key={idx} className="border-b border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-container-highest)]/10 transition-colors group">
                          <td className="py-5 px-8">
                            <div className="font-bold text-sm text-[var(--color-on-surface)]">{candidate.email}</div>
                          </td>
                          <td className="py-5 px-8">
                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(candidate.status)}`}>
                              {candidate.status}
                            </span>
                          </td>
                          <td className="py-5 px-8">
                            <span className="text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
                              {candidate.joinedAt ? new Date(candidate.joinedAt).toLocaleString() : "-"}
                            </span>
                          </td>
                          <td className="py-5 px-8">
                            <span className="text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
                              {candidate.submittedAt ? new Date(candidate.submittedAt).toLocaleString() : "-"}
                            </span>
                          </td>
                          <td className="py-5 px-8 text-right space-x-3 whitespace-nowrap">
                            {candidate.status === "Requested" ? (
                              <>
                                <button onClick={() => handleJoinRequest(candidate.email, "approve")} className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                  Approve
                                </button>
                                <button onClick={() => handleJoinRequest(candidate.email, "reject")} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 text-[var(--color-error)] border border-[var(--color-error)]/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                  Reject
                                </button>
                              </>
                            ) : (
                              <>
                                {candidate.status === "Completed" && (
                                  <button onClick={() => navigate(`/employer/interviews/${id}/results/${candidate.resultId}`)} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-md3)]/10 hover:bg-[var(--color-primary-md3)]/20 text-[var(--color-primary-md3)] border border-[var(--color-primary-md3)]/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                    View Result
                                  </button>
                                )}
                                {candidate.status !== "Completed" && candidate.status !== "In Progress" && (
                                  <button onClick={() => removeCandidate(candidate.email)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-transparent hover:bg-[var(--color-error)]/10 text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" title="Remove Candidate">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Candidate Dialog */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#000000]/80 backdrop-blur-md"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[var(--color-surface-container-low)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--color-outline-variant)]/30"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary-md3)]/10 rounded-full blur-[40px] pointer-events-none" />

              <div className="flex items-center justify-between p-6 md:p-8 border-b border-[var(--color-outline-variant)]/30 relative z-10">
                <h3 className="text-xl font-black uppercase tracking-widest text-[var(--color-on-surface)] flex items-center gap-3">
                  <Plus className="w-6 h-6 text-[var(--color-primary-md3)]" />
                  Invite Candidate
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors p-2 rounded-full hover:bg-[var(--color-surface-variant)]/50">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={addCandidate} className="relative z-10">
                <div className="p-6 md:p-8">
                  <div className="flex bg-[var(--color-surface-container-highest)]/30 p-1 rounded-xl mb-6">
                    {["single", "bulk", "csv"].map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setAddMode(mode)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${addMode === mode ? "bg-[var(--color-primary-md3)] text-white shadow-md shadow-[var(--color-primary-md3)]/30" : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"}`}
                      >
                        {mode === 'single' ? 'Single' : mode === 'bulk' ? 'Paste Many' : 'CSV Upload'}
                      </button>
                    ))}
                  </div>

                  {addMode === "single" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <label className="block text-[11px] font-black uppercase tracking-widest mb-3 text-[var(--color-on-surface)]">Candidate Email Address</label>
                      <input
                        type="email"
                        required
                        value={newCandidateEmail}
                        onChange={(e) => setNewCandidateEmail(e.target.value)}
                        placeholder="candidate@example.com"
                        className={inputClasses}
                      />
                    </motion.div>
                  )}

                  {addMode === "bulk" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-[var(--color-on-surface)]">Paste Multiple Emails</label>
                      <p className="text-[10px] text-[var(--color-on-surface-variant)] font-bold mb-3">Format: Comma, space, or newline separated.</p>
                      <textarea
                        required
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
                        placeholder={"candidate1@example.com, candidate2@example.com\ncandidate3@example.com"}
                        className={`${inputClasses} min-h-[120px] py-4 resize-y`}
                      />
                    </motion.div>
                  )}

                  {addMode === "csv" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-[var(--color-on-surface)]">Upload CSV File</label>
                      <p className="text-[10px] text-[var(--color-on-surface-variant)] font-bold mb-3">Upload a text or CSV file containing emails.</p>
                      <input
                        type="file"
                        accept=".csv,.txt"
                        required
                        onChange={(e) => setCsvFile(e.target.files[0])}
                        className="w-full text-sm text-[var(--color-on-surface-variant)] file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-[var(--color-primary-md3)]/10 file:text-[var(--color-primary-md3)] hover:file:bg-[var(--color-primary-md3)]/20 cursor-pointer bg-[var(--color-surface-container-highest)]/30 rounded-xl border border-[var(--color-outline-variant)]/30"
                      />
                      {csvFile && (
                        <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {csvFile.name} Selected
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
                <div className="flex justify-end gap-4 p-6 md:px-8 md:py-6 bg-[var(--color-surface-container-highest)]/20 border-t border-[var(--color-outline-variant)]/30">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 bg-transparent hover:bg-[var(--color-surface-variant)]/50 text-[var(--color-on-surface)] rounded-xl text-xs font-black uppercase tracking-widest transition-colors border border-[var(--color-outline-variant)]/30">
                    Cancel
                  </button>
                  <button type="submit" disabled={addingCandidate || (addMode === 'single' && !newCandidateEmail) || (addMode === 'bulk' && !bulkEmails) || (addMode === 'csv' && !csvFile)} className="px-6 py-3 bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center min-w-[140px]">
                    {addingCandidate ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Send Invite"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewDetailsPage;
