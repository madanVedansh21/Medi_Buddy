import "dotenv/config";
import app from "./app.js";

import connectDB from "./db/connection.db.js";

const port = process.env.PORT || 8000;

// connect to database
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
