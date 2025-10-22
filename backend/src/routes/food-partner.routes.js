// routes/food-partner.routes.js
import express from "express";
import { getFoodPartnerById } from "../controllers/food-partner.controller.js";
// import { authUserMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* /api/food-partner/:id */
router.get(
  "/:id",
  getFoodPartnerById
);

export default router;
