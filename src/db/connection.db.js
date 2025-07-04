import mongoose from "mongoose";
import "dotenv/config";
import { DB_NAME } from "../constants.js";

const conenctDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
  } catch (error) {
    console.log("MONGODB connection error:", error);
    process.exit(1);
  }
};

export default conenctDB;
