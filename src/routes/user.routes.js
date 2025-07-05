import express, { Router } from "express";

import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/test").get((req, res) => {
  res.json({
    message: "Test route is working",
  });
});
// export the router

export default router;
