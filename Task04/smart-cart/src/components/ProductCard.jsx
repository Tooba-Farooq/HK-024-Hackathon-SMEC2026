export default function ProductCard({ product, addToCart }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 10 }}>
      <img src={product.image} width="100" />
      <h4>{product.title}</h4>
      <p>${product.price}</p>
      <button onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
}
