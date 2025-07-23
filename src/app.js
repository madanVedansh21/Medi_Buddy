import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import medicines from "./models/medi.model.js"; // Use 'medicines' everywhere
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as the view engine
app.set("view engine", "ejs");

// Set the views directory
app.set("views", path.join(__dirname, "views"));

// Serve static files from src/public
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// some initial middlewares setups
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// landing page route
app.get("/", (req, res) => {
  res.render("landing");
});

// import verifyJWT middleware
import { verifyJWT } from "./middlewares/auth.middleware.js";

app.get("/dashboard", verifyJWT, (req, res) => {
  res.render("dashboard", { user: req.user });
});

app.get("/contact-us", (req, res) => {
  res.render("auth/contactUs");
});

app.get("/medicines", verifyJWT, async (req, res) => {
  try {
    const medicinesArr = await medicines.find({ userId: req.user._id });

    res.render("medi/medicinesRecord", {
      user: req.user,
      medicine: medicinesArr.map((med) => ({
        ...med.toObject(),
        dosageTimes: Array.isArray(med.dosageTimes) ? med.dosageTimes : [],
      })),
      medicines: medicinesArr.map((med) => ({
        ...med.toObject(),
        dosageTimes: Array.isArray(med.dosageTimes) ? med.dosageTimes : [],
      })),
    });
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).send("Server error");
  }
});

app.get("/logs", verifyJWT, (req, res) => {
  res.render("medi/logs", { user: req.user });
});

app.get("/notifications", verifyJWT, (req, res) => {
  res.render("medi/notifications", { user: req.user });
});
// import routes
import userRouter from "./routes/user.routes.js";
app.use("/", userRouter);
import "./util/email/cronJobs.email.js"; // This will start the cron job

export default app;
