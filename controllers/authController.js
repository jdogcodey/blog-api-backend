import jwt from "jsonwebtoken";
import passport from "passport";
import bcrypt from "bcryptjs";
import { body, validationResult, check } from "express-validator";
import "dotenv";
import prisma from "../config/prisma-client.js";

const authController = {
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
    // To be used alongside jwtAuth
    if (req.user.id !== parseInt(req.params.id, 10)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }
    next();
  },
  ownPost: async (req, res, next) => {
    // Checks that the signed in user owns the post they are trying to access
    // To be used alongside jwtAuth
    try {
      const postId = parseInt(req.params.postId, 10);
      const userId = parseInt(req.user.id, 10);
      // Fetch the post and check ownership
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }
      if (post.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to edit this post",
        });
      }

      req.post = post;
      next();
    } catch (err) {
      // Errors Handler
      res.status(500).json({
        success: false,
        message: "Server says no",
        errors: err,
      });
    }
  },
  getUser: (req, res, next) => {
    // Authenticates the user and passes that to the next middleware - This is not a security measure!
    // Carries on even if there is no user
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      req.user = user || null;
      next();
    })(req, res, next);
  },
};

export default authController;
