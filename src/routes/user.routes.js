import express, { Router } from "express";

import { registerUser, loginUser } from "../controllers/user.controller.js";

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

// export the router

export default router;
