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

// Cache for subscriptions
const subscriptionCache = new Map();
const activeJobs = new Map();

async function getSubscription(userId) {
    if (subscriptionCache.has(userId)) {
        return subscriptionCache.get(userId);
    }

    const subscriptionRecord = await Subscriptions.findOne({ where: { userId: userId } });
    if (subscriptionRecord) {
        const subscription = JSON.parse(subscriptionRecord.subscription);
        subscriptionCache.set(userId, subscription);
        return subscription;
    }
    return null;
}

async function sendNotification(userId, task) {
    try {
        // First verify the task still exists
        const taskExists = await Tasks.findOne({ where: { id: task.id, userId: userId }});
        if (!taskExists) {
            console.log(`Task ${task.id} no longer exists, cancelling notification`);
            //await cancel(task.id);
            return;
        }

        const subscription = await getSubscription(userId);
        if (!subscription) {
            console.error(`No subscription found for user: ${userId}`);
            return;
        }

        const payload = JSON.stringify({
            title: 'Task Reminder',
            body: `Reminder: ${task.taskName}`,
        });

        await webpush.sendNotification(subscription, payload);
        console.log(`Notification sent for task: ${task.taskName} (ID: ${task.id})`);
    } catch (err) {
        console.error('Error sending notification:', err);
        if (err.statusCode === 410) {
            subscriptionCache.delete(userId);
        }
    }
}

async function scheduleNotification(task) {
    try {
        if (new Date() >= new Date(task.deadline)) {
            console.log(`Task ${task.id} has passed deadline, not scheduling notification`);
            return;
        }

        if (task.reminderType === "one-time") {
            await scheduleOneNotification(task.reminderTime, task, task.deadline);
        } else {
            await scheduleMultiNotification(task.reminderTime, task, task.deadline, task.reminderInterval);
        }
    } catch (error) {
        console.error(`Error scheduling notification for task ${task.id}:`, error);
    }
}

async function scheduleOneNotification(reminderDate, task, deadline) {
    if (new Date() >= new Date(deadline)) return;

    const cronTime = convertCronTime(new Date(reminderDate));
    const job = cron.schedule(cronTime, async () => {
        await sendNotification(task.userId, task);
        //await cancel(task.id);
    });

    // Store the job with its full context
    const jobInfo = {
        type: 'cron',
        job: job,
        taskName: task.taskName,
        createdAt: Date.now()
    };
    
    activeJobs.set(task.id, jobInfo);
    console.log(Array.from(activeJobs.keys()));
    activeJobs.forEach(acJob => {
        console.log(acJob.taskName);
    });
    console.log(`Scheduled one-time notification for task ${task.id}`);
}

async function scheduleMultiNotification(reminderDate, task, deadline, reminderInterval) {
    const deadlineDate = new Date(deadline);
    if (new Date() >= deadlineDate) return;

    const intervalMs = reminderInterval * 60000;
    const startDate = new Date(reminderDate);

    async function startRecurringNotifications() {
        // Send first notification immediately
        await sendNotification(task.userId, task);

        const interval = setInterval(async () => {
            const now = new Date();
            if (now < deadlineDate) {
                const taskExists = await Tasks.findOne({ where: { id: task.id, userId: task.userId }});
                if (taskExists) {
                    await sendNotification(task.userId, task);
                } else {
                    console.log(`Task ${task.id} no longer exists, stopping interval`);
                    //await cancel(task.id);
                }
            } else {
                await cancel(task.id);
            }
        }, intervalMs);

        // Store the interval with its context
        const jobInfo = {
            type: 'interval',
            job: interval,
            taskName: task.taskName,
            createdAt: Date.now()
        };
        
        activeJobs.set(task.id, jobInfo);
        console.log(Array.from(activeJobs.keys()));
        activeJobs.forEach(acJob => {
            console.log(acJob.taskName);
        });
        console.log(`Started recurring notifications for task ${task.id}`);
    }

    if (new Date() < startDate) { //if right now < starting time
        const waitTime = startDate.getTime() - Date.now();
        const timeout = setTimeout(async () => {
            await startRecurringNotifications();
        }, waitTime);

        // Store the timeout with its context
        const jobInfo = {
            type: 'timeout',
            job: timeout,
            taskName: task.taskName,
            createdAt: Date.now()
        };
        
        activeJobs.set(task.id, jobInfo);
        console.log(`Scheduled delayed start for recurring notifications for task ${task.id}`);
    } else {
        await startRecurringNotifications();
    }
}
async function cancel(taskId) {
    console.log(`Attempting to cancel notifications for task ${taskId}`);
    console.log(Array.from(activeJobs.keys()));
    activeJobs.forEach(acJob => {
        console.log(acJob.taskName);
    });
    // const jobInfo = activeJobs.get(taskId);
    const numericTaskId = Number(taskId);
    const jobInfo = activeJobs.get(numericTaskId);
    if (jobInfo) {
        try {
            switch(jobInfo.type) {
                case 'interval':
                    clearInterval(jobInfo.job);
                    console.log(`Cleared interval for task ${taskId}`);
                    break;
                case 'timeout':
                    clearTimeout(jobInfo.job);
                    console.log(`Cleared timeout for task ${taskId}`);
                    break;
                case 'cron':
                    jobInfo.job.stop();
                    console.log(`Stopped cron job for task ${taskId}`);
                    break;
                default:
                    console.warn(`Unknown job type for task ${taskId}: ${jobInfo.type}`);
            }
        } catch (error) {
            console.error(`Error clearing job for task ${taskId}:`, error);
        } finally {
            //job is always removed from activeJobs, regardless of clearing success
            activeJobs.delete(taskId);
            console.log(`Removed job from activeJobs for task ${taskId}`);
        }
    } else {
        console.log(`No active job found for task ${taskId}`);
    }
}

function convertCronTime(date) {
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${minutes} ${hours} ${day} ${month} *`;
}

module.exports = { scheduleNotification, cancel, activeJobs };
