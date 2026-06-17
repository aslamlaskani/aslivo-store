import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { placeholderImg } from '../utils/placeholder';
const Cart = () => {
  const { cartItems, removeItem, clearCart } = useContext(CartContext);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p style={styles.emptyCartText}>Your cart is empty!</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item.id} style={styles.cartItem}>
              <img src={item.imageUrl} alt={item.name} style={styles.cartItemImage} />
              <div style={styles.cartItemDetails}>
                <h4 style={styles.cartItemName}>{item.name}</h4>
                <p style={styles.cartItemPrice}>${item.price}</p>
                <button style={styles.removeButton} onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <h3 style={styles.total}>Total: ${calculateTotal()}</h3>
          <button style={styles.clearCartButton} onClick={clearCart}>Clear Cart</button>
          <button style={styles.checkoutButton}>Proceed to Checkout</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
  },
  heading: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '30px',
  },
  emptyCartText: {
    fontSize: '18px',
    color: '#555',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
    borderBottom: '1px solid #ddd',
    paddingBottom: '20px',
  },
  cartItemImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  cartItemDetails: {
    textAlign: 'left',
    flex: 1,
  },
  cartItemName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  cartItemPrice: {
    fontSize: '16px',
    color: '#007bff',
    marginTop: '5px',
  },
  removeButton: {
    backgroundColor: '#ff4d4f',
    color: 'white',
    padding: '8px 15px',
    fontSize: '14px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  total: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    marginTop: '30px',
  },
  clearCartButton: {
    backgroundColor: '#ff4d4f',
    color: 'white',
    padding: '12px 20px',
    fontSize: '18px',
    borderRadius: '8px',
    fontWeight: '600',
    marginTop: '20px',
    transition: 'background-color 0.3s ease',
  },
  checkoutButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 20px',
    fontSize: '18px',
    borderRadius: '8px',
    fontWeight: '600',
    marginTop: '20px',
    transition: 'background-color 0.3s ease',
  },
};

export default Cart;