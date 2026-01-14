import React from "react";

export default function ProductDetails({ product, onAddToCart, onClose }) {
  if (!product) return null;

  return (
    <div className="product-details-modal">
      <button onClick={onClose}>X</button>
      <img src={product.image} alt={product.title} />
      <h2>{product.title}</h2>
      <p>${product.price}</p>
      <p>{product.description}</p>
      <button onClick={() => onAddToCart(product)}>Add to Cart</button>
    </div>
  );
}
