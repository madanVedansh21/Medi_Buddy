const cron = require("node-cron");
const Medicine = require("../models/Medicine"); // adjust path as needed
const CareTeam = require("../models/CareTeam"); // adjust path as needed
const DailyDoseTracking = require("../models/DailyDoseTracking"); // adjust path as needed
const { sendMissedMedicationAlert } = require("./emailService");

// Run every 15 minutes to check for missed medications
cron.schedule("*/15 * * * *", async () => {
  console.log("Checking for missed medications...");

  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Get all active medicines
    const medicines = await Medicine.find({}).populate("userId");

    for (const medicine of medicines) {
      // Check if medicine is within active date range
      const startDate = new Date(medicine.medicineStarDate);
      const endDate = medicine.endDate ? new Date(medicine.endDate) : null;

      if (now < startDate || (endDate && now > endDate)) {
        continue; // Skip if outside active range
      }

      // Check each dosage time for today
      for (let i = 0; i < medicine.dosageTimes.length; i++) {
        const doseTime = new Date(medicine.dosageTimes[i]);

        // Set dose time to today
        const todayDoseTime = new Date();
        todayDoseTime.setHours(
          doseTime.getHours(),
          doseTime.getMinutes(),
          0,
          0
        );

        // Check if dose time has passed and medication wasn't taken
        const timeDiff = now.getTime() - todayDoseTime.getTime();
        const minutesPassed = Math.floor(timeDiff / (1000 * 60));

        if (minutesPassed > 30) {
          // 30 minutes grace period
          // Check if dose was taken from database
          const doseRecord = await DailyDoseTracking.findOne({
            userId: medicine.userId._id,
            medicineId: medicine._id,
            date: today,
            doseIndex: i,
          });

          // If dose not taken and alert not sent
          if (!doseRecord || (!doseRecord.isTaken && !doseRecord.alertSent)) {
            // Get care team members for this user
            const careTeamMembers = await CareTeam.find({
              userId: medicine.userId._id,
              isActive: true,
              enableNotifications: true,
            });

            for (const careTeamMember of careTeamMembers) {
              if (minutesPassed >= careTeamMember.notificationDelay) {
                const doseTimeString = todayDoseTime.toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }
                );

                await sendMissedMedicationAlert(
                  medicine.userId.email,
                  medicine.userId.fullName,
                  medicine.medicineName,
                  careTeamMember.caregiverEmail,
                  careTeamMember.caregiverName,
                  doseTimeString
                );

                // Mark alert as sent to prevent duplicate alerts
                await DailyDoseTracking.findOneAndUpdate(
                  {
                    userId: medicine.userId._id,
                    medicineId: medicine._id,
                    date: today,
                    doseIndex: i,
                  },
                  {
                    alertSent: true,
                    scheduledTime: todayDoseTime,
                  },
                  { upsert: true }
                );

                console.log(
                  `Alert sent for ${medicine.userId.fullName}'s missed ${medicine.medicineName} to ${careTeamMember.caregiverEmail}`
                );
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in medication monitoring cron job:", error);
  }
});

console.log(
  "Medication monitoring cron job started - checking every 15 minutes"
);
