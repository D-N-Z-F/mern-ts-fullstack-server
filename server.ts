import express from "express";
import cors from "cors";
import connect from "./connection";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const { PORT } = process.env;

connect();
app.use(cors());
app.use(express.json());
app.use(express.static("pfp"));
app.use(express.static("public"));
app.use("/users", require("./controllers/users"));
app.use("/songs", require("./controllers/songs"));
app.use("/playlists", require("./controllers/playlists"));
app.use("/likes", require("./controllers/likes"));
app.listen(PORT, () => console.log(`App is running on PORT: ${PORT}`));
