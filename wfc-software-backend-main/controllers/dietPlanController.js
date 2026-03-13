import { DietPlan } from "../models/DietPlan.js";
import { Member } from "../models/Member.js";

// Create diet plan
export const createDietPlan = async (req, res) => {
  try {
    const {
      memberId,
      goal,
      calorieTarget,
      weightGoal,
      breakfast,
      lunch,
      dinner,
      snacks,
      protein,
      carbs,
      fats,
      fiber,
      notes,
    } = req.body;

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

    const dietPlan = new DietPlan({
      memberId,
      goal,
      calorieTarget,
      weightGoal,
      breakfast,
      lunch,
      dinner,
      snacks,
      protein,
      carbs,
      fats,
      fiber,
      notes,
      assignedBy: req.user._id,
      isActive: true,
    });

    await dietPlan.save();

    res.status(201).json({
      success: true,
      message: "Diet plan created successfully",
      dietPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get diet plan by member
export const getDietPlanByMember = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findOne({
      memberId: req.params.memberId,
      isActive: true,
    }).populate("assignedBy", "name");

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "No active diet plan found",
      });
    }

    res.status(200).json({
      success: true,
      dietPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all diet plans
export const getAllDietPlans = async (req, res) => {
  try {
    const dietPlans = await DietPlan.find()
      .populate("memberId", "userId")
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dietPlans.length,
      dietPlans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update diet plan
export const updateDietPlan = async (req, res) => {
  try {
    let dietPlan = await DietPlan.findById(req.params.id);

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    Object.assign(dietPlan, req.body);
    await dietPlan.save();

    res.status(200).json({
      success: true,
      message: "Diet plan updated successfully",
      dietPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete diet plan
export const deleteDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findByIdAndDelete(req.params.id);

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Diet plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
