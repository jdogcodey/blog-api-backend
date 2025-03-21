import passport from "passport";
import bcrypt from "bcryptjs";
import { body, validationResult, check } from "express-validator";
import "dotenv";
import prisma from "../config/prisma-client.js";

const controller = {
  homepage: (req, res, next) => {
    res.json({ message: "all good!" });
  },
};

export default controller;
