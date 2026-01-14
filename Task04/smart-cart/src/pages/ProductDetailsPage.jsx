import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../api/products";

export default function ProductDetailsPage({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const data = await getProductById(id);
      if (cancelled) return;
      setProduct(data);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="product-details-page">
        <button className="link" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p>Loading product…</p>
      </div>
    );
  }

  if (!product || product?.id == null) {
    return (
      <div className="product-details-page">
        <button className="link" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>Product not found</h2>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <button className="link" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-details">
        <div className="product-details__media">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="product-details__info">
          <h2>{product.title}</h2>
          <p className="product-details__price">${Number(product.price).toFixed(2)}</p>
          <p className="product-details__desc">{product.description}</p>

          <button
            type="button"
            className="product-card__add"
            onClick={() => onAddToCart?.(product)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
