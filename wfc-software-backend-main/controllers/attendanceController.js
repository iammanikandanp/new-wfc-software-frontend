import { Attendance } from "../models/Attendance.js";
import { Member } from "../models/Member.js";

// Check in member
export const checkInMember = async (req, res) => {
  try {
    const { memberId, checkInMethod } = req.body;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCheckIn = await Attendance.findOne({
      memberId,
      date: { $gte: today },
      checkOutTime: null,
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: "Member already checked in today",
      });
    }

    const attendance = new Attendance({
      memberId,
      checkInTime: new Date(),
      checkInMethod: checkInMethod || "staff",
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: "Member checked in successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check out member
export const checkOutMember = async (req, res) => {
  try {
    const { attendanceId } = req.body;

    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        message: "Attendance ID is required",
      });
    }

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: "Member already checked out",
      });
    }

    attendance.checkOutTime = new Date();

    // Calculate duration in minutes
    const duration = Math.floor((attendance.checkOutTime - attendance.checkInTime) / 1000 / 60);
    attendance.duration = duration;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Member checked out successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get daily attendance
export const getDailyAttendance = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const attendance = await Attendance.find({
      date: { $gte: date, $lt: nextDate },
    })
      .populate("memberId", "userId")
      .sort({ checkInTime: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get member attendance history
export const getMemberAttendanceHistory = async (req, res) => {
  try {
    const records = await Attendance.find({ memberId: req.params.memberId }).sort({
      date: -1,
    });

    const monthlyStats = await Attendance.aggregate([
      {
        $match: { memberId: require("mongoose").Types.ObjectId(req.params.memberId) },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalDays: { $sum: 1 },
          totalDuration: { $sum: "$duration" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    res.status(200).json({
      success: true,
      records,
      monthlyStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get monthly attendance report
export const getMonthlyAttendanceReport = async (req, res) => {
  try {
    let year = parseInt(req.query.year) || new Date().getFullYear();
    let month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("memberId", "userId")
      .sort({ date: 1 });

    const memberAttendance = {};
    attendance.forEach((record) => {
      const memberId = record.memberId._id.toString();
      if (!memberAttendance[memberId]) {
        memberAttendance[memberId] = {
          memberId: record.memberId._id,
          memberName: record.memberId.userId,
          totalDays: 0,
          totalDuration: 0,
          records: [],
        };
      }
      memberAttendance[memberId].totalDays += 1;
      memberAttendance[memberId].totalDuration += record.duration || 0;
      memberAttendance[memberId].records.push(record);
    });

    res.status(200).json({
      success: true,
      year,
      month,
      memberAttendance: Object.values(memberAttendance),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
