export default function CartItem({ item, removeFromCart, updateQuantity }) {
  return (
    <div>
      <span>{item.title}</span>
      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
      <span>{item.quantity}</span>
      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
      <button onClick={() => removeFromCart(item.id)}>Remove</button>
    </div>
  );
}
