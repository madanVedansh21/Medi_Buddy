import User from "../models/users.model.js";
import medicines from "../models/medi.model.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import { ApiResponse } from "../util/ApiResponse.js";
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

  if (createdUser) {
    // generate access and referesh tokens and send them in the response
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .redirect("/dashboard");
  } else {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
};

const loginUser = async (req, res) => {
  // take out user credentials from request body
  // check if they are present or not
  // db call to find user by email
  // if user exists, check if password is correct or not
  // if password is correct, generate access and refresh tokens

  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User does not exist with this email");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect password");
  }
  // generate access and referesh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect("/dashboard");
};

const logoutUser = async (req, res) => {
  // clear the cookies and redirect to login page
  res
    .clearCookie("accessToken", { httpOnly: true, secure: true })
    .clearCookie("refreshToken", { httpOnly: true, secure: true })
    .redirect("/");
};

const contactUSContent = async (req, res) => {
  const { fullName, email, phone, message, subject } = req.body;

  if (!fullName || !email || !message || !subject) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const content = `Name: ${fullName}, Email: ${email}, Phone: ${
      phone || "N/A"
    }, Message: ${message}\n , Subject: ${subject}\n\n`;
    await fs.promises.appendFile("contactUs.txt", content);
    return res.status(200).json({ message: "Message saved successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong while saving the message" });
  }
};

const logsData = async (req, res) => {
  const { symptomText, severity, category } = req.body;
  if (!symptomText || !severity || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }
  // we have the user in the body
  const user = req.user; // assuming user is set by verifyJWT middleware
  if (!user) {
    return res.status(401).json({ message: "Unauthorized login again !" });
  }
  try {
    const logEntry = {
      message: symptomText,
      severity: severity,
      category: category,
      timestamp: new Date(),
    };

    // Find the user and update their logs
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { logs: logEntry } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Log entry added successfully",
      logs: updatedUser.logs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const addMedicines = async (req, res) => {
  // deestructure required
  // check if all fields are present or not
  // create a new medicine document and save it to the database

  const {
    medicineName,
    dosageTimes,
    medicineStarDate,
    noOfDoseInADay,
    totalNoOfMedicines,
    endDate,
  } = req.body;
  const userId = req.user._id; // comes from verifyJWT middleware
  if (!medicineName || !dosageTimes || !medicineStarDate || !noOfDoseInADay) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const parsedDosageTimes = Array.isArray(dosageTimes)
      ? dosageTimes.map((time) => {
          const [hh, mm] = time.split(":");
          const d = new Date();
          d.setHours(parseInt(hh));
          d.setMinutes(parseInt(mm));
          d.setSeconds(0);
          d.setMilliseconds(0);
          return d;
        })
      : (() => {
          const [hh, mm] = dosageTimes.split(":");
          const d = new Date();
          d.setHours(parseInt(hh));
          d.setMinutes(parseInt(mm));
          d.setSeconds(0);
          d.setMilliseconds(0);
          return [d];
        })();

    const medicine = await medicines.create({
      medicineName,
      userId,
      dosageTimes: parsedDosageTimes,
      medicineStarDate: new Date(medicineStarDate),
      noOfDoseInADay,
      totalNoOfMedicines,
      endDate: endDate ? new Date(endDate) : null,
    });

    if (!medicine) {
      return res.status(500).json({
        message: "Something went wrong while adding the medicine",
      });
    }

    // Step 3: Add medicine reference to the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { medicines: medicine._id } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(500)
        .json({ message: "Error saving the medicine to user" });
    }

    return res.status(201).json({
      message: "Medicine added successfully",
    });
  } catch (error) {
    console.error("Error adding medicine:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  registerUser,
  generateAccessAndRefereshTokens,
  loginUser,
  logoutUser,
  contactUSContent,
  logsData,
  addMedicines,
};
