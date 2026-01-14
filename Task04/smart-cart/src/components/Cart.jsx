export default function Cart({ cart, removeFromCart, updateQuantity }) {
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="bg-white rounded-xl shadow p-6 sticky top-4 h-fit w-80">
      <h2 className="text-xl font-bold mb-4">Your Cart</h2>

      {cart.length === 0 && (
        <p className="text-gray-500">Cart is empty</p>
      )}

      <div className="space-y-4">
        {cart.map(item => (
          <div key={item.id} className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold line-clamp-1">
                {item.title}
              </p>
              <p className="text-gray-500">${item.price}</p>

              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2 border rounded"
                >-</button>

                <span>{item.quantity}</span>

                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 border rounded"
                >+</button>
              </div>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="text-red-500 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="border-t mt-4 pt-4">
        <p className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </p>

        <button className="w-full mt-4 bg-black text-white py-2 rounded-lg">
          Checkout
        </button>
      </div>
    </div>
  );
}
