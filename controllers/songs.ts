import express, { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import Song, { validateSong } from "../models/Song";
import Like from "../models/Like";
import Playlist from "../models/Playlist";
import auth from "../middleware/auth";
import admin from "../middleware/admin";
import validateId from "../middleware/validateId";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post(
  "/",
  auth,
  admin,
  upload.fields([
    { name: "song", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const { error } = validateSong(req.body);
      if (error) {
        fs.unlinkSync(`./public/${files.song[0].filename}`);
        if (files.image.length)
          fs.unlinkSync(`./public/${files.image[0].filename}`);
        return res.json({ message: error.details[0].message, status: 400 });
      }

      const { name } = req.body;
      const songFound = await Song.findOne({ name });

      if (songFound) {
        fs.unlinkSync(`./public/${files.song[0].filename}`);
        if (files.image.length)
          fs.unlinkSync(`./public/${files.image[0].filename}`);
        return res.json({
          message: "Cannot upload existing song!",
          status: 400,
        });
      }

      const song = new Song({
        ...req.body,
        song: files.song[0].filename,
        image: !files.image ? null : files.image[0].filename,
      });

      song.save();
      return res.json({ message: "Added Successfully.", song });
    } catch (e) {
      if (e instanceof Error)
        res.status(400).json({ msg: e.message, status: 400 });
      return;
    }
  }
);

router.get("/", async (req: Request, res: Response) => {
  try {
    const songs = await Song.find();

    if (!songs) return res.json({ message: "No Songs Found!" });

    return res.json(songs);
  } catch (e) {
    if (e instanceof Error)
      res.status(400).json({ msg: e.message, status: 400 });
    return;
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) return res.json({ message: "Song Not Found!", status: 404 });

    return res.json(song);
  } catch (e) {
    if (e instanceof Error)
      res.status(400).json({ msg: e.message, status: 400 });
    return;
  }
});

router.put(
  "/:id",
  validateId,
  auth,
  admin,
  upload.fields([
    { name: "song", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const song = await Song.findById(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!song) {
        if (files["song"]) fs.unlinkSync(`./public/${files.song[0].filename}`);
        if (files["image"])
          fs.unlinkSync(`./public/${files.image[0].filename}`);
        return res.json({ message: "Song Not Found!", status: 404 });
      }

      if (files["song"] && song.song) fs.unlinkSync(`./public/${song.song}`);
      if (files["image"] && song.image) fs.unlinkSync(`./public/${song.image}`);

      const updatedSong = await Song.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          song: !files["song"] ? song.song : files.song[0].filename,
          image: !files["image"] ? song.image : files.image[0].filename,
        },
        { new: true }
      );

      return res.json({ message: "Song Updated.", updatedSong });
    } catch (e) {
      if (e instanceof Error)
        res.status(400).json({ msg: e.message, status: 400 });
      return;
    }
  }
);

router.delete(
  "/:id",
  validateId,
  auth,
  admin,
  async (req: Request, res: Response) => {
    try {
      const song = await Song.findById(req.params.id);

      if (!song) return res.json({ message: "Song Not Found!", status: 404 });

      fs.unlinkSync(`./public/${song.song}`);
      if (song.image) fs.unlinkSync(`./public/${song.image}`);

      await Playlist.updateMany(
        { songs: { $elemMatch: { $eq: song._id } } },
        { $pull: { songs: song._id } }
      );

      await Like.updateMany(
        { songs: { $elemMatch: { $eq: song._id } } },
        { $pull: { songs: song._id } }
      );

      await Song.findByIdAndDelete(req.params.id);

      return res.json({ message: "Song has been removed." });
    } catch (e) {
      if (e instanceof Error)
        res.status(400).json({ msg: e.message, status: 400 });
      return;
    }
  }
);

module.exports = router;
