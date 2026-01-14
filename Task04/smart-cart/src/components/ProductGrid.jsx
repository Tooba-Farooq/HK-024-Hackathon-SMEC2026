import React, { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import ProductCard from "./ProductCard";

export default function ProductGrid({ onProductClick, onAddToCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          onClick={onProductClick}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
