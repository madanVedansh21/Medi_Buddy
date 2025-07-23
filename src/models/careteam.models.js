import mongoose, { Schema } from "mongoose";

const careTeamSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caregiverName: {
      type: String,
      required: true,
    },
    caregiverEmail: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      enum: ["family", "caregiver", "friend", "doctor", "other"],
      default: "family",
    },
    notificationDelay: {
      type: Number,
      default: 60, // minutes
    },
    enableNotifications: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const CareTeam = mongoose.model("CareTeam", careTeamSchema);

export default CareTeam;
