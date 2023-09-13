"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = void 0;
const express_validation_1 = require("express-validation");
exports.loginValidation = {
    body: express_validation_1.Joi.object({
        email: express_validation_1.Joi.string().email().required(),
        password: express_validation_1.Joi.string().required(),
    }),
};
