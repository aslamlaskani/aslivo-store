import React, { useState } from 'react';

const Checkout = () => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Order placed successfully!');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Checkout</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Name:</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <label style={styles.label}>Address:</label>
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <label style={styles.label}>Phone:</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.submitButton}>Place Order</button>
      </form>
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
  form: {
    maxWidth: '500px',
    margin: '0 auto',
    textAlign: 'left',
  },
  label: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '8px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  submitButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 20px',
    fontSize: '18px',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'background-color 0.3s ease',
  },
};

export default Checkout;