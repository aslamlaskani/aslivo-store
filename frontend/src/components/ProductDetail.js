import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Mocking product data for now
    const fetchProductData = () => {
      const productData = {
        1: { name: 'Product 1', price: 100, description: 'This is a great product.', imageUrl: '/images/product1.jpg' },
        2: { name: 'Product 2', price: 150, description: 'Another amazing product.', imageUrl: '/images/product2.jpg' },
      };
      setProduct(productData[id]);
    };

    fetchProductData();
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-detail text-center">
      <img src={product.imageUrl} alt={product.name} className="img-fluid" />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <h4>${product.price}</h4>
      <button className="btn btn-success">Add to Cart</button>
    </div>
  );
};

export default ProductDetail;