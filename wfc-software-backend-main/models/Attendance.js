import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    checkInTime: Date,
    checkOutTime: Date,
    duration: Number, // in minutes
    checkInMethod: {
      type: String,
      enum: ["qr", "phone", "staff"],
      default: "staff",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create index for daily attendance queries
attendanceSchema.index({ memberId: 1, date: 1 });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
