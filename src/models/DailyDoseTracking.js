import mongoose, { Schema } from "mongoose";

const dailyDoseTrackingSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    date: {
      type: String,
      required: true,
    }, // Format: YYYY-MM-DD
    doseIndex: {
      type: Number,
      required: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    takenAt: {
      type: Date,
    },
    isTaken: {
      type: Boolean,
      default: false,
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create compound index for efficient queries
dailyDoseTrackingSchema.index(
  { userId: 1, medicineId: 1, date: 1, doseIndex: 1 },
  { unique: true }
);

const DailyDoseTracking = mongoose.model(
  "DailyDoseTracking",
  dailyDoseTrackingSchema
);

export default DailyDoseTracking;
