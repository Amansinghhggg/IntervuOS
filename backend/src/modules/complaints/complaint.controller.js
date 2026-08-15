import Complaint from "./complaint.model.js";

// @desc    Create new complaint / support ticket
// @route   POST /api/complaints
// @access  Private (Candidate / Employer)
export const createComplaint = async (req, res, next) => {
  try {
    const { category, interviewCode, subject, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Complaint message is required.",
      });
    }

    // Generate unique Ticket ID e.g. TICKET-940281
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const ticketId = `TICKET-${randomDigits}`;

    const complaint = await Complaint.create({
      ticketId,
      userId: req.user._id,
      userRole: req.user.role || "candidate",
      name: req.user.name || "User",
      email: req.user.email,
      category: category || "other",
      interviewCode: interviewCode || null,
      subject: subject || "Support Ticket",
      message: message.trim(),
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully.",
      ticket: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's past support tickets
// @route   GET /api/complaints/my-tickets
// @access  Private
export const getMyComplaints = async (req, res, next) => {
  try {
    const tickets = await Complaint.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};
