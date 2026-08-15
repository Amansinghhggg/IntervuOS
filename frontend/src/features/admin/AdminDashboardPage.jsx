import React, { useState, useEffect } from "react";
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
  PieChart as PieChartIcon,
  Save,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "react-hot-toast";
import adminService from "../../services/adminService";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'employers', 'campaigns', 'mocks', 'complaints', 'users'

  // Global Dashboard Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

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
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await adminService.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      toast.error("Failed to load admin stats");
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Employers
  const fetchEmployers = async () => {
    try {
      setLoadingEmployers(true);
      const res = await adminService.getEmployers({
        status: employerFilter !== "all" ? employerFilter : undefined,
        search: employerSearch.trim() || undefined,
      });
      if (res.success) {
        setEmployers(res.employers || []);
      }
    } catch (error) {
      toast.error("Failed to load employers");
    } finally {
      setLoadingEmployers(false);
    }
  };

  // Fetch Employer Campaigns
  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const res = await adminService.getCampaigns({
        status: campaignStatusFilter !== "ALL" ? campaignStatusFilter : undefined,
        search: campaignSearch.trim() || undefined,
      });
      if (res.success) {
        setCampaigns(res.campaigns || []);
      }
    } catch (error) {
      toast.error("Failed to load interview campaigns");
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Update campaign controls (isVerified / maxCandidates)
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

  // Fetch Mock Attempts
  const fetchMockAttempts = async () => {
    try {
      setLoadingMocks(true);
      const res = await adminService.getMockAttempts({
        recommendation: mockRecommendationFilter !== "ALL" ? mockRecommendationFilter : undefined,
        search: mockSearch.trim() || undefined,
      });
      if (res.success) {
        setMockAttempts(res.attempts || []);
      }
    } catch (error) {
      toast.error("Failed to load mock attempts");
    } finally {
      setLoadingMocks(false);
    }
  };

  // Fetch Complaints
  const fetchComplaints = async () => {
    try {
      setLoadingComplaints(true);
      const res = await adminService.getComplaints({
        status: complaintStatusFilter !== "ALL" ? complaintStatusFilter : undefined,
        search: complaintSearch.trim() || undefined,
      });
      if (res.success) {
        const list = res.complaints || [];
        setComplaints(list);
        const notesObj = {};
        list.forEach((item) => {
          notesObj[item._id] = item.adminNote || item.adminNotes || "";
        });
        setAdminNotesState(notesObj);
      }
    } catch (error) {
      toast.error("Failed to load support complaints");
    } finally {
      setLoadingComplaints(false);
    }
  };

  // Fetch Users Directory
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await adminService.getUsers({
        role: userRoleFilter !== "ALL" ? userRoleFilter : undefined,
        search: userSearch.trim() || undefined,
      });
      if (res.success) {
        setUsersList(res.users || []);
      }
    } catch (error) {
      toast.error("Failed to load users directory");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "employers") fetchEmployers();
    if (activeTab === "campaigns") fetchCampaigns();
    if (activeTab === "mocks") fetchMockAttempts();
    if (activeTab === "complaints") fetchComplaints();
    if (activeTab === "users") fetchUsers();
  }, [
    activeTab,
    employerFilter,
    employerSearch,
    campaignStatusFilter,
    campaignSearch,
    mockRecommendationFilter,
    mockSearch,
    complaintStatusFilter,
    complaintSearch,
    userRoleFilter,
    userSearch,
  ]);

  // Handle Toggle Employer Verification
  const handleToggleVerification = async (employerId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await adminService.toggleEmployerVerification(employerId, newStatus);
      if (res.success) {
        toast.success(res.message);
        fetchEmployers();
        fetchStats();
      }
    } catch (error) {
      toast.error("Verification update failed");
    }
  };

  // Handle Complaint Note Change
  const handleNoteChange = (id, text) => {
    setAdminNotesState((prev) => ({ ...prev, [id]: text }));
  };

  // Handle Save Admin Note Specifically
  const handleSaveAdminNote = async (id) => {
    const noteText = adminNotesState[id] !== undefined ? adminNotesState[id] : "";
    try {
      const res = await adminService.updateComplaint(id, {
        adminNote: noteText,
        adminNotes: noteText,
      });
      if (res.success) {
        toast.success("Admin note updated successfully");
        fetchComplaints();
      }
    } catch (error) {
      toast.error("Failed to save admin note");
    }
  };

  // Handle Complaint Update Status & Notes
  const handleUpdateComplaintStatus = async (id, newStatus) => {
    const noteText = adminNotesState[id] !== undefined ? adminNotesState[id] : "";
    try {
      const res = await adminService.updateComplaint(id, {
        status: newStatus,
        adminNote: noteText,
        adminNotes: noteText,
      });
      if (res.success) {
        toast.success(`Complaint status updated to ${newStatus}`);
        if (selectedComplaint) {
          setSelectedComplaint(res.complaint);
        }
        fetchComplaints();
        fetchStats();
      }
    } catch (error) {
      toast.error("Failed to update complaint");
    }
  };

  // Handle Grant Bonus Credits
  const handleGrantCredits = async () => {
    if (!creditModalUser) return;
    try {
      const res = await adminService.grantBonusCredits(creditModalUser._id, creditAmountInput);
      if (res.success) {
        toast.success(res.message);
        setCreditModalUser(null);
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      toast.error("Failed to grant bonus credits");
    }
  };

  // Chart Color Palette
  const COLORS = {
    purple: "#a855f7",
    indigo: "#6366f1",
    emerald: "#10b981",
    amber: "#f59e0b",
    rose: "#f43f5e",
    cyan: "#06b6d4",
  };

  // Chart data prepped from stats
  const userDistributionData = stats
    ? [
        { name: "Candidates", value: stats.users.candidates, color: COLORS.indigo },
        { name: "Employers", value: stats.users.employers, color: COLORS.purple },
        { name: "Admins", value: stats.users.admins, color: COLORS.cyan },
      ]
    : [];

  const recommendationChartData = stats
    ? Object.keys(stats.interviews.recommendations).map((key) => ({
        name: key.replace("_", " "),
        count: stats.interviews.recommendations[key],
      }))
    : [];

  const complaintCategoryChartData = stats
    ? Object.keys(stats.complaints.categories).map((cat) => ({
        name: cat.toUpperCase(),
        value: stats.complaints.categories[cat],
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-[#0f1422] border border-purple-500/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Root System Dashboard
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              ForkTalent Admin Console
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Monitor platform growth, verify employers, inspect AI mock interviews, and resolve user support complaints in real time.
            </p>
          </div>

          <button
            onClick={() => {
              fetchStats();
              if (activeTab === "employers") fetchEmployers();
              if (activeTab === "campaigns") fetchCampaigns();
              if (activeTab === "mocks") fetchMockAttempts();
              if (activeTab === "complaints") fetchComplaints();
              if (activeTab === "users") fetchUsers();
              toast.success("Dashboard refreshed");
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-xs font-bold uppercase tracking-wider transition-all self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 overflow-x-auto pt-6 mt-6 border-t border-purple-500/10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "overview", label: "Overview & Analytics", icon: BarChart3 },
            { id: "employers", label: "Employer Verifications", icon: ShieldCheck, badge: stats?.users?.unverifiedEmployers },
            { id: "campaigns", label: "Interview Campaigns", icon: Briefcase },
            { id: "mocks", label: "Mock Attempts", icon: BrainCircuit },
            { id: "complaints", label: "Complaints & Tickets", icon: MessageSquareWarning, badge: stats?.complaints?.pending },
            { id: "users", label: "User Directory", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-purple-950/20 text-slate-400 hover:text-white hover:bg-purple-950/40 border border-purple-500/10"
                }`}
              >
                <Icon className="w-4 h-4 text-purple-300" />
                <span>{tab.label}</span>
                {Boolean(tab.badge) && (
                  <span className="ml-1 px-2 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & GRAPHICAL ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f1422] border border-purple-500/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-indigo-400">
                <Users className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">Users</span>
              </div>
              <h3 className="text-2xl font-black text-white">{stats?.users?.total || 0}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{stats?.users?.candidates || 0} Candidates</span> • <span>{stats?.users?.employers || 0} Employers</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f1422] border border-purple-500/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-purple-400">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">Employers</span>
              </div>
              <h3 className="text-2xl font-black text-white">{stats?.users?.employers || 0}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">{stats?.users?.verifiedEmployers || 0} Verified</span> • 
                <span className="text-amber-400 font-bold">{stats?.users?.unverifiedEmployers || 0} Pending</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f1422] border border-purple-500/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-emerald-400">
                <BrainCircuit className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Mock Attempts</span>
              </div>
              <h3 className="text-2xl font-black text-white">{stats?.interviews?.totalMockInterviews || 0}</h3>
              <p className="text-xs text-slate-400">
                {stats?.interviews?.totalResults || 0} Evaluated AI Session Results
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f1422] border border-purple-500/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-rose-400">
                <MessageSquareWarning className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">Support</span>
              </div>
              <h3 className="text-2xl font-black text-white">{stats?.complaints?.total || 0}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="text-rose-400 font-bold">{stats?.complaints?.pending || 0} Pending</span> • 
                <span className="text-emerald-400 font-bold">{stats?.complaints?.resolved || 0} Resolved</span>
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Roles Pie Chart */}
            <div className="p-6 rounded-3xl bg-[#0f1422] border border-purple-500/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-purple-400" /> Platform User Composition
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Total Users: <strong className="text-white font-bold">{stats?.users?.total || 0}</strong>
                </span>
              </div>
              <div className="h-64 w-full">
                {userDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {userDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f1422", borderColor: "rgba(168, 85, 247, 0.2)", borderRadius: "12px", color: "#fff" }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">No data</div>
                )}
              </div>
            </div>

            {/* AI Recommendation Distribution Bar Chart */}
            <div className="p-6 rounded-3xl bg-[#0f1422] border border-purple-500/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> AI Evaluation Outcomes
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Total Evaluated: <strong className="text-white font-bold">{stats?.interviews?.totalResults || 0}</strong>
                </span>
              </div>
              <div className="h-64 w-full">
                {recommendationChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recommendationChartData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f1422", borderColor: "rgba(168, 85, 247, 0.2)", borderRadius: "12px", color: "#fff" }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">No data</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Feeds Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Registrations */}
            <div className="p-6 rounded-3xl bg-[#0f1422] border border-purple-500/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-purple-500/10 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" /> Recent User Registrations
                </h3>
                <button onClick={() => setActiveTab("users")} className="text-[10px] text-purple-400 hover:underline uppercase font-bold">View All</button>
              </div>
              <div className="space-y-3">
                {stats?.recentUsers?.map((u) => (
                  <div key={u._id} className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 border border-purple-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold flex items-center justify-center text-xs">
                        {u.name ? u.name.substring(0, 1) : "U"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${u.role === "employer" ? "bg-purple-500/20 text-purple-300" : "bg-indigo-500/20 text-indigo-300"}`}>
                      {u.role || "Candidate"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Complaints */}
            <div className="p-6 rounded-3xl bg-[#0f1422] border border-purple-500/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-purple-500/10 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <MessageSquareWarning className="w-4 h-4 text-rose-400" /> Recent Support Tickets
                </h3>
                <button onClick={() => setActiveTab("complaints")} className="text-[10px] text-purple-400 hover:underline uppercase font-bold">Manage Complaints</button>
              </div>
              <div className="space-y-3">
                {stats?.recentComplaints?.map((c) => (
                  <div key={c._id} className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 border border-purple-500/10">
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="text-purple-400 font-mono text-[10px]">{c.ticketId}</span>
                        <span>{c.name}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">{c.category}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${c.status === "PENDING" ? "bg-rose-500/20 text-rose-300" : c.status === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f1422] border border-purple-500/10">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Search className="w-4 h-4 text-purple-400" />
              <input
                type="text"
                placeholder="Search employer by name or email..."
                value={employerSearch}
                onChange={(e) => setEmployerSearch(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full md:w-64"
              />
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              {["all", "pending", "verified"].map((status) => (
                <button
                  key={status}
                  onClick={() => setEmployerFilter(status)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    employerFilter === status
                      ? "bg-purple-600 text-white"
                      : "bg-purple-950/20 text-slate-400 hover:text-white border border-purple-500/10"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#0f1422] border border-purple-500/10 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-purple-950/40 text-purple-300 uppercase font-black tracking-wider text-[10px] border-b border-purple-500/10">
                  <tr>
                    <th className="p-4">Employer</th>
                    <th className="p-4">Campaigns</th>
                    <th className="p-4">Credits Balance</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {loadingEmployers ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">Loading employers...</td>
                    </tr>
                  ) : employers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">No employers found matching your criteria.</td>
                    </tr>
                  ) : (
                    employers.map((emp) => (
                      <tr key={emp._id} className="hover:bg-purple-950/10 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
                              {emp.name ? emp.name.substring(0, 1) : "E"}
                            </div>
                            <div>
                              <p className="font-bold text-white">{emp.name}</p>
                              <p className="text-[10px] text-slate-400">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-white">{emp.campaignsCount || 0} Campaigns</td>
                        <td className="p-4 text-purple-300 font-mono font-bold">
                          {emp.credits?.availableCredits ?? 0} Credits
                        </td>
                        <td className="p-4">
                          {emp.isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <ShieldAlert className="w-3 h-3" /> Pending Verification
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleVerification(emp._id, emp.isVerified)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                              emp.isVerified
                                ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30"
                                : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f1422] border border-purple-500/10">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Search className="w-4 h-4 text-purple-400" />
              <input
                type="text"
                placeholder="Search by title, role, or code..."
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full md:w-64"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {["ALL", "active", "completed", "draft", "archived"].map((st) => (
                <button
                  key={st}
                  onClick={() => setCampaignStatusFilter(st)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    campaignStatusFilter === st
                      ? "bg-purple-600 text-white"
                      : "bg-purple-950/20 text-slate-400 hover:text-white border border-purple-500/10"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingCampaigns ? (
              <div className="col-span-full p-8 text-center text-slate-500">Loading interview campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500">No employer campaigns found.</div>
            ) : (
              campaigns.map((camp) => (
                <div
                  key={camp._id}
                  className="p-5 rounded-3xl bg-[#0f1422] border border-purple-500/10 shadow-xl space-y-4 hover:border-purple-500/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded border border-purple-500/30">
                        {camp.interviewCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateCampaignControls(camp._id, { isVerified: !camp.isVerified })}
                          className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border transition-all flex items-center gap-1 ${
                            camp.isVerified
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-emerald-500/20 hover:text-emerald-300"
                          }`}
                          title={camp.isVerified ? "Verified — Click to revoke candidate access" : "Unverified — Click to verify & make visible to candidates"}
                        >
                          {camp.isVerified ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          {camp.isVerified ? "Verified" : "Unverified"}
                        </button>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border ${
                          camp.status === "active"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : camp.status === "completed"
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                            : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                        }`}>
                          {camp.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{camp.title}</h4>
                      <p className="text-xs text-purple-300 font-semibold">{camp.jobRole}</p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <span>Created by: <strong className="text-slate-200">{camp.employer?.name || "Employer"}</strong></span>
                        <span>({camp.employer?.email})</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-purple-500/10 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Duration</span>
                        <span className="font-bold text-slate-200 text-xs">{camp.duration} Mins</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Level</span>
                        <span className="font-bold text-slate-200 text-xs">{camp.experienceLevel || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Capacity</span>
                        <span className="font-bold text-purple-300 text-xs">
                          {camp.assignedCandidates?.length || 0} / {camp.maxCandidates ? camp.maxCandidates : "∞"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCampaign(camp)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider bg-purple-950/40 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl transition-all border border-purple-500/20"
                  >
                    <Eye className="w-3.5 h-3.5" /> Campaign Details
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Inspect Campaign Modal */}
          {selectedCampaign && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0f1422] border border-purple-500/20 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedCampaign.title}</h3>
                    <p className="text-xs text-purple-400 font-mono">Code: {selectedCampaign.interviewCode} • Role: {selectedCampaign.jobRole}</p>
                  </div>
                  <button onClick={() => setSelectedCampaign(null)} className="p-1 rounded-lg bg-purple-500/10 text-slate-400 hover:text-white">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  {/* Admin Control Settings Panel */}
                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-4 shadow-inner">
                    <h4 className="font-bold text-purple-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-400" /> Admin Campaign Controls
                    </h4>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-white">Verification Status</p>
                        <p className="text-[10px] text-slate-400">
                          {selectedCampaign.isVerified
                            ? "Verified — Visible and accessible to assigned candidates."
                            : "Unverified — Hidden from candidates until verified by Admin."}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUpdateCampaignControls(selectedCampaign._id, { isVerified: !selectedCampaign.isVerified })}
                        className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 ${
                          selectedCampaign.isVerified
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-emerald-500/20 hover:text-emerald-300"
                        }`}
                      >
                        {selectedCampaign.isVerified ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        {selectedCampaign.isVerified ? "Verified (Click to Unverify)" : "Unverified (Click to Verify)"}
                      </button>
                    </div>

                    <div className="pt-3 border-t border-purple-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-white">Maximum Candidates Limit</p>
                        <p className="text-[10px] text-slate-400">
                          Enrolled: <strong className="text-purple-300">{selectedCampaign.assignedCandidates?.length || 0}</strong> • Limit: <strong className="text-purple-300">{selectedCampaign.maxCandidates || "Unlimited"}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Unlimited"
                          min="1"
                          defaultValue={selectedCampaign.maxCandidates || ""}
                          id={`max-candidates-input-${selectedCampaign._id}`}
                          className="w-28 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                        />
                        <button
                          onClick={() => {
                            const inputEl = document.getElementById(`max-candidates-input-${selectedCampaign._id}`);
                            const val = inputEl ? inputEl.value : "";
                            handleUpdateCampaignControls(selectedCampaign._id, { maxCandidates: val });
                          }}
                          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all flex items-center gap-1 shadow-md"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Limit
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-2">
                    <h4 className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">Description & Details</h4>
                    <p className="text-slate-200">{selectedCampaign.description || "No description provided."}</p>
                    {selectedCampaign.instructions && (
                      <p className="text-slate-400 text-[11px] mt-2 italic">Instructions: {selectedCampaign.instructions}</p>
                    )}
                  </div>

                  {selectedCampaign.topics?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">Interview Topics</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCampaign.topics.map((t, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCampaign.assignedCandidates?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">Assigned Candidates ({selectedCampaign.assignedCandidates.length})</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {selectedCampaign.assignedCandidates.map((c, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/10 text-xs">
                            <span className="font-bold text-white">{c.email}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                              c.status === "Completed" ? "bg-emerald-500/20 text-emerald-300" : c.status === "In Progress" ? "bg-amber-500/20 text-amber-300" : "bg-slate-500/20 text-slate-400"
                            }`}>
                              {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MOCK ATTEMPTS */}
      {/* ========================================================================= */}
      {activeTab === "mocks" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f1422] border border-purple-500/10">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Search className="w-4 h-4 text-purple-400" />
              <input
                type="text"
                placeholder="Search by candidate name or role..."
                value={mockSearch}
                onChange={(e) => setMockSearch(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full md:w-64"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {["ALL", "STRONG_HIRE", "HIRE", "BORDERLINE", "NEEDS_IMPROVEMENT", "REJECT"].map((rec) => (
                <button
                  key={rec}
                  onClick={() => setMockRecommendationFilter(rec)}
                  className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${
                    mockRecommendationFilter === rec
                      ? "bg-purple-600 text-white"
                      : "bg-purple-950/20 text-slate-400 hover:text-white border border-purple-500/10"
                  }`}
                >
                  {rec.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingMocks ? (
              <div className="col-span-full p-8 text-center text-slate-500">Loading mock attempts...</div>
            ) : mockAttempts.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500">No candidate mock attempts found.</div>
            ) : (
              mockAttempts.map((attempt) => (
                <div
                  key={attempt._id}
                  className="p-5 rounded-3xl bg-[#0f1422] border border-purple-500/10 shadow-xl space-y-4 hover:border-purple-500/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                        {attempt.interviewSnapshot?.jobRole || "Mock Candidate"}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full border ${
                        attempt.recommendation === "STRONG_HIRE" || attempt.recommendation === "HIRE"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : attempt.recommendation === "BORDERLINE"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}>
                        {attempt.recommendation?.replace("_", " ") || "N/A"}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{attempt.candidateId?.name || "Anonymous Candidate"}</h4>
                      <p className="text-[10px] text-slate-400">{attempt.candidateId?.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-500/10 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Score</span>
                        <span className="font-black text-purple-300 text-sm">{attempt.scores?.overall ?? "N/A"} / 10</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Technical</span>
                        <span className="font-black text-indigo-300 text-sm">{attempt.scores?.technical ?? "N/A"} / 10</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAttempt(attempt)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider bg-purple-950/40 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl transition-all border border-purple-500/20"
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect AI Evaluation
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Inspect Attempt Modal */}
          {selectedAttempt && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0f1422] border border-purple-500/20 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white">AI Evaluation Details</h3>
                    <p className="text-xs text-purple-400">{selectedAttempt.candidateId?.name} ({selectedAttempt.candidateId?.email})</p>
                  </div>
                  <button onClick={() => setSelectedAttempt(null)} className="p-1 rounded-lg bg-purple-500/10 text-slate-400 hover:text-white">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-2">
                    <h4 className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">AI Reasoning & Verdict</h4>
                    <p className="italic text-slate-200">{selectedAttempt.reasoning || "No detailed reasoning available."}</p>
                  </div>

                  {selectedAttempt.strengths?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">Strengths</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {selectedAttempt.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedAttempt.weaknesses?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">Areas for Improvement</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {selectedAttempt.weaknesses.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPLAINTS HANDLING */}
      {/* ========================================================================= */}
      {activeTab === "complaints" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f1422] border border-purple-500/10">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Search className="w-4 h-4 text-purple-400" />
              <input
                type="text"
                placeholder="Search ticket ID, email, message..."
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full md:w-64"
              />
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              {["ALL", "PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setComplaintStatusFilter(st)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    complaintStatusFilter === st
                      ? "bg-purple-600 text-white"
                      : "bg-purple-950/20 text-slate-400 hover:text-white border border-purple-500/10"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {loadingComplaints ? (
              <div className="p-8 text-center text-slate-500">Loading complaints...</div>
            ) : complaints.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No support tickets found.</div>
            ) : (
              complaints.map((c) => (
                <div
                  key={c._id}
                  className="p-5 rounded-3xl bg-[#0f1422] border border-purple-500/10 shadow-xl space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-purple-500/10 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold text-purple-300 bg-purple-500/20 rounded border border-purple-500/30">
                        {c.ticketId}
                      </span>
                      <h4 className="text-sm font-bold text-white">{c.subject}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full ${
                        c.status === "PENDING"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : c.status === "IN_PROGRESS"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-[#080b12] p-3 rounded-2xl border border-purple-500/5">{c.message}</p>

                  {/* Admin Note Section */}
                  <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        Admin Note / Resolution Response
                      </label>
                      {(c.adminNote || c.adminNotes) && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Saved Note
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Add official resolution notes or internal response for this support ticket..."
                      value={adminNotesState[c._id] ?? (c.adminNote || c.adminNotes || "")}
                      onChange={(e) => handleNoteChange(c._id, e.target.value)}
                      className="w-full bg-[#070913] text-xs text-slate-200 placeholder-slate-500 rounded-xl p-2.5 border border-purple-500/20 focus:border-purple-400 focus:outline-none resize-none transition-all"
                    />
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleSaveAdminNote(c._id)}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Note
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 text-[11px] text-slate-400">
                    <div>
                      <span>Submitted by: <strong className="text-white">{c.name}</strong> ({c.email})</span>
                      {c.interviewCode && <span className="ml-2 text-purple-400 font-mono">• Code: {c.interviewCode}</span>}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Status:</span>
                      <button
                        onClick={() => handleUpdateComplaintStatus(c._id, "PENDING")}
                        className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg transition-all ${
                          c.status === "PENDING"
                            ? "bg-rose-500 text-white shadow-sm"
                            : "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20"
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleUpdateComplaintStatus(c._id, "IN_PROGRESS")}
                        className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg transition-all ${
                          c.status === "IN_PROGRESS"
                            ? "bg-amber-500 text-white shadow-sm"
                            : "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20"
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleUpdateComplaintStatus(c._id, "RESOLVED")}
                        className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg transition-all ${
                          c.status === "RESOLVED"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20"
                        }`}
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleUpdateComplaintStatus(c._id, "CLOSED")}
                        className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg transition-all ${
                          c.status === "CLOSED"
                            ? "bg-slate-700 text-white shadow-sm"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
                        }`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: USER DIRECTORY & BONUS CREDITS */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f1422] border border-purple-500/10">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Search className="w-4 h-4 text-purple-400" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full md:w-64"
              />
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              {["ALL", "candidate", "employer", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    userRoleFilter === r
                      ? "bg-purple-600 text-white"
                      : "bg-purple-950/20 text-slate-400 hover:text-white border border-purple-500/10"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#0f1422] border border-purple-500/10 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-purple-950/40 text-purple-300 uppercase font-black tracking-wider text-[10px] border-b border-purple-500/10">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Available Credits</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">Loading user directory...</td>
                    </tr>
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">No users found.</td>
                    </tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-purple-950/10 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
                              {u.name ? u.name.substring(0, 1) : "U"}
                            </div>
                            <div>
                              <p className="font-bold text-white">{u.name}</p>
                              <p className="text-[10px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full ${
                            u.role === "admin" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : u.role === "employer" ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/20 text-emerald-300"
                          }`}>
                            {u.role || "Candidate"}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-purple-300">
                          {u.credits?.availableCredits ?? 0} Credits
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setCreditModalUser(u);
                              setCreditAmountInput(10);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30 transition-all ml-auto"
                          >
                            <Coins className="w-3.5 h-3.5" /> Grant Bonus Credits
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
              <div className="bg-[#0f1422] border border-purple-500/20 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Coins className="w-5 h-5 text-purple-400" /> Grant Bonus Credits
                  </h3>
                  <button onClick={() => setCreditModalUser(null)} className="p-1 rounded-lg bg-purple-500/10 text-slate-400 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs">
                    <p className="text-slate-400">Recipient:</p>
                    <p className="font-bold text-white text-sm">{creditModalUser.name}</p>
                    <p className="text-[10px] text-purple-400">{creditModalUser.email}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Credits Amount</label>
                    <input
                      type="number"
                      min="1"
                      value={creditAmountInput}
                      onChange={(e) => setCreditAmountInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setCreditModalUser(null)}
                    className="px-4 py-2 text-xs font-bold uppercase text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGrantCredits}
                    className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-600/30 hover:opacity-90 transition-all"
                  >
                    Confirm Grant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
