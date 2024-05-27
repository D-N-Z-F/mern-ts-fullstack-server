import express, { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import User, { validateUser } from "../models/User";
import Playlist from "../models/Playlist";
import Like from "../models/Like";
import auth, { AuthenticatedRequest } from "../middleware/auth";
import admin from "../middleware/admin";
import validateId from "../middleware/validateId";
dotenv.config();

const router = express.Router();
const { SECRET_KEY } = process.env;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./pfp");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post(
  "/register",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { error } = validateUser(req.body);
      if (error) {
        if (req.file) fs.unlinkSync(`./pfp/${req.file.filename}`);
        return res.json({ message: error.details[0].message, status: 400 });
      }

      const { email, username, password } = req.body;
      const userFound = await User.findOne({ email, username });

      if (userFound) {
        if (req.file) fs.unlinkSync(`./pfp/${req.file.filename}`);
        return res.json({ message: "User already exists!", status: 400 });
      }

      const user = new User({
        ...req.body,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
        image: !req.file ? null : req.file.filename,
      });

      user.save();
      return res.json({ message: "Registered Successfully.", user });
    } catch (e: unknown) {
      if (e instanceof Error)
        res.status(400).json({ msg: e.message, status: 400 });
      return;
    }
  }
);

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userFound = await User.findOne({ email });

    if (!userFound)
      return res.json({ message: "Invalid Credentials", status: 400 });

    const isMatch = bcrypt.compareSync(password, userFound.password);

    if (!isMatch)
      return res.json({ message: "Invalid Credentials", status: 400 });

    const user = {
      ...userFound.toObject(),
      password: undefined,
      __v: undefined,
    };

    const jwtSecret = SECRET_KEY as Secret;
    const token = jwt.sign(user, jwtSecret, { expiresIn: "24h" });

    return res.json({ message: "Logged In Successfully.", token, user });
  } catch (e: unknown) {
    if (e instanceof Error)
      res.status(400).json({ msg: e.message, status: 400 });
    return;
  }
});

router.get(
  "/profile",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user?._id).select("-password");

      if (!user) return res.json({ message: "User Not Found!", status: 404 });

      return res.json(user);
    } catch (e) {
      if (e instanceof Error)
        res.status(400).json({ msg: e.message, status: 400 });
      return;
    }
  }
);

router.get("/", auth, admin, async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");

    return res.json(users);
  } catch (e) {
    if (e instanceof Error)
      res.status(400).json({ msg: e.message, status: 400 });
    return;
  }
});

router.get("/:id", auth, admin, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.json({ message: "User Not Found!", status: 404 });

    return res.json(user);
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
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) return res.json({ message: "User Not Found!", status: 404 });

      if (req.file && user.image) fs.unlinkSync(`./pfp/${user.image}`);

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          image: !req.file ? user.image : req.file.filename,
        },
        { new: true }
      );

      return res.json({ message: "User Updated.", updatedUser });
    } catch (e) {
      if (e instanceof Error)
        res.status(400).json({ msg: e.message, status: 400 });
      return;
    }
  }
);

router.patch("/:id", validateId, auth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.json({ message: "User Not Found!", status: 404 });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    return res.json({ message: "User Updated.", updatedUser });
  } catch (e) {
    if (e instanceof Error)
      res.status(400).json({ msg: e.message, status: 400 });
    return;
  }
});

router.patch(
  "/premium/:id",
  validateId,
  auth,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) return res.json({ message: "User Not Found!", status: 404 });

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { isPremium: true },
        { new: true }
      );

      return res.json({ message: "User Updated.", updatedUser });
    } catch (e) {
      if (e instanceof Error)
        res.status(400).json({ msg: e.message, status: 400 });
      return;
    }
  }
);

router.delete("/:id", validateId, auth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.json({ message: "User Not Found!", status: 404 });

    if (user.image) fs.unlinkSync(`./pfp/${user.image}`);

    await Playlist.deleteMany({ user: user._id });

    await Like.deleteOne({ user: user._id });

    await User.findByIdAndDelete(req.params.id);

    return res.json({ message: "User has been deleted." });
  } catch (e) {
    if (e instanceof Error)
      res.status(400).json({ msg: e.message, status: 400 });
    return;
  }
});

module.exports = router;
