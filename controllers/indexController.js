import jwt from "jsonwebtoken";
import passport from "passport";
import bcrypt from "bcryptjs";
import { body, validationResult, check } from "express-validator";
import "dotenv";
import prisma from "../config/prisma-client.js";

const controller = {
  loginPost: (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
          errors: err || info,
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
          },
        },
      });
    })(req, res, next);
  },
  jwtAuth: (req, res, next) => {
    // Checks that the user is signed in - anyone logged in will be let past.
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(401).json({
          success: false,
          message: "Not logged in",
          errors: err || info,
        });
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  selfPermission: (req, res, next) => {
    // Checks that the signed in user is the same as the id of the page they are trying to access - Only if they match will they be allowed through.
    if (req.user.id !== parseInt(req.params.id, 10)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }
    next();
  },
  getUser: (req, res, next) => {
    // Authenticates the user and passes that to the next middleware - This is not a security measure!
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      req.user = user || null;
      next();
    })(req, res, next);
  },
  homepage: (req, res, next) => {
    res.json({
      success: true,
      message: "Welcome!",
    });
  },
  loginPage: (req, res, next) => {
    res.json({
      success: true,
      message: "Log In",
    });
  },
  signupPage: (req, res, next) => {
    res.json({
      success: true,
      message: "Sign up",
    });
  },
  signupValidation: () => [
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
  signupPost: async (req, res, next) => {
    // console.log("test");
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Please fix the highlighted field",
        errors: errors.array(),
      });
    }

    const { first_name, last_name, username, email, password } = req.body;

    try {
      const checkForDuplicate = await prisma.user.findFirst({
        where: {
          OR: [{ email: email }, { username: username }],
        },
      });

      if (checkForDuplicate) {
        let duplicateField =
          checkForDuplicate.email === req.body.email ? "email" : "username";
        return res.status(400).json({
          success: false,
          message: `An account already exists with those details`,
          errors: {
            duplicateField: `${duplicateField} already in use`,
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          first_name: first_name,
          last_name: last_name,
          username: username,
          email: email,
          password: hashedPassword,
        },
      });

      const token = jwt.sign({ userId: newUser.id }, process.env.SECRET, {
        expiresIn: "1h",
      });

      res.status(201).json({
        success: true,
        message: "Sign Up successful",
        data: {
          token: token,
        },
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server says no",
        errors: err,
      });
    }
  },
  userPage: async (req, res, next) => {
    const reqProfile = parseInt(req.params.id, 10);
    const currentUser = req.user ? parseInt(req.user.id, 10) : null;

    try {
      const blogPosts = await prisma.post.findMany({
        where: {
          userId: reqProfile,
        },
      });

      if (reqProfile === currentUser) {
        return res.status(200).json({
          success: true,
          message: `${req.params.id} Profile - Logged in as self - Edit privilege allowed`,
          data: {
            user: {
              first_name: req.user.first_name,
              last_name: req.user.last_name,
              username: req.user.username,
              email: req.user.email,
            },
            editPrivilege: true,
            blogPosts: blogPosts,
          },
        });
      } else if (currentUser) {
        return res.status(200).json({
          success: true,
          message: `${req.params.id} Profile - Logged in as ${req.user.username}`,
          data: {
            user: {
              first_name: req.user.first_name,
              last_name: req.user.last_name,
              username: req.user.username,
              email: req.user.email,
            },
            editPrivilege: false,
            blogPosts: blogPosts,
          },
        });
      } else {
        return res.status(200).json({
          success: true,
          message: `${req.params.id} Profile - Not logged in`,
          data: {
            editPrivilege: false,
            blogPosts: blogPosts,
          },
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server says no",
        errors: err,
      });
    }
  },
};

export default controller;
