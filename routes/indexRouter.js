import express from "express";
import "dotenv";
import controller from "../controllers/indexController.js";

const router = express.Router();

router.get("/", controller.homepage);

export default router;
