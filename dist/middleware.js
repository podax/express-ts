"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("./env.config");
const isAuthenticated = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]; // Assumes "Bearer <TOKEN>"
        if (!token) {
            return res.status(401).json({ message: "Authentication failed!" });
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_SECRET);
        req.userData = { userId: decodedToken.userId }; // Store user data in the request for use in other routes.
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Authentication failed!" });
    }
};
exports.isAuthenticated = isAuthenticated;
