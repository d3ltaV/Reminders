const Tasks = require('../models/tasks');
const notificationService = require('../services/notificationsService');
const { sendNotification } = require('web-push');
function scheduleNotification(task) {
    if (task.reminderType === "one-time") {
        scheduleOneNotification(task.reminderTime, task);
    } else {
        scheduleMultiNotification(task.reminderTime, task, task.deadline, task.reminderInterval);
    }
}

function scheduleOneNotification(reminderDate, task) {
    const cronTime = convert(reminderDate);
    cron.schedule(cronTime, () => {
        sendNotification(task);
    });
}
function scheduleMultiNotification(reminderDate, task, deadline, reminderInterval) {
    const reminderTime = new Date(reminderDate);
    const reminderInterval = reminderInterval * 60000;
    const now = new Date();
    if (now < reminderTime) {
        const waitTime = reminderTime - now;
        setTimeout(() => {
            sendNotification(task);
            const interval = setInterval(() => {
                const currentTime = new Date();
                if (currentTime < deadline) {
                    sendNotification(task);
                } else {
                    clearInterval(interval); 
                }
            }, reminderInterval);
        }, waitTime);
    } else {
        sendNotification(task);
        const interval = setInterval(() => {
            const currentTime = new Date();
            if (currentTime < deadline) {
                sendNotification(task);
            } else {
                clearInterval(interval); // Stop the interval when deadline is reached
            }
        }, reminderInterval);
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
    scheduleNotifications,
};
