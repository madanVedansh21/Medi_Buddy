import mongoose, { Schema } from "mongoose";

const mediSchema = new Schema(
  {
    medicineName: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dosageTimes: {
      type: [Date], // Array of Date objects
      required: true,
    },
    medicineStarDate: {
      type: Date,
      required: true,
    },
    noOfDoseInADay: {
      type: Number,
      required: true,
    },
    totalNoOfMedicines: {
      type: Number,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const medicines = mongoose.model("medicines", mediSchema);

export default medicines;
