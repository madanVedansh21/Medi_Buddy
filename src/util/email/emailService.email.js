import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send missed medication alert
export async function sendMissedMedicationAlert(
  userEmail,
  userName,
  medicineName,
  caregiverEmail,
  caregiverName,
  doseTime
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: caregiverEmail,
    subject: `MediBuddy Alert: ${userName} missed medication`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">MediBuddy Alert</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc;">
          <h2 style="color: #1f2937;">Missed Medication Alert</h2>
          <p style="color: #4b5563; font-size: 16px;">
            Hello ${caregiverName},
          </p>
          <p style="color: #4b5563; font-size: 16px;">
            This is to inform you that <strong>${userName}</strong> has missed their scheduled dose of <strong>${medicineName}</strong> at <strong>${doseTime}</strong>.
          </p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-weight: 600;">
              Please check in with them to ensure they take their medication as prescribed.
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This alert was sent because you are registered as a care team member for ${userName}.
          </p>
        </div>
        <div style="background: #e5e7eb; padding: 15px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            MediBuddy - Caring for your health, together
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `Alert sent to ${caregiverEmail} for ${userName}'s missed ${medicineName}`
    );
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
