import { Router } from "express";
import { validate } from "express-validation";
import * as AuthController from "./auth.controller";
import * as AuthSchema from "./auth.schema";

const AuthRoutes = Router();

AuthRoutes.post(
  "/login",
  validate(AuthSchema.loginValidation),
  AuthController.login
);

export default AuthRoutes;
