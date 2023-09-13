import { Joi } from "express-validation";

export const createUserValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
  }),
};
