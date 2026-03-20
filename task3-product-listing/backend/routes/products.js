const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const {
      category, subCategory, gender, minPrice, maxPrice,
      sortBy, search, size, brands, minDiscount, minRating,
      isSale, page = 1, limit = 16
    } = req.query;

    const filter = {};

    if (search && search.trim()) {
      const t = search.trim();
      const or = [
        { name: { $regex: t, $options: "i" } },
        { brand: { $regex: t, $options: "i" } },
        { description: { $regex: t, $options: "i" } },
        { subCategory: { $regex: t, $options: "i" } },
      ];
      if (!isNaN(Number(t))) or.push({ price: Number(t) });
      filter.$or = or;
    }

    if (category && category !== "All") filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (isSale === "true" || isSale === "1") filter.isSale = true;
    if (gender && gender !== "All") filter.gender = gender;
    if (size) filter.sizes = size;

    if (brands) {
      const brandList = Array.isArray(brands) ? brands : brands.split(",").map(b => b.trim()).filter(Boolean);
      if (brandList.length) filter.brand = { $in: brandList };
    }

    if (minDiscount && Number(minDiscount) > 0) {
      filter.discount = { $gte: Number(minDiscount) };
    }

    if (minRating && Number(minRating) > 0) {
      filter.rating = { $gte: Number(minRating) };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    let sort = {};
    if (sortBy === "price_asc")   sort.price = 1;
    else if (sortBy === "price_desc") sort.price = -1;
    else if (sortBy === "rating")    sort.rating = -1;
    else if (sortBy === "discount")  sort.discount = -1;
    else sort.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort(sort).skip(skip).limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/products/search-suggestions
router.get("/search-suggestions", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ success: true, suggestions: [] });
    const products = await Product.find(
      { $or: [{ name: { $regex: q.trim(), $options: "i" } }, { brand: { $regex: q.trim(), $options: "i" } }] },
      { name: 1, brand: 1, category: 1, price: 1, mrp: 1, discount: 1, image: 1, rating: 1 }
    ).limit(6);
    res.json({ success: true, suggestions: products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/products/recommendations
router.get("/recommendations", async (req, res) => {
  try {
    const { category, excludeId } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (excludeId) filter._id = { $ne: excludeId };
    const products = await Product.find(filter).sort({ rating: -1 }).limit(4);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/products/categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ success: true, categories: ["All", ...categories] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/products/filter-options
router.get("/filter-options", async (req, res) => {
  try {
    const { category } = req.query;
    const match = category && category !== "All" ? { category } : {};
    const brands = await Product.distinct("brand", match);
    res.json({ success: true, brands: brands.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/products/price-range
router.get("/price-range", async (req, res) => {
  try {
    const result = await Product.aggregate([
      { $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } },
    ]);
    res.json({ success: true, ...result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
