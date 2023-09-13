import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { env } from "./env.config";
import AuthRoutes from "./api/auth/auth.routes";
import UserRoutes from "./api/users/user.routes";

mongoose.connect(env.DATABASE_URL);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) =>
  res.json({ message: "API server is up and running..." })
);

app.use("/auth", AuthRoutes);
app.use("/users", UserRoutes);

app.listen(env.PORT, () => {
  console.log(`now listening to port ${env.PORT}`);
});
