import User from "../users/user.model.js";
import Complaint from "../complaints/complaint.model.js";
import MockInterview from "../interview/models/MockInterview.js";
import InterviewResult from "../interview/models/InterviewResult.js";
import Interview from "../interview/models/interview.model.js";
import InterviewSession from "../interview/models/InterviewSession.js";
import Transaction from "../payments/models/Transaction.js";
import { cacheService } from "../../shared/services/cacheService.js";

// @desc    Get aggregate high-level metrics & graphical chart data for admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const data = await cacheService.getOrSetCache("admin:dashboard:stats", 60, async () => {
      const [
        totalUsers,
        totalCandidates,
        totalEmployers,
        totalAdmins,
        totalMockInterviews,
        totalEmployerCampaigns,
        totalSessions,
        totalResults,
        recommendationStats,
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        categoryComplaints,
        recentUsers,
        recentComplaints,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "candidate" }),
        User.countDocuments({ role: "employer" }),
        User.countDocuments({ role: "admin" }),
        MockInterview.countDocuments(),
        Interview.countDocuments({ mode: "REGULAR" }),
        InterviewSession.countDocuments(),
        InterviewResult.countDocuments(),
        InterviewResult.aggregate([
          {
            $group: {
              _id: "$recommendation",
              count: { $sum: 1 },
            },
          },
        ]),
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: "PENDING" }),
        Complaint.countDocuments({ status: "IN_PROGRESS" }),
        Complaint.countDocuments({ status: "RESOLVED" }),
        Complaint.aggregate([
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
            },
          },
        ]),
        User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt profilePicture"),
        Complaint.find().sort({ createdAt: -1 }).limit(5).select("ticketId name email category status createdAt"),
      ]);

      // Format recommendation stats map
      const recommendations = {
        STRONG_HIRE: 0,
        HIRE: 0,
        BORDERLINE: 0,
        NEEDS_IMPROVEMENT: 0,
        REJECT: 0,
        NOT_EVALUATED: 0,
      };
      recommendationStats.forEach((item) => {
        if (item._id && recommendations[item._id] !== undefined) {
          recommendations[item._id] = item.count;
        }
      });

      // Format category complaints map
      const complaintCategories = {};
      categoryComplaints.forEach((item) => {
        if (item._id) {
          complaintCategories[item._id] = item.count;
        }
      });

      // Calculate daily, weekly, and monthly user growth
      const monthShorts = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      // 1. Daily Growth (Last 14 Days)
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
      fourteenDaysAgo.setHours(0, 0, 0, 0);

      const dailyRaw = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: fourteenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
              role: "$role",
            },
            count: { $sum: 1 },
          },
        },
      ]);

      const dailyGrowth = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const label = `${dayNames[d.getDay()]}, ${day} ${monthShorts[d.getMonth()]}`;

        const cand = dailyRaw
          .filter((g) => g._id.year === y && g._id.month === m && g._id.day === day && g._id.role === "candidate")
          .reduce((sum, g) => sum + g.count, 0);

        const emp = dailyRaw
          .filter((g) => g._id.year === y && g._id.month === m && g._id.day === day && g._id.role === "employer")
          .reduce((sum, g) => sum + g.count, 0);

        dailyGrowth.push({
          period: label,
          candidates: cand,
          employers: emp,
          users: cand + emp,
        });
      }

      // 2. Weekly Growth (Last 8 Weeks)
      const weeklyGrowth = [];
      for (let i = 7; i >= 0; i--) {
        const startD = new Date();
        startD.setDate(startD.getDate() - (i + 1) * 7);
        const endD = new Date();
        endD.setDate(endD.getDate() - i * 7);

        const label = `Wk ${8 - i}`;

        const cand = await User.countDocuments({
          role: "candidate",
          createdAt: { $gte: startD, $lt: endD },
        });

        const emp = await User.countDocuments({
          role: "employer",
          createdAt: { $gte: startD, $lt: endD },
        });

        weeklyGrowth.push({
          period: label,
          candidates: cand,
          employers: emp,
          users: cand + emp,
        });
      }

      // 3. Monthly Growth (Last 6 Months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const monthlyRaw = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              role: "$role",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      const monthlyGrowth = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const periodLabel = `${monthShorts[d.getMonth()]} ${y}`;

        const cand = monthlyRaw
          .filter((g) => g._id.year === y && g._id.month === m && g._id.role === "candidate")
          .reduce((sum, g) => sum + g.count, 0);

        const emp = monthlyRaw
          .filter((g) => g._id.year === y && g._id.month === m && g._id.role === "employer")
          .reduce((sum, g) => sum + g.count, 0);

        monthlyGrowth.push({
          period: periodLabel,
          candidates: cand,
          employers: emp,
          users: cand + emp,
        });
      }

      return {
        users: {
          total: totalUsers,
          candidates: totalCandidates,
          employers: totalEmployers,
          admins: totalAdmins,
        },
        userGrowth: {
          daily: dailyGrowth,
          weekly: weeklyGrowth,
          monthly: monthlyGrowth,
        },
        interviews: {
          totalMockInterviews,
          totalEmployerCampaigns,
          totalSessions,
          totalResults,
          recommendations,
        },
        complaints: {
          total: totalComplaints,
          pending: pendingComplaints,
          inProgress: inProgressComplaints,
          resolved: resolvedComplaints,
          categories: complaintCategories,
        },
        recentUsers,
        recentComplaints,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of employers with verification status and campaign counts
// @route   GET /api/admin/employers
// @access  Private (Admin)
export const getEmployers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const cacheKey = `admin:employers:${search || ""}:${status || ""}:${page}:${limit}`;

    const cached = await cacheService.getOrSetCache(cacheKey, 60, async () => {
      const query = { role: "employer" };

      if (status === "verified") query.isVerified = true;
      if (status === "pending") query.isVerified = false;

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [employers, total] = await Promise.all([
        User.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        User.countDocuments(query),
      ]);

      // Attach campaign count for each employer
      const employerIds = employers.map((emp) => emp._id);
      const campaignCounts = await Interview.aggregate([
        { $match: { employer: { $in: employerIds } } },
        { $group: { _id: "$employer", count: { $sum: 1 } } },
      ]);

      const campaignMap = {};
      campaignCounts.forEach((c) => {
        campaignMap[c._id.toString()] = c.count;
      });

      const formattedEmployers = employers.map((emp) => ({
        ...emp,
        campaignsCount: campaignMap[emp._id.toString()] || 0,
      }));

      return {
        count: formattedEmployers.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        employers: formattedEmployers,
      };
    });

    res.status(200).json({
      success: true,
      ...cached,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle employer verification status (Approve / Revoke)
// @route   PATCH /api/admin/employers/:id/verify
// @access  Private (Admin)
export const toggleEmployerVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const employer = await User.findById(id);

    if (!employer || employer.role !== "employer") {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    employer.isVerified = typeof isVerified === "boolean" ? isVerified : !employer.isVerified;
    await employer.save();

    // Invalidate admin caches
    await cacheService.invalidateCachePattern("admin:*");

    res.status(200).json({
      success: true,
      message: `Employer ${employer.name} verification status updated to ${employer.isVerified ? "Verified" : "Pending/Unverified"}.`,
      employer: {
        _id: employer._id,
        name: employer.name,
        email: employer.email,
        isVerified: employer.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mock interview attempts and candidate evaluations
// @route   GET /api/admin/mock-attempts
// @access  Private (Admin)
export const getMockAttempts = async (req, res, next) => {
  try {
    const { search, recommendation, page = 1, limit = 20 } = req.query;
    const cacheKey = `admin:mocks:${search || ""}:${recommendation || ""}:${page}:${limit}`;

    const cached = await cacheService.getOrSetCache(cacheKey, 60, async () => {
      const query = { mode: "MOCK" };

      if (recommendation) {
        query.recommendation = recommendation;
      }

      const skip = (Number(page) - 1) * Number(limit);

      let results = await InterviewResult.find(query)
        .populate("candidateId", "name email profilePicture credits")
        .populate("sessionId", "status startedAt createdAt recording")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      if (search) {
        const searchRegex = new RegExp(search, "i");
        results = results.filter(
          (r) =>
            searchRegex.test(r.candidateId?.name || "") ||
            searchRegex.test(r.candidateId?.email || "") ||
            searchRegex.test(r.interviewSnapshot?.jobRole || "")
        );
      }

      const total = await InterviewResult.countDocuments(query);

      return {
        count: results.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        attempts: results,
      };
    });

    res.status(200).json({
      success: true,
      ...cached,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user complaints/support tickets with filters
// @route   GET /api/admin/complaints
// @access  Private (Admin)
export const getComplaints = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const cacheKey = `admin:complaints:${status || ""}:${category || ""}:${search || ""}:${page}:${limit}`;

    const cached = await cacheService.getOrSetCache(cacheKey, 60, async () => {
      const query = {};

      if (status) query.status = status;
      if (category) query.category = category;

      if (search) {
        query.$or = [
          { ticketId: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [tickets, total] = await Promise.all([
        Complaint.find(query)
          .populate("userId", "name email role profilePicture")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Complaint.countDocuments(query),
      ]);

      return {
        count: tickets.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        complaints: tickets,
      };
    });

    res.status(200).json({
      success: true,
      ...cached,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status or admin notes
// @route   PATCH /api/admin/complaints/:id
// @access  Private (Admin)
export const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, adminNote, adminnote } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint ticket not found",
      });
    }

    if (status) complaint.status = status;

    const noteContent = adminNotes !== undefined ? adminNotes : (adminNote !== undefined ? adminNote : adminnote);
    if (noteContent !== undefined) {
      complaint.adminNotes = noteContent;
      complaint.adminNote = noteContent;
    }

    await complaint.save();

    // Invalidate admin caches
    await cacheService.invalidateCachePattern("admin:*");

    res.status(200).json({
      success: true,
      message: `Complaint ${complaint.ticketId} updated successfully.`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of all platform users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const cacheKey = `admin:users:${role || ""}:${search || ""}:${page}:${limit}`;

    const cached = await cacheService.getOrSetCache(cacheKey, 60, async () => {
      const query = {};

      if (role) query.role = role;

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [users, total] = await Promise.all([
        User.find(query)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        User.countDocuments(query),
      ]);

      return {
        count: users.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        users,
      };
    });

    res.status(200).json({
      success: true,
      ...cached,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Grant bonus credits to a user
// @route   POST /api/admin/users/:id/credits
// @access  Private (Admin)
export const grantBonusCredits = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { creditsAmount } = req.body;

    const amount = Number(creditsAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid positive credit amount",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.credits) {
      user.credits = { availableCredits: 0, totalBonusCredits: 0 };
    }

    user.credits.availableCredits = (user.credits.availableCredits || 0) + amount;
    user.credits.totalBonusCredits = (user.credits.totalBonusCredits || 0) + amount;
    user.credits.lastTopUpAt = new Date();

    await user.save();

    // Create persistent BONUS transaction record for audit trail & user history
    await Transaction.create({
      userId: user._id,
      type: "BONUS",
      credits: amount,
      amount: 0,
      status: "paid",
      description: `Admin Granted Bonus Credits (+${amount} Credits)`,
    });

    // Invalidate caches
    await Promise.all([
      cacheService.invalidateCachePattern("admin:*"),
      cacheService.invalidateCache(`user:profile:${user._id}`),
    ]);

    res.status(200).json({
      success: true,
      message: `Granted ${amount} bonus credits to ${user.name}. New balance: ${user.credits.availableCredits}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all interview campaigns created by employers
// @route   GET /api/admin/campaigns
// @access  Private (Admin)
export const getCampaigns = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const cacheKey = `admin:campaigns:${status || ""}:${search || ""}:${page}:${limit}`;

    const cached = await cacheService.getOrSetCache(cacheKey, 60, async () => {
      const query = { mode: "REGULAR" };

      if (status) query.status = status;

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { jobRole: { $regex: search, $options: "i" } },
          { interviewCode: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [campaigns, total] = await Promise.all([
        Interview.find(query)
          .populate("employer", "name email profilePicture isVerified")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Interview.countDocuments(query),
      ]);

      return {
        count: campaigns.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        campaigns,
      };
    });

    res.status(200).json({
      success: true,
      ...cached,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin get full interview campaign by ID
// @route   GET /api/admin/campaigns/:id
// @access  Private (Admin)
export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Interview.findById(req.params.id)
      .populate("employer", "name email companyName profilePicture isVerified");

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Interview campaign not found",
      });
    }

    res.status(200).json({
      success: true,
      campaign,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update interview campaign details (controls, questions, candidates, settings)
// @route   PATCH /api/admin/campaigns/:id
// @access  Private (Admin)
export const updateCampaignControls = async (req, res, next) => {
  try {
    const campaign = await Interview.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Interview campaign not found",
      });
    }

    const {
      title,
      jobRole,
      description,
      topics,
      experienceLevel,
      duration,
      instructions,
      requireApproval,
      status,
      questionMode,
      customQuestions,
      isVerified,
      maxCandidates,
      candidateEmails,
      removeCandidateEmail,
      addCandidateEmail,
    } = req.body;

    if (title !== undefined) campaign.title = title;
    if (jobRole !== undefined) campaign.jobRole = jobRole;
    if (description !== undefined) campaign.description = description;
    if (topics !== undefined && Array.isArray(topics)) campaign.topics = topics;
    if (experienceLevel !== undefined) campaign.experienceLevel = experienceLevel;
    if (duration !== undefined) campaign.duration = Number(duration);
    if (instructions !== undefined) campaign.instructions = instructions;
    if (requireApproval !== undefined) campaign.requireApproval = Boolean(requireApproval);
    if (status !== undefined) campaign.status = status;
    if (questionMode !== undefined) campaign.questionMode = questionMode;
    if (customQuestions !== undefined && Array.isArray(customQuestions)) campaign.customQuestions = customQuestions;

    if (typeof isVerified === "boolean") {
      campaign.isVerified = isVerified;
    }

    if (maxCandidates !== undefined) {
      if (maxCandidates === null || maxCandidates === "" || maxCandidates === "unlimited") {
        campaign.maxCandidates = null;
      } else {
        const parsed = parseInt(maxCandidates, 10);
        campaign.maxCandidates = isNaN(parsed) || parsed <= 0 ? null : parsed;
      }
    }

    // Merge new candidates if provided
    if (candidateEmails && Array.isArray(candidateEmails)) {
      const existingEmails = (campaign.assignedCandidates || []).map((c) => c.email.toLowerCase());
      const uniqueNewEmails = [...new Set(candidateEmails.map((e) => e.toLowerCase()))];
      const newCandidates = uniqueNewEmails
        .filter((email) => !existingEmails.includes(email))
        .map((email) => ({ email, status: "Pending" }));
      campaign.assignedCandidates.push(...newCandidates);
    }

    // Remove candidate if provided
    if (removeCandidateEmail) {
      const emailToRemove = removeCandidateEmail.toLowerCase();
      campaign.assignedCandidates = (campaign.assignedCandidates || []).filter(
        (c) => c.email && c.email.toLowerCase() !== emailToRemove
      );
    }

    // Add single candidate if provided
    if (addCandidateEmail) {
      const emailToAdd = addCandidateEmail.toLowerCase();
      const existingEmails = (campaign.assignedCandidates || []).map((c) => c.email.toLowerCase());
      if (!existingEmails.includes(emailToAdd)) {
        campaign.assignedCandidates.push({ email: emailToAdd, status: "Pending" });
      }
    }

    await campaign.save();
    await campaign.populate("employer", "name email companyName profilePicture isVerified");

    // Invalidate caches
    await Promise.all([
      cacheService.invalidateCachePattern("admin:*"),
      cacheService.invalidateCachePattern(`interview:*`),
      cacheService.invalidateCache(`employer:interviews:${campaign.employer?._id || campaign.employer}`),
    ]);

    res.status(200).json({
      success: true,
      message: "Campaign updated successfully by admin",
      campaign,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin re-enroll a candidate for an interview campaign (resets completed/in-progress attempt)
// @route   POST /api/admin/campaigns/:id/re-enroll
// @access  Private (Admin)
export const reEnrollCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, reason, resetSession = true } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid candidate email address.",
      });
    }

    const emailLower = email.trim().toLowerCase();
    const campaign = await Interview.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Interview campaign not found.",
      });
    }

    campaign.assignedCandidates = campaign.assignedCandidates || [];
    let candidate = campaign.assignedCandidates.find(
      (c) => c.email && c.email.toLowerCase() === emailLower
    );

    const reEnrollRecord = {
      reEnrolledAt: new Date(),
      reEnrollReason: reason?.trim() || "Admin manual re-enrollment",
      reEnrolledBy: req.user?._id || null,
    };

    if (candidate) {
      candidate.status = "Pending";
      candidate.joinedAt = null;
      candidate.submittedAt = null;
      candidate.resultId = null;
      candidate.reEnrollCount = (candidate.reEnrollCount || 0) + 1;
      candidate.reEnrolledAt = reEnrollRecord.reEnrolledAt;
      candidate.reEnrollReason = reEnrollRecord.reEnrollReason;
      candidate.reEnrolledBy = reEnrollRecord.reEnrolledBy;
    } else {
      candidate = {
        email: emailLower,
        status: "Pending",
        joinedAt: null,
        submittedAt: null,
        resultId: null,
        reEnrollCount: 1,
        reEnrolledAt: reEnrollRecord.reEnrolledAt,
        reEnrollReason: reEnrollRecord.reEnrollReason,
        reEnrolledBy: reEnrollRecord.reEnrolledBy,
      };
      campaign.assignedCandidates.push(candidate);
    }

    // Reset previous interview session & purge cache if requested
    if (resetSession) {
      const candidateUser = await User.findOne({ email: emailLower }).select("_id");
      if (candidateUser) {
        await InterviewSession.deleteMany({
          interviewId: campaign._id,
          candidateId: candidateUser._id,
        });

        try {
          const { voiceSessionCache } = await import("../interview/services/voiceSessionCache.service.js");
          await voiceSessionCache.clearSession(campaign._id.toString(), candidateUser._id.toString());
        } catch (cacheErr) {
          console.warn("[Admin Re-Enroll] Failed to clear voice session cache:", cacheErr.message);
        }
      }
    }

    await campaign.save();
    await campaign.populate("employer", "name email companyName profilePicture isVerified");

    // Invalidate all related caches
    await Promise.all([
      cacheService.invalidateCachePattern("admin:*"),
      cacheService.invalidateCachePattern("interview:*"),
      cacheService.invalidateCachePattern("user:*"),
      cacheService.invalidateCache(`employer:interviews:${campaign.employer?._id || campaign.employer}`),
    ]);

    console.log(`[Admin Re-Enroll] Admin ${req.user?.email || req.user?._id} re-enrolled ${emailLower} for campaign ${campaign.interviewCode} (${campaign._id}). Reason: ${reEnrollRecord.reEnrollReason}`);

    res.status(200).json({
      success: true,
      message: `Candidate ${emailLower} successfully re-enrolled in campaign ${campaign.interviewCode}.`,
      campaign,
      candidate,
    });
  } catch (error) {
    next(error);
  }
};

