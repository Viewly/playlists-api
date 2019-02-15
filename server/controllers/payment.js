const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const helpers = require('../utils/helpers');
const db = require('../../db/knex');
// Create a new charge
router.post('/charge', helpers.authOptional, async (req, res) => {
  // Create the charge object with data from the Vue.js client
  const uuid = req.user ? req.user.id : helpers.generateUuid();
  const exists = await db.select('*').from('purchases').where({user_id: uuid, playlist_id: req.body.playlist_id}).reduce(helpers.getFirst);
  const stripeData = req.body.stripeData;
  if (!exists) {
    const newCharge = {
      amount: req.body.price * 100, //Cents
      currency: "usd",
      source: stripeData.id, // obtained with Stripe.js on the client side
      description: `${req.body.playlist_id} bought for ${req.body.price}$.`,
      receipt_email: stripeData.email,
    };

    // Call the stripe objects helper functions to trigger a new charge
    stripe.charges.create(newCharge, async (err, charge) => {
      // send response
      if (err){
        console.error(err);
        res.json({ success: false, error: err, charge: false });
      } else {
        // send response with charge data
        await db.insert({playlist_id: req.body.playlist_id, amount_paid: req.body.price, user_id: uuid, 'purchase_id': charge.id}).into('purchases');
        res.json({ success: true, charge: charge });
      }
    });
  } else res.json({ success: false, message: "This playlist has already been purchased by this user."});

});
module.exports = router;