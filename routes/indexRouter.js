import express from "express";
import "dotenv";
import controller from "../controllers/indexController.js";

const router = express.Router();

router.get("/", controller.homepage);

router.post("/login", controller.login);

router.get("/signup", controller.signUpPage);

router.post("signup", controller.signUpValidation, controller.signUpPost);

export default router;
