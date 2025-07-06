import express, { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  registerUser,
  loginUser,
  logoutUser,
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

// export the router

export default router;
