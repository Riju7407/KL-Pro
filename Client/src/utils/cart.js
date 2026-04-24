const CART_STORAGE_KEY = 'klproCart';

const emitCartUpdate = () => {
  window.dispatchEvent(new Event('cartUpdated'));
};

export const getCartItems = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
};

export const setCartItems = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  emitCartUpdate();
};

export const addToCart = (product, quantity = 1) => {
  if (!product?._id && !product?.id) {
    return [];
  }

  const productId = product._id || product.id;
  const cartItems = getCartItems();
  const existingItemIndex = cartItems.findIndex((item) => item.id === productId);

  if (existingItemIndex >= 0) {
    cartItems[existingItemIndex] = {
      ...cartItems[existingItemIndex],
      quantity: cartItems[existingItemIndex].quantity + quantity,
    };
  } else {
    cartItems.push({
      id: productId,
      name: product.name,
      price: Number(product.price || 0),
      image: product.image || product.images?.[0]?.url || '',
      category: product.category || '',
      stock: Number(product.stock || 0),
      quantity,
    });
  }

  setCartItems(cartItems);
  return cartItems;
};

export const updateCartItemQuantity = (productId, quantity) => {
  const safeQuantity = Math.max(1, Number(quantity) || 1);
  const cartItems = getCartItems().map((item) =>
    item.id === productId ? { ...item, quantity: safeQuantity } : item
  );
  setCartItems(cartItems);
  return cartItems;
};

export const removeCartItem = (productId) => {
  const cartItems = getCartItems().filter((item) => item.id !== productId);
  setCartItems(cartItems);
  return cartItems;
};

export const clearCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
  emitCartUpdate();
  return [];
};

export const getCartCount = () => {
  return getCartItems().reduce((total, item) => total + (Number(item.quantity) || 0), 0);
};
