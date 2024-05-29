import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const { DB_NAME, DB_HOST, DB_USER, DB_PASSWORD } = process.env;

const connect = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority&appName=Dee`
    );
    console.log("Connected to MongoDB");
  } catch (e: unknown) {
    if (e instanceof Error)
      console.error(`Error connecting to MongoDB: ${e.message}`);
    else console.error("An unknown error occurred during MongoDB connection");
  }
};

export default connect;
