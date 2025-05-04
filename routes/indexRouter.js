import express from "express";
import "dotenv";
import controller from "../controllers/indexController.js";

const router = express.Router();

// This probably could be served by the front page alone - unless there needed to be something live on there
router.get("/", controller.homepage);

// Ultimately this probably wouldn't make a back end request
router.get("/login", controller.loginPage);

// Allows a user who is already signed up to login
router.post("/login", controller.loginPost);

// Ultimately this probably wouldn't make a back end request
router.get("/signup", controller.signupPage);

// Validates the users input, then hashes their password and stores them in the db
router.post("/signup", controller.signupValidation(), controller.signupPost);

// Gets the page of a given user - gives an edit privilege to them if they're logged in
router.get("/user/:id", controller.getUser, controller.userPage);

// Shows all of a users own posts
router.get("/posts", controller.getUser, controller.posts);

// Posts a new post
router.post(
  "/posts/new",
  // Check if logged in
  controller.jwtAuth,
  // Check they filled out the form correctly
  controller.newPostValidation(),
  // Find out who the user is
  controller.getUser,
  // Post to the database
  controller.newPost
);

// Gets a post from its ID
router.get(
  "/posts/:postId",
  // Check who is logged in to give edit privileges
  controller.getUser,
  // Request from db and send to client
  controller.postById
);

export default router;
