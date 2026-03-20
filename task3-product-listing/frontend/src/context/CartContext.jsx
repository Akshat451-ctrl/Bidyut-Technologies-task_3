import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fh_cart") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("fh_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, size = "") => {
    const chosenSize = size || product.sizes?.[0] || "";
    const key = `${product._id}-${chosenSize}`;
    setItems(prev => {
      const exists = prev.find(i => i.key === key);
      if (exists) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, {
        key,
        id: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        mrp: product.mrp,
        size: chosenSize,
        color: product.colors?.[0] || "#374151",
        img: product.image,
        qty: 1,
      }];
    });
  };

  const updateQty = (key, delta) =>
    setItems(prev => prev.map(i => i.key === key ? { ...i, qty: Math.max(1, i.qty + delta) } : i));

  const removeItem = (key) =>
    setItems(prev => prev.filter(i => i.key !== key));

  const clearCart = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
