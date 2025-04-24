import { jwt, JsonWebTokenError } from "jsonwebtoken";
import passport from "passport";
import bcrypt from "bcryptjs";
import { body, validationResult, check } from "express-validator";
import "dotenv";
import prisma from "../config/prisma-client.js";

const controller = {
  login: (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials",
          errors: { err },
      });
      }

      const payload = { userId: user.id };
      const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: "1h",
      });
      res.json({ 
        success: true, 
        message: "Login successful",
        data: {
          token,
          user: {
            username: user.username,
            email: user.email,
          }
           }});
    })(req, res, next);
  },
  protected: (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
       if (err || !user) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials",
          errors: { err },
      });
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  homepage: (req, res, next) => {
    res.json({ 
        success: true, 
        message: "Welcome!"
      });
  },
  signUpPage: (req, res, next) => {
    res.json({ 
        success: true, 
        message: "Sign up"
      });
  },
  signUpValidation: (req, res) => [
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
      .trim()
      .escape(),
    body("confirm-password").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  ],
  signUpPost: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Please fix the highlighted field",
        errors: { err },
      })
    }
    
    const { username, email, password } = req.body;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid Sign Up",
          errors: {
            username: "Username already taken"
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);


    }
  }
};

export default controller;
