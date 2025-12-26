// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root folder (or a "public" folder)
app.use(express.static(path.join(__dirname, 'Website Files')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Website Files', 'index.html'));
});


const app = express();
const stripe = require('stripe')('sk_test_sk_test_51SiNGY6MdbNsyfWrP06o8kGLHYjsKo4qGdMORcAOSahVxRwAeKkis7AAs4RroiN7k16Y8gSxfUQfOkWmnablJbMU00aJVcoJJU'); // <-- Replace with your real Stripe test key

const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// Create Stripe Checkout session
app.post('/create-checkout-session', async (req, res) => {
    const { cart } = req.body;

    if (!cart || cart.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    try {
        const line_items = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    // optionally add images:
                    images: [`https://your-site.com/images/${item.image || ''}`],
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/success.html`,
            cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Checkout failed' });
    }
});

// Fallback to serve index.html for all other routes (so React or single-page apps work too)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Use Render's PORT environment variable or fallback to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



