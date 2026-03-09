import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// Helper to calculate and update average rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const avgRating = numReviews > 0 
    ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews 
    : 5.0; // default back to 5.0 if no reviews
    
  await Product.findByIdAndUpdate(productId, {
    rating: avgRating,
    numReviews,
  });
};

// Add a review to a product (Customer only, one per product)
export const addReview = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;
    if (!customerId) return res.status(401).json({ message: "Unauthorized" });
    if (req.user?.role !== "customer") {
      return res.status(403).json({ message: "Only customers can add reviews" });
    }

    const { productId } = req.params; // expects POST /product/:productId
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Verify user has purchased this product
    const hasPurchased = await Order.findOne({
      customer: customerId,
      "orderItems.product": productId,
      status: { $ne: "Cancelled" } // As long as it's not cancelled
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: "You must purchase this product to leave a review." });
    }

    const existing = await Review.findOne({ product: productId, customer: customerId });
    if (existing) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    const review = new Review({
      product: productId,
      customer: customerId,
      rating,
      comment,
    });

    await review.save();
    
    // Update product average rating
    await updateProductRating(productId);
    
    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all reviews for a product (Public)
export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params; // GET /product/:productId
    const reviews = await Review.find({ product: productId })
      .sort("-createdAt")
      .populate("customer", "name email");

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update own review (Customer) or any review (Admin)
export const updateReview = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params; // PATCH/PUT /:id
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const isOwner = review.customer.toString() === userId.toString();
    const isAdmin = role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to update this review" });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }
    if (comment !== undefined) review.comment = comment;

    await review.save();
    
    // Update product average rating
    await updateProductRating(review.product);
    
    res.json({ message: "Review updated", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete own review (Customer) or any review (Admin)
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params; // DELETE /:id
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const isOwner = review.customer.toString() === userId.toString();
    const isAdmin = role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();
    
    // Update product average rating
    await updateProductRating(review.product);
    
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check if a user has purchased a product
export const checkPurchase = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;
    if (!customerId) return res.json({ hasPurchased: false });

    const { productId } = req.params;
    const hasPurchased = await Order.findOne({
      customer: customerId,
      "orderItems.product": productId,
      status: { $ne: "Cancelled" }
    });

    res.json({ hasPurchased: !!hasPurchased });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};