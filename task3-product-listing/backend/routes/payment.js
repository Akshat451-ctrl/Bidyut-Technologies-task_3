const express  = require("express");
const crypto   = require("crypto");
const Razorpay = require("razorpay");
const protect  = require("../middleware/auth");
const router   = express.Router();

// Lazily create Razorpay instance so missing keys don't crash server
function getRazorpay() {
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payment/create-order
router.post("/create-order", protect, async (req, res) => {
  try {
    const { amount } = req.body; // amount in INR paise (multiply by 100)
    if (!amount) return res.status(400).json({ success: false, message: "Amount required" });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // paise
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
      notes:    { userId: req.user._id.toString() },
    });

    res.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/payment/verify
router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body      = razorpay_order_id + "|" + razorpay_payment_id;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ success: false, message: "Payment verification failed" });

    res.json({
      success:    true,
      message:    "Payment verified successfully",
      paymentId:  razorpay_payment_id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payment/key  — send public key to frontend
router.get("/key", (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
