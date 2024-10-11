const Tasks = require('../models/tasks');
const isAuthenticated = require('../auth');
exports.showTasks = async (req, res) => {
    if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Please login!' });
    }
    const userId = req.session.userId;
    try {
        const tasks = await Tasks.findAll({where : {userId}});
        res.render('homepage', {tasks});
        // res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({error: ":("})
    }
};
exports.addTask = async (req, res) => {
    if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Please login!' });
    }
    let { taskName, deadline, reminderType, reminderTime, reminderInterval } = req.body;
    const userId = req.session.userId;
    try {
        let deadlineDate = new Date(deadline);
        if (reminderType === 'multi-time') {
            reminderInterval = reminderInterval ? reminderInterval : 60;
            if (!reminderTime) {
                const reminderDate = new Date(deadlineDate);
                reminderDate.setMinutes(reminderDate.getMinutes() - 60);
                reminderTime = reminderDate;
            }
        } else {
            if (!reminderTime) {
                const reminderDate = new Date(deadlineDate);
                reminderDate.setMinutes(reminderDate.getMinutes() - 60);
                reminderTime = reminderDate;
            }
        }
        const newTask = await Tasks.create({taskName, deadline, reminderType, reminderTime, reminderInterval : reminderInterval ? reminderInterval :null, userId});
        res.redirect('/tasks/homepage');
    } catch (error) {
        res.status(400).json({error:'Task creation failed'});
    }
};

exports.deleteTask = async(req, res) => {
    if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Please login!' });
    }
    const taskIds = req.body.taskIds;
    const userId = req.session.userId;
    try {
        await Tasks.destroy({
            where: {
                id: Array.isArray(taskIds) ? taskIds : [taskIds], userId
            }
        });
        res.redirect('/tasks/homepage');
    } catch (error) {
        res.status(400).json({error:'Failed to delete tasks'});
    }
}

exports.modifyTask = async(req, res) => {
    if (!isAuthenticated(req)) {
        return res.status(401).json({error : 'Please login!'});
    }
    const userId = req.session.userId;
    const taskId = req.body.taskId;
    try {
        const task = await Tasks.findOne({where : {
            id: taskId,
            userId: userId
        }});
        const { taskName, deadline, reminderType, reminderTime, reminderInterval } = req.body;
        task.taskName = taskName || task.taskName;
        task.deadline = deadline || task.deadline;
        task.reminderType = reminderType || task.reminderType;
        task.reminderTime = reminderTime || task.reminderTime;
        task.reminderInterval = reminderInterval || task.reminderInterval;
        await task.save();
        res.redirect('/tasks/homepage');
    } catch (error) {
        res.status(400)
    }
};
