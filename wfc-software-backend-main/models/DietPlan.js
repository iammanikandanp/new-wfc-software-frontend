import mongoose from "mongoose";

const dietPlanSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    goal: String, // weight loss, muscle gain, etc.
    calorieTarget: Number,
    weightGoal: Number, // target weight in kg

    // Meal Plans
    breakfast: {
      items: [String],
      calories: Number,
      time: String,
    },
    lunch: {
      items: [String],
      calories: Number,
      time: String,
    },
    dinner: {
      items: [String],
      calories: Number,
      time: String,
    },
    snacks: {
      items: [String],
      calories: Number,
      time: String,
    },

    // Macros
    protein: Number, // grams
    carbs: Number, // grams
    fats: Number, // grams
    fiber: Number, // grams

    notes: String,
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const DietPlan = mongoose.model("DietPlan", dietPlanSchema);
