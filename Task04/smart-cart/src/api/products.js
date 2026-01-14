export const getProducts = async () => {
  try {
    const res = await fetch("https://fakestoreapi.com/products");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};
