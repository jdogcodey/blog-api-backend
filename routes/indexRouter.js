import express from "express";
import "dotenv";
import indexController from "../controllers/indexController.js";
import validationController from "../controllers/validationControllers.js";

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

router.get("/user", indexController.g);

// Gets the page of a given user - gives an edit privilege to them if they're logged in
router.get("/user/:id", indexController.getUser, indexController.userPage);

// Shows all of a users own posts
router.get("/posts", indexController.getUser, indexController.posts);

// Posts a new post
router.post(
  "/posts/new",
  // Check if logged in
  indexController.jwtAuth,
  // Check they filled out the form correctly
  validationController.newPost(),
  // Find out who the user is
  indexController.getUser,
  // Post to the database
  indexController.newPost
);

// Gets a post from its ID
router.get(
  "/posts/:postId",
  // Check who is logged in to give edit privileges
  indexController.getUser,
  // Request from db and send to client
  indexController.postById
);

router.put(
  // Adding ID to the params as an extra security measure
  "/posts/:postId/:id",
  indexController.selfPermission,
  validationController.putPost(),
  indexController.putPost
);

router.delete(
  "/posts/:postId/:id",
  indexController.selfPermission,
  indexController.getUser,
  indexController.deletePost
);

export default router;
