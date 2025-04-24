import { jwt, JsonWebTokenError } from "jsonwebtoken";
import passport from "passport";
// import bcrypt from "bcryptjs";
// import { body, validationResult, check } from "express-validator";
import "dotenv";
// import prisma from "../config/prisma-client.js";

const controller = {
  login: (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const payload = { userId: user.id };
      const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    })(req, res, next);
  },
  protected: (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  homepage: (req, res, next) => {
    res.json({ message: "all good!" });
  },
};

export default controller;
