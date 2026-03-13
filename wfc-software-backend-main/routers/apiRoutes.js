import express from "express";
import { protect, authorize } from "../middleware/auth.js";

// Import controllers
import {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  getAllUsers,
} from "../controllers/authController.js";

import {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  addProgressPhoto,
  getStatistics,
  deleteMember,
} from "../controllers/memberController.js";

import {
  createPayment,
  getAllPayments,
  getPaymentsByMember,
  getPaymentById,
  getRevenueSummary,
} from "../controllers/paymentController.js";

import {
  createDietPlan,
  getDietPlanByMember,
  getAllDietPlans,
  updateDietPlan,
  deleteDietPlan,
} from "../controllers/dietPlanController.js";

import {
  createTrainer,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  assignTrainingTomember,
  getTrainingSessions,
  completeSession,
} from "../controllers/trainerController.js";

import {
  checkInMember,
  checkOutMember,
  getDailyAttendance,
  getMemberAttendanceHistory,
  getMonthlyAttendanceReport,
} from "../controllers/attendanceController.js";

import {
  getInvoiceById,
  getInvoiceByNumber,
  getAllInvoices,
  getInvoicesByMember,
  markInvoicePrinted,
  markInvoiceSent,
  getInvoiceData,
} from "../controllers/invoiceController.js";

import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from "../controllers/planController.js";

const router = express.Router();

// ==================== AUTH ROUTES ====================
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);
router.get("/auth/me", protect, getCurrentUser);
router.put("/auth/profile", protect, updateProfile);
router.get("/auth/users", protect, authorize("admin"), getAllUsers);

// ==================== PLAN ROUTES ====================
router.post("/plans", protect, authorize("admin"), createPlan);
router.get("/plans", getAllPlans);
router.get("/plans/:id", getPlanById);
router.put("/plans/:id", protect, authorize("admin"), updatePlan);
router.delete("/plans/:id", protect, authorize("admin"), deletePlan);

// ==================== MEMBER ROUTES ====================
router.post("/members", protect, authorize("admin", "staff"), createMember);
router.get("/members", protect, getAllMembers);
router.get("/members/stats", protect, getStatistics);
router.get("/members/:id", protect, getMemberById);
router.put("/members/:id", protect, authorize("admin", "staff"), updateMember);
router.post("/members/:id/photo", protect, addProgressPhoto);
router.delete("/members/:id", protect, authorize("admin"), deleteMember);

// ==================== PAYMENT ROUTES ====================
router.post("/payments", protect, authorize("admin", "staff"), createPayment);
router.get("/payments", protect, getAllPayments);
router.get("/payments/revenue/summary", protect, authorize("admin"), getRevenueSummary);
router.get("/payments/:id", protect, getPaymentById);
router.get("/payments/member/:memberId", protect, getPaymentsByMember);

// ==================== DIET PLAN ROUTES ====================
router.post("/diet-plans", protect, authorize("admin", "staff", "trainer"), createDietPlan);
router.get("/diet-plans", protect, getAllDietPlans);
router.get("/diet-plans/member/:memberId", protect, getDietPlanByMember);
router.put("/diet-plans/:id", protect, authorize("admin", "staff", "trainer"), updateDietPlan);
router.delete("/diet-plans/:id", protect, authorize("admin", "staff", "trainer"), deleteDietPlan);

// ==================== TRAINER ROUTES ====================
router.post("/trainers", protect, authorize("admin"), createTrainer);
router.get("/trainers", protect, getAllTrainers);
router.get("/trainers/:id", protect, getTrainerById);
router.put("/trainers/:id", protect, authorize("admin"), updateTrainer);
router.post("/trainers/assign", protect, authorize("admin", "staff"), assignTrainingTomember);
router.get("/trainers/sessions/:memberId", protect, getTrainingSessions);
router.post("/trainers/sessions/complete", protect, authorize("admin", "trainer"), completeSession);

// ==================== ATTENDANCE ROUTES ====================
router.post("/attendance/check-in", protect, checkInMember);
router.post("/attendance/check-out", protect, authorize("admin", "staff"), checkOutMember);
router.get("/attendance/daily", protect, authorize("admin", "staff"), getDailyAttendance);
router.get("/attendance/member/:memberId", protect, getMemberAttendanceHistory);
router.get("/attendance/monthly/report", protect, authorize("admin", "staff"), getMonthlyAttendanceReport);

// ==================== INVOICE ROUTES ====================
router.get("/invoices", protect, authorize("admin"), getAllInvoices);
router.get("/invoices/:id", protect, getInvoiceById);
router.get("/invoices/number/:invoiceNumber", protect, getInvoiceByNumber);
router.get("/invoices/member/:memberId", protect, getInvoicesByMember);
router.get("/invoices/:id/data", protect, getInvoiceData);
router.put("/invoices/:id/printed", protect, markInvoicePrinted);
router.put("/invoices/:id/sent", protect, markInvoiceSent);

export default router;
