import express, { Request, Response } from "express";
import Playlist, { validatePlaylist } from "../models/Playlist";
import User from "../models/User";
import Song from "../models/Song";
import auth from "../middleware/auth";
import admin from "../middleware/admin";
import validateId from "../middleware/validateId";
import { AuthenticatedRequest } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error } = validatePlaylist(req.body);
    if (error)
      return res.json({ message: error.details[0].message, status: 400 });

    const user = await User.findById(req.user?._id);
    const playlist = new Playlist({
      ...req.body,
      user: user?._id,
      songs: [],
    });

    playlist.save();
    return res.json({ message: "Playlist Created!", playlist });
  } catch (e) {
    if (e instanceof Error)
      res.status(400).json({ msg: e.message, status: 400 });
    return;
  }
});

router.get("/", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const playlist = await Playlist.find({ user: req.user?._id }).populate(
      "songs"
    );

    if (!playlist)
      return res.json({ message: "Playlist Not Found!", status: 400 });

    return res.json(playlist);
  } catch (e) {
    if (e instanceof Error)
      res.status(400).json({ msg: e.message, status: 400 });
    return;
  }
});

router.get(
  "/:id",
  validateId,
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const playlist = await Playlist.findById(req.params.id).populate("songs");

      if (!playlist)
        return res.json({ message: "Playlist Not Found!", status: 400 });

      return res.json(playlist);
    } catch (e) {
      if (e instanceof Error)
        res.status(400).json({ msg: e.message, status: 400 });
      return;
    }
  }
);

router.put(
  "/:id",
  validateId,
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const playlist = await Playlist.findById(req.params.id);
      if (!playlist)
        return res.json({ message: "Playlist Not Found!", status: 404 });

      const user = await User.findById(req.user?._id);
      if (!user?._id.equals(playlist.user))
        return res.json({ message: "Unable To Perform Action", status: 403 });

      playlist.name = req.body.name;
      playlist.description = req.body.description;
      playlist.save();

      return res.json({ message: "Playlist Updated.", playlist });
    } catch (e) {
      if (e instanceof Error)
        res.status(400).json({ msg: e.message, status: 400 });
      return;
    }
  }
);

//Add Songs Into Playlist
router.put(
  "/:playlistId/:songId",
  validateId,
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const playlist = await Playlist.findById(req.params.playlistId);

      if (!playlist)
        return res.json({ message: "Playlist Not Found!", status: 404 });

      const user = await User.findById(req.user?._id);

      if (!user?._id.equals(playlist.user))
        return res.json({ message: "Unable To Perform Action", status: 403 });

      const song = await Song.findById(req.params.songId);

      if (song) {
        if (playlist.songs.indexOf(song?._id) === -1)
          playlist.songs.push(song?._id);
        else if (playlist.songs.indexOf(song?._id) !== -1)
          return res.json({
            message: "Song Already In Playlist!",
            status: 400,
          });
      }

      playlist.save();
      return res.json({ message: "Song Added To Playlist", playlist });
    } catch (e) {
      if (e instanceof Error)
        res.status(400).json({ msg: e.message, status: 400 });
      return;
    }
  }
);

//Remove Songs From Playlist
router.patch(
  "/:playlistId/:songId",
  validateId,
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const playlist = await Playlist.findById(req.params.playlistId);

      if (!playlist)
        return res.json({ message: "Playlist Not Found!", status: 404 });

      const user = await User.findById(req.user?._id);

      if (!user?._id.equals(playlist.user))
        return res.json({ message: "Unable To Perform Action", status: 403 });

      const song = await Song.findById(req.params.songId);

      if (song) {
        if (playlist.songs.indexOf(song?._id) !== -1)
          playlist.songs.splice(playlist.songs.indexOf(song?._id), 1);
      }

      playlist.save();
      return res.json({ message: "Song Removed From Playlist", playlist });
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
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const playlist = await Playlist.findById(req.params.id);

      if (!playlist)
        return res.json({ message: "Playlist Not Found!", status: 404 });

      const user = await User.findById(req.user?._id);

      if (!user?._id.equals(playlist.user))
        return res.json({ message: "Unable To Perform Action", status: 403 });

      await Playlist.findByIdAndDelete(req.params.id);

      return res.json({ message: "Playlist Deleted." });
    } catch (e) {
      if (e instanceof Error)
        res.status(400).json({ msg: e.message, status: 400 });
      return;
    }
  }
);

module.exports = router;
