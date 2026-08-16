import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Users,
  Building2,
  BrainCircuit,
  MessageSquareWarning,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Coins,
  ChevronRight,
  Eye,
  FileText,
  AlertTriangle,
  Award,
  Briefcase,
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Save,
  Edit,
  UserPlus,
  Send,
  HelpCircle,
  Check,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { toast } from "react-hot-toast";
import adminService from "../../services/adminService";
import { PageHeader } from "../../ui/primitives/PageHeader";
import { SectionHeader } from "../../ui/primitives/SectionHeader";
import { GlassCard } from "../../ui/primitives/GlassCard";
import { MetricCard } from "../../ui/primitives/MetricCard";
import { StatusBadge } from "../../ui/primitives/StatusBadge";
import { EmptyState } from "../../ui/primitives/EmptyState";

const USER_PIE_COLORS = [
  "var(--color-primary,#5B3AF2)",
  "var(--color-text-accent,#C4B5FD)",
  "var(--color-warning,#F59E0B)",
];

const getUserCreditBalance = (u) => {
  if (!u || u.credits === undefined || u.credits === null) return 0;
  if (typeof u.credits === "number") return u.credits;
  if (typeof u.credits === "object") {
    return u.credits.availableCredits ?? u.credits.availableMinutes ?? 0;
  }
  return 0;
};

