"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const UserSchema = new mongoose_1.Schema({
    email: String,
    password: String,
});
UserSchema.plugin(mongoose_paginate_v2_1.default);
const User = (0, mongoose_1.model)("User", UserSchema);
exports.default = User;
