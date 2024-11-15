const express = require('express');
const router = express.Router();
const notifs = require('../services/notificationsService');
const Subscriptions = require('../models/subscriptions');
const { Op } = require('sequelize'); 
const Tasks = require('../models/tasks'); 

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

router.post('/unsubscribe', async (req, res) => {
  try {
    const userId = req.session.userId;
    const sub = await Subscriptions.findAll({
      where: {userId},
    });
    
    if (sub.length > 0) {
      for (let subscription of sub) {
        await subscription.destroy();
      }
      console.log('All subscriptions destroyed successfully');
      return res.status(200).json({ message: 'Unsubscribed successfully' });
    } else {
      console.log('No subscriptions found for this user');
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
  } catch (err) {
    console.error('Error during unsubscribe:', err);
    return res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

router.post('/reinitialize', async (req, res) => {
  const userId = req.body.userId;
  //const subscription = await Subscriptions.findOne({ where: { userId } });
  try {
    const tasks = await Tasks.findAll({
      where: {
          userId,
          reminderTime: { [Op.gt]: new Date() } // Reinitialize only future tasks
      }
    });
    tasks.forEach(task => {
      notifs.scheduleNotification(task)
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({error: 'failed to reinit'});
  }
});
module.exports = router;