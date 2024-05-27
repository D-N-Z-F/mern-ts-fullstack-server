import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

const validateId = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(req.params.id) &&
      !mongoose.Types.ObjectId.isValid(req.params.playlistId) &&
      !mongoose.Types.ObjectId.isValid(req.params.songId)
    ) {
      res.status(404).json({ msg: "Invalid ID!", status: 404 });
      return;
    }

    next();
  } catch (e: unknown) {
    if (e instanceof Error)
      res.status(400).json({ msg: e.message, status: 400 });
    return;
  }
};

export default validateId;
