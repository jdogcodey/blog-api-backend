import express from "express";
import "dotenv";
import controller from "../controllers/indexController.js";

const router = express.Router();

router.get("/", controller.homepage);

router.get("/login", controller.loginPage);

router.post("/login", controller.loginPost);

router.get("/signup", controller.signupPage);

router.post("/user/new", controller.signupValidation(), controller.signupPost);

router.get("/user/:id:", controller.userPage);

export default router;
