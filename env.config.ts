import dotenv from "dotenv";
import { cleanEnv, port, str } from "envalid"; // causes error if not destructured

dotenv.config();

export const env = cleanEnv(process.env, {
  PORT: port(),
  DATABASE_URL: str(),
  JWT_SECRET: str(),
  JWT_EXPIRY: str(),
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
});
