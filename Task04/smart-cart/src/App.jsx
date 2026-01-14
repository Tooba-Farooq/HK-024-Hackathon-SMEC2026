import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import ProductGrid from "./components/ProductGrid";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import Cart from "./components/Cart";
import "./App.css";

const CART_SESSION_KEY = "smart_cart_session";

function HomePage({ onAddToCart }) {
  const navigate = useNavigate();

  return (
    <>
      <HeroSlider />
      <ProductGrid
        onProductClick={(product) => navigate(`/product/${product.id}`)}
        onAddToCart={onAddToCart}
      />
    </>
  );
}

export default function App() {
  const [cart, setCart] = useState(() => {
    try {
      const raw = sessionStorage.getItem(CART_SESSION_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(CART_SESSION_KEY, JSON.stringify(cart));
    } catch {
      // ignore write errors (e.g., storage full / disabled)
    }
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id, nextQty) => {
    const qty = Number(nextQty);
    if (!Number.isFinite(qty)) return;

    setCart((prev) => {
      if (qty <= 0) return prev.filter((p) => p.id !== id);
      return prev.map((p) => (p.id === id ? { ...p, quantity: qty } : p));
    });
  };

  const increment = (id) => {
    const item = cart.find((p) => p.id === id);
    updateQuantity(id, Number(item?.quantity || 1) + 1);
  };

  const decrement = (id) => {
    const item = cart.find((p) => p.id === id);
    updateQuantity(id, Number(item?.quantity || 1) - 1);
  };

  return (
    <div>
      <Navbar cartCount={cartCount} onCartClick={() => setShowCart(true)} />

      <Routes>
        <Route path="/" element={<HomePage onAddToCart={addToCart} />} />
        <Route
          path="/product/:id"
          element={<ProductDetailsPage onAddToCart={addToCart} />}
        />
      </Routes>

      {showCart && (
        <Cart
          cartItems={cart}
          onRemove={removeFromCart}
          onClose={() => setShowCart(false)}
          onIncrement={increment}
          onDecrement={decrement}
        />
      )}
    </div>
  );
}
