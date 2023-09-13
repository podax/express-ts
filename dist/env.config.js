"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const envalid_1 = require("envalid"); // causes error if not destructured
dotenv_1.default.config();
exports.env = (0, envalid_1.cleanEnv)(process.env, {
    PORT: (0, envalid_1.port)(),
    DATABASE_URL: (0, envalid_1.str)(),
    JWT_SECRET: (0, envalid_1.str)(),
    JWT_EXPIRY: (0, envalid_1.str)(),
    GOOGLE_CLIENT_ID: (0, envalid_1.str)(),
    GOOGLE_CLIENT_SECRET: (0, envalid_1.str)(),
});
