const WHATSAPP_NUMBER = '923258029183';

export const sendOrderWhatsApp = (order) => {
  const itemsList = order.items
    .map((item, i) =>
      `${i + 1}. ${item.name}${item.size ? ` (Size: ${item.size})` : ''} x${item.quantity} = Rs. ${(item.price * item.quantity).toLocaleString()}`
    )
    .join('\n');

  const message = `
🛍️ *NEW ORDER RECEIVED!*
━━━━━━━━━━━━━━━━━━━━
📦 *Order #${order.id}*
📅 ${new Date(order.createdAt).toLocaleString('en-PK')}

👤 *CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━
Name: ${order.customer.firstName} ${order.customer.lastName}
📞 Phone: ${order.customer.phone}
📧 Email: ${order.customer.email}

📍 *DELIVERY ADDRESS*
━━━━━━━━━━━━━━━━━━━━
${order.customer.address}
${order.customer.city}, ${order.customer.province}
${order.customer.postalCode ? `Postal: ${order.customer.postalCode}` : ''}

🛒 *ORDER ITEMS*
━━━━━━━━━━━━━━━━━━━━
${itemsList}

💳 *PAYMENT SUMMARY*
━━━━━━━━━━━━━━━━━━━━
Subtotal: Rs. ${order.subtotal?.toLocaleString()}
Shipping: ${order.shipping === 0 ? 'FREE' : `Rs. ${order.shipping}`}
💰 *Total: Rs. ${order.total?.toLocaleString()}*

💵 Payment Method: ${
    order.paymentMethod === 'cod' ? 'Cash on Delivery' :
    order.paymentMethod === 'jazzcash' ? 'JazzCash' :
    order.paymentMethod === 'easypaisa' ? 'EasyPaisa' :
    'Credit/Debit Card'
  }

⏳ Status: *Pending*
━━━━━━━━━━━━━━━━━━━━
🏪 Aslivo Store
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(whatsappURL, '_blank');
};

export const sendOrderConfirmationToCustomer = (order) => {
  if (!order.customer?.phone) return;

  const customerPhone = order.customer.phone.replace(/\D/g, '');
  const formattedPhone = customerPhone.startsWith('0')
    ? '92' + customerPhone.slice(1)
    : customerPhone.startsWith('92')
    ? customerPhone
    : '92' + customerPhone;

  const message = `
🎉 *Order Confirmed!*
━━━━━━━━━━━━━━━━━━━━
Thank you for shopping with *Aslivo Store*!

📦 *Order #${order.id}*
💰 Total: Rs. ${order.total?.toLocaleString()}
💳 Payment: ${
    order.paymentMethod === 'cod' ? 'Cash on Delivery' :
    order.paymentMethod === 'jazzcash' ? 'JazzCash' :
    order.paymentMethod === 'easypaisa' ? 'EasyPaisa' :
    'Card'
  }

📍 Delivering to:
${order.customer.address}, ${order.customer.city}

⏱️ Estimated delivery: 3-5 business days

🔍 Track your order at:
aslivostore.com/tracking

Use order number: *${order.id}*
With email: ${order.customer.email}

Thank you for your trust! 🙏
🏪 *Aslivo Store Team*
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  window.open(whatsappURL, '_blank');
};