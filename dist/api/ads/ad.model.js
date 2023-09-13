"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const AdSchema = new mongoose_1.Schema({
    title: { type: String, require: true },
    description: String,
    state: { type: String, require: true },
    city: { type: String, require: true },
    section: { type: String, require: true },
    category: { type: String, require: true },
    keywords: [String],
    location: { type: String, require: true },
    websiteLink: String,
    socialMediaLink: String,
    age: { type: Number, require: true },
    price: Number,
    mobileNumber: { type: String, require: true },
    images: [String],
});
AdSchema.plugin(mongoose_paginate_v2_1.default);
const Ad = (0, mongoose_1.model)("Ad", AdSchema);
exports.default = Ad;
