// server.js
const express = require('express');
const path = require('path');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY'); // Replace with your real Stripe secret key
const bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'Website Files'))); 
// Replace 'Website Files' with the folder that contains index.html, images, CSS, JS

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Website Files', 'index.html'));
});

// Stripe checkout endpoint
app.post('/checkout', async (req, res) => {
  const { items } = req.body; // items = [{name, price}]
  const line_items = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100), // Stripe expects cents
    },
    quantity: 1,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}?success=true`,
      cancel_url: `${req.headers.origin}?canceled=true`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





