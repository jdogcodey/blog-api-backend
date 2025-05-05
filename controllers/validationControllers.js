import jwt from "jsonwebtoken";
import passport from "passport";
import bcrypt from "bcryptjs";
import { body, validationResult, check } from "express-validator";
import "dotenv";
import prisma from "../config/prisma-client.js";

const validationController = {
  signup: () => [
    // Chain of functions from express-validator to validate the sign up form coming in
    body("first_name")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isAlpha()
      .withMessage("First name must only contain letters"),
    body("last_name")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isAlpha()
      .withMessage("Last name must only contain letters"),
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Must be a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[@$!%*?&]/)
      .withMessage(
        "Password must contain at least one special character (@$!%*?&)"
      )
      .not()
      .isIn(["password", "123456", "qwerty"])
      .withMessage("Password is too common")
      .trim(),
    body("confirm-password").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  ],
  newPost: () => [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Posts must have a title")
      .isString()
      .withMessage("Must be a String")
      .isLength({ max: 200 })
      .withMessage("Title Must be under 200 characters"),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isString()
      .withMessage("Must be a String")
      .isLength({ max: 5000 })
      .withMessage("Content must be under 5000 characters"),
  ],
  putPost: () => [
    body("title")
      .optional()
      .trim()
      .isString()
      .withMessage("Must be a String")
      .isLength({ max: 200 })
      .withMessage("Title Must be under 200 characters").optional,
    body("content")
      .optional()
      .trim()
      .isString()
      .withMessage("Must be a String")
      .isLength({ max: 5000 })
      .withMessage("Content must be under 5000 characters"),
    body().custom((body) => {
      if (!body.title && !body.content) {
        throw new Error("Either title or content must be provided");
      }
      return true;
    }),
  ],
};

export default validationController;
