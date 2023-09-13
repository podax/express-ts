import { Request, Response } from "express";
import { env } from "../../env.config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../users/user.model";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({
        status: false,
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY }
    );

    res.json({
      status: true,
      data: { token, userId: user._id },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: false,
      error: "An unexpected error occurred.",
    });
  }
};
