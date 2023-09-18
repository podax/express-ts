import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from './user.model';

export const createUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const existingUserByEmail = await User.findOne({ email });

    if (existingUserByEmail) {
      return res.json({
        status: false,
        error: 'Email already exists!',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    res.json({
      status: true,
      data: { user },
    }); 
  } catch (error) {
    console.log(error);

    res.json({
      status: false,
      error: 'An unexpected error occurred.',
    });
  }
};

export const get = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No Data Found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
