import jwt from "jsonwebtoken";
import User from "../users/user.model.js";

// Protect routes — verify JWT from cookie
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — invalid token",
    });
  }
};

// Authorize by role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Legacy employer verification helper (no-op now that campaign verification controls candidate visibility)
export const requireVerifiedEmployer = (req, res, next) => {
  next();
};

// Require admin privileges (checking both role and ADMIN_EMAIL if set)
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — login required",
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const isRoleAdmin = req.user.role === "admin";
  const isEmailAdmin = adminEmail && req.user.email?.toLowerCase() === adminEmail.toLowerCase();

  if (!isRoleAdmin && !isEmailAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied — Single Admin privileges required",
    });
  }

  // If email matches ADMIN_EMAIL but role is not set to admin, auto-upgrade for convenience
  if (isEmailAdmin && req.user.role !== "admin") {
    req.user.role = "admin";
    req.user.save().catch((err) => console.error("Error setting admin role:", err));
  }

  next();
};



