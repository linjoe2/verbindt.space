const stripe = require('stripe')('sk_test_51JkBTDG663o3DwKgQYb3J9E5oWtjue9nyd3eaCJkQEkJK6bXEV2ZwH0KcJhyjnis33YYDi5GUX2rPnvY7i6EMd0M00g8X5iAyO');
const express = require('express');
let price_ID
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let bookingen = [{tijd: Date.now(), naam: "lindsey", minuten: 15}];
let wachtrij = []
app.use(express.static('public'));
app.use('/rooster',(req, res, next) => {

  // -----------------------------------------------------------------------
  // authentication middleware

  const auth = {login: 'vincent', password: 'MoederAarde'} // change this

  // parse login and password from headers
  const b64auth = (req.headers.authorization  || '').split(' ')[1] || ''
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

  // Verify login and password are set and correct
  if (login && password && login === auth.login && password === auth.password) {
    // Access granted...
    return next()
  }

  // Access denied...
  res.set('WWW-Authenticate', 'Basic realm="401"') // change this
  res.status(401).send('Authentication required.') // custom message

  // -----------------------------------------------------------------------

})

//const YOUR_DOMAIN = 'http://localhost:4242';

app.get('/rooster', async (req,res)=>{

  await fs.readFile('./boekingen.json', 'utf8', (err, data) => {
  
    if (err) {
        console.log(`Error reading file from disk: ${err}`);
    } else {

        // parse JSON string to JSON object
        const bookingen = JSON.parse(data);
        
        let table = "<table><tr><th>tijd</th><th>naam</th><th>minuten</th><th>telefooon</th><th>email</th></tr>"
        bookingen.forEach((boeking) => {
          boeking.tijd = new Date(boeking.tijd)
          boeking.tijd = boeking.tijd.getHours() + ':'+boeking.tijd.getMinutes()
          table += `<tr><td>${boeking.tijd}</td><td>${boeking.naam}</td><td>${boeking.minuten}</td><td>${boeking.telefoon}</td><td>${boeking.email}</td></tr>`
        })
        table += "</table>"
        res.send(table)
    }

})
})

app.get('/boekingen', async (req,res)=>{

  await fs.readFile('./boekingen.json', 'utf8', (err, data) => {
  
      if (err) {
          console.log(`Error reading file from disk: ${err}`);
      } else {
  
          // parse JSON string to JSON object
          const bookingen = JSON.parse(data);
  
          // print all databases
          bookingen.forEach(boeking => {
              console.log(`${boeking.naam}: ${boeking.tijd}`);
              boeking.tijd = new Date(boeking.tijd)
              boeking.tijd = boeking.tijd.getHours() + ':'+boeking.tijd.getMinutes()
          });
          res.send(JSON.stringify(bookingen))
      }
  
  })
    
})

app.get('succes', (req,res)=>{
  res.send("betaling geslaagd!")
})

app.get('cancel', (req,res)=>{
  res.send("betaling geslaagd!")
})


app.post('/versturen', async (req, res) => {
    console.log(req.body)
    let data = req.body
    bookingen.push(data)

    if(data.minuten == 10){
      price_ID = "price_1JkYx2G663o3DwKgq3uRyzqf"
    }

    if(data.minuten == 25){
      price_ID = "price_1JkYx3G663o3DwKgjEUSeXtp"
    }

    if(data.minuten == 50){
      price_ID = "price_1JkYx2G663o3DwKgbOMZx0sH"
    }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // TODO: replace this with the `price` of the product you want to sell
        //price: 50,
        quantity: 1,
        currency: "eur",
        amount: data.prijs+"00",
        name: data.minuten + "Minuten massage"
      },
    ],
    payment_method_types: [
      'card',
      'ideal',
      'sofort',
    ],
    mode: 'payment',
    customer_email: data.email,
    success_url: `https://verbindt.space`,
    cancel_url: `https://verbindt.space`,
  });
  console.log(session.payment_intent)
  data.pi = session.payment_intent
  wachtrij.push(data)
  console.log(wachtrij)
  res.send(JSON.stringify({"url":session.url}))
  //res.redirect(303, session.url)
});


app.post('/webhook', express.json({type: 'application/json'}), (request, response) => {
  const event = request.body;

  console.log(event)

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      console.log(paymentIntent.id)

      fs.readFile('./boekingen.json', 'utf8', (err, data) => {

        if (err) {
            console.log(`Error reading file from disk: ${err}`);
        } else {
    
            // parse JSON string to JSON object
            const boekingen = JSON.parse(data);


            wachtrij.forEach(item =>{
              console.log(item.pi)
              if(item.pi == paymentIntent.id){
                boekingen.push(item)
                fs.writeFile('./boekingen.json', JSON.stringify(boekingen, null, 4), (err) => {
                      if (err) {
                          console.log(`Error writing file: ${err}`);
                      }
                  });
              }
            })
            
            // // add a new record
            // boekingen.push(paymentIntent.metadata);
    
            // // write new data back to the file
            // fs.writeFile('./boekingen.json', JSON.stringify(boekingen, null, 4), (err) => {
            //     if (err) {
            //         console.log(`Error writing file: ${err}`);
            //     }
            // });
        }
      })
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});


app.listen(4242, () => console.log('Running on port 4242'));