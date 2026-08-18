import api from "./api";

export const adminService = {
  // Fetch high-level admin statistics & charts data
  getDashboardStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  // Fetch list of employers with filters
  getEmployers: async (params = {}) => {
    const response = await api.get("/admin/employers", { params });
    return response.data;
  },

  // Toggle employer verification status (true/false)
  toggleEmployerVerification: async (id, isVerified) => {
    const response = await api.patch(`/admin/employers/${id}/verify`, { isVerified });
    return response.data;
  },

  // Fetch mock interview attempts
  getMockAttempts: async (params = {}) => {
    const response = await api.get("/admin/mock-attempts", { params });
    return response.data;
  },

  // Fetch user complaints / support tickets
  getComplaints: async (params = {}) => {
    const response = await api.get("/admin/complaints", { params });
    return response.data;
  },

  // Update complaint status or admin notes
  updateComplaint: async (id, data) => {
    const response = await api.patch(`/admin/complaints/${id}`, data);
    return response.data;
  },

  // Fetch platform users
  getUsers: async (params = {}) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  // Grant bonus credits to a user
  grantBonusCredits: async (id, creditsAmount) => {
    const response = await api.post(`/admin/users/${id}/credits`, { creditsAmount });
    return response.data;
  },

  // Fetch employer interview campaigns
  getCampaigns: async (params = {}) => {
    const response = await api.get("/admin/campaigns", { params });
    return response.data;
  },

  // Fetch full details of a specific campaign
  getCampaignById: async (id) => {
    const response = await api.get(`/admin/campaigns/${id}`);
    return response.data;
  },

  // Update campaign details & controls
  updateCampaign: async (id, data) => {
    const response = await api.patch(`/admin/campaigns/${id}`, data);
    return response.data;
  },

  // Re-enroll a candidate for a campaign (resets completed/in-progress attempt)
  reEnrollCandidate: async (campaignId, data) => {
    const response = await api.post(`/admin/campaigns/${campaignId}/re-enroll`, data);
    return response.data;
  },
};

export default adminService;
