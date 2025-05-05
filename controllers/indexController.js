import jwt from "jsonwebtoken";
import passport from "passport";
import bcrypt from "bcryptjs";
import { body, validationResult, check } from "express-validator";
import "dotenv";
import prisma from "../config/prisma-client.js";

const indexController = {
  loginPost: (req, res, next) => {
    // Takes in the username and password submitted, authenticates them, and provides the user with a jwt
    passport.authenticate("local", { session: false }, (err, user, info) => {
      // Handles an error or no user
      if (err || !user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
          errors: err || info,
        });
      }

      // Creates the payload of the userId
      const payload = { userId: user.id };

      // Uses this payload to sign a new token
      const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: "1h",
      });

      // Returns that the user has logged in - and provides them with the token we just created
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
  homepage: (req, res, next) => {
    // Simple bit of json response when requesting homepage - realistically this likely wouldn't request from the back end.
    res.json({
      success: true,
      message: "Welcome!",
    });
  },
  loginPage: (req, res, next) => {
    // Simple bit of json response when requesting loginpage - realistically this likely wouldn't request from the back end.
    res.json({
      success: true,
      message: "Log In",
    });
  },
  signupPage: (req, res, next) => {
    // Simple bit of json response when requesting signuppage - realistically this likely wouldn't request from the back end.
    res.json({
      success: true,
      message: "Sign up",
    });
  },
  signupPost: async (req, res, next) => {
    // Takes the sign up POST request, validates the form, checks if the user already exists, then creates the user

    // Collecting the errors from the validation
    const errors = validationResult(req);

    // Returning these errors so that the sign up form is correctly filled
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Please fix the highlighted field",
        errors: errors.array(),
      });
    }

    // Destructuring the form
    const { first_name, last_name, username, email, password } = req.body;

    // First checking if a user with that username or email exists
    try {
      const checkForDuplicate = await prisma.user.findFirst({
        where: {
          OR: [{ email: email }, { username: username }],
        },
      });

      // If there is a duplicate then returning this to the user
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

      // Hashing the password for storage
      const hashedPassword = await bcrypt.hash(password, 10);

      // Adding the user to the database
      const newUser = await prisma.user.create({
        data: {
          first_name: first_name,
          last_name: last_name,
          username: username,
          email: email,
          password: hashedPassword,
        },
      });

      // Signing a token for the user
      const token = jwt.sign({ userId: newUser.id }, process.env.SECRET, {
        expiresIn: "1h",
      });

      // Returning the token to the user
      res.status(201).json({
        success: true,
        message: "Sign Up successful",
        data: {
          token: token,
        },
      });
    } catch (err) {
      // Errors Handler
      res.status(500).json({
        success: false,
        message: "Server says no",
        errors: err,
      });
    }
  },
  userPage: async (req, res, next) => {
    // This function checks if the requested blog is the same as the person who logged in. Returns relevant info
    const reqProfile = parseInt(req.params.id, 10);
    const currentUser = req.user ? parseInt(req.user.id, 10) : null;

    try {
      // Gets the requested blog posts from the database
      const blogPosts = await prisma.post.findMany({
        where: {
          userId: reqProfile,
        },
      });

      // If the current user is the same as the blog then let the front-end enable them to edit
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
        // If the current user is not the same as the blog then tell the front end who they are but don't let them edit
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
        // If they aren't signed in then send them the blog but no user info
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
      // Error handler
      res.status(500).json({
        success: false,
        message: "Server says no",
        errors: err,
      });
    }
  },
  posts: async (req, res, next) => {
    try {
      // Find blog posts and send back
      const blogPosts = await prisma.post.findMany({
        where: {
          userId: parseInt(req.user.id, 10),
        },
      });
      res.status(200).json({
        success: true,
        message: "Your Posts",
        data: {
          user: {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            username: req.user.username,
            email: req.user.email,
          },
          blogPosts: blogPosts,
          editPrivilege: true,
        },
      });
    } catch (err) {
      // Error handler
      res.status(500).json({
        success: false,
        message: "Server says no",
        errors: err,
      });
    }
  },
  newPost: async (req, res, next) => {
    // Collecting the errors from the validation
    const errors = validationResult(req);

    // Returning these errors so that the new post form is correctly filled
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Please fix the highlighted field",
        errors: errors.array(),
      });
    }

    try {
      // Add the post to the database, along with the relevant user
      await prisma.post.create({
        data: {
          title: req.body.title,
          content: req.body.content,
          userId: req.user.id,
        },
      });
      // Return a success status that the post was added to the database
      res.status(201).json({
        success: true,
        message: "Post created",
        data: {
          user: {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            username: req.user.username,
            email: req.user.email,
          },
        },
      });
    } catch (err) {
      // Errors Handler
      res.status(500).json({
        success: false,
        message: "Server says no",
        errors: err,
      });
    }
  },
  postById: async (req, res, next) => {
    try {
      // Get the post that matches the request
      const postFromId = await prisma.post.findUnique({
        where: {
          id: parseInt(req.params.postId, 10),
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      let editPrivilege = false;
      let user;
      if (req.user && postFromId.userId === parseInt(req.user.id, 10)) {
        editPrivilege = true;
        user = {
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          username: req.user.username,
          email: req.user.email,
        };
      }

      return res.status(200).json({
        success: true,
        message: `Post ${req.params.postId}`,
        data: {
          user: user,
          editPrivilege: editPrivilege,
          blogPosts: [postFromId],
        },
      });
    } catch (err) {
      // Errors Handler
      res.status(500).json({
        success: false,
        message: "Server says no",
        errors: err,
      });
    }
  },
  putPost: async (req, res, next) => {
    // Collecting the errors from the validation
    const errors = validationResult(req);
    // Returning these errors so that the put post form is correctly filled
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Please fix the highlighted field",
        errors: errors.array(),
      });
    }
    try {
      // Update since user is the owner
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          title: req.body.title,
          content: req.body.content,
        },
      });
      // Return a success status that the post was added to the database
      res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: {
          blogPosts: [updatedPost],
          user: {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            username: req.user.username,
            email: req.user.email,
          },
        },
      });
    } catch (err) {
      // Errors Handler
      res.status(500).json({
        success: false,
        message: "Server says no",
        errors: err,
      });
    }
  },
  deletePost: async (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.user.id;
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
        message: "You do not have permission to delete this post",
      });
    }
    // Delete since the owner is the same
    const deletedPost = await prisma.post.delete({
      where: {
        postId: postId,
      },
    });
    res.status(204);
  },
  getUser: (req, res, next) => {
    return res.status(200).json({
      success: true,
      message: `${req.user.id} Profile - Logged in as self - Edit privilege allowed`,
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
  },
};

export default indexController;
