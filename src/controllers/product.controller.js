import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "./../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Controller function to get product details by ID
const getProductDetails = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Fetch product details by ID
  const product = await Product.findById(productId).select("title description image");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(new ApiResponse(200, "Product details fetched successfully", product));
});

export { getProductDetails };
