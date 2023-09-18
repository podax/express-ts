import { NextFunction, Request, Response } from 'express';
import { env } from '../../env.config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../users/user.model';
import moment from 'moment';
import client from '@mailchimp/mailchimp_marketing';
import { OAuth2Client } from 'google-auth-library';

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
        error: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY },
    );

    res.json({
      status: true,
      data: { token, userId: user._id },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: false,
      error: 'An unexpected error occurred.',
    });
  }
};

export const register = async (req: Request, res: Response) => {
  const {
    email,
    firstName,
    lastName,
    password,
    cardId,
    location,
    dob,
    opted_in,
  } = req.body;
  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        form: {
          email: ['Email already exist.'],
        },
      });
    } else {
      if (cardId) {
        const card = await Card.findById(cardId);

        if (card.userId) {
          return res.status(400).json({
            success: false,
            message: 'Invalid card.',
          });
        }
      }

      let user = await User.create({
        email,
        firstName,
        lastName,
        password: bcrypt.hashSync(password, Number(process.env.BCRYPT_SALT)),
        location,
        dob: dob ? moment(dob) : '',
        opted_in: opted_in,
      });

      if (cardId) {
        const card = await Card.findById(cardId);
        card.userId = user._id;
        await card.save();
      }

      let payload = {
        id: user.id,
        sub: user.id,
        email: email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      client.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.SERVER_PREFIX,
      });

      await client.lists.setListMember(process.env.LIST_ID, email, {
        email_address: email,
        status_if_new: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
          BIRTHDAY: dob ? moment(dob).format('MM/DD') : '',
          COUNTRY: location?.countryName,
        },
        location: {
          latitude: location?.latitude,
          longitude: location?.longtitude,
          country_code: location?.countryCode,
        },
      });

      const token = jwt.sign(payload, 'SECRET', {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      return res.status(200).json({
        success: true,
        accessToken: token,
        user: payload,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const subscribe = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    client.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.SERVER_PREFIX,
    });

    await client.lists.setListMember(process.env.SUBSCRIBE_ID, email, {
      email_address: email,
      status_if_new: 'subscribed',
    });

    return res.status(200).json({
      success: true,
      message: 'Subscribed successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.auth.sub);

    return res.status(200).json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      smsCountryCode: user.smsCountryCode,
      countryCode: user.countryCode,
      profilePhoto: user.profilePhoto,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    let user = await User.findById(req.auth.sub);
    user.email = req.body.email || user.email;
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || '';
    user.phone = req.body.phone || '';
    user.smsCountryCode = req.body.smsCountryCode || '';
    user.countryCode = req.body.countryCode || '';
    user.profilePhoto = req.body.profilePhoto || user.profilePhoto;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile is updated',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const token = await Token.findOne({ userId: user._id });

      if (token) {
        await token.deleteOne();
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hash = await bcrypt.hash(
        resetToken,
        Number(process.env.BCRYPT_SALT),
      );

      await Token({
        userId: user._id,
        token: hash,
        createdAt: Date.now(),
      }).save();

      const link = `${process.env.FRONTEND_URL}/password-reset?token=${resetToken}&userId=${user._id}`;

      await sendEmail.sendEmails(
        user.email,
        'Password Reset Request',
        { name: user.firstName, link: link },
        '../views/email/requestResetPassword.handlebars',
      );

      return res.status(200).json({
        success: true,
        link: link,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPasswordConfirm = async (req: Request, res: Response) => {
  const { token, userId } = req.query;
  try {
    const { password, password2 } = req.body;
    let passwordResetToken = await Token.findOne({ userId });

    if (!passwordResetToken) {
      return res
        .status(400)
        .json({ detail: 'Invalid or expired password reset token' });
    }

    const isVaild = await bcrypt.compare(token, passwordResetToken.token);

    if (!isVaild) {
      return res.status(400).json({
        detail: 'Invalid or expired password reset token',
      });
    }

    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));

    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true },
    );

    await sendEmails(
      user.email,
      'Password Reset Successfully',
      {
        name: user.firstName,
      },
      '../views/email/resetPassword.handlebars',
    );

    await passwordResetToken.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Password confirm successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const validatePasswords = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { newPassword, newPassword2 } = req.body;

    if (newPassword !== newPassword2) {
      return res.status(400).json({ detail: 'Passwords do not match' });
    } else {
      next();
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const passwordChange = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    let user = await User.findById(req.auth.sub);
    const isVaild = await bcrypt.compare(oldPassword, user.password);

    if (!isVaild) {
      return res.status(400).json({
        detail: 'Old Password does not match',
      });
    } else {
      user.password = await bcrypt.hash(
        newPassword,
        Number(process.env.BCRYPT_SALT),
      );

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Password change successfully.',
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    const { sub, given_name, family_name, email, picture } =
      ticket.getPayload();

    const checkexists = await User.findOne({ email: email });

    if (checkexists) {
      let payload = {
        id: checkexists.id,
        sub: checkexists.id,
        firstName: checkexists.firstName,
        lastName: checkexists.lastName,
        email: checkexists.email,
        isStaff: checkexists?.isStaff,
      };
      const jwtToken = jwt.sign(payload, 'secret', {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      return res.status(200).json({
        success: true,
        accessToken: jwtToken,
        user: payload,
      });
    } else {
      const user = await User.findOneAndUpdate(
        { email: email },
        {
          googleId: sub,
          googleToken: token,
          firstName: given_name,
          lastName: family_name,
          profilePhoto: picture,
        },
        { upsert: true, new: true },
      );
      let payload = {
        id: user.id,
        sub: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isStaff: user.isStaff,
        profilePhoto: user.profilePhoto,
      };
      const jwtToken = jwt.sign(payload, 'secret', {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      return res.status(200).json({
        success: true,
        accessToken: jwtToken,
        user: payload,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.messages,
    });
  }
};

export const facebookAuth = async (req: Request, res: Response) => {
  try {
    const { email, profileUrl, name } = req.body;

    const checkexists = await User.findOne({ email: email });

    if (checkexists) {
      let payload = {
        id: checkexists.id,
        sub: checkexists.id,
        firstName: checkexists.firstName,
        lastName: checkexists.lastName,
        email: checkexists.email,
        isStaff: checkexists?.isStaff,
      };
      const jwtToken = jwt.sign(payload, 'secret', {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      return res.status(200).json({
        success: true,
        accessToken: jwtToken,
        user: payload
      })
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const adminLogin = async(req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isStaff: true })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password"
      })
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password)

    if(!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password"
      })
    }

    const payload = {
      id: user.id,
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePhoto: user.profilePhoto,
      isStaff: user.isStaff
    }

    const token = jwt.sign(payload, "secret", {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      success: true,
      accessToken: token,
      user: payload,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}