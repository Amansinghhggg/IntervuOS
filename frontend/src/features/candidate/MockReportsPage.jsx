import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import mockInterviewService from "../../services/mockInterview.service";
import api from "../../services/api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
import {
  FileText,
  Sparkles,
  Award,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  Brain,
  TrendingUp,
  PlayCircle,
  X,
  Search,
  ChevronRight,
  ChevronLeft,
  Target,
  Building2,
  Check,
  Layers,
  XCircle
} from "lucide-react";

export default function MockReportsPage() {
  const navigate = useNavigate();

  // Active Category Tab: "mock" (AI Practice Sessions) vs "company" (Employer Assigned Campaigns)
  const [activeCategory, setActiveCategory] = useState("mock");

  // Mock Evaluations State
  const [loadingMocks, setLoadingMocks] = useState(true);
  const [evaluations, setEvaluations] = useState([]);
  const [resumeableMocks, setResumeableMocks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  // Company Campaigns State
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [companyInterviews, setCompanyInterviews] = useState([]);

  // Mock Filters & Pagination
  const [mockSearchQuery, setMockSearchQuery] = useState("");
  const [mockSelectedFilter, setMockSelectedFilter] = useState("ALL"); // ALL | STRONG_HIRE | HIRE | BORDERLINE | NEEDS_WORK
  const [mockCurrentPage, setMockCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Company Filters & Pagination
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [companySelectedFilter, setCompanySelectedFilter] = useState("ALL"); // ALL | COMPLETED | CLOSED
  const [companyCurrentPage, setCompanyCurrentPage] = useState(1);

  const fetchMockReports = async () => {
    setLoadingMocks(true);
    try {
      const data = await mockInterviewService.getHistory({ page: 1, limit: 100 });
      if (data.success && Array.isArray(data.evaluations)) {
        setEvaluations(data.evaluations);
        setTotalCount(data.total || data.evaluations.length);
      } else {
        setEvaluations([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.warn("Could not fetch mock evaluation history:", err.message);
      setEvaluations([]);
      setTotalCount(0);
    } finally {
      setLoadingMocks(false);
    }
  };

  const fetchResumeableMocks = async () => {
    try {
      const data = await mockInterviewService.getResumeableMocks();
      if (data.success && Array.isArray(data.resumeable)) {
        setResumeableMocks(data.resumeable);
      }
    } catch (err) {
      console.warn("Could not fetch resumeable mocks:", err.message);
    }
  };

  const fetchCompanyInterviews = async () => {
    setLoadingCompany(true);
    try {
      const { data } = await api.get("/interviews/candidate/assigned");
      if (data.success && Array.isArray(data.interviews)) {
        // Only keep past completed / closed campaigns
        const past = data.interviews.filter((interview) => {
          const s = interview.candidateStatus?.toLowerCase();
          return s === "completed" || (interview.status === "completed" && s !== "completed");
        });
        setCompanyInterviews(past);
      } else {
        setCompanyInterviews([]);
      }
    } catch (err) {
      console.warn("Could not fetch company past interviews:", err.message);
      setCompanyInterviews([]);
    } finally {
      setLoadingCompany(false);
    }
  };

  useEffect(() => {
    fetchMockReports();
    fetchResumeableMocks();
    fetchCompanyInterviews();
  }, []);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setMockCurrentPage(1);
  }, [mockSearchQuery, mockSelectedFilter]);

  useEffect(() => {
    setCompanyCurrentPage(1);
  }, [companySearchQuery, companySelectedFilter]);

  const getRecommendationBadge = (recommendation) => {
    switch (recommendation) {
      case "STRONG_HIRE":
        return {
          label: "Strong Hire",
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        };
      case "HIRE":
        return {
          label: "Hire",
          bg: "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--primary)]/30"
        };
      case "BORDERLINE":
        return {
          label: "Borderline",
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/20"
        };
      case "NOT_EVALUATED":
        return {
          label: "Not Evaluated",
          bg: "bg-slate-500/10 text-slate-400 border-slate-500/20"
        };
      default:
        return {
          label: "Needs Improvement",
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/20"
        };
    }
  };

  /* =========================================================================
     MOCK EVALUATION CALCULATIONS & FILTERING
     ========================================================================= */
  const filteredMockEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      const matchesSearch =
        (item.title && item.title.toLowerCase().includes(mockSearchQuery.toLowerCase())) ||
        (item.jobRole && item.jobRole.toLowerCase().includes(mockSearchQuery.toLowerCase())) ||
        (item.topics && item.topics.some((t) => t.toLowerCase().includes(mockSearchQuery.toLowerCase())));

      if (!matchesSearch) return false;

      if (mockSelectedFilter === "ALL") return true;
      if (mockSelectedFilter === "STRONG_HIRE") return item.recommendation === "STRONG_HIRE";
      if (mockSelectedFilter === "HIRE") return item.recommendation === "HIRE";
      if (mockSelectedFilter === "BORDERLINE") return item.recommendation === "BORDERLINE";
      if (mockSelectedFilter === "NEEDS_WORK") return item.recommendation === "NEEDS_WORK" || item.recommendation === "NO_HIRE";
      return true;
    });
  }, [evaluations, mockSearchQuery, mockSelectedFilter]);

  const mockTotalPages = Math.max(Math.ceil(filteredMockEvaluations.length / itemsPerPage), 1);
  const paginatedMockEvaluations = useMemo(() => {
    const startIdx = (mockCurrentPage - 1) * itemsPerPage;
    return filteredMockEvaluations.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredMockEvaluations, mockCurrentPage, itemsPerPage]);

  const evaluatedList = useMemo(() => {
    return evaluations.filter((e) => e.recommendation !== "NOT_EVALUATED");
  }, [evaluations]);

  const baseCount = evaluatedList.length || 1;
  const avgScoreNum = evaluatedList.length > 0
    ? evaluatedList.reduce((sum, e) => sum + (Number(e.scores?.overall) || 0), 0) / evaluatedList.length
    : 0;
  const avgScore = avgScoreNum.toFixed(1);

  const avgTechnical = evaluatedList.length > 0
    ? (evaluatedList.reduce((sum, e) => sum + (Number(e.scores?.technical) || 0), 0) / evaluatedList.length).toFixed(1)
    : "0.0";

  const avgProblemSolving = evaluatedList.length > 0
    ? (evaluatedList.reduce((sum, e) => sum + (Number(e.scores?.problemSolving) || 0), 0) / evaluatedList.length).toFixed(1)
    : "0.0";

  const avgCommunication = evaluatedList.length > 0
    ? (evaluatedList.reduce((sum, e) => sum + (Number(e.scores?.communication) || 0), 0) / evaluatedList.length).toFixed(1)
    : "0.0";

  const totalMinutesPracticed = evaluations.reduce((sum, e) => sum + (Number(e.duration) || 15), 0);

  const recCounts = evaluatedList.reduce(
    (acc, e) => {
      const rec = e.recommendation || "BORDERLINE";
      if (rec === "STRONG_HIRE") acc.strong++;
      else if (rec === "HIRE") acc.hire++;
      else if (rec === "BORDERLINE") acc.borderline++;
      else acc.needsWork++;
      return acc;
    },
    { strong: 0, hire: 0, borderline: 0, needsWork: 0 }
  );

  const strongPct = evaluatedList.length > 0 ? Math.round((recCounts.strong / baseCount) * 100) : 0;
  const hirePct = evaluatedList.length > 0 ? Math.round((recCounts.hire / baseCount) * 100) : 0;
  const borderlinePct = evaluatedList.length > 0 ? Math.round((recCounts.borderline / baseCount) * 100) : 0;
  const needsWorkPct = evaluatedList.length > 0 ? Math.round((recCounts.needsWork / baseCount) * 100) : 0;
  const hireRate = strongPct + hirePct;

  const pieChartData = useMemo(() => {
    const data = [
      { name: "Strong Hire", value: recCounts.strong, color: "#10B981" },
      { name: "Hire", value: recCounts.hire, color: "var(--primary)" },
      { name: "Borderline", value: recCounts.borderline, color: "#F59E0B" },
      { name: "Needs Improvement", value: recCounts.needsWork, color: "#F43F5E" }
    ];
    if (evaluatedList.length === 0) {
      return [{ name: "No Data", value: 1, color: "#232330" }];
    }
    return data.filter((item) => item.value > 0);
  }, [recCounts, evaluatedList]);

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const pct = Math.round((entry.value / baseCount) * 100);
      return (
        <div className="bg-[var(--card)] border border-[var(--border)] px-3 py-1.5 rounded-xl shadow-xl text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload.color }} />
            <span>{entry.name}</span>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">
            {entry.value} sessions ({pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  /* =========================================================================
     COMPANY INTERVIEWS FILTERING & PAGINATION
     ========================================================================= */
  const completedCompanyList = useMemo(() => {
    return companyInterviews.filter((i) => i.candidateStatus?.toLowerCase() === "completed");
  }, [companyInterviews]);

  const missedCompanyList = useMemo(() => {
    return companyInterviews.filter((i) => {
      const s = i.candidateStatus?.toLowerCase();
      return i.status === "completed" && s !== "completed";
    });
  }, [companyInterviews]);

  const filteredCompanyInterviews = useMemo(() => {
    return companyInterviews.filter((item) => {
      const matchesSearch =
        (item.title && item.title.toLowerCase().includes(companySearchQuery.toLowerCase())) ||
        (item.jobRole && item.jobRole.toLowerCase().includes(companySearchQuery.toLowerCase())) ||
        (item.employer?.name && item.employer.name.toLowerCase().includes(companySearchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      const s = item.candidateStatus?.toLowerCase();
      if (companySelectedFilter === "ALL") return true;
      if (companySelectedFilter === "COMPLETED") return s === "completed";
      if (companySelectedFilter === "CLOSED") return item.status === "completed" && s !== "completed";
      return true;
    });
  }, [companyInterviews, companySearchQuery, companySelectedFilter]);

  const companyTotalPages = Math.max(Math.ceil(filteredCompanyInterviews.length / itemsPerPage), 1);
  const paginatedCompanyInterviews = useMemo(() => {
    const startIdx = (companyCurrentPage - 1) * itemsPerPage;
    return filteredCompanyInterviews.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredCompanyInterviews, companyCurrentPage, itemsPerPage]);

  return (
    <div className="w-full min-h-screen bg-[var(--background)] font-['Inter'] pb-20 text-[var(--text-primary)]">
      <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 space-y-6">

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] text-[11px] font-medium">
                <FileText className="w-3 h-3" /> Evaluation Archive
              </span>
              <span className="text-xs text-[var(--text-muted)]">•</span>
              <span className="text-xs text-[var(--text-secondary)] font-normal">Past Assessments & History</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--text-primary)]">
              Past Interviews
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/candidate/mock-interview")}
              className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors duration-150 shadow-sm shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch New Mock</span>
            </button>
          </div>
        </div>

        {/* Segmented Control Switcher: AI Practice Mocks vs Company Campaigns */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div className="flex items-center bg-[var(--card)] p-1 rounded-xl border border-[var(--border)]">
            <button
              onClick={() => setActiveCategory("mock")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                activeCategory === "mock"
                  ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>AI Mock Practice ({evaluations.length})</span>
            </button>

            <button
              onClick={() => setActiveCategory("company")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                activeCategory === "company"
                  ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Company Campaigns ({companyInterviews.length})</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: AI MOCK INTERVIEW EVALUATION REPORTS
           ========================================================================= */}
        {activeCategory === "mock" && (
          <div className="space-y-6">

            {/* Executive Donut / Pie Visual Summary Widget */}
            {evaluatedList.length > 0 && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* 1. Pie / Donut Chart with Centered Metric (Left 5 Cols) */}
                <div className="md:col-span-5 flex items-center justify-center sm:justify-start gap-4">
                  <div className="relative w-32 h-32 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={36}
                          outerRadius={56}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="#16161E"
                          strokeWidth={2}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Center Callout */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-xl font-medium tracking-tight text-[var(--text-primary)] leading-none">
                        {avgScore}
                      </span>
                      <span className="text-[9px] text-[var(--text-secondary)] font-normal mt-0.5">
                        Avg / 10
                      </span>
                    </div>
                  </div>

                  {/* Status Header */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span>Hiring Triage</span>
                    </div>
                    <div className="text-2xl font-medium tracking-tight text-[var(--color-text-accent,#C4B5FD)]">
                      {hireRate}%
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Hiring rate over {totalCount} practice mocks
                    </p>
                  </div>
                </div>

                {/* 2. Interactive Pie Breakdown Legend (Middle 3 Cols) */}
                <div className="md:col-span-3 space-y-2 py-1 md:border-l md:border-[var(--border)] md:pl-6">
                  <div className="text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Outcome Distribution
                  </div>
                  
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Strong Hire
                      </span>
                      <span className="font-medium text-emerald-400">{recCounts.strong} ({strongPct}%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)]" /> Hire
                      </span>
                      <span className="font-medium text-[var(--color-text-accent,#C4B5FD)]">{recCounts.hire} ({hirePct}%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> Borderline
                      </span>
                      <span className="font-medium text-amber-400">{recCounts.borderline} ({borderlinePct}%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <span className="w-2 h-2 rounded-full bg-rose-400" /> Needs Improvement
                      </span>
                      <span className="font-medium text-rose-400">{recCounts.needsWork} ({needsWorkPct}%)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Core Competency Summary (Right 4 Cols) */}
                <div className="md:col-span-4 space-y-2.5 md:border-l md:border-[var(--border)] md:pl-6">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[var(--text-secondary)]">Core Skill Averages</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{totalMinutesPracticed} mins total</span>
                  </div>

                  {/* Technical Depth */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[var(--text-secondary)]">Technical Depth</span>
                      <span className="font-medium text-[var(--text-primary)]">{avgTechnical}/10</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--background)] overflow-hidden">
                      <div style={{ width: `${(parseFloat(avgTechnical) / 10) * 100}%` }} className="h-full bg-[var(--primary)] rounded-full" />
                    </div>
                  </div>

                  {/* Problem Solving */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[var(--text-secondary)]">Problem Solving</span>
                      <span className="font-medium text-[var(--text-primary)]">{avgProblemSolving}/10</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--background)] overflow-hidden">
                      <div style={{ width: `${(parseFloat(avgProblemSolving) / 10) * 100}%` }} className="h-full bg-emerald-400 rounded-full" />
                    </div>
                  </div>

                  {/* Communication */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[var(--text-secondary)]">Communication</span>
                      <span className="font-medium text-[var(--text-primary)]">{avgCommunication}/10</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--background)] overflow-hidden">
                      <div style={{ width: `${(parseFloat(avgCommunication) / 10) * 100}%` }} className="h-full bg-amber-400 rounded-full" />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Incomplete / Resumeable Sessions (if any exist) */}
            {resumeableMocks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <h2 className="text-sm font-medium text-[var(--text-primary)]">
                    Pending / Incomplete Mocks ({resumeableMocks.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resumeableMocks.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[var(--card)] border border-amber-500/30 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {item.status || "In Progress"}
                          </span>
                          <h3 className="text-sm font-medium text-[var(--text-primary)] mt-1.5">
                            {item.jobRole || item.title}
                          </h3>
                        </div>
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                        <span>{item.experienceLevel}</span>
                        <span>•</span>
                        <span>{item.duration} Mins</span>
                      </div>

                      <button
                        onClick={() => navigate(`/candidate/mock-interview/${item.id}/prepare`)}
                        className="w-full py-2 bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] hover:bg-[var(--primary-tint)]/80 border border-[var(--primary)]/30 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors duration-150"
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> Resume Session
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search reports by role or topic..."
                  value={mockSearchQuery}
                  onChange={(e) => setMockSearchQuery(e.target.value)}
                  className="w-full bg-[var(--card)] border border-[var(--border)] pl-9 pr-4 py-2 rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors duration-150"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { key: "ALL", label: `All (${evaluations.length})` },
                  { key: "STRONG_HIRE", label: `Strong (${recCounts.strong})` },
                  { key: "HIRE", label: `Hire (${recCounts.hire})` },
                  { key: "BORDERLINE", label: `Borderline (${recCounts.borderline})` },
                  { key: "NEEDS_WORK", label: `Improvement (${recCounts.needsWork})` }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setMockSelectedFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-150 border whitespace-nowrap ${
                      mockSelectedFilter === f.key
                        ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]"
                        : "bg-[var(--card)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-3">
              {loadingMocks ? (
                <div className="bg-[var(--card)] border border-[var(--border)] p-12 rounded-2xl text-center text-xs text-[var(--text-secondary)]">
                  Loading evaluation reports...
                </div>
              ) : filteredMockEvaluations.length === 0 ? (
                <div className="bg-[var(--card)] border border-[var(--border)] p-10 sm:p-14 rounded-3xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 flex items-center justify-center text-[var(--color-text-accent,#C4B5FD)] mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
                      {evaluations.length === 0 ? "No Mock Interview Reports Yet" : "No Matching Reports"}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto font-normal leading-relaxed">
                      {evaluations.length === 0
                        ? "Take your first AI mock interview to generate in-depth STAR feedback, competency radar scores, transcript analysis, and downloadable PDF performance reports."
                        : "Try adjusting your search keywords or filter dropdowns to view your past reports."}
                    </p>
                  </div>
                  {evaluations.length === 0 ? (
                    <div className="pt-2">
                      <button
                        onClick={() => navigate("/candidate/mock-interview")}
                        className="px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-xs rounded-xl inline-flex items-center gap-2 transition-colors duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
                      >
                        <PlayCircle className="w-4 h-4" /> Start First Mock Interview
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setMockSearchQuery("");
                        setMockSelectedFilter("ALL");
                      }}
                      className="px-4 py-2 border border-[var(--border)] hover:bg-[var(--surface-hover,#1E1E2A)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors duration-150"
                    >
                      Clear Search Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3">
                    {paginatedMockEvaluations.map((item) => {
                      const badge = getRecommendationBadge(item.recommendation);
                      return (
                        <div
                          key={item.id}
                          className="bg-[var(--card)] border border-[var(--border)] hover:border-[var(--color-border-active,#6338F6)]/60 transition-colors duration-150 rounded-2xl p-5"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.bg}`}>
                                  {badge.label}
                                </span>
                                <span className="text-[11px] text-[var(--text-secondary)]">
                                  {new Date(item.evaluatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </div>

                              <h3 className="text-base font-medium text-[var(--text-primary)]">
                                {item.title}
                              </h3>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3.5 h-3.5 text-[var(--primary)]" /> {item.jobRole}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Brain className="w-3.5 h-3.5 text-emerald-400" /> {item.experienceLevel}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {item.duration} Mins
                                </span>
                              </div>

                              {item.topics && item.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {item.topics.map((t, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[10px] text-[var(--text-secondary)]"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-5 shrink-0 w-full sm:w-auto justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                              <div className="text-left sm:text-right">
                                <div className="text-xl font-medium text-[var(--primary)]">
                                  {item.scores?.overall || "0"}
                                  <span className="text-xs text-[var(--text-secondary)] font-normal">/10</span>
                                </div>
                                <div className="text-[10px] text-[var(--text-secondary)]">Score</div>
                              </div>

                              <button
                                onClick={() => setSelectedEvaluation(item)}
                                className="px-3.5 py-2 bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] hover:bg-[var(--primary-tint)]/80 border border-[var(--primary)]/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors duration-150"
                              >
                                <FileText className="w-3.5 h-3.5" /> View Analysis
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mock Pagination Bar */}
                  {mockTotalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
                      <div>
                        Showing{" "}
                        <span className="font-medium text-[var(--text-primary)]">
                          {(mockCurrentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-[var(--text-primary)]">
                          {Math.min(mockCurrentPage * itemsPerPage, filteredMockEvaluations.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-[var(--text-primary)]">
                          {filteredMockEvaluations.length}
                        </span>{" "}
                        mock reports
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setMockCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={mockCurrentPage === 1}
                          className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title="Previous Page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: mockTotalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setMockCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-xl text-xs font-medium border transition-colors ${
                              mockCurrentPage === pageNum
                                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                                : "bg-[var(--card)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}

                        <button
                          onClick={() => setMockCurrentPage((prev) => Math.min(prev + 1, mockTotalPages))}
                          disabled={mockCurrentPage === mockTotalPages}
                          className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title="Next Page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 2: COMPANY / EMPLOYER CAMPAIGN PAST INTERVIEWS
           ========================================================================= */}
        {activeCategory === "company" && (
          <div className="space-y-6">

            {/* Company Overview Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[var(--card)] border border-[var(--border)] p-4 sm:p-5 rounded-2xl space-y-1">
                <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between">
                  <span>Completed Submissions</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-medium text-emerald-400">{completedCompanyList.length}</div>
                <p className="text-[11px] text-[var(--text-muted)]">Evaluated by hiring teams</p>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] p-4 sm:p-5 rounded-2xl space-y-1">
                <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between">
                  <span>Closed Campaigns</span>
                  <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <div className="text-2xl font-medium text-[var(--text-secondary)]">{missedCompanyList.length}</div>
                <p className="text-[11px] text-[var(--text-muted)]">Campaign expired or closed</p>
              </div>
            </div>

            {/* Company Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search by company or role..."
                  value={companySearchQuery}
                  onChange={(e) => setCompanySearchQuery(e.target.value)}
                  className="w-full bg-[var(--card)] border border-[var(--border)] pl-9 pr-4 py-2 rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors duration-150"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { key: "ALL", label: `All (${companyInterviews.length})` },
                  { key: "COMPLETED", label: `Submitted (${completedCompanyList.length})` },
                  { key: "CLOSED", label: `Closed (${missedCompanyList.length})` }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setCompanySelectedFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-150 border whitespace-nowrap ${
                      companySelectedFilter === f.key
                        ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]"
                        : "bg-[var(--card)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Company Interviews Feed */}
            <div className="space-y-3">
              {loadingCompany ? (
                <div className="bg-[var(--card)] border border-[var(--border)] p-12 rounded-2xl text-center text-xs text-[var(--text-secondary)]">
                  Loading company interview history...
                </div>
              ) : filteredCompanyInterviews.length === 0 ? (
                <div className="bg-[var(--card)] border border-[var(--border)] p-12 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] flex items-center justify-center text-[var(--primary)] mx-auto">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-medium text-[var(--text-primary)]">No company interview records</h3>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto font-normal">
                    {companySearchQuery || companySelectedFilter !== "ALL"
                      ? "No records match your search filter."
                      : "Finished employer campaign submissions will be archived here once completed."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3">
                    {paginatedCompanyInterviews.map((item) => {
                      const isCompleted = item.candidateStatus?.toLowerCase() === "completed";
                      return (
                        <div
                          key={item._id}
                          className="bg-[var(--card)] border border-[var(--border)] hover:border-[var(--color-border-active,#6338F6)]/60 transition-colors duration-150 rounded-2xl p-5"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                {isCompleted ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Submitted
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                    Closed / Expired
                                  </span>
                                )}

                                {item.employer?.name && (
                                  <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 font-normal">
                                    <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                    {item.employer.name}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-base font-medium text-[var(--text-primary)]">
                                {item.title}
                              </h3>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3.5 h-3.5 text-[var(--primary)]" />
                                  {item.jobRole}
                                </span>
                                <span>•</span>
                                <span>{item.experienceLevel || "All Levels"}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  {item.duration || 15} Mins
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                              <span className="px-3.5 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-medium">
                                {isCompleted ? "Evaluation Under Review" : "Campaign Expired"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Company Pagination */}
                  {companyTotalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
                      <div>
                        Showing{" "}
                        <span className="font-medium text-[var(--text-primary)]">
                          {(companyCurrentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-[var(--text-primary)]">
                          {Math.min(companyCurrentPage * itemsPerPage, filteredCompanyInterviews.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-[var(--text-primary)]">
                          {filteredCompanyInterviews.length}
                        </span>{" "}
                        records
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setCompanyCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={companyCurrentPage === 1}
                          className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title="Previous Page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: companyTotalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setCompanyCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-xl text-xs font-medium border transition-colors ${
                              companyCurrentPage === pageNum
                                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                                : "bg-[var(--card)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}

                        <button
                          onClick={() => setCompanyCurrentPage((prev) => Math.min(prev + 1, companyTotalPages))}
                          disabled={companyCurrentPage === companyTotalPages}
                          className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title="Next Page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Detailed Evaluation Report Modal */}
      <AnimatePresence>
        {selectedEvaluation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="bg-[var(--card)] border border-[var(--border)]/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-xl p-6 space-y-5 relative text-[var(--text-primary)]"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getRecommendationBadge(selectedEvaluation.recommendation).bg}`}>
                      {getRecommendationBadge(selectedEvaluation.recommendation).label}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {new Date(selectedEvaluation.evaluatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">
                    {selectedEvaluation.title}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {selectedEvaluation.jobRole} • {selectedEvaluation.experienceLevel}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvaluation(null)}
                  className="p-1.5 rounded-lg bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scores Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--border)]">
                  <div className="text-base font-medium text-[var(--primary)]">{selectedEvaluation.scores?.overall}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Overall</div>
                </div>
                <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--border)]">
                  <div className="text-base font-medium text-[var(--color-text-accent,#C4B5FD)]">{selectedEvaluation.scores?.technical}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Technical</div>
                </div>
                <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--border)]">
                  <div className="text-base font-medium text-emerald-400">{selectedEvaluation.scores?.communication}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Communication</div>
                </div>
                <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--border)]">
                  <div className="text-base font-medium text-amber-400">{selectedEvaluation.scores?.problemSolving}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Problem Solving</div>
                </div>
                <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] col-span-2 sm:col-span-1">
                  <div className="text-base font-medium text-indigo-400">{selectedEvaluation.scores?.confidence}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Confidence</div>
                </div>
              </div>

              {/* Assessment Summary */}
              <div className="bg-[var(--background)] border border-[var(--border)] p-4 rounded-xl space-y-1">
                <h4 className="text-xs font-medium text-[var(--primary)] flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" /> Evaluator Assessment
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {selectedEvaluation.reasoning}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[var(--background)] border border-emerald-500/20 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Key Strengths
                  </h4>
                  <ul className="space-y-1">
                    {(selectedEvaluation?.strengths || []).map((s, idx) => (
                      <li key={idx} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[var(--background)] border border-amber-500/20 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Areas to Polish
                  </h4>
                  <ul className="space-y-1">
                    {(selectedEvaluation?.weaknesses || []).map((w, idx) => (
                      <li key={idx} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Question Breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-medium text-[var(--text-primary)]">
                  Question-by-Question Assessment
                </h4>

                <div className="space-y-2.5">
                  {(selectedEvaluation?.questionBreakdown || []).map((q, idx) => (
                    <div key={q.questionId || idx} className="bg-[var(--background)] border border-[var(--border)] p-3.5 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-medium text-[var(--color-text-accent,#C4B5FD)] bg-[var(--primary-tint,rgba(99,56,246,0.15))] px-1.5 py-0.5 rounded">
                          Q{idx + 1} • {q.topic || "General"}
                        </span>
                        <div className="text-xs font-medium text-[var(--primary)]">
                          Score: {q.scores?.technical || q.score || 0} / 10
                        </div>
                      </div>

                      <p className="text-xs font-medium text-[var(--text-primary)]">
                        {q.question}
                      </p>

                      {q.answer && (
                        <div className="bg-[var(--card)] p-2.5 rounded-lg text-xs text-[var(--text-secondary)] italic">
                          "{q.answer}"
                        </div>
                      )}

                      <p className="text-xs text-emerald-400/90 pt-0.5">
                        <span className="text-[10px] text-[var(--text-secondary)] block">AI Feedback:</span>
                        {q.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
