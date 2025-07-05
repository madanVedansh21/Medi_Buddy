import User from "../models/users.model.js";
import Medi from "../models/medi.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../util/ApiError.js";
// register user controller

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    // validateBeforeSave: false is used to avoid validation errors like vo sab recheck karne lag jata h
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  // check if he has submitted all or not
  if (!fullName || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  // check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
  }
  // password will be hashed in the model pre-save hook
  const user = await User.create({ fullName, email, password });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  // access token and refresh token will be generated in the model method
};

export { registerUser, generateAccessAndRefereshTokens };
