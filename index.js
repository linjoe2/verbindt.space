const stripe = require('stripe')('sk_test_51JkBTDG663o3DwKgQYb3J9E5oWtjue9nyd3eaCJkQEkJK6bXEV2ZwH0KcJhyjnis33YYDi5GUX2rPnvY7i6EMd0M00g8X5iAyO');
const express = require('express');
const app = express();
let bookingen = [];
app.use(express.static('public'));

const YOUR_DOMAIN = 'http://localhost:4242';

app.get('bookingen', async (req,res)=>{
    res.send(JSON.stringify(bookingen))
})


app.post('/versturen', async (req, res) => {
    console.log(req.json())
    let data = req.json();


  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // TODO: replace this with the `price` of the product you want to sell
        price: '{{PRICE_ID}}',
        quantity: 1,
      },
    ],
    payment_method_types: [
      'card',
      'ideal',
      'sofort',
    ],
    mode: 'payment',
    success_url: `https://verbindt.space/success.html`,
    cancel_url: `https://verbindt.space/cancel.html`,
  });

  res.redirect(303, session.url)
});

app.listen(4242, () => console.log('Running on port 4242'));