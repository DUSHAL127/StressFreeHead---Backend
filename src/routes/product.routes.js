import { Router } from "express";
import { getProductDetails } from "../controllers/product.controller.js";

const router = Router();

// Route to get product details by ID
router.route("/products/:productId").get(getProductDetails);

export default router;
