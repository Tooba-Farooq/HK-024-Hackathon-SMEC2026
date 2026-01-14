import React from "react";

export default function Cart({ cartItems, onRemove, onClose, onIncrement, onDecrement }) {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
    0
  );

  return (
    <div className="cart-overlay" onClick={onClose} role="presentation">
      <div
        className="cart-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="cart-header">
          <div>
            <h2 className="cart-title">My Cart</h2>
            <p className="cart-subtitle">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </p>
          </div>
          <button type="button" className="cart-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty__icon">🛒</div>
              <p className="cart-empty__title">Your cart is empty</p>
              <p className="cart-empty__text">Add some products to get started.</p>
            </div>
          ) : (
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item__imgWrap">
                    <img
                      className="cart-item__img"
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                    />
                  </div>

                  <div className="cart-item__info">
                    <div className="cart-item__title" title={item.title}>
                      {item.title}
                    </div>
                    <div className="cart-item__meta">
                      <span className="cart-item__price">
                        ${Number(item.price).toFixed(2)}
                      </span>
                      <span className="cart-item__dot">•</span>
                      <div className="cart-item__qty" aria-label="Quantity controls">
                        <button
                          type="button"
                          className="cart-item__qtyBtn"
                          onClick={() => onDecrement?.(item.id)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="cart-item__qtyVal" aria-label="Quantity">
                          {item.quantity || 1}
                        </span>
                        <button
                          type="button"
                          className="cart-item__qtyBtn"
                          onClick={() => onIncrement?.(item.id)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => onRemove(item.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="cart-item__right">
                    <div className="cart-item__total">
                      ${
                        (Number(item.price) * Number(item.quantity || 1)).toFixed(2)
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-summary">
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div className="cart-summary__row is-muted">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          </div>

          <button
            type="button"
            className="cart-checkout"
            disabled={cartItems.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
