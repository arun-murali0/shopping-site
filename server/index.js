const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const app = express();
const CheckoutSession = require("./schema.js");
const cors = require("cors");
app.use(express.json());
const PORT = 8756;
connection = process.env.CONNECTION_URL;
const allowedOrigins = [
  "http://localhost:3000",
  // "https://shopping-site-001.netlify.app",
];
app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.get("/", (req, res) => {
  res.json("welcome");
});

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

app.post("/create-checkout-session", async (req, res) => {
  const line_items = req.body.data.cartItems.map((item) => {
    console.log(item);
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.productName,
          metadata: {
            id: item.id,
          },
        },
        unit_amount: item.price * 100,
      },
      quantity: item.qty,
    };
  });
  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: "payment",
    success_url: "http://localhost:3000/cart/success",

    cancel_url: "http://localhost:3000/cart/cancel",
  });

  try {
    const checkoutSessions = req.body.data.cartItems.map((item) => {
      return new CheckoutSession({
        productName: item.productName,
        productQty: item.qty,
        productPrice: item.price,
        totalPrice: item.price * item.qty,
        paymentMode: "card",
      });
    });

    await CheckoutSession.insertMany(checkoutSessions);
    res.send({ url: session.url });
  } catch (error) {
    console.log(error);
  }
});

mongoose
  .connect(connection, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(app.listen(PORT, () => console.log(`Running on port:${PORT}`)))
  .catch((err) => console.log(err));

// Payment_method_options: ["card"],

// shipping_address_collection: { allowed_countries: ["us"] },
// shipping_options: [
//   {
//     shipping_rate_data: {
//       type: "fixed amount",
//       fixed_amount: { amount: 1, currency: "usd" },
//       display_name: "minimum wage for shipping 1 usd",
//       delivery_status: {
//         minimum: { unit: "hour", value: 2 },
//         maximum: { unit: "hour", value: 3 },
//       },
//     },
//   },
// ],
// phone_number_collection: {
//   enabled: true,
// },
// let endpointSecret;
//  endpointSecret = process.env.webhook_secret;

// app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
//   const sig = req.headers["stripe-signature"];

//   let data, eventTypes;

//   if (endpointSecret) {
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       res.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }
//     data = event.data.object;
//     eventTypes = event.type;
//   } else {
//     data = req.body.data.object;
//     eventTypes = req.body.type;
//   }

//   if (eventTypes === "checkout.session.completed") {
//     console.log(data);
//   }

//   // // Handle the event
//   // switch (event.type) {
//   //   case "payment_intent.succeeded":
//   //     const paymentIntentSucceeded = event.data.object;
//   //     // Then define and call a function to handle the event payment_intent.succeeded
//   //     break;
//   //   // ... handle other event types
//   //   default:
//   //     console.log(`Unhandled event type ${event.type}`);
//   // }

//   // // Return a 200 response to acknowledge receipt of the event
//   // res.send();
// });
