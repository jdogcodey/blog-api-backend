import path from "node:path";
import express from "express";
import { PrismaClient } from "@prisma/client";
import passport from "passport";
import "dotenv/config";
import routes from "./routes/indexRouter";
import "./config/passport";
