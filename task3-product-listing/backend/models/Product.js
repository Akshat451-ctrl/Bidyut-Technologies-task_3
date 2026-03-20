const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    brand:       { type: String, required: true },
    price:       { type: Number, required: true, min: 0 },
    mrp:         { type: Number, required: true },
    discount:    { type: Number, default: 0 },
    category:    { type: String, required: true, enum: ["Men", "Women", "Kids", "Sports"] },
    subCategory: { type: String, required: true },
    gender:      { type: String, enum: ["Men", "Women", "Kids", "Unisex"], default: "Unisex" },
    description: { type: String, required: true },
    image:       { type: String, required: true },
    image2:      { type: String },
    rating:      { type: Number, default: 4.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    sizes:       [{ type: String }],
    colors:      [{ type: String }],
    inStock:     { type: Boolean, default: true },
    isTrending:  { type: Boolean, default: false },
    isSale:      { type: Boolean, default: false },
    freeShipping:{ type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
