import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  phone:       { type: String, required: true },
  email:       { type: String, default: "" },
  age:         { type: Number },
  gender:      { type: String, enum: ["Male", "Female", "Other", ""] },
  interest:    { type: String, default: "" }, // Weight Loss, Muscle Gain, etc.
  source:      { type: String, default: "Walk-in" }, // Walk-in, Phone, Instagram, etc.
  message:     { type: String, default: "" },
  status:      {
    type: String,
    enum: ["New", "Contacted", "Interested", "Converted", "Lost"],
    default: "New",
  },
  followUpDate: { type: Date },
  assignedTo:   { type: String, default: "" },
  notes:        { type: String, default: "" },
}, { timestamps: true });

export const Lead = mongoose.model("Lead", leadSchema);