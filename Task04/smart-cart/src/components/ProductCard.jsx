import React from "react";

export default function ProductCard({ product, onClick, onAddToCart }) {
  return (
    <div className="product-card">
      <button
        type="button"
        className="product-card__imageBtn"
        onClick={() => onClick?.(product)}
        aria-label={`Open details for ${product.title}`}
      >
        <img src={product.image} alt={product.title} />
      </button>
      <button
        type="button"
        className="product-card__titleBtn"
        onClick={() => onClick?.(product)}
      >
        <h3>{product.title}</h3>
      </button>
      <p>${Number(product.price).toFixed(2)}</p>

      <div className="product-card__actions">
        <button
          type="button"
          className="product-card__add"
          onClick={(e) => {
            onAddToCart?.(product);
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
