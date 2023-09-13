"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const env_config_1 = require("../../env.config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../users/user.model"));
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_model_1.default.findOne({ email });
        if (!user ||
            !user.password ||
            !(yield bcrypt_1.default.compare(password, user.password))) {
            return res.status(401).json({
                status: false,
                error: "Invalid email or password",
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, env_config_1.env.JWT_SECRET, { expiresIn: env_config_1.env.JWT_EXPIRY });
        res.json({
            status: true,
            data: { token, userId: user._id },
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            error: "An unexpected error occurred.",
        });
    }
});
exports.login = login;
