import { useState, useEffect } from "react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const fmt = (p) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

// Load Razorpay script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartPage({ onClose, onAuthNeeded }) {
  const { user } = useAuth();
  const { items, updateQty, removeItem, clearCart } = useCart();
  const [paying, setPaying]         = useState(false);
  const [paySuccess, setPaySuccess] = useState(null);
  const [payError, setPayError]     = useState("");
  const [step, setStep]             = useState("cart"); // cart | address | payment
  const [isDemo, setIsDemo]         = useState(false);

  const [address, setAddress] = useState({
    name:    user?.name    || "",
    phone:   user?.phone   || "",
    street:  user?.address?.street  || "",
    city:    user?.address?.city    || "",
    state:   user?.address?.state   || "",
    pincode: user?.address?.pincode || "",
  });

  useEffect(() => {
    if (user) setAddress({ name: user.name, phone: user.phone || "", street: user.address?.street || "", city: user.address?.city || "", state: user.address?.state || "", pincode: user.address?.pincode || "" });
  }, [user]);

  const subtotal  = items.reduce((s, it) => s + it.price * it.qty, 0);
  const savings   = items.reduce((s, it) => s + (it.mrp - it.price) * it.qty, 0);
  const delivery  = subtotal > 999 ? 0 : 79;
  const total     = subtotal + delivery;

  const runDemoPayment = () => {
    setTimeout(() => {
      clearCart();
      setPaySuccess({
        paymentId: "pay_demo_" + Math.random().toString(36).slice(2, 14).toUpperCase(),
        orderId:   "order_demo_" + Math.random().toString(36).slice(2, 14).toUpperCase(),
        amount:    total,
      });
      setPaying(false);
    }, 2000);
  };

  const handlePayment = async () => {
    if (!user) return onAuthNeeded?.();
    setPaying(true); setPayError("");
    try {
      // Check if real Razorpay keys are configured
      const keyRes = await api.get("/api/payment/key");
      const keyId = keyRes.data.keyId;
      const demoMode = !keyId || keyId.includes("YourKey") || keyId === "rzp_test_YourKeyIDHere";
      setIsDemo(demoMode);

      if (demoMode) {
        // Demo mode — simulate payment without real Razorpay
        runDemoPayment();
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Razorpay SDK failed to load. Check your internet connection.");

      // Create order on backend
      const { data } = await api.post("/api/payment/create-order", { amount: total });

      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        "Bidyut Innovation Store",
        description: `Order of ${items.length} item(s)`,
        image:       "https://i.imgur.com/n5tjHFD.png",
        order_id:    data.orderId,
        prefill: {
          name:    user.name,
          email:   user.email,
          contact: user.phone || "9999999999",
        },
        notes: {
          address: `${address.street}, ${address.city}`,
        },
        theme: { color: "#f97316" },
        handler: async (response) => {
          try {
            const verify = await api.post("/api/payment/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            if (verify.data.success) {
              clearCart();
              setPaySuccess({
                paymentId: response.razorpay_payment_id,
                orderId:   response.razorpay_order_id,
                amount:    total,
              });
            }
          } catch {
            setPayError("Payment verified but confirmation failed. Contact support.");
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => { setPaying(false); },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setPayError(resp.error?.description || "Payment failed. Try again.");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setPayError(err.response?.data?.message || err.message || "Payment failed");
      setPaying(false);
    }
  };

  const INPUT = "w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={!paying ? onClose : undefined} />

      <div className="w-full max-w-md bg-white dark:bg-gray-950 h-full flex flex-col shadow-2xl">

        {/* ── PAYMENT SUCCESS ── */}
        {paySuccess && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-500/15 rounded-full flex items-center justify-center mb-5 animate-bounce">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your order has been placed. We'll email you the details shortly.</p>
            <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-left space-y-2.5 mb-6">
              {[
                ["Amount Paid", fmt(paySuccess.amount)],
                ["Payment ID", paySuccess.paymentId],
                ["Order ID", paySuccess.orderId.slice(0, 20) + "..."],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{l}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-xs">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={onClose} className="flex-1 py-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors">Close</button>
              <button onClick={onClose} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors">Track Order</button>
            </div>
          </div>
        )}

        {!paySuccess && (
          <>
            {/* Header */}
            <div className="border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center px-5 h-14">
                {step !== "cart" && (
                  <button onClick={() => setStep("cart")} className="mr-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 flex-1">
                  {step === "cart" && <><span className="text-orange-500">🛒</span> My Cart <span className="text-sm font-normal text-gray-400">({items.length} items)</span></>}
                  {step === "address" && <><span>📍</span> Delivery Address</>}
                </h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center cursor-pointer">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Stepper */}
              <div className="flex px-5 pb-3 gap-1">
                {["Cart", "Address", "Payment"].map((s, i) => (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                      (step === "cart" && i === 0) || (step === "address" && i === 1) || (step === "payment" && i === 2)
                        ? "bg-orange-500 text-white"
                        : i < ["cart","address","payment"].indexOf(step) ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    }`}>{i < ["cart","address"].indexOf(step) ? "✓" : i + 1}</div>
                    <span className="text-xs text-gray-400 font-medium hidden sm:block">{s}</span>
                    {i < 2 && <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800 mx-1" />}
                  </div>
                ))}
              </div>
            </div>

            {/* ── CART STEP ── */}
            {step === "cart" && (
              <>
                {delivery > 0 && (
                  <div className="mx-5 mt-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20">
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">Add {fmt(999 - subtotal)} more for FREE delivery!</p>
                  </div>
                )}
                {delivery === 0 && (
                  <div className="mx-5 mt-3 p-3 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-100 dark:border-green-500/20">
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">🎉 You qualify for FREE delivery!</p>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl">🛒</span>
                      </div>
                      <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1">Your cart is empty</h3>
                      <p className="text-sm text-gray-400">Add items from the product listing to get started.</p>
                      <button onClick={onClose} className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl cursor-pointer transition-colors">
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.key} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://placehold.co/80x96"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{item.brand}</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight mt-0.5 line-clamp-2">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.size && <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">Size: {item.size}</span>}
                            <span className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ background: item.color }} />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-extrabold text-gray-900 dark:text-gray-100 text-sm">{fmt(item.price)}</span>
                              {item.mrp > item.price && <span className="text-xs text-gray-400 line-through">{fmt(item.mrp)}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateQty(item.key, -1)} className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 cursor-pointer transition-colors">−</button>
                              <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-gray-100">{item.qty}</span>
                              <button onClick={() => updateQty(item.key, 1)} className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 cursor-pointer transition-colors">+</button>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.key)} className="self-start p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-300 hover:text-red-400 cursor-pointer transition-colors mt-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 shrink-0 space-y-2">
                  {[["Subtotal", fmt(subtotal)], ["Discount", `− ${fmt(savings)}`], ["Delivery", delivery === 0 ? "FREE" : fmt(delivery)]].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{l}</span>
                      <span className={l === "Discount" ? "text-green-600 dark:text-green-400 font-semibold" : l === "Delivery" && delivery === 0 ? "text-green-600 dark:text-green-400 font-semibold" : ""}>{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-extrabold text-base text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span>Total</span><span>{fmt(total)}</span>
                  </div>
                  <button
                    onClick={() => setStep("address")}
                    disabled={items.length === 0}
                    className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer mt-1 text-sm shadow-lg shadow-orange-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              </>
            )}

            {/* ── ADDRESS STEP ── */}
            {step === "address" && (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
                  {[["Full Name","name","text","👤"],["Phone Number","phone","tel","📱"],["Street / House No.","street","text","🏠"],["City","city","text","🏙️"],["State","state","text","📍"],["Pincode","pincode","text","🔢"]].map(([lbl,k,type,icon]) => (
                    <div key={k}>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{lbl}</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{icon}</span>
                        <input type={type} required placeholder={lbl}
                          value={address[k]}
                          onChange={(e) => setAddress({ ...address, [k]: e.target.value })}
                          className={`${INPUT} pl-10`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                  <div className="flex justify-between font-bold text-base text-gray-900 dark:text-gray-100 mb-3">
                    <span>Total Amount</span><span className="text-orange-500">{fmt(total)}</span>
                  </div>
                  {payError && <p className="text-sm text-red-500 mb-2 font-medium">{payError}</p>}
                  <button
                    onClick={handlePayment}
                    disabled={paying || !address.name || !address.phone || !address.street}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-4 rounded-2xl transition-all cursor-pointer shadow-lg shadow-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
                  >
                    {paying ? (
                      <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing...</>
                    ) : (
                      <><span className="text-xl">💳</span> Pay {fmt(total)} with Razorpay{isDemo && <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">DEMO</span>}</>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2.5 flex items-center justify-center gap-1.5">
                    <span>🔒</span> Secured by Razorpay · UPI · Cards · Net Banking
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
