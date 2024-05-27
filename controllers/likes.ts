import express, { Request, Response } from "express";
import Song from "../models/Song";
import auth from "../middleware/auth";
import validateId from "../middleware/validateId";
import { AuthenticatedRequest } from "../middleware/auth";
import Like from "../models/Like";
import User from "../models/User";

const router = express.Router();

router.post(
  "/:id",
  validateId,
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user?._id);

      if (!user) return res.json({ message: "User Not Found!", status: 404 });

      let like = await Like.findOne({ user: user._id });

      if (!like) like = new Like({ user: req.user?._id });

      const song = await Song.findById(req.params.id);

      if (!song) return res.json({ message: "Song Not Found!", status: 404 });

      if (like.songs.indexOf(song._id) === -1) like.songs.push(song._id);
      else like.songs.splice(like.songs.indexOf(song._id), 1);

      await like.save();
      return res.json({ message: "Success!", like });
    } catch (e) {
      if (e instanceof Error)
        res.status(400).json({ msg: e.message, status: 400 });
      return;
    }
  }
);

router.get("/", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const like = await Like.findOne({ user: req.user?._id }).populate("songs");

    if (!like)
      return res.json({ message: "No Liked Songs Found!", status: 404 });

    return res.json(like);
  } catch (e) {
    if (e instanceof Error)
      res.status(400).json({ msg: e.message, status: 400 });
    return;
  }
});

module.exports = router;
