import { Lead } from "../models/Lead.js";

// Create
export const createLead = async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    return res.status(201).json({ success: true, message: "Lead added successfully", lead });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all
export const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: leads.length, leads });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update (status, notes, followUp)
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    return res.status(200).json({ success: true, message: "Lead updated", lead });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    return res.status(200).json({ success: true, message: "Lead deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Stats for dashboard
export const getLeadStats = async (req, res) => {
  try {
    const all = await Lead.find();
    const stats = {
      total:     all.length,
      new:       all.filter(l => l.status === "New").length,
      contacted: all.filter(l => l.status === "Contacted").length,
      interested:all.filter(l => l.status === "Interested").length,
      converted: all.filter(l => l.status === "Converted").length,
      lost:      all.filter(l => l.status === "Lost").length,
    };
    return res.status(200).json({ success: true, stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};