import { Joi } from "express-validation";

export const loginValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const registerValidation = {
  body: Joi.object({
    email: Joi.string().required(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    password: Joi.string().required(),
    newsletterOptIn: Joi.bool().default(true),
    cardId: Joi.string().empty("").optional(),
    dob: Joi.string().empty("").optional(),
    location: {
      countryCode: Joi.string(),
      countryName: Joi.string(),
      city: Joi.string(),
      postal: Joi.string(),
      latitude: Joi.string(),
      longtitude: Joi.string(),
      IPv4: Joi.string(),
      state: Joi.string()
    },
    opted_in: Joi.boolean().optional()
  })
}

export const subscriptionValidation = {
  body: Joi.object({
    email: Joi.string().required()
  })
}

export const updateProfileValidation = {
  body: Joi.object({
    email: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string().empty("").optional().allow(null),
    phone: Joi.string().empty("").optional().allow(null),
    smsCountryCode: Joi.string().empty("").optional().allow(null),
    countryCode: Joi.string().empty("").optional().allow(null),
    profilephoto: Joi.string().empty("").optional()
  })
}

export const adminLoginValidation = {
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  })
}