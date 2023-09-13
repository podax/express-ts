import { Router } from "express";
import { validate } from "express-validation";
import { isAuthenticated } from "../../middleware";
import * as UserController from "./user.controller";
import * as UserSchema from "./user.schema";

const UserRoutes = Router();

UserRoutes.post(
  "/",
  validate(UserSchema.createUserValidation),
  isAuthenticated,
  UserController.createUser
);

export default UserRoutes;
