const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const helpers = require('../utils/helpers');
const db = require('../../db/knex');
// Create a new charge
router.post('/charge', helpers.auth, async (req, res) => {
  // Create the charge object with data from the Vue.js client
  const uuid = req.user.id;
  const exists = await db.select('*').from('purchases').where({user_id: uuid, playlist_id: req.body.playlist_id}).reduce(helpers.getFirst);
  if (!exists) {
    const newCharge = {
      amount: req.body.amount,
      currency: "usd",
      source: req.body.id, // obtained with Stripe.js on the client side
      //description: req.body.specialNote,
      receipt_email: req.body.email,
      shipping: {
        name: req.body.name,
        address: {
          line1: req.body.card.address_line1,
          city: req.body.card.address_city,
          state: req.body.card.address_state,
          postal_code: req.body.card.address_zip,
          country: req.body.card.address_country
        }
      }
    };

    // Call the stripe objects helper functions to trigger a new charge
    stripe.charges.create(newCharge, async (err, charge) => {
      // send response
      if (err){
        console.error(err);
        res.json({ success: false, error: err, charge: false });
      } else {
        // send response with charge data
        await db.insert({playlist_id: req.body.playlist_id, amount_paid: req.body.amount, user_id: uuid}).into('purchases');
        res.json({ success: true, charge: charge });
      }
    });
  } else res.json({ success: false, message: "This playlist has already been purchased by this user."});

});
module.exports = router;