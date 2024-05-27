import { Request, Response, NextFunction } from "express";
import { UserI } from "../models/User";

interface AuthenticatedRequest extends Request {
  user?: UserI;
}

const admin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.json({ message: "Permission denied!", status: 403 });
      return;
    }

    next();
  } catch (e: unknown) {
    if (e instanceof Error)
      res.status(400).json({ msg: e.message, status: 400 });
    return;
  }
};

export default admin;
