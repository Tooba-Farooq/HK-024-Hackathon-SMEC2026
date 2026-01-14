export default function CartItem({ item, removeFromCart, updateQuantity }) {
  const handleDecrease = () => {
    if (item.quantity === 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <img 
        src={item.image} 
        alt={item.title}
        className="w-20 h-20 object-contain rounded-lg bg-white p-2"
      />
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
          {item.title}
        </h3>
        <p className="text-purple-600 font-bold mb-2">${item.price}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
            <button
              onClick={handleDecrease}
              className="px-3 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-l-lg transition-colors font-bold"
            >
              {item.quantity === 1 ? '🗑️' : '−'}
            </button>
            <span className="px-3 py-1 font-semibold text-gray-800 min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-3 py-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-r-lg transition-colors font-bold"
            >
              +
            </button>
          </div>
          
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
