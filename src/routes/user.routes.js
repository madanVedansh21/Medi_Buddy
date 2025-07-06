import express, { Router } from "express";

import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router
  .route("/register")
  .get((req, res) => {
    res.render("auth/register");
  })
  .post(registerUser);

// export the router

export default router;