export default function AdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const navigate = useNavigate();

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // Cache tracker to avoid refetching tabs repeatedly
  const loadedTabsRef = useRef({
    stats: false,
    employers: false,
    campaigns: false,
    mocks: false,
    complaints: false,
    users: false,
  });

  // Global Dashboard Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [growthInterval, setGrowthInterval] = useState("daily"); // 'daily', 'weekly', 'monthly'

  // Tab 2: Employers Verification Data
  const [employers, setEmployers] = useState([]);
  const [employerFilter, setEmployerFilter] = useState("all"); // 'all', 'pending', 'verified'
  const [employerSearch, setEmployerSearch] = useState("");
  const [loadingEmployers, setLoadingEmployers] = useState(false);

  // Tab 3: Employer Campaigns Data
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStatusFilter, setCampaignStatusFilter] = useState("ALL");
  const [campaignSearch, setCampaignSearch] = useState("");
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Tab 4: Mock Attempts Data
  const [mockAttempts, setMockAttempts] = useState([]);
  const [mockRecommendationFilter, setMockRecommendationFilter] = useState("ALL");
  const [mockSearch, setMockSearch] = useState("");
  const [loadingMocks, setLoadingMocks] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  // Tab 5: Complaints Data
  const [complaints, setComplaints] = useState([]);
  const [complaintStatusFilter, setComplaintStatusFilter] = useState("ALL");
  const [complaintSearch, setComplaintSearch] = useState("");
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminNotesState, setAdminNotesState] = useState({});

  // Tab 6: Users Directory Data
  const [usersList, setUsersList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creditModalUser, setCreditModalUser] = useState(null);
  const [creditAmountInput, setCreditAmountInput] = useState(10);

  // Fetch Dashboard Stats
  const fetchStats = async (force = false) => {
    if (!force && loadedTabsRef.current.stats) return;
    try {
      setLoadingStats(true);
      const res = await adminService.getDashboardStats();
      if (res.success) {
        setStats(res.data);
        loadedTabsRef.current.stats = true;
      }
    } catch {
      toast.error("Failed to load platform stats");
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Employers
  const fetchEmployers = async (force = false) => {
    if (!force && loadedTabsRef.current.employers) return;
    try {
      setLoadingEmployers(true);
      const res = await adminService.getEmployers({});
      if (res.success) {
        setEmployers(res.employers || []);
        loadedTabsRef.current.employers = true;
      }
    } catch {
      toast.error("Failed to load employers");
    } finally {
      setLoadingEmployers(false);
    }
  };

  // Fetch Employer Campaigns
  const fetchCampaigns = async (force = false) => {
    if (!force && loadedTabsRef.current.campaigns) return;
    try {
      setLoadingCampaigns(true);
      const res = await adminService.getCampaigns({});
      if (res.success) {
        setCampaigns(res.campaigns || []);
        loadedTabsRef.current.campaigns = true;
      }
    } catch {
      toast.error("Failed to load interview campaigns");
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Fetch Mock Attempts
  const fetchMockAttempts = async (force = false) => {
    if (!force && loadedTabsRef.current.mocks) return;
    try {
      setLoadingMocks(true);
      const res = await adminService.getMockAttempts({});
      if (res.success) {
        setMockAttempts(res.attempts || []);
        loadedTabsRef.current.mocks = true;
      }
    } catch {
      toast.error("Failed to load mock attempts");
    } finally {
      setLoadingMocks(false);
    }
  };

  // Fetch Complaints
  const fetchComplaints = async (force = false) => {
    if (!force && loadedTabsRef.current.complaints) return;
    try {
      setLoadingComplaints(true);
      const res = await adminService.getComplaints({});
      if (res.success) {
        const list = res.complaints || [];
        setComplaints(list);
        const notesObj = {};
        list.forEach((item) => {
          notesObj[item._id] = item.adminNote || item.adminNotes || "";
        });
        setAdminNotesState(notesObj);
        loadedTabsRef.current.complaints = true;
      }
    } catch {
      toast.error("Failed to load support complaints");
    } finally {
      setLoadingComplaints(false);
    }
  };

  // Fetch Users Directory
  const fetchUsers = async (force = false) => {
    if (!force && loadedTabsRef.current.users) return;
    try {
      setLoadingUsers(true);
      const res = await adminService.getUsers({});
      if (res.success) {
        setUsersList(res.users || []);
        loadedTabsRef.current.users = true;
      }
    } catch {
      toast.error("Failed to load users directory");
    } finally {
      setLoadingUsers(false);
    }
  };

  // On mount and on tab switch: only fetch if not loaded
  useEffect(() => {
    if (activeTab === "overview") fetchStats();
    else if (activeTab === "employers") fetchEmployers();
    else if (activeTab === "campaigns") fetchCampaigns();
    else if (activeTab === "mocks") fetchMockAttempts();
    else if (activeTab === "complaints") fetchComplaints();
    else if (activeTab === "users") fetchUsers();
  }, [activeTab]);

  // Global Refresh Action (Forces fresh fetch for active tab and stats)
  const handleRefreshActiveTab = () => {
    if (activeTab === "overview") fetchStats(true);
    else if (activeTab === "employers") fetchEmployers(true);
    else if (activeTab === "campaigns") fetchCampaigns(true);
    else if (activeTab === "mocks") fetchMockAttempts(true);
    else if (activeTab === "complaints") fetchComplaints(true);
    else if (activeTab === "users") fetchUsers(true);
    toast.success("Data refreshed");
  };

  // Optimistic Handlers for Mutations
  const handleToggleVerification = async (employerId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await adminService.toggleEmployerVerification(employerId, newStatus);
      if (res.success) {
        toast.success(res.message || "Employer verification updated");
        setEmployers((prev) =>
          prev.map((e) => (e._id === employerId ? { ...e, isVerified: newStatus } : e))
        );
        // Also update usersList if loaded
        setUsersList((prev) =>
          prev.map((u) => (u._id === employerId ? { ...u, isVerified: newStatus } : u))
        );
      }
    } catch {
      toast.error("Verification update failed");
    }
  };

  const handleUpdateCampaignControls = async (campaignId, payload) => {
    try {
      const res = await adminService.updateCampaign(campaignId, payload);
      if (res.success) {
        toast.success(res.message || "Campaign updated successfully");
        setCampaigns((prev) =>
          prev.map((c) => (c._id === campaignId ? { ...c, ...res.campaign } : c))
        );
        if (selectedCampaign && selectedCampaign._id === campaignId) {
          setSelectedCampaign((prev) => ({ ...prev, ...res.campaign }));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update campaign controls");
    }
  };

  const handleGrantBonusCredits = async () => {
    if (!creditModalUser || creditAmountInput <= 0) return;
    try {
      const res = await adminService.grantBonusCredits(creditModalUser._id, creditAmountInput);
      if (res.success) {
        toast.success(`Granted ${creditAmountInput} bonus credits to ${creditModalUser.name}`);
        setUsersList((prev) =>
          prev.map((u) => {
            if (u._id !== creditModalUser._id) return u;
            if (typeof u.credits === "object" && u.credits !== null) {
              return {
                ...u,
                credits: {
                  ...u.credits,
                  availableCredits: (u.credits.availableCredits || 0) + Number(creditAmountInput),
                  totalBonusCredits: (u.credits.totalBonusCredits || 0) + Number(creditAmountInput),
                },
              };
            }
            return {
              ...u,
              credits: (Number(u.credits) || 0) + Number(creditAmountInput),
            };
          })
        );
        setCreditModalUser(null);
        setCreditAmountInput(10);
      }
    } catch {
      toast.error("Failed to grant bonus credits");
    }
  };

  const handleUpdateComplaintStatus = async (id, status) => {
    try {
      const res = await adminService.updateComplaint(id, { status });
      if (res.success) {
        toast.success("Complaint status updated");
        setComplaints((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status } : c))
        );
        if (selectedComplaint && selectedComplaint._id === id) {
          setSelectedComplaint((prev) => ({ ...prev, status }));
        }
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSaveAdminNote = async (id) => {
    try {
      const note = adminNotesState[id] || "";
      const res = await adminService.updateComplaint(id, { adminNotes: note });
      if (res.success) {
        toast.success("Admin note saved");
        setComplaints((prev) =>
          prev.map((c) => (c._id === id ? { ...c, adminNotes: note } : c))
        );
      }
    } catch {
      toast.error("Failed to save note");
    }
  };

  // CLIENT-SIDE FILTERED DATA (Zero redundant API calls when typing or switching filters!)
  const filteredEmployers = useMemo(() => {
    return employers.filter((emp) => {
      const matchesFilter =
        employerFilter === "all"
          ? true
          : employerFilter === "verified"
          ? emp.isVerified
          : !emp.isVerified;
      const q = employerSearch.toLowerCase();
      const matchesSearch =
        !q ||
        emp.name?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.companyName?.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [employers, employerFilter, employerSearch]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      const matchesFilter =
        campaignStatusFilter === "ALL" ? true : camp.status === campaignStatusFilter;
      const q = campaignSearch.toLowerCase();
      const matchesSearch =
        !q ||
        camp.title?.toLowerCase().includes(q) ||
        camp.jobRole?.toLowerCase().includes(q) ||
        camp.interviewCode?.toLowerCase().includes(q) ||
        camp.employer?.name?.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [campaigns, campaignStatusFilter, campaignSearch]);

  const filteredMocks = useMemo(() => {
    return mockAttempts.filter((att) => {
      const matchesFilter =
        mockRecommendationFilter === "ALL"
          ? true
          : att.recommendation === mockRecommendationFilter;
      const q = mockSearch.toLowerCase();
      const matchesSearch =
        !q ||
        att.user?.name?.toLowerCase().includes(q) ||
        att.user?.email?.toLowerCase().includes(q) ||
        att.jobRole?.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [mockAttempts, mockRecommendationFilter, mockSearch]);

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesRole =
        userRoleFilter === "ALL" ? true : u.role === userRoleFilter;
      const q = userSearch.toLowerCase();
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [usersList, userRoleFilter, userSearch]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesFilter =
        complaintStatusFilter === "ALL" ? true : c.status === complaintStatusFilter;
      const q = complaintSearch.toLowerCase();
      const matchesSearch =
        !q ||
        c.ticketId?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [complaints, complaintStatusFilter, complaintSearch]);

  // User Distribution Chart Data
  const userDistributionData = useMemo(() => {
    if (!stats?.users) return [];
    return [
      { name: "Candidates", value: stats.users.candidates || 0, color: "var(--color-primary,#5B3AF2)" },
      { name: "Employers", value: stats.users.employers || 0, color: "var(--color-text-accent,#C4B5FD)" },
      { name: "Admins", value: stats.users.admins || 1, color: "var(--color-warning,#F59E0B)" },
    ];
  }, [stats]);

  // User Base Growth Timeline Chart Data (Daily, Weekly, Monthly)
  const userGrowthChartData = useMemo(() => {
    if (stats?.userGrowth) {
      if (stats.userGrowth[growthInterval] && Array.isArray(stats.userGrowth[growthInterval]) && stats.userGrowth[growthInterval].length > 0) {
        return stats.userGrowth[growthInterval];
      }
      if (Array.isArray(stats.userGrowth) && stats.userGrowth.length > 0) {
        return stats.userGrowth;
      }
    }
    // Fallback simulated trend if server returns empty
    return [
      { period: "Period 1", users: 5, candidates: 3, employers: 2 },
      { period: "Period 2", users: 10, candidates: 7, employers: 3 },
      { period: "Period 3", users: 16, candidates: 11, employers: 5 },
      { period: "Period 4", users: 24, candidates: 17, employers: 7 },
      { period: "Period 5", users: 32, candidates: 22, employers: 10 },
      { period: "Current", users: stats?.users?.total || 35, candidates: stats?.users?.candidates || 25, employers: stats?.users?.employers || 10 },
    ];
  }, [stats, growthInterval]);

  const inputClasses =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-xs font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-border-active,#6338F6)] transition-colors";

  return (
    <div className="w-full space-y-8 font-['Inter']">
      {/* Top Header & Refresh Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          badgeIcon={ShieldCheck}
          badgeText="System Authority"
          title={
            activeTab === "overview"
              ? "Platform overview & analytics"
              : activeTab === "employers"
              ? "Employer verification queue"
              : activeTab === "campaigns"
              ? "Interview campaigns directory"
              : activeTab === "mocks"
              ? "Candidate mock evaluations"
              : activeTab === "users"
              ? "Platform user directory"
              : "Support tickets & complaints"
          }
          description={
            activeTab === "overview"
              ? "Real-time metrics, user base growth timeline, and platform distribution."
              : activeTab === "employers"
              ? "Inspect employer credentials, review company data, and approve or revoke candidate access."
              : activeTab === "campaigns"
              ? "Manage and edit all employer campaigns, custom questions, candidate limits, and verification."
              : activeTab === "mocks"
              ? "Inspect AI candidate evaluation scorecards, technical metrics, and hiring recommendations."
              : activeTab === "users"
              ? "Browse all registered candidates and employers, manage balances, and grant bonus credits."
              : "Review user tickets, update investigation status, and record internal admin notes."
          }
        />

        <button
          type="button"
          onClick={handleRefreshActiveTab}
          className="px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover,#1E1E2A)] border border-[var(--color-border)] transition-all flex items-center gap-1.5 shrink-0"
          title="Refresh active tab data from server"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Registered platform users"
              value={stats?.users?.total || 0}
              icon={Users}
              subtext="all accounts"
              trend={`${stats?.users?.candidates || 0} candidates • ${stats?.users?.employers || 0} employers`}
            />

            <MetricCard
              label="Total employers"
              value={stats?.users?.employers || 0}
              icon={Building2}
              subtext="organizations"
              trend={`${stats?.users?.verifiedEmployers || 0} verified • ${stats?.users?.unverifiedEmployers || 0} pending`}
            />

            <MetricCard
              label="Mock & live sessions"
              value={stats?.interviews?.totalSessions || stats?.interviews?.totalMockInterviews || 0}
              icon={BrainCircuit}
              subtext="sessions"
              trend={`${stats?.interviews?.totalResults || 0} evaluated scorecards`}
            />

            <MetricCard
              label="Support tickets"
              value={stats?.complaints?.total || 0}
              icon={MessageSquareWarning}
              subtext="tickets"
              trend={`${stats?.complaints?.pending || 0} pending review`}
            />
          </div>

          {/* Charts Row: User Base Growth Timeline (Replaces AI outcomes) + Composition */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* User Base Growth Chart (8 cols) */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
                <div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                    User base growth timeline
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Live registration trajectories across all user roles
                  </p>
                </div>

                {/* Granularity Interval Switcher (Days, Weeks, Months) */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
                  {[
                    { id: "daily", label: "Daily (14D)" },
                    { id: "weekly", label: "Weekly (8W)" },
                    { id: "monthly", label: "Monthly (6M)" },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setGrowthInterval(btn.id)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                        growthInterval === btn.id
                          ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-transparent"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Indicators Summary */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-1">
                <span className="flex items-center gap-1.5 text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm"></span>
                  Users (Both)
                </span>
                <span className="flex items-center gap-1.5 text-[var(--color-primary,#5B3AF2)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary,#5B3AF2)]"></span>
                  Candidates
                </span>
                <span className="flex items-center gap-1.5 text-[var(--color-success,#10B981)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-success,#10B981)]"></span>
                  Employers
                </span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="growthUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="growthCandidates" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary,#5B3AF2)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary,#5B3AF2)" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="growthEmployers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-success,#10B981)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-success,#10B981)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="period" stroke="var(--color-text-secondary)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--color-text-secondary)" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                        borderRadius: "12px",
                        color: "var(--color-text-primary)",
                        fontSize: "12px",
                      }}
                    />
                    {/* Line 1: Users (Combined both candidates & employers) */}
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="Users (Both)"
                      stroke="#FFFFFF"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#growthUsers)"
                    />
                    {/* Line 2: Candidates */}
                    <Area
                      type="monotone"
                      dataKey="candidates"
                      name="Candidates"
                      stroke="var(--color-primary,#5B3AF2)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#growthCandidates)"
                    />
                    {/* Line 3: Employers */}
                    <Area
                      type="monotone"
                      dataKey="employers"
                      name="Employers"
                      stroke="var(--color-success,#10B981)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#growthEmployers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform User Composition (4 cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                    User role composition
                  </h3>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Total: <strong className="text-[var(--color-text-primary)]">{stats?.users?.total || 0}</strong>
                  </span>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {userDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-surface)",
                          borderColor: "var(--color-border)",
                          borderRadius: "12px",
                          color: "var(--color-text-primary)",
                          fontSize: "12px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: "11px", color: "var(--color-text-secondary)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] flex items-center justify-between">
                <span>Verification Ratio</span>
                <span className="font-medium text-[var(--color-success)]">
                  {stats?.users?.employers
                    ? Math.round(((stats?.users?.verifiedEmployers || 0) / stats.users.employers) * 100)
                    : 100}
                  % verified
                </span>
              </div>
            </div>
          </div>

          {/* Recent Feeds Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Registrations */}
            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                  Recent user registrations
                </h3>
                <button
                  onClick={() => setActiveTab("users")}
                  className="text-xs font-medium text-[var(--color-text-accent,#C4B5FD)] hover:underline flex items-center gap-1"
                >
                  <span>View all</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {stats?.recentUsers?.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] border border-[var(--color-border-active,#6338F6)]/30 text-[var(--color-text-accent,#C4B5FD)] font-medium flex items-center justify-center text-xs">
                        {u.name ? u.name.substring(0, 1) : "U"}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{u.name}</p>
                        <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">{u.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                        u.role === "employer"
                          ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]/30"
                          : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                      }`}
                    >
                      {u.role || "Candidate"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Complaints */}
            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                  <MessageSquareWarning className="w-4 h-4 text-[var(--color-warning)]" />
                  Recent support tickets
                </h3>
                <button
                  onClick={() => setActiveTab("complaints")}
                  className="text-xs font-medium text-[var(--color-text-accent,#C4B5FD)] hover:underline flex items-center gap-1"
                >
                  <span>Manage tickets</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {stats?.recentComplaints?.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs"
                  >
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                        <span className="text-[var(--color-text-accent,#C4B5FD)] font-mono text-[11px]">{c.ticketId}</span>
                        <span>{c.name}</span>
                      </p>
                      <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{c.category}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                        c.status === "PENDING"
                          ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30"
                          : c.status === "IN_PROGRESS"
                          ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]/30"
                          : "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EMPLOYER VERIFICATIONS */}
      {/* ========================================================================= */}
      {activeTab === "employers" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2.5 w-full sm:w-80">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] shrink-0" />
              <input
                type="text"
                placeholder="Search by company name, email, or owner..."
                value={employerSearch}
                onChange={(e) => setEmployerSearch(e.target.value)}
                className="bg-transparent text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: "all", label: "All employers" },
                { id: "pending", label: "Pending" },
                { id: "verified", label: "Verified" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEmployerFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                    employerFilter === tab.id
                      ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--color-text-secondary)]">
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-canvas)] text-[11px] font-medium text-[var(--color-text-primary)]">
                  <tr>
                    <th className="p-4">Employer & Company</th>
                    <th className="p-4">Campaigns</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {loadingEmployers ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                        Loading employers...
                      </td>
                    </tr>
                  ) : filteredEmployers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                        No employers found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployers.map((emp) => (
                      <tr key={emp._id} className="hover:bg-[var(--color-surface-hover,#1E1E2A)] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center font-medium">
                              {emp.name ? emp.name.substring(0, 1) : "E"}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text-primary)]">{emp.name}</p>
                              <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">{emp.email}</p>
                              {emp.companyName && (
                                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Company: {emp.companyName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-[var(--color-text-primary)]">
                          {emp.campaignsCount || 0} active campaigns
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                              emp.isVerified
                                ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30"
                                : "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30"
                            }`}
                          >
                            {emp.isVerified ? "Verified" : "Pending Verification"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleVerification(emp._id, emp.isVerified)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium tracking-tight border transition-all ${
                              emp.isVerified
                                ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/30 hover:bg-[var(--color-danger)]/20"
                                : "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30 hover:bg-[var(--color-success)]/20"
                            }`}
                          >
                            {emp.isVerified ? "Revoke Verification" : "Approve & Verify"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INTERVIEW CAMPAIGNS */}
      {/* ========================================================================= */}
      {activeTab === "campaigns" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2.5 w-full sm:w-80">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] shrink-0" />
              <input
                type="text"
                placeholder="Search by title, role, or campaign code..."
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                className="bg-transparent text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {["ALL", "active", "completed", "draft", "archived"].map((st) => (
                <button
                  key={st}
                  onClick={() => setCampaignStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all capitalize ${
                    campaignStatusFilter === st
                      ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border)]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loadingCampaigns ? (
              <div className="col-span-full p-12 text-center text-xs text-[var(--color-text-secondary)]">
                Loading interview campaigns...
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="col-span-full p-12 text-center text-xs text-[var(--color-text-secondary)]">
                No campaigns found matching filter.
              </div>
            ) : (
              filteredCampaigns.map((camp) => (
                <div
                  key={camp._id}
                  className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4 hover:border-[var(--color-border-active,#6338F6)]/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-medium text-[var(--color-text-accent,#C4B5FD)] bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] px-2.5 py-0.5 rounded-lg border border-[var(--color-border-active,#6338F6)]/30">
                        {camp.interviewCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateCampaignControls(camp._id, { isVerified: !camp.isVerified })}
                          className={`px-2 py-0.5 text-[10px] font-medium rounded-full border transition-all flex items-center gap-1 ${
                            camp.isVerified
                              ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30"
                              : "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30"
                          }`}
                          title={camp.isVerified ? "Verified (Click to Revoke)" : "Unverified (Click to Verify)"}
                        >
                          {camp.isVerified ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          {camp.isVerified ? "Verified" : "Unverified"}
                        </button>
                        <StatusBadge status={camp.status} size="sm" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-[var(--color-text-primary)] leading-tight">{camp.title}</h4>
                      <p className="text-xs text-[var(--color-text-accent,#C4B5FD)] mt-0.5">{camp.jobRole}</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 truncate">
                        Created by: <strong className="text-[var(--color-text-primary)]">{camp.employer?.name || "Employer"}</strong> ({camp.employer?.email})
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--color-border)] text-xs">
                      <div>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">Duration</span>
                        <span className="font-medium text-[var(--color-text-primary)]">{camp.duration} Mins</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">Level</span>
                        <span className="font-medium text-[var(--color-text-primary)]">{camp.experienceLevel || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">Candidates</span>
                        <span className="font-medium text-[var(--color-text-accent,#C4B5FD)]">
                          {camp.assignedCandidates?.length || 0} / {camp.maxCandidates ? camp.maxCandidates : "∞"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={() => setSelectedCampaign(camp)}
                      className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] hover:bg-[var(--color-surface-hover,#1E1E2A)] rounded-xl transition-all border border-[var(--color-border)]"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    <Link
                      to={`/admin/campaigns/${camp._id}/edit`}
                      className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl transition-all shadow-md shadow-[var(--color-primary)]/20"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Inspect Campaign Modal */}
          {selectedCampaign && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                  <div>
                    <h3 className="text-base font-medium text-[var(--color-text-primary)]">{selectedCampaign.title}</h3>
                    <p className="text-xs text-[var(--color-text-accent,#C4B5FD)] font-mono">
                      Code: {selectedCampaign.interviewCode} • Role: {selectedCampaign.jobRole}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/campaigns/${selectedCampaign._id}/edit`}
                      className="px-3.5 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Campaign
                    </Link>
                    <button
                      onClick={() => setSelectedCampaign(null)}
                      className="p-1.5 rounded-xl bg-[var(--color-canvas)] text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-border)]"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Admin Controls Panel inside Modal */}
                  <div className="p-4 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-4">
                    <h4 className="text-xs font-medium text-[var(--color-text-accent,#C4B5FD)] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Admin quick overrides
                    </h4>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-[var(--color-text-primary)]">Verification Status</p>
                        <p className="text-[11px] text-[var(--color-text-secondary)]">
                          {selectedCampaign.isVerified
                            ? "Verified — Visible to candidates."
                            : "Unverified — Hidden until verified."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateCampaignControls(selectedCampaign._id, { isVerified: !selectedCampaign.isVerified })}
                        className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 border ${
                          selectedCampaign.isVerified
                            ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30"
                            : "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30"
                        }`}
                      >
                        {selectedCampaign.isVerified ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        {selectedCampaign.isVerified ? "Verified (Revoke)" : "Unverified (Verify)"}
                      </button>
                    </div>

                    <div className="pt-3 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-[var(--color-text-primary)]">Max candidate capacity</p>
                        <p className="text-[11px] text-[var(--color-text-secondary)]">
                          Enrolled: {selectedCampaign.assignedCandidates?.length || 0} • Limit: {selectedCampaign.maxCandidates || "Unlimited"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Unlimited"
                          min="1"
                          defaultValue={selectedCampaign.maxCandidates || ""}
                          id={`max-candidates-input-${selectedCampaign._id}`}
                          className="w-28 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const inputEl = document.getElementById(`max-candidates-input-${selectedCampaign._id}`);
                            const val = inputEl ? inputEl.value : "";
                            handleUpdateCampaignControls(selectedCampaign._id, { maxCandidates: val });
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)] rounded-xl"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1.5">
                    <h4 className="text-xs font-medium text-[var(--color-text-primary)]">Description</h4>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {selectedCampaign.description || "No description provided."}
                    </p>
                  </div>

                  {selectedCampaign.topics?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-[var(--color-text-primary)]">Technical topics</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCampaign.topics.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-accent,#C4B5FD)] text-xs font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCampaign.assignedCandidates?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-[var(--color-text-primary)]">
                        Assigned candidates ({selectedCampaign.assignedCandidates.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {selectedCampaign.assignedCandidates.map((c, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs"
                          >
                            <span className="font-mono text-[var(--color-text-primary)]">{c.email}</span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                                c.status === "Completed"
                                  ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30"
                                  : c.status === "In Progress"
                                  ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30"
                                  : "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]/30"
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Action */}
                  <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedCampaign(null)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border)]"
                    >
                      Close
                    </button>
                    <Link
                      to={`/admin/campaigns/${selectedCampaign._id}/edit`}
                      className="px-5 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" /> Full Campaign & Questions Editor
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MOCK ATTEMPTS */}
      {/* ========================================================================= */}
      {activeTab === "mocks" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2.5 w-full sm:w-80">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] shrink-0" />
              <input
                type="text"
                placeholder="Search by candidate name or target role..."
                value={mockSearch}
                onChange={(e) => setMockSearch(e.target.value)}
                className="bg-transparent text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {["ALL", "STRONG_HIRE", "HIRE", "BORDERLINE", "NEEDS_IMPROVEMENT", "REJECT"].map((rec) => (
                <button
                  key={rec}
                  onClick={() => setMockRecommendationFilter(rec)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                    mockRecommendationFilter === rec
                      ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border)]"
                  }`}
                >
                  {rec.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--color-text-secondary)]">
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-canvas)] text-[11px] font-medium text-[var(--color-text-primary)]">
                  <tr>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Target Track</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Recommendation</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {loadingMocks ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                        Loading mock attempts...
                      </td>
                    </tr>
                  ) : filteredMocks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                        No mock attempts found.
                      </td>
                    </tr>
                  ) : (
                    filteredMocks.map((att) => (
                      <tr key={att._id} className="hover:bg-[var(--color-surface-hover,#1E1E2A)] transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-[var(--color-text-primary)]">{att.user?.name || "Candidate"}</p>
                          <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">{att.user?.email}</p>
                        </td>
                        <td className="p-4 font-medium text-[var(--color-text-primary)]">{att.jobRole}</td>
                        <td className="p-4 font-mono font-medium text-[var(--color-text-accent,#C4B5FD)]">
                          {att.overallScore !== undefined ? `${att.overallScore}/100` : "—"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                              att.recommendation === "STRONG_HIRE" || att.recommendation === "HIRE"
                                ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30"
                                : att.recommendation === "BORDERLINE"
                                ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30"
                                : "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/30"
                            }`}
                          >
                            {(att.recommendation || "Completed").replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedAttempt(att)}
                            className="px-3 py-1.5 bg-[var(--color-canvas)] hover:bg-[var(--color-surface-hover,#1E1E2A)] text-[var(--color-text-secondary)] hover:text-white rounded-xl border border-[var(--color-border)]"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inspect Attempt Modal */}
          {selectedAttempt && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl text-xs">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                  <div>
                    <h3 className="text-base font-medium text-[var(--color-text-primary)]">
                      {selectedAttempt.user?.name}&apos;s Mock Scorecard
                    </h3>
                    <p className="text-xs text-[var(--color-text-accent,#C4B5FD)] font-mono">{selectedAttempt.jobRole}</p>
                  </div>
                  <button
                    onClick={() => setSelectedAttempt(null)}
                    className="p-1.5 rounded-xl bg-[var(--color-canvas)] text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-border)]"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[var(--color-text-primary)]">Overall Evaluation Score</span>
                    <span className="font-mono text-base font-medium text-[var(--color-text-accent,#C4B5FD)]">
                      {selectedAttempt.overallScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {selectedAttempt.overallSummary || "Evaluation summary generated by Gemini AI engine."}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAttempt(null)}
                    className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-medium"
                  >
                    Close Scorecard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: USER DIRECTORY & CREDITS (Pure client filtering on cached dataset!) */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2.5 w-full sm:w-80">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] shrink-0" />
              <input
                type="text"
                placeholder="Search by user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-transparent text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: "ALL", label: "All users" },
                { id: "candidate", label: "Candidates" },
                { id: "employer", label: "Employers" },
                { id: "admin", label: "Admins" },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setUserRoleFilter(role.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                    userRoleFilter === role.id
                      ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border)]"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--color-text-secondary)]">
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-canvas)] text-[11px] font-medium text-[var(--color-text-primary)]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Credit Balance</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                        Loading user directory...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                        No users found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-[var(--color-surface-hover,#1E1E2A)] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center font-medium">
                              {u.name ? u.name.substring(0, 1) : "U"}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text-primary)]">{u.name}</p>
                              <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                              u.role === "employer"
                                ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]/30"
                                : u.role === "admin"
                                ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30"
                                : "bg-[var(--color-canvas)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                            }`}
                          >
                            {u.role || "Candidate"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 font-mono font-medium text-[var(--color-text-primary)] bg-[var(--color-canvas)] px-2.5 py-1 rounded-lg border border-[var(--color-border)]">
                            <Coins className="w-3.5 h-3.5 text-[var(--color-warning)]" />
                            {getUserCreditBalance(u)} credits
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              u.isVerified
                                ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30"
                                : "bg-[var(--color-canvas)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                            }`}
                          >
                            {u.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => setCreditModalUser(u)}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--color-text-accent,#C4B5FD)] bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--color-primary-tint,rgba(99,56,246,0.25))] border border-[var(--color-border-active,#6338F6)]/40 transition-all"
                          >
                            Grant Credits
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grant Bonus Credits Modal */}
          {creditModalUser && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl text-xs">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                  <div>
                    <h3 className="text-base font-medium text-[var(--color-text-primary)]">
                      Grant Bonus Credits
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      Adding credits to {creditModalUser.name} ({creditModalUser.email})
                    </p>
                  </div>
                  <button
                    onClick={() => setCreditModalUser(null)}
                    className="p-1.5 rounded-xl bg-[var(--color-canvas)] text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-border)]"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-[var(--color-text-primary)] block">
                    Credits to grant
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={creditAmountInput}
                    onChange={(e) => setCreditAmountInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className={inputClasses}
                  />
                  <div className="flex gap-2">
                    {[5, 10, 25, 50].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCreditAmountInput(amt)}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-medium ${
                          creditAmountInput === amt
                            ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]"
                            : "bg-[var(--color-canvas)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                        }`}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setCreditModalUser(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGrantBonusCredits}
                    className="px-5 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium"
                  >
                    Grant {creditAmountInput} Credits
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SUPPORT & COMPLAINTS */}
      {/* ========================================================================= */}
      {activeTab === "complaints" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2.5 w-full sm:w-80">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] shrink-0" />
              <input
                type="text"
                placeholder="Search by ticket ID, user name, or category..."
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                className="bg-transparent text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {["ALL", "PENDING", "IN_PROGRESS", "RESOLVED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setComplaintStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                    complaintStatusFilter === st
                      ? "bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border)]"
                  }`}
                >
                  {st.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {loadingComplaints ? (
              <div className="p-12 text-center text-xs text-[var(--color-text-secondary)]">
                Loading support complaints...
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--color-text-secondary)]">
                No complaints found matching filter.
              </div>
            ) : (
              filteredComplaints.map((c) => (
                <div
                  key={c._id}
                  className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium text-[var(--color-text-accent,#C4B5FD)] bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] px-2.5 py-0.5 rounded-lg border border-[var(--color-border-active,#6338F6)]/30">
                        {c.ticketId}
                      </span>
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{c.name}</p>
                        <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">{c.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium">
                        {c.category}
                      </span>
                      <select
                        value={c.status}
                        onChange={(e) => handleUpdateComplaintStatus(c._id, e.target.value)}
                        className="px-3 py-1 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none cursor-pointer"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
                    <span className="text-[11px] font-medium text-[var(--color-text-primary)]">User Message:</span>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{c.description}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      type="text"
                      placeholder="Add admin internal note or resolution comment..."
                      value={adminNotesState[c._id] || ""}
                      onChange={(e) =>
                        setAdminNotesState((prev) => ({ ...prev, [c._id]: e.target.value }))
                      }
                      className={inputClasses}
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveAdminNote(c._id)}
                      className="px-4 py-2 rounded-xl bg-[var(--color-primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--color-primary-tint,rgba(99,56,246,0.25))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)] text-xs font-medium shrink-0 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save note</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
