import express, { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import User from "../models/users.model.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  contactUSContent,
  logsData,
  addMedicines,
} from "../controllers/user.controller.js";

const router = Router();

router
  .route("/register")
  .get((req, res) => {
    res.render("auth/register");
  })
  .post(registerUser);

router
  .route("/login")
  .get((req, res) => {
    res.render("auth/login");
  })
  .post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/contact").post(contactUSContent);
router.route("/logsdata").post(verifyJWT, logsData);

router.route("/logsdata/:logId").delete(verifyJWT, async (req, res) => {
  const userId = req.user._id; // comes from verifyJWT middleware
  const logId = req.params.logId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out the log with matching _id
    user.logs = user.logs.filter((log) => log._id.toString() !== logId);
    await user.save();

    res.status(200).json({ message: "Log deleted successfully" });
  } catch (err) {
    console.error("Error deleting log:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.route("/add/medicines").post(verifyJWT, addMedicines);
// export the router

export default router;
