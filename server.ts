import express from "express";
import cors from "cors";
import connect from "./connection";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const { PORT, HOST } = process.env;
const port = PORT ? parseInt(PORT) : 8000;
const host = HOST ? HOST : "0.0.0.0";

connect();
app.use(cors());
app.use(express.json());
app.use(express.static("pfp"));
app.use(express.static("public"));
app.use("/users", require("./controllers/users"));
app.use("/songs", require("./controllers/songs"));
app.use("/playlists", require("./controllers/playlists"));
app.use("/likes", require("./controllers/likes"));
app.listen(port, host, () =>
  console.log(`App is running on, HOST: ${HOST}, PORT: ${PORT}`)
);
