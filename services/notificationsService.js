const Tasks = require('../models/tasks');
const notificationService = require('../services/notificationsService');
const { sendNotification } = require('web-push');
activeJobs = {};
function scheduleNotification(task) {
    if (task.reminderType === "one-time") {
        scheduleOneNotification(task.reminderTime, task, task.deadline);
    } else {
        scheduleMultiNotification(task.reminderTime, task, task.deadline, task.reminderInterval);
    }
}

function scheduleOneNotification(reminderDate, task, deadline) {
    const cronTime = convert(reminderDate);
    const reminderTime = new Date(reminderDate);
    const now = new Date();
    if (now >= deadline) {
        return;
    }
    cron.schedule(cronTime, () => {
        sendNotification(task);
    });
    activeJobs[task.id] = job;
}
function scheduleMultiNotification(reminderDate, task, deadline, reminderInterval) {
    const reminderTime = new Date(reminderDate);
    const reminderInterval = reminderInterval * 60000;
    const now = new Date();
    if (now >= deadline) {
        return;
    }
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
            activeJobs[task.id] = interval;
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
            activeJobs[task.id] = interval;
        }, reminderInterval);
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
