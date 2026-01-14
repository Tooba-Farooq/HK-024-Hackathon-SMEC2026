import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import useCart from "./hooks/useCart";

export default function App() {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Smart Shopping Cart</h1>

      <div className="flex gap-8">
        <div className="flex-1">
          <ProductList addToCart={addToCart} />
        </div>

        <Cart
          cart={cart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
        />
      </div>
    </div>
  );
}
