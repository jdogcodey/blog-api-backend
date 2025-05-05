import express from "express";
import "dotenv";
import indexController from "../controllers/indexController.js";
import validationController from "../controllers/validationControllers.js";
import authController from "../controllers/authController.js";

const router = express.Router();

// This probably could be served by the front page alone - unless there needed to be something live on there
router.get("/", indexController.homepage);

// Ultimately this probably wouldn't make a back end request
router.get("/login", indexController.loginPage);

// Allows a user who is already signed up to login
router.post("/login", indexController.loginPost);

// Ultimately this probably wouldn't make a back end request
router.get("/signup", indexController.signupPage);

// Validates the users input, then hashes their password and stores them in the db
router.post(
  "/signup",
  validationController.signup(),
  indexController.signupPost
);

router.get(
  "/user",
  authController.jwtAuth,
  authController.getUser,
  indexController.getUser
);

// Gets the page of a given user - gives an edit privilege to them if they're logged in
router.get("/user/:id", authController.getUser, indexController.userPage);

// Shows all of a users own posts
router.get("/posts", authController.getUser, indexController.posts);

// Posts a new post
router.post(
  "/posts/new",
  // Check if logged in
  authController.jwtAuth,
  // Check they filled out the form correctly
  validationController.newPost(),
  // Find out who the user is
  authController.getUser,
  // Post to the database
  indexController.newPost
);

// Gets a post from its ID
router.get(
  "/posts/:postId",
  // Check who is logged in to give edit privileges
  authController.getUser,
  // Request from db and send to client
  indexController.postById
);

// Checks that a user owns the post, validates their form and then updates their post
router.put(
  "/posts/:postId",
  authController.getUser,
  // Checks the user and the owner of the post are the same
  authController.ownPost,
  // Validates they filled the form out correctly
  validationController.putPost(),
  // Updates the database
  indexController.putPost
);

// Checks that the user owns the post then deletes the post
router.delete(
  "/posts/:postId/:id",
  authController.getUser,
  // Checks the user and the owner of the post are the same
  authController.ownPost,
  // Deletes from the database
  indexController.deletePost
);

export default router;
