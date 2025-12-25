const express = require('express');
const stripe = require('stripe')('sk_test_51SiNGY6MdbNsyfWrP06o8kGLHYjsKo4qGdMORcAOSahVxRwAeKkis7AAs4RroiN7k16Y8gSxfUQfOkWmnablJbMU00aJVcoJJU'); // Replace with your Stripe test key
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
    const { cart } = req.body;
    if (!cart || cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const line_items = cart.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: 'http://localhost:3000/success.html',
        cancel_url: 'http://localhost:3000/cancel.html',
    });

    res.json({ url: session.url });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
