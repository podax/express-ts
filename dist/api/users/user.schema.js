"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserValidation = void 0;
const express_validation_1 = require("express-validation");
exports.createUserValidation = {
    body: express_validation_1.Joi.object({
        email: express_validation_1.Joi.string().email().required(),
        password: express_validation_1.Joi.string().required().min(8),
    }),
};
