import express from "express";
import { protect, requireAdmin } from "../auth/auth.middleware.js";
import {
  getAdminDashboardStats,
  getEmployers,
  toggleEmployerVerification,
  getMockAttempts,
  getComplaints,
  updateComplaint,
  getUsers,
  grantBonusCredits,
  getCampaigns,
  getCampaignById,
  updateCampaignControls,
} from "./admin.controller.js";

const router = express.Router();

// Apply protection & single admin verification to all admin routes
router.use(protect, requireAdmin);

router.get("/stats", getAdminDashboardStats);
router.get("/employers", getEmployers);
router.patch("/employers/:id/verify", toggleEmployerVerification);
router.get("/mock-attempts", getMockAttempts);
router.get("/complaints", getComplaints);
router.patch("/complaints/:id", updateComplaint);
router.get("/users", getUsers);
router.post("/users/:id/credits", grantBonusCredits);
router.get("/campaigns", getCampaigns);
router.get("/campaigns/:id", getCampaignById);
router.patch("/campaigns/:id", updateCampaignControls);

export default router;
