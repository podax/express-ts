"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdValidation = void 0;
const express_validation_1 = require("express-validation");
exports.createAdValidation = {
    body: express_validation_1.Joi.object({
        title: express_validation_1.Joi.string().required(),
        description: express_validation_1.Joi.string().optional(),
        state: express_validation_1.Joi.string().required(),
        city: express_validation_1.Joi.string().required(),
        section: express_validation_1.Joi.string().required(),
        category: express_validation_1.Joi.string().required(),
        keywords: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional(),
        location: express_validation_1.Joi.string().required(),
        websiteLink: express_validation_1.Joi.string().optional(),
        socialMediaLink: express_validation_1.Joi.string().optional(),
        age: express_validation_1.Joi.number().required(),
        price: express_validation_1.Joi.number().optional(),
        mobileNumber: express_validation_1.Joi.string().required(),
        images: express_validation_1.Joi.array().items(express_validation_1.Joi.binary()).optional(),
    }),
};
