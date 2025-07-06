import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");

// Set the views directory (assuming app.js is in src/)
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

// import routes
import userRouter from "./routes/user.routes.js";
app.use("/", userRouter); // import remaining isLoggedIn middleware and userRouter

export default app;
