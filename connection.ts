import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const { DB_NAME } = process.env;

const connect = async () => {
  try {
    await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`);
    console.log("Connected to MongoDB");
  } catch (e: unknown) {
    if (e instanceof Error)
      console.error(`Error connecting to MongoDB: ${e.message}`);
    else console.error("An unknown error occurred during MongoDB connection");
  }
};

export default connect;
