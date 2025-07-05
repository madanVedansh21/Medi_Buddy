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

const Medi = mongoose.model("Medi", mediSchema);

export default Medi;
