import path from "node:path";
import express from "express";
import { PrismaClient } from "@prisma/client";
import passport from "passport";
import "dotenv/config";
import routes from "./routes/indexRouter";
import "./config/passport";

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({ extended: true, limit: "1mb", parameterLimit: 5000 })
);
app.use(express.static(path.join(__dirname, "public")));
