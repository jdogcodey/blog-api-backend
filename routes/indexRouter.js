import express from "express";
import "dotenv";
import controller from "../controllers/indexController.js";

const router = express.Router();

router.get("/", controller.homepage);

router.get("/login", controller.loginPage);

router.post("/login", controller.loginPost);

router.get("/signup", controller.signupPage);

router.post("/user/new", controller.signupValidation(), controller.signupPost);

router.get("/user/:id", controller.getUser, controller.userPage);

router.get("/posts", controller.getUser, controller.posts);

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

export default router;
