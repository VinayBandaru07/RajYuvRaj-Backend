const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: "",
    key_secret: "",
  });
// Create an order
app.post('/create-order', async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    const options = {
      amount: amount, // Convert to paise
      currency: 'INR',
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
app.post('/verify-payment', (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', '')
      .update(text)
      .digest('hex');

    if (expectedSignature === signature) {
      res.status(200).json({ valid: true });
    } else {
      res.status(400).json({ valid: false, error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
