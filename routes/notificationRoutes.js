const express = require('express');
const router = express.Router();
const Subscriptions = require('../models/subscriptions'); 
router.post('/subscribe', async (req, res) => {
    const subscription = req.body;
    const userId = req.session.userId;
    try {
      await Subscriptions.create({
        userId: userId,
        subscription: JSON.stringify(subscription),
      });
  
      return res.status(201).json({ message: 'Subscription saved successfully!' });
    } catch (error) {
      console.error('Error saving subscription:', error);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }
  });
  
  module.exports = router;