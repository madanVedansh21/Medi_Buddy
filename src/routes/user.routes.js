import express, { Router } from "express";

import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

// export the router

export default router;
