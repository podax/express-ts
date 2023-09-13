import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "./env.config";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Assumes "Bearer <TOKEN>"

    if (!token) {
      return res.status(401).json({ message: "Authentication failed!" });
    }

    const decodedToken = jwt.verify(token, env.JWT_SECRET) as any;

    req.userData = { userId: decodedToken.userId }; // Store user data in the request for use in other routes.

    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed!" });
  }
};
