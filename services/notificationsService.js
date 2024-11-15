const Subscriptions = require('../models/subscriptions');
const webpush = require('web-push');
require('dotenv').config();
const cron = require('node-cron');
const Tasks = require('../models/tasks');

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  'mailto:joellejingyaoyang@gmail.com',
  publicVapidKey,
  privateVapidKey
);

const activeJobs = {};

async function sendNotification(userId, task) {
    try {
        const subscriptionRecord = await Subscriptions.findOne({ where: { userId: userId } });
        if (!subscriptionRecord) {
            console.error(`No subscription found for user: ${userId}`);
            return;
        }
        const subscription = JSON.parse(subscriptionRecord.subscription); 
        const payload = JSON.stringify({
            title: 'Task Reminder',
            body: `Reminder: ${task.taskName}`,
        });
        await webpush.sendNotification(subscription, payload);
        console.log(`Notification sent for task: ${task.taskName}`);
    } catch (err) {
        console.error('Error sending notification:', err);
    }
}

function scheduleNotification(task) {
    if (task.reminderType === "one-time") {
        scheduleOneNotification(task.reminderTime, task, task.deadline);
    } else {
        scheduleMultiNotification(task.reminderTime, task, task.deadline, task.reminderInterval);
    }
}

function scheduleOneNotification(reminderDate, task, deadline) {
    const cronTime = convertCronTime(new Date(reminderDate));
    if (new Date() >= new Date(deadline)) return;

    const job = cron.schedule(cronTime, () => {
        sendNotification(task.userId, task);
        job.stop(); 
    });
    activeJobs[task.id] = job;
}

function scheduleMultiNotification(reminderDate, task, deadline, reminderInterval) {
    // const reminderTime = new Date(reminderDate);
    const intervalMs = reminderInterval * 60000;
    if (new Date() >= deadline) return;

    if (new Date() < reminderDate) {
        const waitTime = reminderDate - new Date();
        setTimeout(() => {
            handleRecurringNotification(task, deadline, intervalMs);
        }, waitTime);
    } else {
        handleRecurringNotification(task, deadline, intervalMs);
    }
}
function handleRecurringNotification(task, deadline, intervalMs) {
    sendNotification(task.userId, task);
    const interval = setInterval(() => {
        if (new Date() < new Date(deadline)) {
            sendNotification(task.userId, task);
        } else {
            clearInterval(interval);
            delete activeJobs[task.id];
        }
    }, intervalMs);
    activeJobs[task.id] = interval;
}

function cancel(taskId) {
    const job = activeJobs[taskId];
    if (job) {
        if (typeof job.stop === "function") job.stop();
        else clearInterval(job);
        delete activeJobs[taskId];
    }
}

function convertCronTime(date) {
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${minutes} ${hours} ${day} ${month} *`;
}

module.exports = { scheduleNotification, cancel };
