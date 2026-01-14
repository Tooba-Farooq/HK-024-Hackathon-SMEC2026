import React from "react";

export default function Navbar({ cartCount, onCartClick }) {
  return (
    <nav className="navbar">
      <h1>My Shop</h1>
      <div className="cart-icon" onClick={onCartClick}>
        🛒 {cartCount > 0 && <span>{cartCount}</span>}
      </div>
    </nav>
  );
}
