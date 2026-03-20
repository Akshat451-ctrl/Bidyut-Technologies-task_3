require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const productRoutes = require("./routes/products");
const authRoutes    = require("./routes/auth");
const paymentRoutes = require("./routes/payment");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/auth",     authRoutes);
app.use("/api/payment",  paymentRoutes);

app.get("/", (req, res) => res.json({ message: "FabricHub API running!" }));

const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server → http://localhost:${PORT}`));
  })
  .catch((err) => { console.error("MongoDB Error:", err.message); process.exit(1); });
