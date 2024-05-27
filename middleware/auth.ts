import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import { UserI } from "../models/User";

dotenv.config();

const { SECRET_KEY } = process.env;

export interface AuthenticatedRequest extends Request {
  user?: UserI;
}

const auth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authToken = req.header("x-auth-token");

    if (!authToken) {
      res.status(401).json({ msg: "Unauthorized Action Denied!", status: 401 });
      return;
    }

    const decoded = jwt.verify(authToken, SECRET_KEY as Secret) as UserI;

    req.user = decoded;

    next();
  } catch (e: unknown) {
    if (e instanceof Error)
      res.status(400).json({ msg: e.message, status: 400 });
    return;
  }
};

export default auth;
