import express from "express";
import { deletereg, fetch, fetchOne, register, updatereg } from "../controllers/control.js";
import parser from "../middleware/multer.js";
import {
  createRegPayment,
  getAllRegPayments,
  getRegPaymentsByMember,
  getRevenueSummary,
  patchPdfUrl,
  updateRegPayment,
  deleteRegPayment,
} from "../controllers/regPaymentController.js";
import {
  createRegDietPlan,
  getAllRegDietPlans,
  getRegDietPlanByMember,
  updateRegDietPlan,
  deleteRegDietPlan,
} from "../controllers/regDietPlanController.js";
import {
  importAttendance,
  getAllAttendance,
  getAttendanceByRegistration,
  getAvailableMonths,
  linkAttendanceId,
} from "../controllers/xlsAttendanceController.js";
import { sendInvoiceEmail } from "../controllers/emailController.js";
import { createLead, getAllLeads, updateLead, deleteLead, getLeadStats } from "../controllers/leadController.js";

const router = express.Router();

// ── Registration ──────────────────────────────────────────────────────────────
router.post("/register",
  parser.fields([
    { name: "profileImage",   maxCount: 1 },
    { name: "frontBodyImage", maxCount: 1 },
    { name: "sideBodyImage",  maxCount: 1 },
    { name: "backBodyImage",  maxCount: 1 },
  ]),
  register
);
router.get("/fetch",           fetch);
router.get("/fetchone/:id",    fetchOne);
router.post("/update/:id",
  parser.fields([
    { name: "profileImage",   maxCount: 1 },
    { name: "frontBodyImage", maxCount: 1 },
    { name: "sideBodyImage",  maxCount: 1 },
    { name: "backBodyImage",  maxCount: 1 },
  ]),
  updatereg
);
router.post("/delete/:id",     deletereg);

// ── Payments ──────────────────────────────────────────────────────────────────
router.post("/reg-payments",                createRegPayment);
router.get("/reg-payments",                 getAllRegPayments);
router.get("/reg-payments/revenue/summary", getRevenueSummary);
router.get("/reg-payments/member/:id",      getRegPaymentsByMember);
router.patch("/reg-payments/pdf/:id",       patchPdfUrl);
router.put("/reg-payments/:id",             updateRegPayment);
router.delete("/reg-payments/:id",          deleteRegPayment);

// ── Diet Plans ────────────────────────────────────────────────────────────────
router.post("/reg-diet-plans",            createRegDietPlan);
router.get("/reg-diet-plans",             getAllRegDietPlans);
router.get("/reg-diet-plans/member/:id",  getRegDietPlanByMember);
router.put("/reg-diet-plans/:id",         updateRegDietPlan);
router.delete("/reg-diet-plans/:id",      deleteRegDietPlan);

// ── Attendance ────────────────────────────────────────────────────────────────
router.post("/xls-attendance/import",     importAttendance);
router.get("/xls-attendance",             getAllAttendance);
router.get("/xls-attendance/months",      getAvailableMonths);
router.get("/xls-attendance/member/:id",  getAttendanceByRegistration);
router.post("/xls-attendance/link",       linkAttendanceId);

// ── Leads (stats MUST be before /:id to avoid wildcard match) ─────────────────
router.post("/leads",          createLead);
router.get("/leads/stats",     getLeadStats);
router.get("/leads",           getAllLeads);
router.put("/leads/:id",       updateLead);
router.delete("/leads/:id",    deleteLead);

// ── Email ─────────────────────────────────────────────────────────────────────
router.post("/send-email",     sendInvoiceEmail);

export default router;