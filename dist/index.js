"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const env_config_1 = require("./env.config");
const auth_routes_1 = __importDefault(require("./api/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./api/users/user.routes"));
mongoose_1.default.connect(env_config_1.env.DATABASE_URL);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => res.json({ message: "API server is up and running..." }));
app.use("/auth", auth_routes_1.default);
app.use("/users", user_routes_1.default);
app.listen(env_config_1.env.PORT, () => {
    console.log(`now listening to port ${env_config_1.env.PORT}`);
});
