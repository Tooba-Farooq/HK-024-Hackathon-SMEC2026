import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import useCart from "./hooks/useCart";

export default function App() {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  return (
    <div style={{ display: "flex", gap: 40 }}>
      <ProductList addToCart={addToCart} />
      <Cart
        cart={cart}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
      />
    </div>
  );
}
