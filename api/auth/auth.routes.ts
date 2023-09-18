import { Router } from 'express';
import { validate } from 'express-validation';
import * as AuthController from './auth.controller';
import * as AuthSchema from './auth.schema';

const AuthRoutes = Router();

AuthRoutes.post(
  '/login',
  validate(AuthSchema.loginValidation, { keyByField: true }, {}),
  AuthController.login,
);

AuthRoutes.post(
  '/register',
  validate(AuthSchema.registerValidation, { keyByField: true }, {}),
  AuthController.register,
);

AuthRoutes.post(
  '/subscribe',
  validate(AuthSchema.subscriptionValidation, { keyByField: true }, {}),
  AuthController.subscribe,
);

AuthRoutes.get('/profile', AuthController.getProfile);

AuthRoutes.post(
  '/profile',
  checkJwt,
  validate(AuthSchema.updateProfileValidation, { keyByField: true }, {}),
  AuthController.updateProfile,
);

AuthRoutes.post('/reset-password', AuthController.resetPassword);
AuthRoutes.post('/reset-password-confirm', AuthController.resetPasswordConfirm);

AuthRoutes.post(
  '/password-change',
  checkJwt,
  AuthController.validatePasswords,
  AuthController.passwordChange,
);

AuthRoutes.post('/google', AuthController.googleAuth);
AuthRoutes.post('/facebook', AuthController.facebookAuth);

AuthRoutes.post(
  '/admin/login',
  validate(AuthSchema.adminLoginValidation, { keyByField: true }, {}),
  AuthController.adminLogin
);

export default AuthRoutes;
