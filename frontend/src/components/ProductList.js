import React from 'react';
import { useParams } from 'react-router-dom';
import { placeholderImg } from '../utils/placeholder';
const ProductDetail = () => {
  const { id } = useParams();

  // Mock product data for now
  const product = {
    id: 1,
    name: 'Product 1',
    price: 100,
    imageUrl: '/images/product1.jpg',
    description: 'This is a detailed description of the product. It explains its features, uses, and more!',
  };

  return (
    <div style={styles.container}>
      <div style={styles.productDetail}>
        <img src={product.imageUrl} alt={product.name} style={styles.productImage} />
        <div style={styles.productInfo}>
          <h3 style={styles.productName}>{product.name}</h3>
          <p style={styles.productPrice}>${product.price}</p>
          <p style={styles.productDescription}>{product.description}</p>
          <button style={styles.addToCartButton}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
  },
  productDetail: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  productImage: {
    width: '400px',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  productInfo: {
    textAlign: 'left',
    maxWidth: '500px',
  },
  productName: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '20px',
  },
  productPrice: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#007bff',
    marginBottom: '20px',
  },
  productDescription: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '30px',
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '15px 30px',
    fontSize: '18px',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'background-color 0.3s ease',
  },
};

export default ProductDetail;