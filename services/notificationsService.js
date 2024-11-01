const Subscriptions = require('../models/subscriptions');
const webpush = require('web-push');
require('dotenv').config();
const cron = require('node-cron');

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  'mailto:joellejingyaoyang@gmail.com',
  publicVapidKey,
  privateVapidKey
);

const activeJobs = {};
// function showNotification(message) {
//     if (Notification.permission === 'granted') {
//         new Notification(message);
//     }
// }
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
        webpush.sendNotification(subscription, payload);
        // showNotification(`Reminder: ${task.taskName}`);
        console.log(`Notification sent for task: ${task.taskName}`);
    } catch (err) {
        console.error(`Error sending notification: ${err.message}`);
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
    const cronTime = convert(new Date(reminderDate));
    const now = new Date();
    if (now >= new Date(deadline)) {
        return;
    }
    const job = cron.schedule(cronTime, () => {
        sendNotification(task.userId, task);
    });
    // activeJobs[task.id] = job;
    console.log(activeJobs);
}

function scheduleMultiNotification(reminderDate, task, deadline, reminderInterval) {
    const reminderTime = new Date(reminderDate);
    reminderInterval = reminderInterval * 60000;
    const now = new Date();
    if (now >= new Date(deadline)) {
        return;
    }
    if (now < reminderTime) {
        const waitTime = reminderTime - now;
        setTimeout(() => {
            sendNotification(task.userId, task);
            const interval = setInterval(() => {
                const currentTime = new Date();
                if (currentTime < new Date(deadline)) {
                    sendNotification(task.userId, task);
                } else {
                    clearInterval(interval);
                }
            }, reminderInterval);
            activeJobs[task.id] = interval;
        }, waitTime);
    } else {
        sendNotification(task.userId, task);
        const interval = setInterval(() => {
            const currentTime = new Date();
            if (currentTime < new Date(deadline)) {
                sendNotification(task.userId, task);
            } else {
                clearInterval(interval);
            }
        }, reminderInterval);
        activeJobs[task.id] = interval;
    }
}

function cancel(taskId) {
    const job = activeJobs[taskId];
    if (job) {
        if (typeof job.stop === "function") {
            job.stop();
        } else {
            clearTimeout(job);
            clearInterval(job);
        }
        delete activeJobs[taskId];
    }
}

function convert(date) {
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${minutes} ${hours} ${day} ${month} *`;
}

module.exports = {
    scheduleNotification,
    cancel
};
// const Subscriptions = require('../models/subscriptions');
// const webpush = require('web-push');
// require('dotenv').config();
// const cron = require('node-cron');

// const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
// const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

// webpush.setVapidDetails(
//   'mailto:joellejingyaoyang@gmail.com',
//   publicVapidKey,
//   privateVapidKey
// );

// activeJobs = {};
// async function sendNotification(userId, task) {
//     console.log("yes");
//     try {
//         const subscriptionRecord = await Subscriptions.findOne({ where: { userId: userId } });
//         if (!subscriptionRecord) {
//             console.error(`no sub why`);
//             return;
//         }
//         const subscription = JSON.parse(subscriptionRecord.subscription); 
//         const payload = JSON.stringify({
//             title: 'Task Reminder',
//             body: `reminder: ${task.taskName}`,
//         });
//         console.log(subscription);
//         console.log(payload);
//         await webpush.sendNotification(subscription, payload);
//         console.log(`Notification sent for task: ${task.taskName}`);
//     } catch (err) {
//         console.error(`:( ${err.message}`);
//     }
// }
// function scheduleNotification(task) {
//     console.log("scheduled");
//     console.log(task);
//     if (task.reminderType === "one-time") {
//         scheduleOneNotification(task.reminderTime, task, task.deadline);
//         console.log("once");
//     } else {
//         scheduleMultiNotification(task.reminderTime, task, task.deadline, task.reminderInterval);
//     }
// }

// function scheduleOneNotification(reminderDate, task, deadline) {
//     const cronTime = convert(reminderDate);
//     const reminderTime = new Date(reminderDate);
//     const now = new Date();
//     // const subscription = task.subscription;
//     if (now >= deadline) {
//         return;
//     }
//     const job = cron.schedule(cronTime, () => {
//         sendNotification(task.userId, task)
//     });
//     activeJobs[task.id] = job;
// }
// function scheduleMultiNotification(reminderDate, task, deadline, reminderInterval) {
//     const reminderTime = new Date(reminderDate);
//     reminderInterval = reminderInterval * 60000;
//     const now = new Date();
//     const subscription = task.subscription;
//     if (now >= deadline) {
//         return;
//     }
//     if (now < reminderTime) {
//         const waitTime = reminderTime - now;
//         setTimeout(() => {
//             sendNotification(task);
//             const interval = setInterval(() => {
//                 const currentTime = new Date();
//                 if (currentTime < deadline) {
//                     sendNotification(task.userId, task)
//                 } else {
//                     clearInterval(interval); 
//                 }
//             }, reminderInterval);
//             activeJobs[task.id] = interval;
//         }, waitTime);
//     } else {
//         sendNotification(task);
//         const interval = setInterval(() => {
//             const currentTime = new Date();
//             if (currentTime < deadline) {
//                 sendNotification(subscription, task)
//             } else {
//                 clearInterval(interval);
//             }
//             activeJobs[task.id] = interval;
//         }, reminderInterval);
//     }
// }

// function cancel(taskId) {
//     const job = activeJobs[taskId];
//     if (job) {
//         if (typeof job.stop === "function") {
//             job.stop();
//         } else {
//             clearTimeout(job);
//             clearInterval(job);
//         }
//         delete activeJobs[taskId];
//     }
// }
// function convert(date) {
//     const minutes = date.getMinutes();
//     const hours = date.getHours();
//     const day = date.getDate();
//     const month = date.getMonth() + 1;
//     return `${minutes} ${hours} ${day} ${month} *`;
// }

// module.exports = {
//     scheduleNotification,
//     cancel
// };
