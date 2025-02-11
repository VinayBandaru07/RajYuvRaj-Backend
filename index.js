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
    key_id: process.env.API_KEY,
    key_secret: process.env.SECRET_KEY,
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
    console.log(amount)
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
    console.log("Order created success")
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
app.post('/verify-payment', (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    console.log(orderId);
    console.log(paymentId);
    console.log(signature);
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.SECRET_KEY)
      .update(text)
      .digest('hex');

    if (expectedSignature === signature) {
      res.status(200).json({ valid: true });
      console.log("success")
      console.log(expectedSignature)
    } else {
      res.status(400).json({ valid: false, error: 'Invalid signature' });
      console.log("failed")
      console.log(expectedSignature)
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Fetch payment details
app.get('/fetch-payment/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await razorpay.payments.fetch(paymentId);

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        res.status(200).json({ success: true, payment });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch payment details' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
